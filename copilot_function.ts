
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! }
                }
            }
        );

        // 1. Get User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');

        // 2. Get Settings (Decrypted)
        const { data: settings, error: settingsError } = await supabaseClient.rpc('get_decrypted_api_key');
        if (settingsError || !settings || settings.length === 0) {
            throw new Error('AI Settings not found. Please configure your API Key in Settings.');
        }
        const { provider, model, api_key } = settings[0];

        // 3. Get Request Body
        const { question } = await req.json();

        // 4. Get Context (Fleet Summary)
        const { data: fleetContext, error: contextError } = await supabaseClient.rpc('get_fleet_summary');
        if (contextError) console.error('Error fetching context:', contextError);

        // 5. Get/Create Conversation
        let conversationId;
        const { data: existingConv } = await supabaseClient
            .from('copilot_conversations')
            .select('id')
            .eq('admin_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existingConv) {
            conversationId = existingConv.id;
        } else {
            const { data: newConv, error: createError } = await supabaseClient
                .from('copilot_conversations')
                .insert({ admin_id: user.id })
                .select()
                .single();
            if (createError) throw createError;
            conversationId = newConv.id;
        }

        // 6. Save User Message
        await supabaseClient.from('copilot_messages').insert({
            conversation_id: conversationId,
            role: 'admin',
            content: question
        });

        // 7. Get History
        const { data: recentMessages } = await supabaseClient
            .from('copilot_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(10);

        const history = recentMessages?.reverse() || [];

        // 8. Generate AI Response
        let answer = '';

        const systemPrompt = `Você é o Copiloto Voxia, uma IA assistente especializada em gestão de frotas.
Sua persona é prestativa, educada, profissional e empática.
Você deve sempre tratar o usuário com cordialidade.

DIRETRIZES PRINCIPAIS:
1. Use SOMENTE as informações fornecidas no 'contexto_bd'. Não invente dados.
2. Se a informação necessária não estiver no contexto, diga educadamente que não tem acesso a essa informação no momento.
3. Se o usuário fizer perguntas fora do escopo (ex: esportes, política, receitas, assuntos gerais), recuse educadamente e redirecione o foco para a gestão da frota.
   - Exemplo de recusa: "Peço desculpas, mas como assistente Voxia, meu foco é ajudar na gestão da sua frota. Posso ajudar com algo sobre seus veículos ou motoristas?"
4. NÃO repita respostas anteriores se a pergunta for diferente. Analise cada pergunta individualmente.
5. Seja conciso mas completo. Use formatação (negrito, listas) para facilitar a leitura.

CONTEXTO DE DADOS:
Você receberá um objeto JSON com:
- vehicles_summary: Contagem de veículos por tipo (ex: Carro, Camião).
- vehicles_details: Lista detalhada de veículos com placa, modelo, tipo, status e odômetro (km_current).
- drivers_status: Lista de motoristas com status e total de viagens concluídas.
- active_trips: Viagens em andamento.

Use esses dados para responder perguntas como "quantos carros?", "quantos km o veículo X tem?", "quantas viagens o motorista Y fez?".
Se os dados estiverem vazios ou insuficientes, informe o usuário.`;

        const formattedMessage = `pergunta_usuario: ${question}\n\ncontexto_bd: ${JSON.stringify(fleetContext || 'Nenhum dado disponível')}`;

        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${api_key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history?.map((msg: any) => ({
                            role: msg.role === 'admin' ? 'user' : 'assistant',
                            content: msg.role === 'admin' && msg.content === question ? formattedMessage : msg.content
                        })) || [],
                        // If history is empty or we want to ensure the last message is the formatted one:
                        // Actually, we should replace the last user message content with the formatted one, 
                        // or just append it if we are not strictly following history.
                        // Let's just append the current message as a new one with the context, 
                        // but we already saved the "clean" question to DB.
                        // So for the AI, we send the formatted version.
                        // If history includes the current message (it shouldn't if we fetched before insert, but we fetched AFTER insert),
                        // then we need to be careful.
                        // We fetched history AFTER insert. So the last message in `history` is the current question.
                        // We should map it.
                    ].map(msg => {
                        if (msg.role === 'user' && msg.content === question) {
                            return { ...msg, content: formattedMessage };
                        }
                        return msg;
                    })
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            answer = data.choices[0].message.content;

        } else if (provider === 'google') {
            // Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [
                        ...history?.map((msg: any) => ({
                            role: msg.role === 'admin' ? 'user' : 'model',
                            parts: [{ text: msg.role === 'admin' && msg.content === question ? formattedMessage : msg.content }]
                        })) || []
                    ]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            answer = data.candidates[0].content.parts[0].text;
        }

        // 9. Save AI Response
        await supabaseClient.from('copilot_messages').insert({
            conversation_id: conversationId,
            role: 'ai',
            content: answer
        });

        return new Response(JSON.stringify({ answer }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
