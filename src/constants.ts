export interface MenuItem {
    label: string;
    path: string;
    icon: string; // material symbols name
    key?: string;
}

export const MENU_ITEMS: MenuItem[] = [
    { label: 'Dashboard', path: '/', icon: 'dashboard', key: 'sidebar.overview' },
    { label: 'Viagens', path: '/trips', icon: 'route', key: 'sidebar.trips' },
    { label: 'Veículos', path: '/vehicles', icon: 'local_shipping', key: 'sidebar.vehicles' },
    { label: 'Reboques', path: '/trailers', icon: 'rv_hookup', key: 'sidebar.trailers' },
    { label: 'Motoristas', path: '/drivers', icon: 'person', key: 'sidebar.drivers' },
    { label: 'Chat', path: '/chat', icon: 'chat', key: 'sidebar.chat' },
    { label: 'Copiloto IA', path: '/copilot', icon: 'smart_toy', key: 'sidebar.copilot' },
    { label: 'Utilizadores', path: '/users', icon: 'group', key: 'sidebar.users' },
    { label: 'Alertas', path: '/alerts', icon: 'warning', key: 'sidebar.alerts' },
    { label: 'Abastecimentos', path: '/fueling', icon: 'local_gas_station', key: 'sidebar.fueling' },
    { label: 'Relatórios', path: '/reports', icon: 'insights', key: 'sidebar.reports' },
    { label: 'Gestor de Arquivos', path: '/files', icon: 'folder', key: 'sidebar.files' },
];
