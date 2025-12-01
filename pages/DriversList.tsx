import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { driversRepo } from '../repositories/driversRepo';
import { Driver, Status } from '../types';

import { useToast } from '../components/ToastContext';

export const DriversList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const online = searchParams.get('online') === 'true';
        const data = await driversRepo.getDrivers({ online });
        setDrivers(data);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [searchParams]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('drivers.deleteConfirm'))) {
      try {
        await driversRepo.deleteDriver(id);
        setDrivers(drivers.filter(d => d.id !== id));
        showToast(t('drivers.deleteSuccess'), 'success');
      } catch (error) {
        console.error('Failed to delete driver:', error);
        showToast(t('drivers.deleteError'), 'error');
      }
    }
  };

  // Update URL when filter changes
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  };

  const filteredDrivers = drivers.filter(d => !statusFilter || d.status === statusFilter);

  // Helper for status color
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.Active: return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case Status.Warning: return 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20';
      case Status.Inactive: return 'bg-surface-3 text-txt-disabled border-surface-border';
      default: return 'bg-surface-3 text-txt-tertiary';
    }
  };

  const getStatusDotColor = (status: Status) => {
    switch (status) {
      case Status.Active: return 'bg-brand-primary';
      case Status.Warning: return 'bg-semantic-warning';
      case Status.Inactive: return 'bg-txt-disabled';
      default: return 'bg-txt-tertiary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">{t('drivers.title')}</h1>
          <p className="text-sm text-txt-tertiary mt-1">{t('drivers.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/drivers/create')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined">person_add</span>
          {t('drivers.addDriver')}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-surface-border flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
              <input
                type="text"
                placeholder={t('drivers.searchPlaceholder')}
                className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-sm text-txt-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option value="">{t('drivers.allStatus')}</option>
              <option value={Status.Active}>{t('statusValues.Ativo')}</option>
              <option value={Status.Inactive}>{t('statusValues.Inativo')}</option>
              <option value={Status.Warning}>{t('statusValues.Alerta')}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors" title={t('maintenance.exportCsv')}>
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors" title="Filtros Avançados">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">{t('drivers.table.driver')}</th>
                <th className="px-6 py-4">{t('drivers.table.id')}</th>
                <th className="px-6 py-4">{t('drivers.table.status')}</th>
                <th className="px-6 py-4">{t('drivers.table.rating')}</th>
                <th className="px-6 py-4">{t('drivers.table.trips')}</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">{t('drivers.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                    {t('drivers.loading')}
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                    {t('drivers.noDrivers')}
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => navigate(`/drivers/${driver.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {driver.avatar ? (
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            className="w-10 h-10 rounded-full object-cover border border-surface-border bg-surface-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-3 border border-surface-border flex items-center justify-center">
                            <span className="material-symbols-outlined text-txt-tertiary">person</span>
                          </div>
                        )}
                        <div>
                          <span className="text-txt-primary font-bold block">{driver.name}</span>
                          <span className="text-xs text-txt-tertiary">ID: {driver.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-txt-secondary font-mono text-xs">
                      {driver.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(driver.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(driver.status)}`}></span>
                        {t(`statusValues.${driver.status}`, driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-txt-primary font-medium">
                        <span className="material-symbols-outlined text-semantic-warning text-lg fill-icon">star</span>
                        {driver.rating > 0 ? driver.rating.toFixed(1) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-txt-primary font-medium">{driver.tripsCompleted}</span>
                      <span className="text-txt-tertiary text-xs ml-1">{t('drivers.table.completed')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/drivers/create?id=${driver.id}&mode=edit`); }}
                          className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, driver.id)}
                          className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/drivers/${driver.id}`); }}
                          className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title={t('common.view')}
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-txt-tertiary">
          <span>{t('maintenance.showing', { count: drivers.length })}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              Anterior
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-bg-main font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors">3</button>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary transition-colors">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
