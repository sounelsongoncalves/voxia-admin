import { useState } from "react"
import { useTrips } from "@/features/trips/hooks/useTrips"
import { TripsTable } from "@/features/trips/components/TripsTable"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Filter } from "lucide-react"
import { useToast } from "@/components/ToastContext" // Still using legacy ToastContext for now as I haven't migrated it fully yet, or should I use a new one? Use legacy for now to avoid breaking too much.

export function TripsPage() {
    const { trips, loading, deleteTrip } = useTrips()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const filteredTrips = trips.filter(trip => {
        const matchesSearch =
            trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || trip.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleDelete = async (id: string) => {
        try {
            await deleteTrip(id, () => {
                showToast(t('trips.deleteSuccess'), 'success')
            })
        } catch (error) {
            showToast(t('trips.deleteError'), 'error')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('trips.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('trips.subtitle', 'Manage and monitor all logistics trips')}</p>
                </div>
                <Button onClick={() => navigate('/trips/create')} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('trips.create')}
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('trips.searchPlaceholder')}
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Simple Select for Status Filter - Ideally replace with Select component */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-[180px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">{t('trips.allStatus')}</option>
                        <option value="Active">{t('statusValues.Active')}</option>
                        <option value="Accepted">{t('statusValues.Accepted')}</option>
                        <option value="Completed">{t('statusValues.Completed')}</option>
                        <option value="InTransit">{t('statusValues.InTransit')}</option>
                        <option value="Warning">{t('statusValues.Warning')}</option>
                    </select>
                </div>
            </div>

            <TripsTable
                trips={filteredTrips}
                loading={loading}
                onDelete={handleDelete}
            />
        </div>
    )
}
