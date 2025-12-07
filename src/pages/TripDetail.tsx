
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripsRepo } from '../repositories/tripsRepo';
import { journeysRepo } from '../repositories/journeysRepo';
import { eventsRepo } from '../repositories/eventsRepo';
import { Trip, Status } from '../types';

export const TripDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const tripData = await tripsRepo.getTripById(id);
        setTrip(tripData);

        // Fetch journey events for timeline
        const journeys = await journeysRepo.getJourneysByTripId(id);
        if (journeys.length > 0) {
          const journeyEvents = await eventsRepo.getEventsByJourneyId(journeys[0].id);
          setEvents(journeyEvents);
        }
      } catch (error) {
        console.error('Failed to fetch trip details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-txt-tertiary">{t('trips.loadingDetails')}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-txt-tertiary">{t('trips.notFound')}</p>
        <button
          onClick={() => navigate('/trips')}
          className="px-4 py-2 bg-brand-primary text-bg-main rounded-lg"
        >
          {t('trips.backToTrips')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>{t('sidebar.overview')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trips')}>{t('sidebar.trips')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{trip.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-txt-primary mb-2">{t('trips.tripTitle', { id: trip.id })}</h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${trip.status === Status.InTransit ? 'bg-semantic-info/10 text-semantic-info border-semantic-info/20' :
              trip.status === Status.Completed ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' :
                trip.status === Status.Accepted ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                  trip.status === Status.Warning ? 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20' :
                    'bg-surface-3 text-txt-disabled border-surface-border'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${trip.status === Status.InTransit ? 'bg-semantic-info' :
                trip.status === Status.Completed ? 'bg-semantic-success' :
                  trip.status === Status.Accepted ? 'bg-brand-primary' :
                    trip.status === Status.Warning ? 'bg-semantic-warning' :
                      'bg-txt-disabled'
                }`}></span>
              {t(`statusValues.${trip.status}`)}
            </span>
            <span className="text-sm text-txt-tertiary">
              {t('trips.createdOn')} {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString(i18n.language) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (window.confirm(t('trips.forceCompleteConfirmation'))) {
                try {
                  await tripsRepo.updateTripStatus(trip.id, Status.Completed);
                  setTrip({ ...trip, status: Status.Completed });
                } catch (e) {
                  console.error(e);
                  alert(t('trips.completeError'));
                }
              }
            }}
            className="px-4 py-2 bg-semantic-warning/10 hover:bg-semantic-warning/20 border border-semantic-warning/30 text-semantic-warning rounded-lg text-sm font-medium transition-colors"
          >
            {t('trips.completeTest')}
          </button>
          <button
            onClick={async () => {
              if (window.confirm(t('trips.forceAcceptConfirmation'))) {
                try {
                  await tripsRepo.updateTripStatus(trip.id, Status.Accepted);
                  setTrip({ ...trip, status: Status.Accepted });
                } catch (e) {
                  console.error(e);
                  alert(t('trips.acceptError'));
                }
              }
            }}
            className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary rounded-lg text-sm font-medium transition-colors"
          >
            {t('trips.acceptTest')}
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-surface-1 hover:bg-surface-2 border border-surface-border text-txt-primary rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            {t('common.message')}
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg text-sm transition-colors shadow-lg shadow-brand-primary/20"
          >
            {t('trips.trackOnMap')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Route Card */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-txt-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">map</span>
              {t('trips.routeDetails')}
            </h3>

            <div className="relative pl-4 border-l-2 border-surface-border space-y-8">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-brand-primary border-2 border-bg-main"></div>
                <p className="text-xs text-txt-tertiary mb-1">{t('trips.origin')} - {trip.startTime || t('trips.timeNotRegistered')}</p>
                <p className="text-txt-primary font-bold text-lg">{trip.origin}</p>
                <p className="text-sm text-txt-secondary mt-1">{t('trips.mainHub')}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-bg-main border-2 border-txt-tertiary"></div>
                <p className="text-xs text-txt-tertiary mb-1">{t('trips.destination')} - ETA: {trip.eta}</p>
                <p className="text-txt-primary font-bold text-lg">{trip.destination}</p>
                <p className="text-sm text-txt-secondary mt-1">{t('trips.centralWarehouse')}</p>
              </div>
            </div>

            {/* Job Description & Temps */}
            {(trip.jobDescription || trip.tempFront !== undefined || trip.tempRear !== undefined) && (
              <div className="mt-8 pt-6 border-t border-surface-border">
                <h4 className="text-sm font-bold text-txt-secondary uppercase tracking-wider mb-4">{t('trips.cargoDetails')}</h4>

                {trip.jobDescription && (
                  <div className="mb-4">
                    <p className="text-xs text-txt-tertiary mb-1">{t('trips.jobDescription')}</p>
                    <p className="text-txt-primary bg-surface-2 p-3 rounded-lg text-sm">{trip.jobDescription}</p>
                  </div>
                )}

                {(trip.tempFront !== undefined || trip.tempRear !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    {trip.tempFront !== undefined && (
                      <div className="bg-surface-2 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-txt-tertiary">{t('trips.tempFront')}</p>
                          <p className="text-lg font-bold text-brand-primary">{trip.tempFront}°C</p>
                        </div>
                        <span className="material-symbols-outlined text-txt-tertiary">ac_unit</span>
                      </div>
                    )}
                    {trip.tempRear !== undefined && (
                      <div className="bg-surface-2 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-txt-tertiary">{t('trips.tempRear')}</p>
                          <p className="text-lg font-bold text-brand-primary">{trip.tempRear}°C</p>
                        </div>
                        <span className="material-symbols-outlined text-txt-tertiary">ac_unit</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Driver Card */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-6 cursor-pointer hover:border-brand-primary/50 transition-colors" onClick={() => navigate(`/drivers/${trip.driverId}`)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-txt-primary">{t('trips.driver')}</h3>
                <span className="material-symbols-outlined text-txt-tertiary">id_card</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-txt-tertiary font-bold">
                  {trip.driver.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-txt-primary">{trip.driver}</p>
                  <div className="flex items-center gap-2 text-sm text-txt-tertiary">
                    <span>ID: {trip.driverId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-6 cursor-pointer hover:border-brand-primary/50 transition-colors" onClick={() => navigate(`/vehicles/${trip.vehicleId}`)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-txt-primary">{t('trips.vehicle')}</h3>
                <span className="material-symbols-outlined text-txt-tertiary">local_shipping</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center text-brand-primary">
                  <span className="material-symbols-outlined text-2xl">local_shipping</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-txt-primary">{trip.vehicle}</p>
                </div>
              </div>
            </div>

            {/* Trailer Card */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-6 cursor-pointer hover:border-brand-primary/50 transition-colors" onClick={() => trip.trailerId && navigate(`/trailers/edit/${trip.trailerId}`)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-txt-primary">{t('trips.trailer')}</h3>
                <span className="material-symbols-outlined text-txt-tertiary">local_shipping</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center text-brand-primary">
                  <span className="material-symbols-outlined text-2xl">local_shipping</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-txt-primary">{trip.trailer || t('common.none')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Info */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h3 className="font-bold text-txt-primary mb-4">{t('trips.cargoInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">{t('trips.cargoType')}</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.type || t('common.notProvided')}</p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">{t('trips.totalWeight')}</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.weight || t('common.notProvided')}</p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">{t('trips.declaredValue')}</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.value || t('common.notProvided')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Gallery */}
        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <h3 className="font-bold text-txt-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-primary">photo_library</span>
            {t('trips.gallery')}
          </h3>
          {events.filter(e => e.metadata?.photo_url).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {events.filter(e => e.metadata?.photo_url).map((event) => (
                <div
                  key={event.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-surface-border cursor-pointer"
                  onClick={() => window.open(event.metadata.photo_url, '_blank')}
                >
                  <img
                    src={event.metadata.photo_url}
                    alt={event.event_type}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">visibility</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
                    {event.description || event.event_type}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-txt-tertiary border-2 border-dashed border-surface-border rounded-lg">
              <span className="material-symbols-outlined text-4xl mb-2">no_photography</span>
              <p>{t('trips.noPhotos')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Map / Timeline */}
      <div className="lg:col-span-1 space-y-6">
        <div
          className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden h-80 flex flex-col cursor-pointer hover:border-brand-primary transition-colors"
          onClick={() => navigate('/map')}
        >
          <div className="p-4 border-b border-surface-border bg-surface-3 flex justify-between items-center">
            <h3 className="font-bold text-txt-primary">{t('common.map')}</h3>
            <span className="text-xs text-brand-primary hover:underline">{t('common.expand')}</span>
          </div>
          <div className="flex-1 relative bg-bg-sec">
            {/* Static Map Placeholder */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                    radial-gradient(#2A2E35 1px, transparent 1px),
                    linear-gradient(to right, rgba(42, 46, 53, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(42, 46, 53, 0.1) 1px, transparent 1px)
                  `,
                backgroundSize: '20px 20px, 40px 40px, 40px 40px'
              }}
            ></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(0,204,153,0.5)] animate-pulse"></div>
              <div className="bg-surface-1/90 backdrop-blur px-3 py-1 rounded-lg mt-2 text-xs font-bold text-txt-primary border border-surface-border">
                {t(`statusValues.${Status.InTransit}`)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <h3 className="font-bold text-txt-primary mb-4">{t('trips.timeline')}</h3>
          <div className="space-y-6">
            {events.length === 0 ? (
              <p className="text-sm text-txt-tertiary">{t('trips.noEvents')}</p>
            ) : (
              events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-brand-primary' : 'bg-txt-tertiary'}`}></div>
                    {index < events.length - 1 && <div className="w-0.5 h-full bg-surface-3 my-1"></div>}
                  </div>
                  <div className="pb-1 flex-1">
                    <p className="text-xs text-txt-tertiary">
                      {new Date(event.timestamp).toLocaleString(i18n.language, {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm font-medium text-txt-primary">
                      {event.description || event.event_type}
                    </p>
                    {event.location && (
                      <p className="text-xs text-txt-tertiary mt-1">
                        {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                      </p>
                    )}
                    {event.metadata?.photo_url && (
                      <div className="mt-2">
                        <img
                          src={event.metadata.photo_url}
                          alt={t('trips.proof')}
                          className="w-24 h-24 object-cover rounded-lg border border-surface-border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(event.metadata.photo_url, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
