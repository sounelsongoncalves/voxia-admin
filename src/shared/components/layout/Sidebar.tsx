import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
    LayoutDashboard,
    Map,
    Truck,
    Container,
    Users,
    MessageSquare,
    Bot,
    Settings,
    Bell,
    Fuel,
    FileText,
    FolderOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { useTheme } from "@/shared/components/theme-provider"
import { useState } from "react"

const MENU_ITEMS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Viagens', path: '/trips', icon: Map },
    { label: 'Veículos', path: '/vehicles', icon: Truck },
    { label: 'Reboques', path: '/trailers', icon: Container },
    { label: 'Motoristas', path: '/drivers', icon: Users },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Copiloto IA', path: '/copilot', icon: Bot },
    { label: 'Abastecimentos', path: '/fueling', icon: Fuel },
    { label: 'Relatórios', path: '/reports', icon: FileText },
    { label: 'Arquivos', path: '/files', icon: FolderOpen },
    { label: 'Alertas', path: '/alerts', icon: Bell },
    { label: 'Configurações', path: '/settings', icon: Settings },
]

interface SidebarProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const location = useLocation()
    const { t } = useTranslation()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <Menu className="h-6 w-6" />
            </Button>

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 md:relative",
                    isOpen ? "w-64" : "w-20",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex h-16 items-center border-b px-4">
                    <div className={cn("flex items-center gap-2 font-bold text-xl transition-all", !isOpen && "scale-0 w-0 opacity-0")}>
                        <span className="text-primary">Voxia</span>
                        <span>Admin</span>
                    </div>
                    {/* Logo Icon only when collapsed */}
                    {!isOpen && (
                        <div className="mx-auto font-bold text-xl text-primary">V</div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="grid gap-1 px-2">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                            isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground",
                                            !isOpen && "justify-center px-2"
                                        )}
                                        title={!isOpen ? item.label : undefined}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <Icon className="h-5 w-5 shrink-0" />
                                        <span className={cn("truncate transition-all", !isOpen && "hidden w-0")}>
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="border-t p-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className={cn(!isOpen && "hidden")}>Recolher</span>
                    </Button>
                </div>
            </aside>
        </>
    )
}
