import { supabase } from '../services/supabase';
import { Vehicle, Status } from '../types';

export const vehiclesRepo = {
    async getVehicles(filters?: { in_use?: boolean }): Promise<Vehicle[]> {
        let query = supabase
            .from('vehicles')
            .select('*')
            .order('plate');

        if (filters?.in_use) {
            const { data: vehiclesInUse } = await supabase.from('v_vehicles_in_use').select('id');
            const inUseIds = vehiclesInUse?.map((v: any) => v.id) || [];
            if (inUseIds.length > 0) {
                query = query.in('id', inUseIds);
            } else {
                return [];
            }
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((v: any) => ({
            id: v.id,
            plate: v.plate,
            model: v.model || v.description || 'Modelo Desconhecido',
            status: (v.status as Status) || (v.active ? Status.Active : Status.Inactive),
            location: 'Desconhecida', // TODO: Join with latest location view if available
            fuel: v.fuel_level || 0,
            driverId: v.driver_id,
            manufacturer: v.manufacturer,
            year: v.year,
            type: v.type,
            odometer: v.km_current || 0,
        }));
    },

    async getVehicleById(id: string): Promise<Vehicle | null> {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            plate: data.plate,
            model: data.model || data.description || 'Modelo Desconhecido',
            status: (data.status as Status) || (data.active ? Status.Active : Status.Inactive),
            location: 'Desconhecida',
            fuel: data.fuel_level || 0,
            driverId: data.driver_id,
            manufacturer: data.manufacturer,
            year: data.year,
            type: data.type,
            odometer: data.km_current || 0,
        };
    },

    async createVehicle(vehicle: Partial<Vehicle>) {
        const { data, error } = await supabase
            .from('vehicles')
            .insert({
                plate: vehicle.plate,
                model: vehicle.model,
                manufacturer: vehicle.manufacturer,
                year: vehicle.year,
                type: vehicle.type,
                fuel_level: vehicle.fuel,
                status: vehicle.status,
                active: vehicle.status === Status.Active,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateVehicle(id: string, updates: Partial<Vehicle>) {
        const { error } = await supabase
            .from('vehicles')
            .update({
                plate: updates.plate,
                model: updates.model,
                manufacturer: updates.manufacturer,
                year: updates.year,
                type: updates.type,
                fuel_level: updates.fuel,
                status: updates.status,
                active: updates.status === Status.Active,
                driver_id: updates.driverId,
            })
            .eq('id', id);

        if (error) throw error;
    }
};
