import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripsRepo } from '../repositories/tripsRepo';
import { driversRepo } from '../repositories/driversRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Driver, Vehicle } from '../types';
import { useToast } from '../components/ToastContext';

export const AssignTrip: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, vehiclesData] = await Promise.all([
          driversRepo.getDrivers(),
          vehiclesRepo.getVehicles()
        ]);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDriver || !selectedVehicle) {
      setError(t('trips.validation.driverVehicleRequired'));
      return;
    }

    if (!id) {
      setError(t('trips.validation.tripIdNotFound'));
      return;
    }

    setLoading(true);
    try {
      await tripsRepo.assignTrip(id, selectedDriver, selectedVehicle);
      showToast(t('trips.assignSuccess'), 'success');
      navigate('/trips');
    } catch (err: any) {
      console.error('Failed to assign trip:', err);
      setError(err.message || t('trips.assignError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>{t('sidebar.overview')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trips')}>{t('sidebar.trips')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{t('trips.assignTrip')}</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">{t('trips.assignTripTitle', { id })}</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">assignment</span>
              {t('trips.assignResources')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('trips.driver')}</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  required
                >
                  <option value="">{t('trips.selectDriver')}</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('trips.vehicle')}</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  required
                >
                  <option value="">{t('trips.selectVehicle')}</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.assigning') : t('trips.assignTrip')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
