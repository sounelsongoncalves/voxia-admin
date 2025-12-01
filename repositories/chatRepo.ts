import { supabase } from '../services/supabase';
import { ChatMessage } from '../types';

export const chatRepo = {
    async getMessages(threadId: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select(`
        id,
        message,
        sent_at,
        sender_admin_id,
        sender_driver_id
      `)
            .eq('thread_id', threadId)
            .order('sent_at', { ascending: true });

        if (error) throw error;

        return data.map((msg: any) => {
            const isMe = !!msg.sender_admin_id;
            const senderName = isMe ? 'Você' : 'Motorista';

            return {
                id: msg.id,
                sender: senderName,
                text: msg.message,
                timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: isMe,
            };
        });
    },

    async sendMessage(threadId: string, text: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                thread_id: threadId,
                sender_admin_id: session.user.id,
                sender_driver_id: null,
                message: text,
                sender_role: 'admin',
                sent_at: new Date().toISOString()
            });

        if (error) throw error;
    },

    subscribeToMessages(threadId: string, callback: (msg: ChatMessage) => void) {
        return supabase
            .channel(`chat-${threadId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${threadId}` },
                async (payload) => {
                    const newMsg = payload.new as any;
                    const isMe = !!newMsg.sender_admin_id;

                    callback({
                        id: newMsg.id,
                        sender: isMe ? 'Você' : 'Motorista',
                        text: newMsg.message,
                        timestamp: new Date(newMsg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: isMe,
                    });
                }
            )
            .subscribe();
    },

    async getThreads() {
        // List drivers as threads
        const { data, error } = await supabase
            .from('drivers')
            .select('id, name, avatar_url, status')
            .order('name');

        if (error) throw error;

        return data.map((driver: any) => ({
            id: driver.id, // This is driverId, NOT threadId yet
            name: driver.name,
            avatar: driver.avatar_url,
            status: driver.status,
            lastMessage: 'Clique para iniciar conversa',
            unreadCount: 0
        }));
    },

    async getOrCreateThread(driverId: string): Promise<string> {
        // Check if thread exists
        const { data: existing } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('driver_id', driverId)
            .single();

        if (existing) return existing.id;

        const { data, error } = await supabase
            .from('chat_threads')
            .insert({ driver_id: driverId })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    },

    async deleteThread(threadId: string) {
        // Delete messages first
        const { error: msgError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('thread_id', threadId);

        if (msgError) throw msgError;

        // Delete thread
        const { error: threadError } = await supabase
            .from('chat_threads')
            .delete()
            .eq('id', threadId);

        if (threadError) throw threadError;
    }
};
