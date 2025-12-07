import { supabase } from '../services/supabase';

export interface FuelingEvent {
    id: string;
    occurred_at: string;
    fuel_liters: number;
    fuel_type: string;
    target_asset_type: 'Vehicle' | 'Trailer';
    target_asset_id: string;
    driver_id: string;
    driver_name: string;
    vehicle_id: string;
    vehicle_plate: string;
    trailer_plate?: string;
}

export const fuelingRepo = {
    async getFuelingEvents(periodDays: number = 30, vehicleId?: string): Promise<FuelingEvent[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        let query = supabase
            .from('v_fueling_events')
            .select('*')
            .gte('occurred_at', startDate.toISOString())
            .order('occurred_at', { ascending: false });

        if (vehicleId) {
            query = query.eq('vehicle_id', vehicleId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching fueling events:', error);
            return [];
        }

        return data as FuelingEvent[];
    },

    subscribeToFuelingEvents(callback: (payload: any) => void) {
        return supabase
            .channel('fueling_updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'journey_events', filter: "type=eq.ABASTECIMENTO" },
                callback
            )
            .subscribe();
    }
};
