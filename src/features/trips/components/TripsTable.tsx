import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Trip, Status } from "@/types"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Eye, ArrowRight } from "lucide-react"

interface TripsTableProps {
    trips: Trip[]
    loading: boolean
    onDelete: (id: string) => void
}

export function TripsTable({ trips, loading, onDelete }: TripsTableProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (window.confirm(t('trips.deleteConfirmation'))) {
            onDelete(id)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('trips.table.tripId')}</TableHead>
                        <TableHead>{t('table.route')}</TableHead>
                        <TableHead>{t('trips.table.driver')}</TableHead>
                        <TableHead>{t('trips.table.vehicle')}</TableHead>
                        <TableHead>{t('trips.table.eta')}</TableHead>
                        <TableHead>{t('table.status')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                {t('common.loading')}
                            </TableCell>
                        </TableRow>
                    ) : trips.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                {t('trips.noTripsFound')}
                            </TableCell>
                        </TableRow>
                    ) : (
                        trips.map((trip) => (
                            <TableRow key={trip.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/trips/${trip.id}`)}>
                                <TableCell className="font-medium font-mono">
                                    {trip.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{trip.origin}</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <ArrowRight className="h-3 w-3" />
                                            <span>{trip.destination}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{trip.driver}</TableCell>
                                <TableCell>{trip.vehicle}</TableCell>
                                <TableCell className="font-mono text-muted-foreground">{trip.eta}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            trip.status === Status.InTransit
                                                ? "secondary"
                                                : trip.status === Status.Completed
                                                    ? "default"
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
                                        {t(`statusValues.${trip.status}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate('/trips/create'); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, trip.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
