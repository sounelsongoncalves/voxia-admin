import { supabase } from '../services/supabase';

export interface AISettings {
    provider: 'google' | 'openai';
    model: string;
    hasKey: boolean; // We don't return the actual key
}

export const aiSettingsRepo = {
    async getSettings(): Promise<AISettings | null> {
        const { data, error } = await supabase
            .rpc('get_ai_config')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching AI settings:', error);
            return null;
        }

        const settings = data as { provider: string; model: string; has_key: boolean };

        return {
            provider: settings.provider as 'google' | 'openai',
            model: settings.model,
            hasKey: settings.has_key
        };
    },

    async saveSettings(provider: 'google' | 'openai', model: string, apiKey: string) {
        // We call an RPC or just insert with pgcrypto function in the query
        // Since Supabase JS client doesn't support calling SQL functions directly in insert easily without RPC,
        // we will use an RPC function to handle the encryption safely on the server side
        // OR we can use the edge function to save it.
        // Let's create a simple RPC for this to ensure security and use pgcrypto.

        const { error } = await supabase.rpc('save_ai_settings', {
            p_provider: provider,
            p_model: model,
            p_api_key: apiKey
        });

        if (error) throw error;
    }
};
