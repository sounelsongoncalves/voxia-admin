
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tripsRepo } from '../repositories/tripsRepo';
import { Trip, Status } from '../types';

import { useToast } from '../components/ToastContext';

export const TripsList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripsRepo.getTrips();
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('trips.deleteConfirmation'))) {
      try {
        await tripsRepo.deleteTrip(id);
        setTrips(trips.filter(t => t.id !== id));
        showToast(t('trips.deleteSuccess'), 'success');
      } catch (error) {
        console.error('Failed to delete trip:', error);
        showToast(t('trips.deleteError'), 'error');
      }
    }
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  };

  const filteredTrips = trips.filter(t => !statusFilter || t.status === statusFilter);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-txt-tertiary">{t('trips.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">{t('trips.title')}</h1>
        <button
          onClick={() => navigate('/trips/create')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          {t('trips.create')}
        </button>
      </div>

      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-surface-border flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[250px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
            <input
              type="text"
              placeholder={t('trips.searchPlaceholder')}
              className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-sm text-txt-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="">{t('trips.allStatus')}</option>
            <option value={Status.Active}>{t(`statusValues.${Status.Active}`)}</option>
            <option value={Status.Accepted}>{t(`statusValues.${Status.Accepted}`)}</option>
            <option value={Status.Completed}>{t(`statusValues.${Status.Completed}`)}</option>
            <option value={Status.InTransit}>{t(`statusValues.${Status.InTransit}`)}</option>
            <option value={Status.Warning}>{t(`statusValues.${Status.Warning}`)}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">{t('trips.table.tripId')}</th>
                <th className="px-6 py-4">{t('table.route')}</th>
                <th className="px-6 py-4">{t('trips.table.driver')}</th>
                <th className="px-6 py-4">{t('trips.table.vehicle')}</th>
                <th className="px-6 py-4">{t('trips.table.eta')}</th>
                <th className="px-6 py-4">{t('table.status')}</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <td className="px-6 py-4 font-mono text-brand-primary font-medium">{trip.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-txt-primary font-medium">{trip.origin}</span>
                      <div className="flex items-center gap-1 text-xs text-txt-tertiary mt-0.5">
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-txt-secondary font-medium">{trip.driver}</td>
                  <td className="px-6 py-4 text-txt-tertiary">{trip.vehicle}</td>
                  <td className="px-6 py-4 text-txt-secondary font-mono">{trip.eta}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${trip.status === Status.InTransit ? 'bg-semantic-info/10 text-semantic-info border-semantic-info/20' :
                      trip.status === Status.Completed ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' :
                        trip.status === Status.Accepted ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                          trip.status === Status.Warning ? 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20' :
                            'bg-surface-3 text-txt-disabled border-surface-border'
                      }`}>
                      {t(`statusValues.${trip.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                        title={t('common.edit')}
                        onClick={(e) => { e.stopPropagation(); navigate('/trips/create'); }}
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                        title={t('common.delete')}
                        onClick={(e) => handleDelete(e, trip.id)}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                      <button
                        className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 rounded-lg transition-colors"
                        title={t('common.details')}
                        onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-txt-tertiary">
                    {t('trips.noTripsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-txt-tertiary">
          <span>{t('common.showing')} <span className="text-txt-primary font-bold">1-{trips.length}</span> {t('common.of')} <span className="text-txt-primary font-bold">{trips.length}</span> {t('common.trips')}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              {t('common.previous')}
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-bg-main font-bold">1</button>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary transition-colors">
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
