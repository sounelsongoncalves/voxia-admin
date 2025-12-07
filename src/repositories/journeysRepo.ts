import { supabase } from '../services/supabase';

export interface Journey {
    id: string;
    trip_id: string;
    driver_id: string;
    vehicle_id: string;
    started_at: string;
    ended_at?: string;
    status: 'active' | 'completed' | 'paused';
    distance_km?: number;
}

export interface JourneyEvent {
    id: string;
    journey_id: string;
    event_type: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    metadata?: any;
}

export const journeysRepo = {
    async getJourneysByTripId(tripId: string): Promise<Journey[]> {
        const { data, error } = await supabase
            .from('journeys')
            .select('*')
            .eq('trip_id', tripId)
            .order('started_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getJourneyById(id: string): Promise<Journey | null> {
        const { data, error } = await supabase
            .from('journeys')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async getActiveJourneys(): Promise<Journey[]> {
        const { data, error } = await supabase
            .from('journeys')
            .select('*')
            .eq('status', 'active')
            .order('started_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
};

export const eventsRepo = {
    async getEventsByJourneyId(journeyId: string): Promise<JourneyEvent[]> {
        const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .eq('journey_id', journeyId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getEventsByTripId(tripId: string): Promise<JourneyEvent[]> {
        // Get all journeys for this trip, then get their events
        const { data: journeys, error: journeysError } = await supabase
            .from('journeys')
            .select('id')
            .eq('trip_id', tripId);

        if (journeysError) throw journeysError;

        if (!journeys || journeys.length === 0) return [];

        const journeyIds = journeys.map(j => j.id);

        const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .in('journey_id', journeyIds)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getLatestEventByJourneyId(journeyId: string): Promise<JourneyEvent | null> {
        const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .eq('journey_id', journeyId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data;
    },
};
