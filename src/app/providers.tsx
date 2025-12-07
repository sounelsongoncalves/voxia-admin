import React from 'react';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { ToastProvider } from '@/components/ToastContext';
import { AppSettingsProvider } from '@/components/AppSettingsContext';
import { UserProvider } from '@/components/UserContext';
import { BrowserRouter } from 'react-router-dom';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="voxia-ui-theme">
            <AppSettingsProvider>
                <UserProvider>
                    <ToastProvider>
                        <BrowserRouter>
                            {children}
                        </BrowserRouter>
                    </ToastProvider>
                </UserProvider>
            </AppSettingsProvider>
        </ThemeProvider>
    );
}
