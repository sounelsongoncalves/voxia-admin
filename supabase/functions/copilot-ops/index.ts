// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { empresa_id, mensagem } = await req.json();

        // 1. Init Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        // 2. Get OpenAI Key securely
        const { data: settings, error: settingsError } = await supabaseClient.rpc('get_decrypted_api_key');
        if (settingsError || !settings || settings.length === 0) {
            throw new Error('AI Settings not found. Please configure your API Key in Settings.');
        }
        const { provider, model, api_key } = settings[0];

        if (provider !== 'openai') {
            throw new Error('This agent currently supports only OpenAI provider.');
        }

        const openai = new OpenAI({
            apiKey: api_key,
        });

        // 3. Define Tools
        const tools = [
            {
                type: "function",
                function: {
                    name: "buscar_dados_motorista",
                    description: "Busca dados de contato e habilitação de um motorista pelo nome ou apelido.",
                    parameters: {
                        type: "object",
                        properties: {
                            nome_ou_apelido: { type: "string", description: "Nome ou apelido do motorista" },
                        },
                        required: ["nome_ou_apelido"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "listar_motoristas_online",
                    description: "Lista os motoristas que estão atualmente online/ativos.",
                    parameters: {
                        type: "object",
                        properties: {
                            empresa_id: { type: "string" },
                        },
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "contar_veiculos_por_tipo_ou_sinonimo",
                    description: "Conta veículos por tipo, aceitando sinônimos (ex: trator -> Camião).",
                    parameters: {
                        type: "object",
                        properties: {
                            empresa_id: { type: "string" },
                            termo: { type: "string", description: "Termo usado para o tipo de veículo (ex: 'galera', 'trator')" },
                        },
                        required: ["termo"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "veiculos_que_abasteceram_no_dia",
                    description: "Lista veículos que abasteceram em uma data específica.",
                    parameters: {
                        type: "object",
                        properties: {
                            empresa_id: { type: "string" },
                            data: { type: "string", description: "Data no formato YYYY-MM-DD" },
                        },
                        required: ["data"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "quilometros_veiculo_no_periodo",
                    description: "Calcula total de km percorridos por um veículo num período.",
                    parameters: {
                        type: "object",
                        properties: {
                            empresa_id: { type: "string" },
                            identificador_veiculo: { type: "string", description: "Placa ou ID do veículo" },
                            data_inicio: { type: "string", description: "Data inicial YYYY-MM-DD" },
                            data_fim: { type: "string", description: "Data final YYYY-MM-DD" },
                        },
                        required: ["identificador_veiculo", "data_inicio", "data_fim"],
                    },
                },
            },
        ];

        // 4. Initial Call to OpenAI
        const messages = [
            {
                role: "system",
                content: `Você é o Copiloto de Operações de uma empresa de transporte.
Você deve:
– Responder sempre em português, de forma clara, profissional e amigável.
– Entender que “chofer”, “motorista” e “condutor” são a mesma função de motorista e usar as ferramentas de consulta de motoristas no banco de dados para responder.
– Entender que “veículo”, “camião”, “trator”, “reboque”, “galera” e termos semelhantes podem significar tipos de veículos diferentes e deve consultar as tabelas de tipos de veículo e seus sinônimos antes de responder.
– SEMPRE usar as ferramentas de consulta ao banco de dados para responder perguntas sobre motoristas, veículos, viagens, abastecimentos, quilometragem, habilitação, datas de inscrição, aniversários, etc.
– Nunca inventar números: se não encontrar alguma informação no banco de dados, explique claramente que essa informação não está registrada.
– Quando a pergunta envolver datas relativas (hoje, ontem, esta semana, este mês), interpretar corretamente o período e consultar o banco de dados com base nesse intervalo.
– Quando detectar aumentos anormais de consumo de combustível (por exemplo, um veículo abastecer muito mais que a sua média recente), deve alertar o operador, explicar o que encontrou e sugerir verificação.
– Comportar-se como uma funcionária experiente do setor de operações, que conhece bem a rotina dos motoristas, veículos e da empresa.`
            },
            { role: "user", content: mensagem }
        ];

        const completion = await openai.chat.completions.create({
            model: model || "gpt-4-turbo-preview", // Fallback to a capable model
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const responseMessage = completion.choices[0].message;

        // 5. Handle Tool Calls
        if (responseMessage.tool_calls) {
            messages.push(responseMessage); // Add the assistant's request to history

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let functionResult;

                try {
                    if (functionName === "buscar_dados_motorista") {
                        const { data } = await supabaseClient
                            .from('drivers')
                            .select('name, phone, license_number, license_expiry, license_category, created_at, email')
                            .ilike('name', `%${args.nome_ou_apelido}%`)
                            .limit(5);
                        functionResult = JSON.stringify(data);
                    }
                    else if (functionName === "listar_motoristas_online") {
                        // Assuming 'active' status or checking a view if available. 
                        // Using v_online_drivers view if exists, else drivers table.
                        const { data } = await supabaseClient.from('v_online_drivers').select('*');
                        functionResult = JSON.stringify(data);
                    }
                    else if (functionName === "contar_veiculos_por_tipo_ou_sinonimo") {
                        // 1. Check synonym
                        const { data: synData } = await supabaseClient
                            .from('vehicle_type_synonyms')
                            .select('vehicle_type_id, vehicle_types(name)')
                            .ilike('synonym', args.termo)
                            .single();

                        let typeName = args.termo;
                        if (synData && synData.vehicle_types) {
                            typeName = synData.vehicle_types.name;
                        }

                        // 2. Count in vehicles
                        // Try exact match on type first
                        const { count } = await supabaseClient
                            .from('vehicles')
                            .select('*', { count: 'exact', head: true })
                            .ilike('type', typeName);

                        functionResult = JSON.stringify({ termo_pesquisado: args.termo, tipo_identificado: typeName, quantidade: count });
                    }
                    else if (functionName === "veiculos_que_abasteceram_no_dia") {
                        const startOfDay = new Date(args.data).toISOString();
                        const endOfDay = new Date(new Date(args.data).setHours(23, 59, 59, 999)).toISOString();

                        // Join journey_events -> journeys -> vehicles
                        // Since we can't do deep nested joins easily in one go for select, we might need two steps or a view.
                        // But we can select from journey_events where type='ABASTECIMENTO' and get journey(vehicle(plate))

                        const { data } = await supabaseClient
                            .from('journey_events')
                            .select(`
                    id,
                    occurred_at,
                    value,
                    description,
                    journey:journeys (
                        vehicle:vehicles (plate, model)
                    )
                `)
                            .eq('type', 'ABASTECIMENTO')
                            .gte('occurred_at', startOfDay)
                            .lte('occurred_at', endOfDay);

                        functionResult = JSON.stringify(data);
                    }
                    else if (functionName === "quilometros_veiculo_no_periodo") {
                        // Find vehicle ID if plate is given
                        let vehicleId = args.identificador_veiculo;
                        // Check if it looks like a UUID
                        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicleId);

                        if (!isUuid) {
                            const { data: vData } = await supabaseClient.from('vehicles').select('id').ilike('plate', vehicleId).single();
                            if (vData) vehicleId = vData.id;
                        }

                        const { data } = await supabaseClient
                            .from('journeys')
                            .select('km_start, km_end')
                            .eq('vehicle_id', vehicleId)
                            .gte('started_at', args.data_inicio)
                            .lte('started_at', args.data_fim);

                        let totalKm = 0;
                        if (data) {
                            totalKm = data.reduce((acc, curr) => {
                                if (curr.km_end && curr.km_start) {
                                    return acc + (curr.km_end - curr.km_start);
                                }
                                return acc;
                            }, 0);
                        }
                        functionResult = JSON.stringify({ veiculo: args.identificador_veiculo, total_km: totalKm, viagens_consideradas: data?.length });
                    }
                    else {
                        functionResult = "Função não encontrada.";
                    }
                } catch (err) {
                    functionResult = `Erro ao executar função: ${err.message}`;
                }

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResult,
                });
            }

            // 6. Second Call to OpenAI with Tool Outputs
            const secondResponse = await openai.chat.completions.create({
                model: model || "gpt-4-turbo-preview",
                messages: messages,
            });

            return new Response(JSON.stringify({ answer: secondResponse.choices[0].message.content }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // No tool calls, just return text
        return new Response(JSON.stringify({ answer: responseMessage.content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
