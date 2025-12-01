
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { tripsRepo } from '../repositories/tripsRepo';
import { driversRepo } from '../repositories/driversRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { trailersRepo, Trailer } from '../repositories/trailersRepo';
import { Driver, Vehicle } from '../types';

import { useToast } from '../components/ToastContext';

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    driver: '',
    vehicle: '',
    trailer: '',
    cargoType: '',
    startTime: '',
    tempFront: '',
    tempRear: '',
    jobDescription: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, vehiclesData, trailersData] = await Promise.all([
          driversRepo.getDrivers(),
          vehiclesRepo.getVehicles(),
          trailersRepo.getTrailers()
        ]);
        setDrivers(driversData);
        setVehicles(vehiclesData);
        setTrailers(trailersData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.origin || !formData.destination) {
      setError(t('trips.validation.originDestRequired'));
      return;
    }
    if (!formData.driver || !formData.vehicle) {
      setError(t('trips.validation.driverVehicleRequired'));
      return;
    }
    if (!formData.startTime) {
      setError(t('trips.validation.startTimeRequired'));
      return;
    }


    setLoading(true);
    try {
      await tripsRepo.createTrip({
        origin: formData.origin,
        destination: formData.destination,
        driverId: formData.driver,
        vehicleId: formData.vehicle,
        trailerId: formData.trailer || undefined,
        tempFront: formData.tempFront ? Number(formData.tempFront) : undefined,
        tempRear: formData.tempRear ? Number(formData.tempRear) : undefined,
        jobDescription: formData.jobDescription,
        cargoType: formData.cargoType,
      } as any);

      showToast(t('trips.createSuccess'), 'success');
      navigate('/trips');
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      setError(err.message || t('trips.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>{t('sidebar.overview')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trips')}>{t('sidebar.trips')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{t('trips.newTrip')}</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">{t('trips.createNewTrip')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-6">

            {/* Route Section */}
            <div>
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">map</span>
                {t('trips.routeAndSchedule')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.origin')}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">trip_origin</span>
                    <input
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      type="text"
                      placeholder={t('trips.originPlaceholder')}
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.destination')}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">location_on</span>
                    <input
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      type="text"
                      placeholder={t('trips.destinationPlaceholder')}
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.startTime')}</label>
                  <input
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    type="datetime-local"
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-surface-border w-full"></div>

            {/* Resources Section */}
            <div>
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">local_shipping</span>
                {t('trips.resources')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.driver')}</label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">{t('trips.selectDriver')}</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.vehicle')}</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">{t('trips.selectVehicle')}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.trailerOptional')}</label>
                  <select
                    name="trailer"
                    value={formData.trailer}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">{t('trips.selectTrailer')}</option>
                    {trailers.map(t => (
                      <option key={t.id} value={t.id}>{t.plate} ({t.type})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.cargoType')}</label>
                  <select
                    name="cargoType"
                    value={formData.cargoType}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">{t('trips.selectType')}</option>
                    <option value="general">{t('trips.cargoTypes.general')}</option>
                    <option value="refrigerated">{t('trips.cargoTypes.refrigerated')}</option>
                    <option value="dangerous">{t('trips.cargoTypes.dangerous')}</option>
                    <option value="grain">{t('trips.cargoTypes.grain')}</option>
                  </select>
                </div>

                {/* Refrigerated Cargo Fields */}
                {formData.cargoType === 'refrigerated' && (
                  <div className="grid grid-cols-2 gap-4 md:col-span-2 bg-surface-2 p-4 rounded-lg border border-surface-border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-txt-secondary">{t('trips.tempFront')}</label>
                      <input
                        name="tempFront"
                        value={formData.tempFront}
                        onChange={handleChange}
                        type="number"
                        min="-30"
                        max="30"
                        placeholder={t('trips.tempPlaceholder')}
                        className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-txt-secondary">{t('trips.tempRear')}</label>
                      <input
                        name="tempRear"
                        value={formData.tempRear}
                        onChange={handleChange}
                        type="number"
                        min="-30"
                        max="30"
                        placeholder={t('trips.tempPlaceholder')}
                        className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-txt-secondary">{t('trips.jobDescriptionLabel')}</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={(e: any) => handleChange(e as any)}
                    rows={3}
                    placeholder={t('trips.jobDescriptionPlaceholder')}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
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
                {loading ? t('common.creating') : t('trips.confirmTrip')}
              </button>
            </div>
          </form>
        </div>

        {/* Map Preview Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden h-96 flex flex-col">
            <div className="p-4 border-b border-surface-border bg-surface-3">
              <h3 className="font-bold text-txt-primary">{t('trips.routePreview')}</h3>
            </div>
            <div className="flex-1 relative bg-bg-sec">
              {/* Route Preview Map */}
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

              {/* Route Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 100 100 Q 200 150 300 300"
                  stroke="#00CC99"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8 4"
                  className="opacity-70"
                />
                <circle cx="100" cy="100" r="6" fill="#00CC99" />
                <circle cx="300" cy="300" r="6" fill="#FFC107" />
              </svg>

              {/* Distance Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-surface-1/90 backdrop-blur-sm border border-surface-border p-3 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-txt-tertiary">{t('trips.estimatedDistance')}</span>
                  <span className="text-sm font-bold text-txt-primary">452 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-txt-tertiary">{t('trips.estimatedTime')}</span>
                  <span className="text-sm font-bold text-txt-primary">6h 45min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-brand-primary">auto_awesome</span>
            <div>
              <h4 className="font-bold text-brand-primary text-sm mb-1">{t('trips.copilotSuggestion')}</h4>
              <p className="text-xs text-txt-secondary leading-relaxed">
                <Trans i18nKey="trips.copilotSuggestionText" components={{ strong: <strong /> }} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
