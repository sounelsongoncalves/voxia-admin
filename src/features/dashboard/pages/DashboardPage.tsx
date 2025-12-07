import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData"
import { StatCard } from "@/features/dashboard/components/StatCard"
import { RecentTripsWidget } from "@/features/dashboard/components/RecentTripsWidget"
import { useTranslation } from "react-i18next"
import { Users, Truck, Map as MapIcon, AlertTriangle } from "lucide-react"

// Import existing charts (migrating them to use new UI style in future tasks)
import { TripsPerDayChart } from "@/components/charts/TripsPerDayChart"
import { TopDriversChart } from "@/components/charts/TopDriversChart"
import { FuelConsumptionChart } from "@/components/charts/FuelConsumptionChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

export function DashboardPage() {
    const {
        loading,
        kpis,
        recentTrips,
        tripsPerDayData,
        topDriversData,
        fuelConsumptionData
    } = useDashboardData()

    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t('dashboard.onlineDrivers')}
                    value={kpis.activeDrivers}
                    icon={Users}
                    description={`${kpis.totalDrivers} ${t('common.total')}`}
                    className="border-l-4 border-l-emerald-500"
                />
                <StatCard
                    title={t('dashboard.vehiclesInUse')}
                    value={kpis.vehiclesInUse}
                    icon={Truck}
                    description={`${kpis.totalVehicles} ${t('common.total')}`}
                    className="border-l-4 border-l-blue-500"
                />
                <StatCard
                    title={t('dashboard.activeTrips')}
                    value={kpis.activeTrips}
                    icon={MapIcon}
                    className="border-l-4 border-l-indigo-500"
                />
                <StatCard
                    title={t('dashboard.openAlerts')}
                    value={kpis.openAlerts}
                    icon={AlertTriangle}
                    trend={kpis.openAlerts > 0 ? "Requires Attention" : "All Good"}
                    trendUp={kpis.openAlerts === 0}
                    className="border-l-4 border-l-amber-500"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('dashboard.tripsPerDay')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <TripsPerDayChart data={tripsPerDayData} />
                    </CardContent>
                </Card>

                {/* Secondary Charts */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('dashboard.topDrivers')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopDriversChart data={topDriversData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
                <RecentTripsWidget trips={recentTrips} loading={loading} />
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('dashboard.fuelConsumption')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FuelConsumptionChart data={fuelConsumptionData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
