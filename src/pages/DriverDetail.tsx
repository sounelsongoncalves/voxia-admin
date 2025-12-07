import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { driversRepo } from '../repositories/driversRepo';
import { tripsRepo } from '../repositories/tripsRepo';
import { chatRepo } from '../repositories/chatRepo';
import { Driver, Trip, Status } from '../types';

import { useToast } from '../components/ToastContext';

export const DriverDetail: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [driverData, tripsData] = await Promise.all([
          driversRepo.getDriverById(id),
          tripsRepo.getTripsByDriver(id)
        ]);

        setDriver(driverData);
        setTrips(tripsData.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch driver details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus: Status) => {
    if (!driver) return;

    try {
      await driversRepo.updateDriver(driver.id, { status: newStatus });
      setDriver({ ...driver, status: newStatus });
      showToast(t('drivers.detail.statusUpdateSuccess'), 'success');
    } catch (error) {
      console.error('Failed to update driver status:', error);
      showToast(t('drivers.detail.statusUpdateError'), 'error');
    }
  };

  const handleSuspend = () => {
    if (window.confirm(t('drivers.detail.suspendConfirm'))) {
      handleStatusChange(Status.Inactive);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-txt-tertiary">{t('drivers.loading')}</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-txt-tertiary">{t('drivers.detail.notFound')}</p>
        <button
          onClick={() => navigate('/drivers')}
          className="px-4 py-2 bg-brand-primary text-bg-main rounded-lg"
        >
          {t('drivers.detail.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/drivers')}>{t('drivers.title')}</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">{driver.name}</span>
      </div>

      <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-surface-3 border-4 border-surface-2 flex items-center justify-center text-3xl font-bold text-txt-tertiary">
            {driver.avatar ? <img src={driver.avatar} alt={driver.name} className="w-full h-full rounded-full object-cover" /> : driver.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-txt-primary">{driver.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-txt-tertiary">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">badge</span> ID: {driver.id}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">call</span> {driver.phone || '(11) 99999-9999'}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">email</span> {driver.email || 'motorista@email.com'}</span>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate(`/drivers/create?id=${driver.id}&mode=edit`)}
                className="px-4 py-2 bg-brand-primary text-bg-main font-bold rounded-lg hover:bg-brand-hover transition-colors"
              >
                {t('drivers.detail.editProfile')}
              </button>
              <button
                onClick={async () => {
                  try {
                    const threadId = await chatRepo.getOrCreateThread(driver.id);
                    navigate(`/chat?threadId=${threadId}`);
                  } catch (error) {
                    console.error('Failed to open chat:', error);
                    showToast('Erro ao abrir chat.', 'error');
                  }
                }}
                className="px-4 py-2 bg-surface-2 text-txt-primary border border-surface-border font-medium rounded-lg hover:bg-surface-3 transition-colors"
              >
                {t('drivers.detail.sendMessage')}
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-2 bg-semantic-error/10 text-semantic-error border border-semantic-error/20 font-medium rounded-lg hover:bg-semantic-error/20 transition-colors"
              >
                {t('drivers.detail.suspend')}
              </button>
            </div>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl border border-surface-border min-w-[200px]">
            <p className="text-xs text-txt-tertiary uppercase font-bold mb-2">{t('drivers.detail.safetyScore')}</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-brand-primary">{driver.rating || 4.8}</span>
              <span className="text-sm text-txt-tertiary mb-1">/ 5.0</span>
            </div>
            <div className="w-full bg-surface-3 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-brand-primary h-full rounded-full" style={{ width: `${((driver.rating || 4.8) / 5) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-txt-primary mb-4">{t('drivers.detail.recentTrips')}</h3>
          <div className="space-y-4">
            {trips.length === 0 ? (
              <p className="text-sm text-txt-tertiary text-center py-4">{t('drivers.detail.noRecentTrips')}</p>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-surface-border">
                  <div>
                    <p className="text-sm font-bold text-txt-primary">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-txt-tertiary">{trip.eta}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${trip.status === Status.Completed ? 'bg-semantic-success/10 text-semantic-success' :
                    trip.status === Status.InTransit ? 'bg-semantic-info/10 text-semantic-info' :
                      'bg-surface-3 text-txt-tertiary'
                    }`}>
                    {t(`statusValues.${trip.status}`, trip.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-txt-primary mb-4">{t('drivers.detail.documentation')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-surface-border">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-primary">description</span>
                <div>
                  <p className="text-sm font-bold text-txt-primary">{t('drivers.detail.license')} ({driver.license_category || 'E'})</p>
                  <p className="text-xs text-txt-tertiary">{t('drivers.detail.expiresIn')} {driver.license_expiry || '12/2025'}</p>
                </div>
              </div>
              <span className="text-semantic-success text-xs font-bold">{t('drivers.detail.valid')}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2 border border-surface-border">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-primary">verified_user</span>
                <div>
                  <p className="text-sm font-bold text-txt-primary">{t('drivers.detail.toxicology')}</p>
                  <p className="text-xs text-txt-tertiary">{t('drivers.detail.performedIn')} 01/2024</p>
                </div>
              </div>
              <span className="text-semantic-success text-xs font-bold">{t('drivers.detail.ok')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
