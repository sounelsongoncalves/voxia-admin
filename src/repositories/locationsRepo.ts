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
        return (data || []).map((row: any) => ({
            id: row.id,
            vehicle_id: row.vehicle_id,
            driver_id: row.driver_id,
            latitude: row.lat,
            longitude: row.lng,
            speed_kmh: row.speed,
            heading: row.heading,
            timestamp: row.recorded_at,
            accuracy_m: 0 // Default as not in view
        }));
    },

    async getLatestLocationByVehicle(vehicleId: string): Promise<Location | null> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return {
            id: data.id,
            vehicle_id: data.vehicle_id,
            driver_id: data.driver_id,
            latitude: data.lat,
            longitude: data.lng,
            speed_kmh: data.speed,
            heading: data.heading,
            timestamp: data.recorded_at,
            accuracy_m: 0
        };
    },

    async getLocationHistory(vehicleId: string, limit: number = 100): Promise<Location[]> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('recorded_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).map((row: any) => ({
            id: row.id,
            vehicle_id: row.vehicle_id,
            driver_id: row.driver_id,
            latitude: row.lat,
            longitude: row.lng,
            speed_kmh: row.speed,
            heading: row.heading,
            timestamp: row.recorded_at,
            accuracy_m: 0
        }));
    },

    subscribeToLocations(callback: (location: Location) => void) {
        return supabase
            .channel('locations-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'locations' },
                (payload) => {
                    const newLoc = payload.new as any;
                    callback({
                        id: newLoc.id,
                        vehicle_id: newLoc.vehicle_id,
                        driver_id: newLoc.driver_id,
                        latitude: newLoc.lat,
                        longitude: newLoc.lng,
                        speed_kmh: newLoc.speed,
                        heading: newLoc.heading,
                        timestamp: newLoc.recorded_at,
                        accuracy_m: 0
                    });
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
                    const newLoc = payload.new as any;
                    callback({
                        id: newLoc.id,
                        vehicle_id: newLoc.vehicle_id,
                        driver_id: newLoc.driver_id,
                        latitude: newLoc.lat,
                        longitude: newLoc.lng,
                        speed_kmh: newLoc.speed,
                        heading: newLoc.heading,
                        timestamp: newLoc.recorded_at,
                        accuracy_m: 0
                    });
                }
            )
            .subscribe();
    },
};
