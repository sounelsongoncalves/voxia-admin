import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appSettingsRepo, AppSettings } from '../repositories/appSettingsRepo';

interface AppSettingsContextType {
    settings: AppSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    applyBranding: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (!context) {
        throw new Error('useAppSettings must be used within AppSettingsProvider');
    }
    return context;
};

interface AppSettingsProviderProps {
    children: ReactNode;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await appSettingsRepo.getSettings();
            setSettings(data);

            // Apply branding immediately after fetching
            if (data) {
                applyBrandingToDOM(data);
            }
        } catch (error) {
            console.error('Failed to fetch app settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyBrandingToDOM = (appSettings: AppSettings) => {
        // Apply primary color to CSS variable
        if (appSettings.primary_color) {
            document.documentElement.style.setProperty('--color-brand-primary', appSettings.primary_color);
            document.documentElement.style.setProperty('--color-brand-hover', adjustColorBrightness(appSettings.primary_color, -10));
        }

        // Update page title
        if (appSettings.org_name) {
            document.title = `${appSettings.org_name} - Admin Dashboard`;
        }
    };

    const applyBranding = () => {
        if (settings) {
            applyBrandingToDOM(settings);
        }
    };

    const refreshSettings = async () => {
        setLoading(true);
        await fetchSettings();
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <AppSettingsContext.Provider value={{ settings, loading, refreshSettings, applyBranding }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

/**
 * Helper function to adjust color brightness
 */
function adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1).toUpperCase();
}
