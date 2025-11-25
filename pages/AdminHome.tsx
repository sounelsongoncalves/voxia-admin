
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { StatsCard } from '../components/StatsCard';
import { tripsRepo } from '../repositories/tripsRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { alertsRepo } from '../repositories/alertsRepo';
import { driversRepo } from '../repositories/driversRepo';
import { locationsRepo } from '../repositories/locationsRepo';
import { kpiRepo } from '../repositories/kpiRepo';
import { Trip, Status, Alert } from '../types';
import { useToast } from '../components/ToastContext';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333
};

export const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [kpis, setKpis] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    totalVehicles: 0,
    vehiclesInUse: 0,
    totalTrips: 0,
    activeTrips: 0,
    openAlerts: 0,
  });
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drivers, vehicles, trips, alerts, locations, onlineDriversCount, vehiclesInUseCount] = await Promise.all([
          driversRepo.getDrivers(),
          vehiclesRepo.getVehicles(),
          tripsRepo.getTrips(),
          alertsRepo.getAlerts(),
          locationsRepo.getLatestLocations(),
          kpiRepo.getOnlineDriversCount(),
          kpiRepo.getVehiclesInUseCount()
        ]);

        setKpis({
          totalDrivers: drivers.length,
          activeDrivers: onlineDriversCount,
          totalVehicles: vehicles.length,
          vehiclesInUse: vehiclesInUseCount,
          totalTrips: trips.length,
          activeTrips: trips.filter(t => t.status === Status.Active || t.status === Status.InTransit).length,
          openAlerts: alerts.filter(a => !a.resolved_at).length,
        });

        setRecentTrips(trips.slice(0, 5));
        setRecentAlerts(alerts.slice(0, 5));
        setVehicleLocations(locations);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadReport = () => {
    showToast('Relatório Geral sendo gerado. O download iniciará em breve.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Visão Geral</h1>
        <button
          onClick={handleDownloadReport}
          className="px-4 py-2 bg-surface-1 hover:bg-surface-2 text-brand-primary text-sm font-medium rounded-lg border border-brand-primary transition-colors"
        >
          Descarregar Relatório
        </button>
      </div>

      {/* KPI Grid - Clickable with Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/drivers?online=true')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
          <StatsCard title="Motoristas Online" value={kpis.activeDrivers.toString()} trend="Disponíveis" trendUp={true} icon="person" color="success" />
        </div>
        <div onClick={() => navigate('/vehicles?in_use=true')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
          <StatsCard title="Viaturas em Uso" value={kpis.vehiclesInUse.toString()} trend="Em operação" trendUp={true} icon="local_shipping" color="info" />
        </div>
        <div onClick={() => navigate('/trips?status=active')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
          <StatsCard title="Viagens Ativas" value={kpis.activeTrips.toString()} trend="Em andamento" trendUp={true} icon="route" color="primary" />
        </div>
        <div onClick={() => navigate('/alerts?status=open')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
          <StatsCard title="Alertas Abertos" value={kpis.openAlerts.toString()} trend="Requer Atenção" trendUp={false} icon="warning" color="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-surface-1 border border-surface-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-txt-primary">Viagens Recentes</h3>
            <button onClick={() => navigate('/trips')} className="text-brand-primary text-sm font-medium hover:underline">Ver Todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-3 text-txt-secondary">
                  <th className="px-4 py-3 font-medium rounded-l-lg">ID</th>
                  <th className="px-4 py-3 font-medium">Rota</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right rounded-r-lg">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-txt-tertiary">
                      Carregando...
                    </td>
                  </tr>
                ) : recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-txt-tertiary">
                      Nenhuma viagem encontrada
                    </td>
                  </tr>
                ) : (
                  recentTrips.map((trip) => (
                    <tr key={trip.id} className="group hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                      <td className="px-4 py-3 font-mono text-txt-secondary">{trip.id.substring(0, 12)}...</td>
                      <td className="px-4 py-3 text-txt-secondary">
                        <span className="text-txt-primary">{trip.origin}</span>
                        <span className="mx-2 text-txt-tertiary">→</span>
                        <span className="text-txt-primary">{trip.destination}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-bg-main ${trip.status === Status.InTransit ? 'bg-semantic-info text-white' :
                          trip.status === Status.Completed ? 'bg-semantic-success text-bg-main' :
                            trip.status === Status.Warning ? 'bg-semantic-warning text-bg-main' :
                              'bg-surface-3 text-txt-tertiary'
                          }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-txt-tertiary">{trip.progress}%</span>
                          <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-primary rounded-full"
                              style={{ width: `${trip.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Mini Map */}
        <div className="space-y-6">
          <div className="bg-surface-1 border border-surface-border rounded-xl p-5 h-64 flex flex-col">
            <h3 className="font-semibold text-txt-primary mb-3">Mapa da Frota</h3>
            <div
              className="flex-1 bg-bg-main rounded-lg border border-surface-border relative overflow-hidden group cursor-pointer"
              onClick={() => navigate('/map')}
            >
              {!isLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center text-txt-tertiary bg-surface-2">
                  {googleMapsApiKey ? 'Carregando Mapa...' : 'Mapa Indisponível'}
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={10}
                  options={{
                    disableDefaultUI: true,
                    draggable: false,
                    zoomControl: false,
                    scrollwheel: false,
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    ]
                  }}
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="text-brand-primary font-medium">Abrir Mapa Completo</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-txt-primary mb-3">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/trips/create')}
                className="p-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-left border border-surface-border transition-colors group"
              >
                <span className="material-symbols-outlined text-brand-primary mb-2 group-hover:text-brand-hover">add_location</span>
                <div className="text-sm font-medium text-txt-primary">Nova Viagem</div>
              </button>
              <button
                onClick={() => navigate('/drivers/create')}
                className="p-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-left border border-surface-border transition-colors group"
              >
                <span className="material-symbols-outlined text-semantic-info mb-2">person_add</span>
                <div className="text-sm font-medium text-txt-primary">Adicionar Motorista</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
