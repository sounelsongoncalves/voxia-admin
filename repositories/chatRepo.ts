import { supabase } from '../services/supabase';
import { ChatMessage } from '../types';

export const chatRepo = {
    async getMessages(driverId: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select(`
        id,
        message,
        created_at,
        sender_role,
        admin:admins(name),
        driver:drivers(name)
      `)
            .eq('driver_id', driverId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((msg: any) => {
            const isMe = msg.sender_role === 'admin';
            const senderName = isMe ? 'Você' : (msg.driver?.name || 'Motorista');

            return {
                id: msg.id,
                sender: senderName,
                text: msg.message,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: isMe,
            };
        });
    },

    async sendMessage(driverId: string, text: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                driver_id: driverId,
                admin_id: session.user.id,
                sender_role: 'admin',
                message: text,
            });

        if (error) throw error;
    },

    subscribeToMessages(driverId: string, callback: (msg: ChatMessage) => void) {
        return supabase
            .channel(`chat-${driverId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `driver_id=eq.${driverId}` },
                async (payload) => {
                    const newMsg = payload.new as any;
                    const isMe = newMsg.sender_role === 'admin';

                    callback({
                        id: newMsg.id,
                        sender: isMe ? 'Você' : 'Motorista',
                        text: newMsg.message,
                        timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
            id: driver.id,
            name: driver.name,
            avatar: driver.avatar_url,
            status: driver.status,
            lastMessage: 'Clique para iniciar conversa', // Placeholder, could fetch real last message
            unreadCount: 0
        }));
    },

    async createThread(driverId: string) {
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

    async getOrCreateThread(driverId: string): Promise<string> {
        // In this implementation, the thread ID is the driver ID.
        // We can optionally create a record in chat_threads if needed for other logic,
        // but for now we just return the driverId to navigate to the chat.
        await this.createThread(driverId).catch(() => { }); // Attempt to create, ignore if fails or exists
        return driverId;
    }
};
