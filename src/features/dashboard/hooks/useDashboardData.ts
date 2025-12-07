import { useState, useEffect } from 'react';
import { tripsRepo } from '@/repositories/tripsRepo';
import { vehiclesRepo } from '@/repositories/vehiclesRepo';
import { driversRepo } from '@/repositories/driversRepo';
import { alertsRepo } from '@/repositories/alertsRepo';
import { locationsRepo } from '@/repositories/locationsRepo';
import { kpiRepo } from '@/repositories/kpiRepo';
import { Trip, Status } from '@/types';

export function useDashboardData() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalDrivers: 0,
        activeDrivers: 0,
        totalVehicles: 0,
        vehiclesInUse: 0,
        totalTrips: 0,
        activeTrips: 0,
        openAlerts: 0,
    });
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);
    const [activeDriversWithTrips, setActiveDriversWithTrips] = useState<any[]>([]);
    const [tripsPerDayData, setTripsPerDayData] = useState<any[]>([]);
    const [topDriversData, setTopDriversData] = useState<any[]>([]);
    const [fuelConsumptionData, setFuelConsumptionData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [drivers, vehicles, trips, alerts, locations, kmByDriver, fuelEfficiency] = await Promise.all([
                    driversRepo.getDrivers(),
                    vehiclesRepo.getVehicles(),
                    tripsRepo.getTrips(),
                    alertsRepo.getAlerts(),
                    locationsRepo.getLatestLocations(),
                    kpiRepo.getKmByDriver(),
                    kpiRepo.getFuelEfficiency()
                ]);

                const activeTripsList = trips.filter(t => t.status === Status.InTransit || t.status === Status.Active);
                const uniqueActiveDrivers = new Set(activeTripsList.map(t => t.driverId).filter(id => id));
                const uniqueVehiclesInUse = new Set(activeTripsList.map(t => t.vehicleId).filter(id => id));

                setKpis({
                    totalDrivers: drivers.length,
                    activeDrivers: uniqueActiveDrivers.size,
                    totalVehicles: vehicles.length,
                    vehiclesInUse: uniqueVehiclesInUse.size,
                    totalTrips: trips.length,
                    activeTrips: activeTripsList.length,
                    openAlerts: alerts.filter(a => !a.resolved_at).length,
                });

                setRecentTrips(trips.slice(0, 5));
                setVehicleLocations(locations);

                // Trips Per Day
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                });

                const tripsByDate = trips.reduce((acc: any, trip) => {
                    const date = trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/A';
                    if (date !== 'N/A') acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                setTripsPerDayData(last7Days.map(date => ({ date, trips: tripsByDate[date] || 0 })));

                // Top Drivers
                setTopDriversData(kmByDriver.slice(0, 5).map(d => ({ name: d.driver_name, km: d.total_km })));

                // Fuel
                setFuelConsumptionData(fuelEfficiency.slice(0, 5).map(v => ({
                    plate: v.vehicle_plate,
                    consumption: v.avg_fuel_efficiency_km_per_l ? parseFloat((100 / v.avg_fuel_efficiency_km_per_l).toFixed(1)) : 0
                })));


                const driversWithTripsData = activeTripsList.map(trip => {
                    const driver = drivers.find(d => d.id === trip.driverId) || { name: trip.driver, id: trip.driverId, avatar: '' };
                    return { driver, trip };
                });
                setActiveDriversWithTrips(driversWithTripsData);

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        loading,
        kpis,
        recentTrips,
        vehicleLocations,
        activeDriversWithTrips,
        tripsPerDayData,
        topDriversData,
        fuelConsumptionData
    };
}
