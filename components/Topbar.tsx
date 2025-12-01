import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { useUser } from './UserContext';
import { alertsRepo } from '../repositories/alertsRepo';
import { Alert } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TopbarProps {
    onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { t } = useTranslation();

    // Dropdown States
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Data States
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.topbar-dropdown')) {
                setIsNotifOpen(false);
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Alerts
    useEffect(() => {
        fetchAlerts();

        // Subscribe to new alerts
        const subscription = alertsRepo.subscribeToAlerts((newAlert) => {
            setAlerts(prev => [newAlert, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await alertsRepo.getAlerts();
            // Filter only unresolved or recent alerts if needed
            setAlerts(data.slice(0, 10)); // Show top 10
            setUnreadCount(data.filter(a => !a.resolved_at).length);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'Critical': return 'error';
            case 'Warning': return 'warning';
            case 'Info': return 'info';
            default: return 'notifications';
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'Critical': return 'text-semantic-error';
            case 'Warning': return 'text-semantic-warning';
            case 'Info': return 'text-brand-primary';
            default: return 'text-txt-tertiary';
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-bg-main sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="inline-flex items-center justify-center rounded-md p-2 text-txt-tertiary hover:bg-surface-2 hover:text-txt-primary focus:outline-none transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Language Selector */}
                <LanguageSwitcher />

                {/* Notifications */}
                <div className="relative topbar-dropdown">
                    <button
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                        className="p-2 rounded-full hover:bg-surface-2 transition-colors text-txt-tertiary hover:text-txt-primary relative w-10 h-10 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-semantic-error rounded-full border-2 border-bg-main"></span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-surface-1 border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="flex justify-between items-center p-4 border-b border-surface-border">
                                <h3 className="font-bold text-txt-primary">{t('topbar.notifications')}</h3>
                                <button className="text-txt-tertiary hover:text-txt-primary" onClick={() => setUnreadCount(0)}>
                                    <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {alerts.length === 0 ? (
                                    <div className="p-4 text-center text-txt-tertiary text-sm">
                                        {t('topbar.noNotifications')}
                                    </div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert.id} className="p-4 border-b border-surface-border hover:bg-surface-2 transition-colors cursor-pointer flex gap-3">
                                            <div className={`w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center ${getAlertColor(alert.type)}`}>
                                                <span className="material-symbols-outlined">{getAlertIcon(alert.type)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-txt-primary">
                                                    <span className="font-bold">{alert.type === 'Critical' ? t('topbar.critical') : alert.type === 'Warning' ? t('topbar.warning') : t('topbar.info')}</span>: {alert.message}
                                                </p>
                                                <p className="text-xs text-txt-tertiary mt-1">{alert.timestamp}</p>
                                            </div>
                                            {!alert.resolved_at && <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 text-center border-t border-surface-border">
                                <button
                                    onClick={() => { navigate('/alerts'); setIsNotifOpen(false); }}
                                    className="text-sm text-brand-primary font-bold hover:underline"
                                >
                                    {t('topbar.viewAllAlerts')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 rounded-full hover:bg-surface-2 transition-colors text-txt-tertiary hover:text-txt-primary w-10 h-10 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">settings</span>
                </button>

                {/* User Profile */}
                <div className="relative topbar-dropdown">
                    <button
                        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-primary transition-all"
                    >
                        <img
                            src={user?.avatar_url || "https://i.pravatar.cc/150?u=admin"}
                            alt={user?.name || "Admin"}
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-surface-1 border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="p-4 border-b border-surface-border flex items-center gap-3">
                                <img
                                    src={user?.avatar_url || "https://i.pravatar.cc/150?u=admin"}
                                    alt={user?.name || "Admin"}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-txt-primary truncate">{user?.name || 'Administrador'}</h3>
                                    <p className="text-xs text-txt-tertiary truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="py-2">
                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-txt-primary hover:bg-surface-2 flex items-center gap-3 transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-txt-tertiary">person</span>
                                    {t('topbar.profile')}
                                </button>
                                <button onClick={() => { navigate('/audit'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-txt-primary hover:bg-surface-2 flex items-center gap-3 transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-txt-tertiary">show_chart</span>
                                    {t('topbar.activityLog')}
                                </button>
                            </div>
                            <div className="border-t border-surface-border py-2">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-txt-primary hover:bg-surface-2 flex items-center gap-3 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-txt-tertiary">logout</span>
                                    {t('sidebar.logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
