import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { maintenanceRepo, MaintenanceRecord } from '../repositories/maintenanceRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Vehicle } from '../types';
import { useToast } from '../components/ToastContext';

export const Maintenance: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<(MaintenanceRecord & { vehicle?: { plate: string; model: string } })[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    type: 'preventive',
    description: '',
    performed_at: new Date().toISOString().split('T')[0],
    cost: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, vehiclesData] = await Promise.all([
        maintenanceRepo.getMaintenanceRecords(),
        vehiclesRepo.getVehicles()
      ]);
      setRecords(maintenanceData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to fetch maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await maintenanceRepo.createMaintenanceRecord({
        vehicle_id: formData.vehicle_id,
        type: formData.type as 'preventive' | 'corrective' | 'inspection',
        description: formData.description,
        performed_at: formData.performed_at,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      });
      setShowModal(false);
      setFormData({
        vehicle_id: '',
        type: 'preventive',
        description: '',
        performed_at: new Date().toISOString().split('T')[0],
        cost: '',
        status: 'scheduled'
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
      showToast(t('maintenance.error.schedule'), 'error');
    }
  };

  const handleResolve = async (id: string) => {
    if (window.confirm(t('maintenance.confirmComplete'))) {
      try {
        await maintenanceRepo.updateMaintenanceRecord(id, { status: 'completed' });
        fetchData();
      } catch (error) {
        console.error('Failed to update maintenance record:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-semantic-success/10 text-semantic-success';
      case 'scheduled': return 'bg-semantic-warning/10 text-semantic-warning';
      case 'in_progress': return 'bg-semantic-info/10 text-semantic-info';
      case 'cancelled': return 'bg-surface-3 text-txt-disabled';
      default: return 'bg-surface-3 text-txt-tertiary';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">{t('maintenance.pageTitle')}</h1>
          <p className="text-sm text-txt-tertiary mt-1">{t('maintenance.pageSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">calendar_add_on</span>
          {t('maintenance.scheduleMaintenance')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-1 border border-surface-border rounded-xl p-5">
          <p className="text-txt-tertiary text-sm">{t('maintenance.stats.upcoming')}</p>
          <p className="text-3xl font-bold text-semantic-warning mt-1">
            {records.filter(r => r.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-surface-1 border border-surface-border rounded-xl p-5">
          <p className="text-txt-tertiary text-sm">{t('maintenance.stats.inProgress')}</p>
          <p className="text-3xl font-bold text-semantic-info mt-1">
            {records.filter(r => r.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-surface-1 border border-surface-border rounded-xl p-5">
          <p className="text-txt-tertiary text-sm">{t('maintenance.stats.totalCost')}</p>
          <p className="text-3xl font-bold text-txt-primary mt-1">
            {records.reduce((acc, curr) => acc + (curr.cost || 0), 0).toLocaleString(i18n.language, { style: 'currency', currency: i18n.language === 'pt' ? 'BRL' : 'EUR' })}
          </p>
        </div>
      </div>

      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">{t('maintenance.table.vehicle')}</th>
              <th className="px-6 py-4">{t('maintenance.table.serviceType')}</th>
              <th className="px-6 py-4">{t('maintenance.table.date')}</th>
              <th className="px-6 py-4">{t('maintenance.table.status')}</th>
              <th className="px-6 py-4 text-right">{t('maintenance.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-txt-tertiary">{t('maintenance.loading')}</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-txt-tertiary">{t('maintenance.noRecords')}</td></tr>
            ) : (
              records.map(record => (
                <tr key={record.id} className="hover:bg-surface-2">
                  <td
                    className="px-6 py-4 text-txt-primary font-medium cursor-pointer hover:text-brand-primary"
                    onClick={() => navigate(`/vehicles/${record.vehicle_id}`)}
                  >
                    {record.vehicle?.model} ({record.vehicle?.plate})
                  </td>
                  <td className="px-6 py-4 text-txt-secondary">
                    {record.description}
                    <span className="block text-xs text-txt-tertiary capitalize">{t(`maintenance.types.${record.type}`)}</span>
                  </td>
                  <td className="px-6 py-4 text-txt-primary">
                    {new Date(record.performed_at).toLocaleDateString(i18n.language)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${getStatusColor(record.status)} px-2 py-1 rounded text-xs font-bold`}>
                      {t(`maintenance.status.${record.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status !== 'completed' && record.status !== 'cancelled' && (
                      <button
                        onClick={() => handleResolve(record.id)}
                        className="text-brand-primary hover:underline mr-3"
                      >
                        {t('maintenance.actions.complete')}
                      </button>
                    )}
                    <button onClick={() => navigate(`/vehicles/${record.vehicle_id}`)} className="text-txt-tertiary hover:text-txt-primary">
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-txt-primary mb-4">{t('maintenance.modal.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1">{t('maintenance.modal.vehicle')}</label>
                <select
                  required
                  value={formData.vehicle_id}
                  onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                >
                  <option value="">{t('maintenance.modal.selectVehicle')}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1">{t('maintenance.modal.type')}</label>
                <select
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                >
                  <option value="preventive">{t('maintenance.types.preventive')}</option>
                  <option value="corrective">{t('maintenance.types.corrective')}</option>
                  <option value="inspection">{t('maintenance.types.inspection')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1">{t('maintenance.modal.description')}</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                  placeholder={t('maintenance.modal.descriptionPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-txt-secondary mb-1">{t('maintenance.modal.date')}</label>
                  <input
                    type="date"
                    required
                    value={formData.performed_at}
                    onChange={e => setFormData({ ...formData, performed_at: e.target.value })}
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-txt-secondary mb-1">{t('maintenance.modal.estimatedCost')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    placeholder={t('maintenance.modal.costPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-txt-primary font-medium rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors"
                >
                  {t('maintenance.modal.schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
