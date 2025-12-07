import { useParams, useNavigate } from "react-router-dom"
import { useTripDetail } from "@/features/trips/hooks/useTripDetail"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Status } from "@/types"
import { ArrowLeft, MessageSquare, MapPin, CheckCircle, PlayCircle, AlertTriangle } from "lucide-react"

export function TripDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { trip, events, loading, updateStatus } = useTripDetail(id)

    if (loading) {
        return <div className="p-8 text-center">{t('common.loading')}</div>
    }

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted-foreground">{t('trips.notFound')}</p>
                <Button onClick={() => navigate('/trips')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('trips.backToTrips')}
                </Button>
            </div>
        )
    }

    const handleStatusUpdate = async (status: Status) => {
        if (window.confirm(t('common.confirmAction'))) { // Use generic or specific translation
            await updateStatus(status)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">{t('trips.tripTitle', { id: trip.id })}</h1>
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
                    </div>
                    <p className="text-sm text-muted-foreground ml-10">
                        {t('trips.createdOn')} {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString(i18n.language) : 'N/A'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => handleStatusUpdate(Status.Completed)}>
                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        {t('trips.completeTest')}
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusUpdate(Status.Accepted)}>
                        <PlayCircle className="mr-2 h-4 w-4 text-brand-primary" />
                        {t('trips.acceptTest')}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/chat')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('common.message')}
                    </Button>
                    <Button onClick={() => navigate('/map')}>
                        <MapPin className="mr-2 h-4 w-4" />
                        {t('trips.trackOnMap')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Route Details */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                            <MapPin className="h-5 w-5 text-primary" />
                            {t('trips.routeDetails')}
                        </h3>
                        <div className="relative pl-6 border-l-2 border-muted ml-2 space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary ring-2 ring-background" />
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium leading-none">{t('trips.origin')}</span>
                                    <p className="text-sm text-muted-foreground">{trip.origin}</p>
                                    <span className="text-xs text-muted-foreground">{trip.startTime || t('trips.timeNotRegistered')}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1 h-4 w-4 rounded-full border-2 border-muted bg-background ring-2 ring-background" />
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium leading-none">{t('trips.destination')}</span>
                                    <p className="text-sm text-muted-foreground">{trip.destination}</p>
                                    <span className="text-xs text-muted-foreground">ETA: {trip.eta}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg border bg-card p-4 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => navigate(`/drivers/${trip.driverId}`)}>
                            <h4 className="font-semibold text-muted-foreground mb-2">{t('trips.driver')}</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                                    {trip.driver.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{trip.driver}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border bg-card p-4 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => navigate(`/vehicles/${trip.vehicleId}`)}>
                            <h4 className="font-semibold text-muted-foreground mb-2">{t('trips.vehicle')}</h4>
                            <p className="font-medium text-lg">{trip.vehicle}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => trip.trailerId && navigate(`/trailers/edit/${trip.trailerId}`)}>
                            <h4 className="font-semibold text-muted-foreground mb-2">{t('trips.trailer')}</h4>
                            <p className="font-medium text-lg">{trip.trailer || t('common.none')}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Timeline logic simplified for now */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-4">{t('trips.timeline')}</h3>
                        {events.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('trips.noEvents')}</p>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event, i) => (
                                    <div key={event.id} className="flex gap-4 relative">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </p>
                                            <p className="text-sm font-medium leading-none">{event.description || event.event_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
