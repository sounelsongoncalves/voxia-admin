import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { maintenanceRepo } from '../repositories/maintenanceRepo';
import { tripsRepo } from '../repositories/tripsRepo';
import { locationsRepo } from '../repositories/locationsRepo';
import { alertsRepo } from '../repositories/alertsRepo';
import { Vehicle, Status, Trip, Alert } from '../types';
import { MaintenanceHistory } from '../components/MaintenanceHistory';

import { useToast } from '../components/ToastContext';

export const VehicleDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 1. Fetch Vehicle Core Data (Critical)
        const vehicleData = await vehiclesRepo.getVehicleById(id);
        setVehicle(vehicleData);

        if (!vehicleData) {
          setLoading(false);
          return;
        }

        // 2. Fetch Secondary Data (Non-critical)
        // We use Promise.allSettled or individual try-catch to ensure one failure doesn't block the UI
        try {
          const [maintenanceData, tripsData, locationData, alertsData] = await Promise.all([
            maintenanceRepo.getMaintenanceByVehicle(id).catch(err => {
              console.warn('Failed to fetch maintenance:', err);
              return [];
            }),
            tripsRepo.getTripsByVehicle(id).catch(err => {
              console.warn('Failed to fetch trips:', err);
              return [];
            }),
            locationsRepo.getLatestLocationByVehicle(id).catch(err => {
              console.warn('Failed to fetch location:', err);
              return null;
            }),
            alertsRepo.getAlertsByVehicle(id).catch(err => {
              console.warn('Failed to fetch alerts:', err);
              return [];
            })
          ]);

          setMaintenanceRecords(maintenanceData);
          setRecentTrips(tripsData.slice(0, 5));
          setLocation(locationData);
          setAlerts(alertsData);
        } catch (secondaryErr) {
          console.error('Error fetching secondary data:', secondaryErr);
        }

      } catch (error) {
        console.error('Failed to fetch vehicle details:', error);
        showToast(t('vehicles.detail.loadError'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showToast, t]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.Active: return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case Status.Error: return 'bg-semantic-error/10 text-semantic-error border-semantic-error/20';
      case Status.Inactive: return 'bg-surface-3 text-txt-disabled border-surface-border';
      default: return 'bg-surface-3 text-txt-tertiary';
    }
  };

  const getFuelColor = (level: number) => {
    if (level > 50) return 'bg-semantic-success';
    if (level > 20) return 'bg-semantic-warning';
    return 'bg-semantic-error';
  };

  const handleDeactivate = async () => {
    if (!vehicle) return;

    if (window.confirm(t('vehicles.detail.deactivateConfirm'))) {
      try {
        await vehiclesRepo.updateVehicle(vehicle.id, { status: Status.Inactive });
        setVehicle({ ...vehicle, status: Status.Inactive });
        showToast(t('vehicles.detail.deactivateSuccess'), 'success');
        navigate('/vehicles');
      } catch (err) {
        console.error('Failed to deactivate vehicle:', err);
        showToast(t('vehicles.detail.deactivateError'), 'error');
      }
    }
  };

  const handleMaintenance = () => {
    navigate(`/maintenance?vehicleId=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-txt-tertiary">{t('vehicles.detail.loadingDetails')}</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-txt-tertiary">{t('vehicles.detail.notFound')}</p>
        <button
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-brand-primary text-bg-main rounded-lg"
        >
          {t('vehicles.detail.backToVehicles')}
        </button>
      </div>
    );
  }

  // Calculate next maintenance
  const nextMaintenance = maintenanceRecords.find(m => m.status === 'scheduled');
  const daysUntilService = nextMaintenance
    ? Math.ceil((new Date(nextMaintenance.next_maintenance_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : -1;
  const isServiceUpcoming = daysUntilService <= 30 && daysUntilService >= 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>{t('sidebar.overview')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/vehicles')}>{t('sidebar.vehicles')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{vehicle.model}</span>
      </div>

      {/* Header */}
      <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(vehicle.status)}`}>
                {t(`statusValues.${vehicle.status}`)}
              </span>
              <span className="text-xs text-txt-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : t('vehicles.unknownLocation')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-txt-primary mb-1">{vehicle.model}</h1>
            <p className="text-txt-secondary font-mono text-sm">
              {vehicle.plate} <span className="text-txt-tertiary mx-2">|</span> ID: {vehicle.id}
            </p>
          </div>

          <div className="w-full md:w-64 h-32 rounded-lg overflow-hidden bg-surface-3 border border-surface-border relative">
            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDzoyhn1V4r0qUYfUE-x38qffoWLFAQfKiRCrzu620XGc7vuX_RCc8BJQMeA3jEK77S-Wk-fXkGgbdh1TWY2baot0ZVtWraGZunAm9iZlKbDRsCB8fjwcBXhgp7oKcoJuQqFPnF-AJosu3f2Z3mxe6btaeNBk7I8yKmaV4sBh5Eqily1qJ14mDZHcfUQ3sO3VsT-2nXQFfPEsTBZU5BUXYympUx-gAgeEKp6e1Fi6r_BB6xNMDr3bwsNYPixd99QLdHVm-xq4WBlVF5")' }}></div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-surface-border">
          <button
            onClick={() => navigate(`/vehicles/create?id=${id}`)}
            className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-brand-primary text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            {t('vehicles.edit')}
          </button>
          <button
            onClick={handleMaintenance}
            className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-txt-primary text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">build</span>
            {t('vehicles.detail.registerMaintenance')}
          </button>
          <button
            onClick={handleDeactivate}
            className="px-4 py-2 bg-semantic-error/10 hover:bg-semantic-error/20 text-semantic-error text-sm font-bold rounded-lg transition-colors ml-auto flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">block</span>
            {t('vehicles.detail.deactivate')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Technical Specs & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specs */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">info</span>
                {t('vehicles.detail.specs')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-surface-border">
                  <span className="text-sm text-txt-tertiary">{t('vehicles.detail.manufacturer')}</span>
                  <span className="text-sm font-medium text-txt-primary">{vehicle.manufacturer || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-border">
                  <span className="text-sm text-txt-tertiary">{t('vehicles.detail.yearModel')}</span>
                  <span className="text-sm font-medium text-txt-primary">{vehicle.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-border">
                  <span className="text-sm text-txt-tertiary">{t('vehicles.detail.type')}</span>
                  <span className="text-sm font-medium text-txt-primary">{vehicle.type ? t(`vehicles.create.types.${vehicle.type}`) : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-border">
                  <span className="text-sm text-txt-tertiary">{t('vehicles.detail.odometer')}</span>
                  <span className="text-sm font-medium text-txt-primary">{vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-txt-tertiary">{t('vehicles.detail.vin')}</span>
                  <span className="text-xs font-mono text-txt-secondary">N/A</span>
                </div>
              </div>
            </div>

            {/* Current Status & Fuel */}
            <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">speed</span>
                {t('vehicles.detail.currentStatus')}
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-txt-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">local_gas_station</span> {t('vehicles.table.fuel')}
                    </span>
                    <span className={`font-bold ${vehicle.fuel < 20 ? 'text-semantic-error' : 'text-txt-primary'}`}>{vehicle.fuel}%</span>
                  </div>
                  <div className="w-full h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getFuelColor(vehicle.fuel)}`}
                      style={{ width: `${vehicle.fuel}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  {(() => {
                    const openCritical = alerts.filter(a => !a.resolved_at && a.type === 'Critical').length;
                    const openWarning = alerts.filter(a => !a.resolved_at && a.type === 'Warning').length;
                    const health = Math.max(0, 100 - (openCritical * 20) - (openWarning * 5));
                    const healthColor = health > 80 ? 'text-semantic-success' : health > 50 ? 'text-semantic-warning' : 'text-semantic-error';
                    const barColor = health > 80 ? 'bg-semantic-success' : health > 50 ? 'bg-semantic-warning' : 'bg-semantic-error';

                    return (
                      <>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-txt-tertiary flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">health_and_safety</span> {t('vehicles.detail.vehicleHealth')}
                          </span>
                          <span className={`font-bold ${healthColor}`}>{health}%</span>
                        </div>
                        <div className="w-full h-3 bg-surface-3 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${health}%` }}></div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t border-surface-border flex justify-between items-center">
                  <div>
                    <p className="text-xs text-txt-tertiary">{t('vehicles.detail.assignedDriver')}</p>
                    {vehicle.driverId ? (
                      <div className="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-80" onClick={() => navigate(`/drivers/${vehicle.driverId}`)}>
                        <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-brand-primary">
                          D
                        </div>
                        <span className="text-sm font-medium text-brand-primary hover:underline">{t('vehicles.detail.viewDriver')}</span>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-txt-secondary mt-1">{t('vehicles.detail.noDriverAssigned')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/audit')}
                    className="text-xs text-txt-tertiary hover:text-txt-primary flex items-center gap-1 border border-surface-border rounded px-2 py-1 hover:bg-surface-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">history</span> {t('vehicles.detail.history')}
                  </button>
                </div>
              </div>
            </div>
          </div>



          {/* Maintenance History Component */}
          <MaintenanceHistory />

          {/* Trip Log */}
          <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-txt-primary">{t('vehicles.detail.recentTrips')}</h3>
              <button
                onClick={() => navigate('/trips')}
                className="text-sm text-brand-primary hover:underline"
              >
                {t('vehicles.detail.viewAll')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-3 text-txt-tertiary uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Rota</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">ETA</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-txt-secondary">
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-txt-tertiary">
                        {t('vehicles.detail.noTrips')}
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-6 py-4 text-txt-tertiary">
                          {/* Date formatting if available in trip object, otherwise placeholder */}
                          {t('vehicles.detail.today')}
                        </td>
                        <td className="px-6 py-4">{trip.origin} → {trip.destination}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trip.status === Status.InTransit ? 'bg-semantic-info/10 text-semantic-info' :
                            trip.status === Status.Completed ? 'bg-semantic-success/10 text-semantic-success' :
                              'bg-surface-3 text-txt-tertiary'
                            }`}>
                            {t(`statusValues.${trip.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{trip.eta}</td>
                        <td className="px-6 py-4 text-right">
                          <span
                            onClick={() => navigate(`/trips/${trip.id}`)}
                            className="material-symbols-outlined text-txt-tertiary hover:text-txt-primary cursor-pointer text-lg"
                          >
                            visibility
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Maintenance Schedule */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-txt-primary">{t('vehicles.detail.maintenancePlan')}</h3>
              {isServiceUpcoming && (
                <div className="flex items-center gap-1 text-semantic-warning text-xs font-medium bg-semantic-warning/10 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {t('vehicles.detail.nextIn', { days: daysUntilService })}
                </div>
              )}
            </div>

            <div className="relative pl-4 border-l border-surface-border space-y-6">
              {nextMaintenance ? (
                <div className="relative group">
                  <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-bg-main border-2 ${isServiceUpcoming ? 'border-semantic-warning' : 'border-brand-primary'} group-hover:scale-110 transition-transform`}></div>
                  <p className={`text-sm font-bold cursor-pointer hover:underline ${isServiceUpcoming ? 'text-semantic-warning' : 'text-brand-primary'}`}>
                    {nextMaintenance.description}
                  </p>
                  <p className={`text-xs ${isServiceUpcoming ? 'text-semantic-warning font-bold' : 'text-txt-secondary'}`}>
                    {t('vehicles.detail.forecast')}: {new Date(nextMaintenance.next_maintenance_date!).toLocaleDateString(i18n.language)}
                    {isServiceUpcoming && <span className="ml-1">{t('vehicles.detail.soon')}</span>}
                  </p>
                  <p className="text-xs text-txt-tertiary mt-1">{t('vehicles.detail.type')}: {nextMaintenance.type}</p>
                </div>
              ) : (
                <p className="text-sm text-txt-tertiary">{t('vehicles.detail.noMaintenanceScheduled')}</p>
              )}

              {/* Completed Maintenance History */}
              {maintenanceRecords.filter(m => m.status === 'completed').slice(0, 2).map(m => (
                <div key={m.id} className="relative opacity-60">
                  <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-bg-main border-2 border-semantic-success"></div>
                  <p className="text-sm font-bold text-txt-primary line-through">{m.description}</p>
                  <p className="text-xs text-txt-secondary">{t('vehicles.detail.completedIn')} {new Date(m.performed_at).toLocaleDateString(i18n.language)}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleMaintenance}
              className="w-full mt-6 py-2 rounded-lg border border-surface-border hover:bg-surface-2 text-sm font-medium text-txt-primary transition-colors"
            >
              {t('vehicles.detail.viewFullHistory')}
            </button>
          </div>

          {/* Damage Reports - Placeholder for now as we don't have a damages table yet */}
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-txt-primary">{t('vehicles.detail.recentDamages')}</h3>
              <span className="text-xs text-txt-tertiary">0 {t('vehicles.detail.pending')}</span>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-txt-tertiary text-center py-4">{t('vehicles.detail.noDamages')}</p>
            </div>
            <button className="w-full mt-4 py-2 text-xs text-brand-primary hover:underline font-medium">
              {t('vehicles.detail.reportDamage')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
