import { useState, useEffect } from 'react';
import { tripsRepo } from '@/repositories/tripsRepo';
import { journeysRepo } from '@/repositories/journeysRepo';
import { eventsRepo } from '@/repositories/eventsRepo';
import { Trip, Status } from '@/types';

export function useTripDetail(id: string | undefined) {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTripData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const tripData = await tripsRepo.getTripById(id);
                setTrip(tripData);

                // Fetch journey events for timeline
                const journeys = await journeysRepo.getJourneysByTripId(id);
                if (journeys.length > 0) {
                    const journeyEvents = await eventsRepo.getEventsByJourneyId(journeys[0].id);
                    setEvents(journeyEvents);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error('Failed to fetch trip details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTripData();
    }, [id]);

    const updateStatus = async (newStatus: Status) => {
        if (!trip) return;
        try {
            await tripsRepo.updateTripStatus(trip.id, newStatus);
            setTrip({ ...trip, status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            throw error;
        }
    }

    return { trip, events, loading, updateStatus };
}
