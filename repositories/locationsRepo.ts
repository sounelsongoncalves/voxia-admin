import { supabase } from '../services/supabase';

export interface Location {
    id: string;
    vehicle_id: string;
    driver_id?: string;
    latitude: number;
    longitude: number;
    speed_kmh?: number;
    heading?: number;
    accuracy_m?: number;
    timestamp: string;
}

export const locationsRepo = {
    async getLatestLocations(): Promise<Location[]> {
        // Get latest location for each vehicle using the view
        const { data, error } = await supabase
            .from('v_latest_locations')
            .select('*');

        if (error) throw error;
        return data || [];
    },

    async getLatestLocationByVehicle(vehicleId: string): Promise<Location | null> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data;
    },

    async getLocationHistory(vehicleId: string, limit: number = 100): Promise<Location[]> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    subscribeToLocations(callback: (location: Location) => void) {
        return supabase
            .channel('locations-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'locations' },
                (payload) => {
                    callback(payload.new as Location);
                }
            )
            .subscribe();
    },

    subscribeToVehicleLocation(vehicleId: string, callback: (location: Location) => void) {
        return supabase
            .channel(`location-${vehicleId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'locations',
                    filter: `vehicle_id=eq.${vehicleId}`
                },
                (payload) => {
                    callback(payload.new as Location);
                }
            )
            .subscribe();
    },
};
