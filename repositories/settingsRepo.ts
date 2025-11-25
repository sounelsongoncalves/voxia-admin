import { supabase } from '../services/supabase';

export interface SystemPreferences {
    id: string;
    dark_mode: boolean;
    realtime_notifications: boolean;
    copilot_auto_analysis: boolean;
}

export const settingsRepo = {
    async getPreferences(): Promise<SystemPreferences | null> {
        const { data, error } = await supabase
            .from('system_preferences')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            // If no preferences found, create default
            if (error.code === 'PGRST116') {
                return this.createDefaultPreferences();
            }
            console.error('Error fetching preferences:', error);
            return null;
        }

        return data;
    },

    async createDefaultPreferences(): Promise<SystemPreferences> {
        const { data, error } = await supabase
            .from('system_preferences')
            .insert({
                dark_mode: true,
                realtime_notifications: true,
                copilot_auto_analysis: false
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePreferences(updates: Partial<SystemPreferences>) {
        // First get the ID (assuming single row for now per org/admin context)
        const current = await this.getPreferences();
        if (!current) throw new Error('Could not find preferences to update');

        const { data, error } = await supabase
            .from('system_preferences')
            .update(updates)
            .eq('id', current.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
