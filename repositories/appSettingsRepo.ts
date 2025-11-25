import { supabase } from '../services/supabase';

export interface AppSettings {
    id: string;
    is_configured: boolean;
    org_name: string | null;
    logo_url: string | null;
    primary_color: string;
    support_email: string | null;
    support_phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface SetupFormData {
    org_name: string;
    logo_file?: File;
    primary_color: string;
    support_email: string;
    support_phone: string;
}

class AppSettingsRepository {
    /**
     * Get current app settings
     */
    async getSettings(): Promise<AppSettings | null> {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching app settings:', error);
            return null;
        }

        return data;
    }

    /**
     * Check if app is configured
     */
    async isConfigured(): Promise<boolean> {
        const settings = await this.getSettings();
        return settings?.is_configured || false;
    }

    /**
     * Upload organization logo to storage
     */
    async uploadLogo(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('org-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Failed to upload logo: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage
            .from('org-assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * Configure app settings (initial setup)
     */
    async configureApp(formData: SetupFormData): Promise<AppSettings> {
        let logoUrl: string | null = null;

        // Upload logo if provided
        if (formData.logo_file) {
            logoUrl = await this.uploadLogo(formData.logo_file);
        }

        // Check if settings already exist
        const existingSettings = await this.getSettings();

        if (existingSettings) {
            // Update existing settings
            const { data, error } = await supabase
                .from('app_settings')
                .update({
                    is_configured: true,
                    org_name: formData.org_name,
                    logo_url: logoUrl || existingSettings.logo_url,
                    primary_color: formData.primary_color,
                    support_email: formData.support_email,
                    support_phone: formData.support_phone,
                })
                .eq('id', existingSettings.id)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update settings: ${error.message}`);
            }

            return data;
        } else {
            // Insert new settings
            const { data, error } = await supabase
                .from('app_settings')
                .insert({
                    is_configured: true,
                    org_name: formData.org_name,
                    logo_url: logoUrl,
                    primary_color: formData.primary_color,
                    support_email: formData.support_email,
                    support_phone: formData.support_phone,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create settings: ${error.message}`);
            }

            return data;
        }
    }

    /**
     * Update app settings (for admin panel later)
     */
    async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
        const existingSettings = await this.getSettings();

        if (!existingSettings) {
            throw new Error('No settings found to update');
        }

        const { data, error } = await supabase
            .from('app_settings')
            .update(updates)
            .eq('id', existingSettings.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update settings: ${error.message}`);
        }

        return data;
    }
}

export const appSettingsRepo = new AppSettingsRepository();
