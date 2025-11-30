
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
        const { data: history } = await supabaseClient
            .from('copilot_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(10);

        // 8. Generate AI Response
        let answer = '';

        const systemPrompt = `Você é o Copiloto Voxia, uma IA especializada em gestão de frotas, veículos e motoristas.

Você só pode usar as informações que receber no campo de contexto (dados vindos diretamente do banco de dados Voxia daquela empresa).

Nunca use conhecimento próprio, internet ou informações externas.

Se a informação não estiver no contexto ou não puder ser deduzida de forma segura a partir dos dados fornecidos, responda claramente que não há dados suficientes.

Se o usuário fizer perguntas que não estejam relacionadas à frota da empresa, ao sistema Voxia ou aos dados recebidos (por exemplo: notícias, curiosidades, política, esportes, vida pessoal, etc.), você deve responder de forma educada:

Explique que você não tem autorização para tratar de temas externos ao sistema Voxia.

Reforce que seu papel é exclusivamente ajudar na gestão da frota, veículos, motoristas, viagens, alertas e indicadores operacionais dessa empresa.

Nunca invente valores, datas, nomes, quantidades ou estatísticas.

Quando responder, seja objetivo, cordial e profissional, sempre ajudando o gestor a tomar decisões (ex.: sugerir ações, priorizar problemas, indicar motoristas ou veículos críticos, etc.).

Quando for útil, faça referência explícita aos dados usados na resposta (ex: “Nos últimos 7 dias, o sistema registrou X viagens ativas…”).

Você receberá mensagens no formato:

pergunta_usuario: texto da pergunta

contexto_bd: dados em formato estruturado (JSON, tabelas resumidas ou texto) vindos do banco Voxia

Sua missão é responder somente com base em contexto_bd, dentro do escopo Voxia.`;

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
