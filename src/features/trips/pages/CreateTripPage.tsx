import { useNavigate } from "react-router-dom"
import * as React from "react"
import { useTranslation } from "react-i18next"
import { useCreateTrip } from "@/features/trips/hooks/useCreateTrip"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useToast } from "@/components/ToastContext"
import { ArrowLeft, Map as MapIcon, Truck, Box, Thermometer } from "lucide-react"

export function CreateTripPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { showToast } = useToast()

    const {
        drivers,
        vehicles,
        trailers,
        loadingResources,
        loading,
        formData,
        estimatedDistance,
        estimatedTime,
        handleChange,
        submitTrip
    } = useCreateTrip()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitTrip(
            () => {
                showToast(t('trips.createSuccess'), 'success')
                navigate('/trips')
            },
            (msg) => {
                showToast(msg, 'error')
            }
        )
    }

    if (loadingResources) {
        return <div className="p-8 text-center">{t('common.loading')}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('trips.createNewTrip')}</h1>
                    <p className="text-sm text-muted-foreground">{t('trips.subtitle', 'Create a new logicstics instruction')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapIcon className="h-5 w-5 text-primary" />
                                    {t('trips.routeAndSchedule')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.origin')}</label>
                                    <Input
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleChange}
                                        placeholder={t('trips.originPlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.destination')}</label>
                                    <Input
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder={t('trips.destinationPlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">{t('trips.startTime')}</label>
                                    <Input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                        className="block" // specific styling for datetime-local
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    {t('trips.resources')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.driver')}</label>
                                    <select
                                        name="driver"
                                        value={formData.driver}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="">{t('trips.selectDriver')}</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.vehicle')}</label>
                                    <select
                                        name="vehicle"
                                        value={formData.vehicle}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="">{t('trips.selectVehicle')}</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.trailerOptional')}</label>
                                    <select
                                        name="trailer"
                                        value={formData.trailer}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">{t('trips.selectTrailer')}</option>
                                        {trailers.map(t => (
                                            <option key={t.id} value={t.id}>{t.plate} ({t.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('trips.cargoType')}</label>
                                    <select
                                        name="cargoType"
                                        value={formData.cargoType}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">{t('trips.selectType')}</option>
                                        <option value="general">{t('trips.cargoTypes.general')}</option>
                                        <option value="refrigerated">{t('trips.cargoTypes.refrigerated')}</option>
                                        <option value="dangerous">{t('trips.cargoTypes.dangerous')}</option>
                                        <option value="grain">{t('trips.cargoTypes.grain')}</option>
                                    </select>
                                </div>

                                {formData.cargoType === 'refrigerated' && (
                                    <div className="col-span-2 grid grid-cols-2 gap-4 bg-muted p-4 rounded-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-1">
                                                <Thermometer className="h-4 w-4" />
                                                {t('trips.tempFront')}
                                            </label>
                                            <Input
                                                type="number"
                                                name="tempFront"
                                                value={formData.tempFront}
                                                onChange={handleChange}
                                                placeholder="°C"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-1">
                                                <Thermometer className="h-4 w-4" />
                                                {t('trips.tempRear')}
                                            </label>
                                            <Input
                                                type="number"
                                                name="tempRear"
                                                value={formData.tempRear}
                                                onChange={handleChange}
                                                placeholder="°C"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">{t('trips.jobDescriptionLabel')}</label>
                                    <textarea
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleChange as any}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder={t('trips.jobDescriptionPlaceholder')}
                                    />
                                </div>

                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button type="button" variant="outline" onClick={() => navigate('/trips')}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? t('common.creating') : t('trips.confirmTrip')}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Map Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('trips.routePreview')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative h-64 w-full bg-muted">
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-slate-900/10">
                                    {/* Simulated map */}
                                    <MapIcon className="h-12 w-12 opacity-20" />
                                </div>
                                {/* Route Path SVG Mock */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                                    <path
                                        d="M 50 150 Q 150 50 250 150"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray="8 4"
                                        className="text-primary"
                                    />
                                    <circle cx="50" cy="150" r="4" className="fill-primary" />
                                    <circle cx="250" cy="150" r="4" className="fill-amber-500" />
                                </svg>
                            </div>
                            <div className="p-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('trips.estimatedDistance')}</span>
                                    <span className="font-bold">{estimatedDistance ? `${estimatedDistance} km` : '--'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('trips.estimatedTime')}</span>
                                    <span className="font-bold">{estimatedTime || '--'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
