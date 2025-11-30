import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// StatsCard removed in favor of inline styling for analytics look
import { tripsRepo } from '../repositories/tripsRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { alertsRepo } from '../repositories/alertsRepo';
import { driversRepo } from '../repositories/driversRepo';
import { locationsRepo } from '../repositories/locationsRepo';
import { kpiRepo } from '../repositories/kpiRepo';
import { Trip, Status, Alert } from '../types';
import { useToast } from '../components/ToastContext';
import { TripsPerDayChart } from '../components/charts/TripsPerDayChart';
import { TopDriversChart } from '../components/charts/TopDriversChart';
import { FuelConsumptionChart } from '../components/charts/FuelConsumptionChart';
import { supabase } from '../services/supabase';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 38.7223,
  lng: -9.1393
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
  const [activeDriversWithTrips, setActiveDriversWithTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
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

        const activeTrips = trips.filter(t => t.status === Status.InTransit || t.status === Status.Active);
        const driversWithTripsData = activeTrips.map(trip => {
          const driver = drivers.find(d => d.id === trip.driverId) || { name: trip.driver, id: trip.driverId, avatar: '' };
          return { driver, trip };
        });
        setActiveDriversWithTrips(driversWithTripsData);
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
    <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Visão Geral</h1>
        <button
          onClick={handleDownloadReport}
          className="px-4 py-2 bg-surface-1 hover:bg-surface-2 text-brand-primary text-sm font-medium rounded-lg border border-brand-primary transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-emerald-500/10"
        >
          Descarregar Relatório
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Motoristas Online */}
        <div onClick={() => navigate('/drivers?online=true')} className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2 transition-colors group">
          <div>
            <p className="text-xs text-txt-tertiary mb-1">Motoristas Online</p>
            <h3 className="text-2xl font-semibold text-txt-primary">{kpis.activeDrivers}</h3>
            <p className="text-xs text-semantic-success mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              Disponíveis
            </p>
          </div>
          <div className="rounded-full bg-surface-2 p-3 flex items-center justify-center text-semantic-success group-hover:bg-semantic-success/10 transition-colors">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>

        {/* Viaturas em Uso */}
        <div onClick={() => navigate('/vehicles?in_use=true')} className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2 transition-colors group">
          <div>
            <p className="text-xs text-txt-tertiary mb-1">Viaturas em Uso</p>
            <h3 className="text-2xl font-semibold text-txt-primary">{kpis.vehiclesInUse}</h3>
            <p className="text-xs text-semantic-info mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              Em operação
            </p>
          </div>
          <div className="rounded-full bg-surface-2 p-3 flex items-center justify-center text-semantic-info group-hover:bg-semantic-info/10 transition-colors">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
        </div>

        {/* Viagens Ativas */}
        <div onClick={() => navigate('/trips?status=active')} className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2 transition-colors group">
          <div>
            <p className="text-xs text-txt-tertiary mb-1">Viagens Ativas</p>
            <h3 className="text-2xl font-semibold text-txt-primary">{kpis.activeTrips}</h3>
            <p className="text-xs text-brand-primary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">route</span>
              Em andamento
            </p>
          </div>
          <div className="rounded-full bg-surface-2 p-3 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
            <span className="material-symbols-outlined">route</span>
          </div>
        </div>

        {/* Alertas Abertos */}
        <div onClick={() => navigate('/alerts?status=open')} className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2 transition-colors group">
          <div>
            <p className="text-xs text-txt-tertiary mb-1">Alertas Abertos</p>
            <h3 className="text-2xl font-semibold text-txt-primary">{kpis.openAlerts}</h3>
            <p className="text-xs text-semantic-warning mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Requer Atenção
            </p>
          </div>
          <div className="rounded-full bg-surface-2 p-3 flex items-center justify-center text-semantic-warning group-hover:bg-semantic-warning/10 transition-colors">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="w-full">
        <TripsPerDayChart />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDriversChart />
        <FuelConsumptionChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Trips Table */}
        <div className="xl:col-span-2 bg-surface-1 border border-surface-border rounded-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-surface-border bg-surface-1/50 backdrop-blur-sm">
            <h3 className="font-semibold text-txt-primary">Viagens Recentes</h3>
            <button onClick={() => navigate('/trips')} className="text-brand-primary text-sm font-medium hover:underline">Ver Todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-1">
                <tr className="border-b border-surface-border">
                  <th className="hidden sm:table-cell px-4 py-3 text-xs font-semibold text-txt-tertiary uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-txt-tertiary uppercase tracking-wider">Rota</th>
                  <th className="px-4 py-3 text-xs font-semibold text-txt-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-txt-tertiary uppercase tracking-wider text-right">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-surface-1">
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
                      <td className="hidden sm:table-cell px-4 py-4 font-mono text-xs text-txt-tertiary max-w-[140px] truncate">
                        {trip.id}
                      </td>
                      <td className="px-4 py-4 text-txt-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-txt-primary font-medium">{trip.origin}</span>
                          <span className="text-txt-tertiary">→</span>
                          <span className="text-txt-primary font-medium">{trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${trip.status === Status.InTransit
                          ? 'bg-semantic-info/10 text-semantic-info border-semantic-info/30'
                          : trip.status === Status.Completed
                            ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/30'
                            : trip.status === Status.Warning
                              ? 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/30'
                              : 'bg-surface-3 text-txt-tertiary border-surface-border'
                          }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-xs text-txt-tertiary font-mono">{trip.progress}%</span>
                          <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-semantic-success rounded-full transition-all duration-500"
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
        <div className="space-y-4">
          <div className="bg-surface-1 border border-surface-border rounded-xl p-4 space-y-4 flex flex-col">
            <h3 className="font-semibold text-txt-primary">Mapa da Frota</h3>
            <div
              className="w-full h-64 md:h-80 rounded-lg overflow-hidden relative bg-surface-2 group cursor-pointer border border-surface-border"
              onClick={() => navigate('/map')}
            >
              {loadError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-semantic-error text-sm p-4 text-center bg-surface-2 border border-semantic-error/20 rounded-lg">
                  <span className="material-symbols-outlined text-3xl mb-2">error</span>
                  <p className="font-bold">Erro ao carregar o mapa</p>
                  <p className="text-xs mt-1 opacity-80 break-all max-w-[90%]">{loadError.message || JSON.stringify(loadError)}</p>
                  <p className="text-xs mt-2 text-txt-tertiary">Verifique se a "Maps JavaScript API" está ativada no Google Cloud Console.</p>
                </div>
              ) : !isLoaded ? (
                <div className="w-full h-full flex items-center justify-center text-txt-tertiary text-sm">
                  {googleMapsApiKey ? 'Carregando Mapa...' : 'Mapa Indisponível (API Key não configurada)'}
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={vehicleLocations.length > 0 ? { lat: vehicleLocations[0].latitude, lng: vehicleLocations[0].longitude } : defaultCenter}
                  zoom={12}
                  options={{
                    disableDefaultUI: true,
                    draggable: false,
                    zoomControl: false,
                    scrollwheel: false,
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#161A1F" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#161A1F" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#A0A0A0" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2A2E35" }] },
                      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111418" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B0D10" }] },
                    ]
                  }}
                >
                  {vehicleLocations.map((loc) => (
                    <Marker
                      key={loc.id}
                      position={{ lat: loc.latitude, lng: loc.longitude }}
                      icon={{
                        url: 'https://cdn-icons-png.flaticon.com/512/741/741407.png', // Truck icon
                        scaledSize: new google.maps.Size(32, 32)
                      }}
                      title={`Veículo: ${loc.vehicle_id}`}
                    />
                  ))}
                </GoogleMap>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="text-brand-primary font-medium">Abrir Mapa Completo</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-txt-primary mb-3">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/trips/create')}
                className="p-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-left border border-surface-border transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-emerald-500/10 group"
              >
                <span className="material-symbols-outlined text-brand-primary mb-2 group-hover:text-brand-hover">add_location</span>
                <div className="text-sm font-medium text-txt-primary">Nova Viagem</div>
              </button>
              <button
                onClick={() => navigate('/drivers/create')}
                className="p-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-left border border-surface-border transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-emerald-500/10 group"
              >
                <span className="material-symbols-outlined text-semantic-info mb-2">person_add</span>
                <div className="text-sm font-medium text-txt-primary">Adicionar Motorista</div>
              </button>
            </div>
          </div>

          {/* Active Drivers List */}
          <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-surface-border bg-surface-1/50 backdrop-blur-sm">
              <h3 className="font-semibold text-txt-primary">Motoristas em Viagem</h3>
              <span className="text-xs font-medium text-semantic-success bg-semantic-success/10 px-2 py-1 rounded-full">
                {activeDriversWithTrips.length} Online
              </span>
            </div>
            <div className="p-4 space-y-3">
              {activeDriversWithTrips.length === 0 ? (
                <p className="text-sm text-txt-tertiary text-center py-4">Nenhum motorista em viagem no momento.</p>
              ) : (
                activeDriversWithTrips.slice(0, 5).map((item) => (
                  <div key={item.trip.id} className="flex items-center justify-between p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/drivers/${item.driver.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={item.driver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.driver.name)}&background=random`}
                          alt={item.driver.name}
                          className="w-10 h-10 rounded-full object-cover border border-surface-border"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-semantic-success border-2 border-surface-1 rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-txt-primary">{item.driver.name}</p>
                        <p className="text-xs text-txt-tertiary truncate max-w-[120px]">
                          {item.trip.origin} → {item.trip.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono text-brand-primary font-medium">{item.trip.progress}%</span>
                        <span className="text-xs text-txt-tertiary">Progresso</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {activeDriversWithTrips.length > 5 && (
              <div className="p-4 pt-0">
                <button onClick={() => navigate('/drivers')} className="w-full text-center text-xs text-txt-tertiary hover:text-brand-primary transition-colors">
                  Ver todos ({activeDriversWithTrips.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
