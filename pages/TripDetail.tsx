
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tripsRepo } from '../repositories/tripsRepo';
import { journeysRepo } from '../repositories/journeysRepo';
import { eventsRepo } from '../repositories/eventsRepo';
import { Trip, Status } from '../types';

export const TripDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
        <p className="text-txt-tertiary">Carregando detalhes da viagem...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-txt-tertiary">Viagem não encontrada</p>
        <button
          onClick={() => navigate('/trips')}
          className="px-4 py-2 bg-brand-primary text-bg-main rounded-lg"
        >
          Voltar para Viagens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trips')}>Viagens</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{trip.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-txt-primary mb-2">Viagem {trip.id}</h1>
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
              {trip.status}
            </span>
            <span className="text-sm text-txt-tertiary">Criada em 24/10/2024</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (window.confirm('Forçar conclusão da viagem? (Apenas para teste)')) {
                try {
                  await tripsRepo.updateTripStatus(trip.id, Status.Completed);
                  setTrip({ ...trip, status: Status.Completed });
                } catch (e) {
                  console.error(e);
                  alert('Erro ao concluir viagem');
                }
              }
            }}
            className="px-4 py-2 bg-semantic-warning/10 hover:bg-semantic-warning/20 border border-semantic-warning/30 text-semantic-warning rounded-lg text-sm font-medium transition-colors"
          >
            Concluir (Teste)
          </button>
          <button
            onClick={async () => {
              if (window.confirm('Simular aceite do motorista?')) {
                try {
                  await tripsRepo.updateTripStatus(trip.id, Status.Accepted);
                  setTrip({ ...trip, status: Status.Accepted });
                } catch (e) {
                  console.error(e);
                  alert('Erro ao aceitar viagem');
                }
              }
            }}
            className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary rounded-lg text-sm font-medium transition-colors"
          >
            Aceitar (Teste)
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-surface-1 hover:bg-surface-2 border border-surface-border text-txt-primary rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            Mensagem
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg text-sm transition-colors shadow-lg shadow-brand-primary/20"
          >
            Rastrear no Mapa
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
              Detalhes da Rota
            </h3>

            <div className="relative pl-4 border-l-2 border-surface-border space-y-8">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-brand-primary border-2 border-bg-main"></div>
                <p className="text-xs text-txt-tertiary mb-1">Origem - {trip.startTime || 'Horário não registrado'}</p>
                <p className="text-txt-primary font-bold text-lg">{trip.origin}</p>
                <p className="text-sm text-txt-secondary mt-1">CD Principal - Doca 04</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-bg-main border-2 border-txt-tertiary"></div>
                <p className="text-xs text-txt-tertiary mb-1">Destino - ETA: {trip.eta}</p>
                <p className="text-txt-primary font-bold text-lg">{trip.destination}</p>
                <p className="text-sm text-txt-secondary mt-1">Armazém Central</p>
              </div>
            </div>

            {/* Job Description & Temps */}
            {(trip.jobDescription || trip.tempFront !== undefined || trip.tempRear !== undefined) && (
              <div className="mt-8 pt-6 border-t border-surface-border">
                <h4 className="text-sm font-bold text-txt-secondary uppercase tracking-wider mb-4">Detalhes da Carga</h4>

                {trip.jobDescription && (
                  <div className="mb-4">
                    <p className="text-xs text-txt-tertiary mb-1">Descrição do Trabalho</p>
                    <p className="text-txt-primary bg-surface-2 p-3 rounded-lg text-sm">{trip.jobDescription}</p>
                  </div>
                )}

                {(trip.tempFront !== undefined || trip.tempRear !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    {trip.tempFront !== undefined && (
                      <div className="bg-surface-2 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-txt-tertiary">Motor Frente</p>
                          <p className="text-lg font-bold text-brand-primary">{trip.tempFront}°C</p>
                        </div>
                        <span className="material-symbols-outlined text-txt-tertiary">ac_unit</span>
                      </div>
                    )}
                    {trip.tempRear !== undefined && (
                      <div className="bg-surface-2 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-txt-tertiary">Motor Trás</p>
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
                <h3 className="font-bold text-txt-primary">Motorista</h3>
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
                <h3 className="font-bold text-txt-primary">Veículo</h3>
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
                <h3 className="font-bold text-txt-primary">Reboque</h3>
                <span className="material-symbols-outlined text-txt-tertiary">local_shipping</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center text-brand-primary">
                  <span className="material-symbols-outlined text-2xl">local_shipping</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-txt-primary">{trip.trailer || 'Nenhum'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Info */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h3 className="font-bold text-txt-primary mb-4">Informações da Carga</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">Tipo</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.type || 'Não informado'}</p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">Peso Total</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.weight || 'Não informado'}</p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <p className="text-xs text-txt-tertiary mb-1">Valor Declarado</p>
                <p className="text-sm font-bold text-txt-primary">{trip.cargo?.value || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Map / Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden h-80 flex flex-col cursor-pointer hover:border-brand-primary transition-colors"
            onClick={() => navigate('/map')}
          >
            <div className="p-4 border-b border-surface-border bg-surface-3 flex justify-between items-center">
              <h3 className="font-bold text-txt-primary">Mapa</h3>
              <span className="text-xs text-brand-primary hover:underline">Expandir</span>
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
                  Em Trânsito
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h3 className="font-bold text-txt-primary mb-4">Timeline de Eventos</h3>
            <div className="space-y-6">
              {events.length === 0 ? (
                <p className="text-sm text-txt-tertiary">Nenhum evento registrado</p>
              ) : (
                events.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-brand-primary' : 'bg-txt-tertiary'}`}></div>
                      {index < events.length - 1 && <div className="w-0.5 h-full bg-surface-3 my-1"></div>}
                    </div>
                    <div className="pb-1">
                      <p className="text-xs text-txt-tertiary">
                        {new Date(event.timestamp).toLocaleString('pt-BR', {
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
