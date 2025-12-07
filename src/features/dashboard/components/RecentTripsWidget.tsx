import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Trip, Status } from "@/types"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { useNavigate } from "react-router-dom"

interface RecentTripsWidgetProps {
    trips: Trip[]
    loading: boolean
}

export function RecentTripsWidget({ trips, loading }: RecentTripsWidgetProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <Card className="col-span-1 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('dashboard.recentTrips')}</CardTitle>
                <Button variant="link" onClick={() => navigate('/trips')}>
                    {t('dashboard.viewAll')}
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t('table.id')}</TableHead>
                            <TableHead>{t('table.route')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead className="text-right">{t('table.progress')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    {t('common.loading')}
                                </TableCell>
                            </TableRow>
                        ) : trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    {t('dashboard.noTripsFound')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            trips.map((trip) => (
                                <TableRow key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="cursor-pointer">
                                    <TableCell className="font-medium">{trip.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{trip.origin}</span>
                                            <span className="text-xs text-muted-foreground">to {trip.destination}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                trip.status === Status.InTransit
                                                    ? "secondary"
                                                    : trip.status === Status.Completed
                                                        ? "default" // success color? default is primary. I should add success variant to badge or use CSS class
                                                        : trip.status === Status.Warning
                                                            ? "destructive"
                                                            : "outline"
                                            }
                                            className={
                                                trip.status === Status.InTransit
                                                    ? "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200"
                                                    : trip.status === Status.Completed
                                                        ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200"
                                                        : ""
                                            }
                                        >
                                            {trip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {trip.progress}%
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
