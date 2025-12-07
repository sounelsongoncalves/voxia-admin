import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fuelingRepo, FuelingEvent } from '../repositories/fuelingRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo'; // Assuming this exists
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle } from '../types';

export const Fueling: React.FC = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState<FuelingEvent[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');

    useEffect(() => {
        loadData();
        loadVehicles();

        const subscription = fuelingRepo.subscribeToFuelingEvents(() => {
            loadData();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [period, selectedVehicle]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fuelingRepo.getFuelingEvents(period, selectedVehicle || undefined);
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        try {
            const data = await vehiclesRepo.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.text(t('fueling.title'), 14, 15);

        const tableData = events.map(event => [
            new Date(event.occurred_at).toLocaleString(),
            event.vehicle_plate,
            event.trailer_plate || '-',
            event.driver_name || '-',
            event.fuel_type || '-',
            event.fuel_liters?.toString() || '0'
        ]);

        autoTable(doc, {
            head: [[t('fueling.date'), t('fueling.vehicle'), t('fueling.trailer'), t('fueling.driver'), t('fueling.type'), t('fueling.liters')]],
            body: tableData,
            startY: 20,
        });

        doc.save('fueling-report.pdf');
    };

    const totalLiters = events.reduce((acc, curr) => acc + (Number(curr.fuel_liters) || 0), 0);

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-txt-primary">{t('fueling.title')}</h1>
                    <p className="text-txt-tertiary mt-1">
                        {t('fueling.totalLiters')}: <span className="text-brand-primary font-bold">{totalLiters.toFixed(2)} L</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select
                        className="bg-surface-1 border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                    >
                        <option value={1}>{t('fueling.today')}</option>
                        <option value={7}>{t('fueling.last7days')}</option>
                        <option value={30}>{t('fueling.last30days')}</option>
                    </select>

                    <select
                        className="bg-surface-1 border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="">{t('fueling.allVehicles')}</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                        ))}
                    </select>

                    <button
                        onClick={exportPdf}
                        className="flex items-center gap-2 bg-brand-primary text-bg-main px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        {t('fueling.exportPdf')}
                    </button>
                </div>
            </div>

            <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-2 border-b border-surface-border text-xs uppercase text-txt-secondary font-medium">
                                <th className="px-6 py-4">{t('fueling.date')}</th>
                                <th className="px-6 py-4">{t('fueling.vehicle')}</th>
                                <th className="px-6 py-4">{t('fueling.trailer')}</th>
                                <th className="px-6 py-4">{t('fueling.driver')}</th>
                                <th className="px-6 py-4">{t('fueling.type')}</th>
                                <th className="px-6 py-4 text-right">{t('fueling.liters')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                                        <div className="flex justify-center">
                                            <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                                        {t('fueling.noData')}
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id} className="hover:bg-surface-2 transition-colors">
                                        <td className="px-6 py-4 text-sm text-txt-primary">
                                            {new Date(event.occurred_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-txt-primary font-medium">
                                            {event.vehicle_plate}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-txt-secondary">
                                            {event.trailer_plate || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-txt-secondary">
                                            {event.driver_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${event.fuel_type === 'Green Diesel' ? 'bg-green-500/10 text-green-500' :
                                                    event.fuel_type === 'AdBlue' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-yellow-500/10 text-yellow-500'}`}>
                                                {event.fuel_type || 'Diesel'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-txt-primary text-right font-mono">
                                            {event.fuel_liters} L
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
