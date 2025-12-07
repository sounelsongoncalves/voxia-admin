import { supabase } from '../services/supabase';

export interface JourneyEvent {
    id: string;
    journey_id: string;
    event_type: 'start' | 'checkpoint' | 'stop' | 'end' | 'alert';
    timestamp: string;
    location?: {
        lat: number;
        lng: number;
    };
    description?: string;
    metadata?: any;
}

export const eventsRepo = {
    async getEventsByJourneyId(journeyId: string): Promise<JourneyEvent[]> {
        const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .eq('journey_id', journeyId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getEventsByTripId(tripId: string): Promise<JourneyEvent[]> {
        // First get journeys for this trip
        const { data: journeys, error: journeysError } = await supabase
            .from('journeys')
            .select('id')
            .eq('trip_id', tripId);

        if (journeysError) throw journeysError;
        if (!journeys || journeys.length === 0) return [];

        // Then get all events for these journeys
        const journeyIds = journeys.map(j => j.id);
        const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .in('journey_id', journeyIds)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createEvent(event: Partial<JourneyEvent>): Promise<JourneyEvent> {
        const { data, error } = await supabase
            .from('journey_events')
            .insert({
                journey_id: event.journey_id,
                event_type: event.event_type,
                timestamp: event.timestamp || new Date().toISOString(),
                location: event.location,
                description: event.description,
                metadata: event.metadata,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
