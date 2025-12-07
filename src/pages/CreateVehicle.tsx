
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Status } from '../types';
import { useToast } from '../components/ToastContext';

export const CreateVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const vehicleId = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    manufacturer: '',
    year: '',
    type: '',
    fuel: '',
    status: Status.Active,
  });

  useEffect(() => {
    if (vehicleId) {
      const fetchVehicle = async () => {
        setLoading(true);
        try {
          const vehicle = await vehiclesRepo.getVehicleById(vehicleId);
          if (vehicle) {
            setFormData({
              plate: vehicle.plate,
              model: vehicle.model,
              manufacturer: vehicle.manufacturer || '',
              year: vehicle.year?.toString() || '',
              type: vehicle.type || '',
              fuel: vehicle.fuel.toString(),
              status: vehicle.status,
            });
          }
        } catch (err) {
          console.error('Failed to fetch vehicle:', err);
          showToast(t('vehicles.create.validation.loadError'), 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [vehicleId, showToast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.plate || !formData.model) {
      setError(t('vehicles.create.validation.plateModelRequired'));
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        manufacturer: formData.manufacturer,
        year: formData.year ? parseInt(formData.year) : undefined,
        type: formData.type,
        fuel: formData.fuel ? parseInt(formData.fuel) : 100,
        status: formData.status,
      };

      if (vehicleId) {
        await vehiclesRepo.updateVehicle(vehicleId, vehicleData);
        showToast(t('vehicles.create.validation.updateSuccess'), 'success');
      } else {
        await vehiclesRepo.createVehicle(vehicleData);
        showToast(t('vehicles.create.validation.createSuccess'), 'success');
      }

      navigate('/vehicles');
    } catch (err: any) {
      console.error('Failed to save vehicle:', err);
      setError(err.message || t('vehicles.create.validation.error'));
      showToast(t('vehicles.create.validation.error'), 'error');
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
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/vehicles')}>{t('sidebar.vehicles')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{vehicleId ? t('vehicles.create.editVehicle') : t('vehicles.create.newVehicle')}</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">{vehicleId ? t('vehicles.create.editVehicle') : t('vehicles.create.registerNew')}</h1>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-8">

          {/* Vehicle Identity Section */}
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">directions_car</span>
              {t('vehicles.create.identification')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.plate')}</label>
                <input
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('vehicles.create.platePlaceholder')}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.model')}</label>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('vehicles.create.modelPlaceholder')}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.detail.manufacturer')}</label>
                <select
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value="">{t('vehicles.create.manufacturerSelect')}</option>
                  <option value="volvo">Volvo</option>
                  <option value="scania">Scania</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="daf">DAF</option>
                  <option value="iveco">Iveco</option>
                  <option value="vw">Volkswagen</option>
                  <option value="man">MAN</option>
                  <option value="renault">Renault</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.year')}</label>
                <input
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  type="number"
                  placeholder={t('vehicles.create.yearPlaceholder')}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-border w-full"></div>

          {/* Status & Config Section */}
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">settings</span>
              {t('vehicles.create.statusConfig')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.vehicleType')}</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value="">{t('vehicles.create.selectType')}</option>
                  <option value="truck">{t('vehicles.create.types.truck')}</option>
                  <option value="light_truck">{t('vehicles.create.types.light_truck')}</option>
                  <option value="van">{t('vehicles.create.types.van')}</option>
                  <option value="trailer">{t('vehicles.create.types.trailer')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.initialStatus')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                >
                  <option value={Status.Active}>{t('statusValues.Ativo')}</option>
                  <option value={Status.Inactive}>{t('statusValues.Inativo')}</option>
                  <option value={Status.Error}>{t('statusValues.Erro')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">{t('vehicles.create.initialFuel')}</label>
                <input
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
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
              onClick={() => navigate('/vehicles')}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('vehicles.create.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('vehicles.create.saving') : (vehicleId ? t('vehicles.create.update') : t('vehicles.create.save'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
