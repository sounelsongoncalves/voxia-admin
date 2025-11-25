import { supabase } from './supabase';

export interface CopilotQuery {
    question: string;
}

export interface CopilotResponse {
    answer: string;
    cards?: any[];
    tables?: any[];
    suggestions?: string[];
}

export const copilotService = {
    async query(queryData: CopilotQuery): Promise<CopilotResponse> {
        try {
            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('copilot-query', {
                body: queryData,
            });

            if (error) {
                // Parse error message from body if available
                let errorMessage = error.message;
                try {
                    // Sometimes the error body is a stringified JSON
                    const body = JSON.parse(error.message);
                    if (body && body.error) errorMessage = body.error;
                } catch (e) {
                    // ignore
                }
                throw new Error(errorMessage);
            }

            return data as CopilotResponse;
        } catch (error: any) {
            console.error('Copilot query error:', error);
            throw error;
        }
    },

    async getHistory(): Promise<any[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data: conversation } = await supabase
            .from('copilot_conversations')
            .select('id')
            .eq('admin_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!conversation) return [];

        const { data: messages } = await supabase
            .from('copilot_messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

        return messages || [];
    },

    getSuggestions(): string[] {
        return [
            'Quantas viagens ativas temos agora?',
            'Qual a eficiência média de combustível da frota?',
            'Mostre os motoristas com melhor taxa de pontualidade',
            'Quais veículos precisam de manutenção?',
        ];
    }
};
