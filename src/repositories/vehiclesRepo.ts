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
            status: mapDbStatusToFrontend(v.status),
            location: 'Desconhecida', // Location is fetched separately in VehicleDetail
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
            status: mapDbStatusToFrontend(data.status),
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
                status: mapFrontendStatusToDb(vehicle.status as Status),
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
                status: updates.status ? mapFrontendStatusToDb(updates.status as Status) : undefined,
                active: updates.status === Status.Active,
                driver_id: updates.driverId,
            })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteVehicle(id: string) {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === '23503') {
                throw new Error('Não é possível excluir este veículo pois ele está associado a viagens ou motoristas.');
            }
            throw error;
        }
    }
};

function mapDbStatusToFrontend(dbStatus: string): Status {
    switch (dbStatus) {
        case 'active': return Status.Active;
        case 'inactive': return Status.Inactive;
        case 'maintenance': return Status.Error;
        case 'in_transit': return Status.InTransit;
        default: return Status.Inactive;
    }
}

function mapFrontendStatusToDb(status: Status): string {
    switch (status) {
        case Status.Active: return 'active';
        case Status.Inactive: return 'inactive';
        case Status.Error: return 'maintenance';
        case Status.InTransit: return 'in_transit';
        default: return 'inactive';
    }
}
