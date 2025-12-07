import { useState, useEffect } from 'react';
import * as React from 'react';
import { tripsRepo } from '@/repositories/tripsRepo';
import { driversRepo } from '@/repositories/driversRepo';
import { vehiclesRepo } from '@/repositories/vehiclesRepo';
import { trailersRepo } from '@/repositories/trailersRepo';
import { Driver, Vehicle } from '@/types';
import { Trailer } from '@/repositories/trailersRepo'; // Need to confirm if types are exported or need adjust
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface TripFormData {
    origin: string
    destination: string
    driver: string
    vehicle: string
    trailer: string
    cargoType: string
    startTime: string
    tempFront: string
    tempRear: string
    jobDescription: string
}

export function useCreateTrip() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [trailers, setTrailers] = useState<Trailer[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);

    const [formData, setFormData] = useState<TripFormData>({
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

    const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<string>('');

    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResources = async () => {
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
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, []);

    useEffect(() => {
        if (formData.origin && formData.destination) {
            // Deterministic pseudo-random calculation
            const str = formData.origin.toLowerCase() + formData.destination.toLowerCase();
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Generate realistic looking distance between 50km and 800km
            const distance = Math.abs(hash % 750) + 50;
            setEstimatedDistance(distance);

            // Calculate time assuming avg speed of 70km/h
            const totalMinutes = Math.round((distance / 70) * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setEstimatedTime(`${hours}h ${minutes}min`);
        } else {
            setEstimatedDistance(null);
            setEstimatedTime('');
        }
    }, [formData.origin, formData.destination]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitTrip = async (onSuccess?: () => void, onError?: (msg: string) => void) => {
        // Validation
        if (!formData.origin || !formData.destination) {
            if (onError) onError(t('trips.validation.originDestRequired'));
            return;
        }
        if (!formData.driver || !formData.vehicle) {
            if (onError) onError(t('trips.validation.driverVehicleRequired'));
            return;
        }
        if (!formData.startTime) {
            if (onError) onError(t('trips.validation.startTimeRequired'));
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

            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Failed to create trip:', err);
            if (onError) onError(err.message || t('trips.createError'));
        } finally {
            setLoading(false);
        }
    }

    return {
        drivers,
        vehicles,
        trailers,
        loadingResources,
        loading,
        formData,
        estimatedDistance,
        estimatedTime,
        handleChange,
        submitTrip
    };
}
