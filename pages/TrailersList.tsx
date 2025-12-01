import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trailersRepo, Trailer } from '../repositories/trailersRepo';
import { Status } from '../types';

import { useToast } from '../components/ToastContext';

export const TrailersList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const data = await trailersRepo.getTrailers();
        setTrailers(data);
      } catch (error) {
        console.error('Failed to fetch trailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, []);

  const handleAdd = () => navigate('/trailers/create');

  const handleEdit = (id: string) => {
    navigate(`/trailers/edit/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('trailers.deleteConfirm'))) {
      try {
        await trailersRepo.deleteTrailer(id);
        setTrailers(trailers.filter(t => t.id !== id));
        showToast(t('trailers.deleteSuccess'), 'success');
      } catch (error) {
        console.error('Failed to delete trailer:', error);
        showToast(t('trailers.deleteError'), 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">{t('trailers.title')}</h1>
          <p className="text-sm text-txt-tertiary mt-1">{t('trailers.subtitle')}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          {t('trailers.addTrailer')}
        </button>
      </div>

      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-border">
          <input type="text" placeholder={t('trailers.searchPlaceholder')} className="w-full max-w-md bg-bg-main border border-surface-border rounded-lg py-2 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">{t('trailers.table.plate')}</th>
                <th className="px-6 py-4">{t('trailers.table.type')}</th>
                <th className="px-6 py-4">{t('trailers.table.location')}</th>
                <th className="px-6 py-4">{t('trailers.table.status')}</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">{t('trailers.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-txt-tertiary">
                    {t('trailers.loading')}
                  </td>
                </tr>
              ) : trailers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-txt-tertiary">
                    {t('trailers.noTrailers')}
                  </td>
                </tr>
              ) : (
                trailers.map((trailer) => (
                  <tr key={trailer.id} className="hover:bg-surface-2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-txt-primary font-mono font-bold">{trailer.plate}</span>
                        <span className="text-xs text-txt-tertiary">{trailer.id.substring(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-txt-secondary">{t(`trailers.types.${trailer.type}`, trailer.type)}</td>
                    <td className="px-6 py-4 text-txt-tertiary">{trailer.current_location || t('common.unknown')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${trailer.status === Status.Active ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                        trailer.status === Status.Error ? 'bg-semantic-error/10 text-semantic-error border-semantic-error/20' :
                          'bg-surface-3 text-txt-disabled border-surface-border'
                        }`}>
                        {t(`statusValues.${trailer.status}`, trailer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(trailer.id)}
                          className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, trailer.id)}
                          className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
