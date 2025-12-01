import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MENU_ITEMS } from '../constants';
import { useAppSettings } from './AppSettingsContext';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { t } = useTranslation();

    const { settings } = useAppSettings();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out bg-bg-main border-r border-surface-border flex flex-col 
                ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-20'} md:static`}>

                {/* Logo Area */}
                <div className={`h-16 flex items-center ${isOpen ? 'px-6' : 'justify-center px-2'}`}>
                    {settings?.logo_url ? (
                        <img
                            src={settings.logo_url}
                            alt={settings.org_name || 'Logo'}
                            className={`h-8 w-auto object-contain ${isOpen ? 'mr-3' : ''}`}
                        />
                    ) : (
                        <img
                            src="/favicon.png"
                            alt="Voxia Logo"
                            className={`w-8 h-8 rounded-lg ${isOpen ? 'mr-3' : ''}`}
                        />
                    )}
                    <span className={`text-xl font-bold text-txt-primary tracking-tight whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                        {settings?.org_name || 'Voxia'}
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 overflow-x-hidden">
                    {MENU_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center py-2.5 rounded-lg transition-colors duration-200 group whitespace-nowrap border-l-2 ${isOpen ? 'px-3' : 'justify-center px-0'
                                    } ${isActive
                                        ? 'bg-surface-2 border-brand-primary text-brand-primary font-medium'
                                        : 'border-transparent text-txt-tertiary hover:text-txt-primary hover:bg-surface-2'
                                    }`}
                                title={!isOpen ? (item.key ? t(item.key) : item.label) : ''}
                            >
                                <span className={`material-symbols-outlined ${isOpen ? 'mr-3' : ''} ${isActive ? 'fill-icon' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                                    {item.key ? t(item.key) : item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>


            </aside>
        </>
    );
};
