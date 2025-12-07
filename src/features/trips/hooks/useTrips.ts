import { useState, useEffect } from 'react';
import { tripsRepo } from '@/repositories/tripsRepo';
import { Trip, Status } from '@/types';
import { useTranslation } from 'react-i18next';

export function useTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const data = await tripsRepo.getTrips();
            setTrips(data);
        } catch (error) {
            console.error('Failed to fetch trips', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const deleteTrip = async (id: string, onSuccess?: () => void) => {
        try {
            await tripsRepo.deleteTrip(id);
            setTrips(prev => prev.filter(t => t.id !== id));
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to delete trip:', error);
            throw error;
        }
    };

    return {
        trips,
        loading,
        fetchTrips,
        deleteTrip
    };
}
