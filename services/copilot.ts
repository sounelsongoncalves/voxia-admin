
import { supabase } from './supabase';

export interface CopilotQuery {
    question: string;
    conversationId?: string;
    attachment?: {
        name: string;
        type: string;
        content: string; // base64
    };
}

export interface CopilotResponse {
    answer: string;
    cards?: any[];
    tables?: any[];
    suggestions?: string[];
    conversationId?: string;
}

export const copilotService = {
    async query(queryData: CopilotQuery): Promise<CopilotResponse> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            let conversationId = queryData.conversationId || null;

            // 1. Create Conversation if not provided (New Chat)
            if (session && !conversationId) {
                const { data: newConv } = await supabase
                    .from('copilot_conversations')
                    .insert([{ admin_id: session.user.id }])
                    .select()
                    .single();

                if (newConv) conversationId = newConv.id;
            }

            // 2. Save User Message
            if (session && conversationId) {
                await supabase.from('copilot_messages').insert({
                    conversation_id: conversationId,
                    role: 'admin',
                    content: queryData.question
                });
            }

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

            const response = data as CopilotResponse;
            if (conversationId) response.conversationId = conversationId;

            // 3. Save AI Response
            if (session && conversationId) {
                await supabase.from('copilot_messages').insert({
                    conversation_id: conversationId,
                    role: 'ai',
                    content: response.answer
                });
            }

            return response;
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

        return this.getConversationMessages(conversation.id);
    },

    async getAllConversations(): Promise<any[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data: conversations } = await supabase
            .from('copilot_conversations')
            .select('id, created_at')
            .eq('admin_id', session.user.id)
            .order('created_at', { ascending: false });

        return conversations || [];
    },

    async getConversationMessages(conversationId: string): Promise<any[]> {
        const { data: messages } = await supabase
            .from('copilot_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        return messages || [];
    },

    async deleteConversation(conversationId: string): Promise<void> {
        // Delete messages first (manual cascade)
        const { error: msgError } = await supabase
            .from('copilot_messages')
            .delete()
            .eq('conversation_id', conversationId);

        if (msgError) console.error('Error deleting messages:', msgError);

        // Delete conversation
        const { error } = await supabase
            .from('copilot_conversations')
            .delete()
            .eq('id', conversationId);

        if (error) throw error;
    },

    getSuggestions(): string[] {
        return [
            'copilot.suggestions.activeTrips',
            'copilot.suggestions.fuelEfficiency',
            'copilot.suggestions.punctuality',
            'copilot.suggestions.maintenance',
        ];
    }
};
