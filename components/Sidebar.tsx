import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import { useAppSettings } from './AppSettingsContext';
import { supabase } from '../services/supabase';

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useAppSettings();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen bg-surface-3 border-r border-surface-border flex flex-col fixed left-0 top-0 z-30">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-surface-border">
                {settings?.logo_url ? (
                    <img
                        src={settings.logo_url}
                        alt={settings.org_name || 'Logo'}
                        className="h-8 w-auto mr-3 object-contain"
                    />
                ) : (
                    <img
                        src="/favicon.png"
                        alt="Voxia Logo"
                        className="w-8 h-8 mr-3 rounded-lg"
                    />
                )}
                <span className="text-xl font-bold text-txt-primary tracking-tight">
                    {settings?.org_name || 'Voxia'}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 group ${isActive
                                ? 'bg-surface-2 text-brand-primary font-medium'
                                : 'text-txt-tertiary hover:text-txt-primary hover:bg-surface-2'
                                }`}
                        >
                            <span className={`material-symbols-outlined mr-3 ${isActive ? 'fill-icon' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-surface-border">
                <div className="flex items-center p-2 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors group" onClick={handleLogout}>
                    <div className="w-8 h-8 rounded-full bg-surface-1 flex items-center justify-center text-xs font-bold text-txt-primary mr-3">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-txt-primary truncate">Administrador</p>
                        <p className="text-xs text-txt-tertiary truncate">Sair da conta</p>
                    </div>
                    <span className="material-symbols-outlined text-txt-tertiary text-sm group-hover:text-semantic-error transition-colors">logout</span>
                </div>
            </div>
        </aside>
    );
};
