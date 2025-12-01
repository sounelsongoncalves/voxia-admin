import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { maintenanceRepo, MaintenanceRecord } from '../repositories/maintenanceRepo';

interface MaintenanceHistoryProps {
  vehicleId?: string;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ vehicleId }) => {
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MaintenanceRecord; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchData();
  }, [vehicleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let data;
      if (vehicleId) {
        data = await maintenanceRepo.getMaintenanceByVehicle(vehicleId);
      } else {
        data = await maintenanceRepo.getMaintenanceRecords();
      }
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof MaintenanceRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRecords = useMemo(() => {
    let data = [...records];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(record =>
        record.description.toLowerCase().includes(lowerTerm) ||
        record.type.toLowerCase().includes(lowerTerm) ||
        record.performed_at.includes(lowerTerm)
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [records, searchTerm, sortConfig]);

  const getSortIcon = (key: keyof MaintenanceRecord) => {
    if (sortConfig?.key === key) {
      return (
        <span className="material-symbols-outlined text-sm text-brand-primary select-none">
          {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      );
    }
    return <span className="material-symbols-outlined text-sm text-txt-disabled opacity-50 select-none group-hover:text-txt-secondary">unfold_more</span>;
  };

  return (
    <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-surface-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-txt-primary">{t('maintenance.title')}</h3>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm">search</span>
            <input
              type="text"
              placeholder={t('maintenance.filterPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-2 border border-surface-border rounded-lg py-2 pl-9 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:outline-none placeholder-txt-tertiary transition-all"
            />
          </div>
          <button className="px-3 py-2 bg-surface-2 border border-surface-border rounded-lg text-txt-primary hover:bg-surface-3 transition-colors flex items-center justify-center" title="Filtros avançados">
            <span className="material-symbols-outlined text-lg">filter_list</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-3 text-txt-tertiary uppercase text-xs font-semibold">
            <tr>
              <th
                className="px-6 py-3 cursor-pointer hover:text-txt-primary transition-colors group select-none"
                onClick={() => handleSort('performed_at')}
              >
                <div className="flex items-center gap-1">
                  {t('maintenance.table.date')}
                  {getSortIcon('performed_at')}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:text-txt-primary transition-colors group select-none"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1">
                  {t('maintenance.table.description')}
                  {getSortIcon('description')}
                </div>
              </th>
              <th
                className="px-6 py-3 cursor-pointer hover:text-txt-primary transition-colors group select-none"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center gap-1">
                  {t('maintenance.table.cost')}
                  {getSortIcon('cost')}
                </div>
              </th>
              <th className="px-6 py-3">{t('maintenance.table.type')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-txt-secondary">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-txt-tertiary">{t('maintenance.loading')}</td></tr>
            ) : sortedAndFilteredRecords.length > 0 ? (
              sortedAndFilteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-4 text-txt-tertiary whitespace-nowrap font-mono">
                    {new Date(record.performed_at).toLocaleDateString(i18n.language)}
                  </td>
                  <td className="px-6 py-4 font-medium text-txt-primary">{record.description}</td>
                  <td className="px-6 py-4 font-mono">
                    {record.cost ? record.cost.toLocaleString(i18n.language, { style: 'currency', currency: 'EUR' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-txt-tertiary capitalize">{record.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-txt-tertiary">
                  {t('maintenance.noRecords', { term: searchTerm })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-surface-border bg-surface-2/30 flex justify-between items-center">
        <span className="text-xs text-txt-tertiary">
          {t('maintenance.showing', { count: sortedAndFilteredRecords.length })}
        </span>
        <button className="text-xs font-medium text-brand-primary hover:text-brand-hover hover:underline transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">download</span>
          {t('maintenance.exportCsv')}
        </button>
      </div>
    </div>
  );
};
