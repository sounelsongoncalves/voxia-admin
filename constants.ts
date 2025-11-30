export interface MenuItem {
    label: string;
    path: string;
    icon: string; // material symbols name
}

export const MENU_ITEMS: MenuItem[] = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Viagens', path: '/trips', icon: 'route' },
    { label: 'Veículos', path: '/vehicles', icon: 'local_shipping' },
    { label: 'Reboques', path: '/trailers', icon: 'rv_hookup' },
    { label: 'Motoristas', path: '/drivers', icon: 'person' },
    { label: 'Chat', path: '/chat', icon: 'chat' },
    { label: 'Copiloto IA', path: '/copilot', icon: 'smart_toy' },
    { label: 'Utilizadores', path: '/users', icon: 'group' },
    { label: 'Alertas', path: '/alerts', icon: 'warning' },
    { label: 'Relatórios', path: '/reports', icon: 'insights' },
    { label: 'Gestor de Arquivos', path: '/files', icon: 'folder' },
];
