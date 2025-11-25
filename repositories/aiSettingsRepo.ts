import { supabase } from '../services/supabase';

export interface AISettings {
    provider: 'google' | 'openai';
    model: string;
    hasKey: boolean; // We don't return the actual key
}

export const aiSettingsRepo = {
    async getSettings(): Promise<AISettings | null> {
        const { data, error } = await supabase
            .from('ai_settings')
            .select('provider, model, api_key_encrypted')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return {
            provider: data.provider as 'google' | 'openai',
            model: data.model,
            hasKey: !!data.api_key_encrypted
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
