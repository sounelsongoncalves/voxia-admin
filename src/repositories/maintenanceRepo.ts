import { supabase } from '../services/supabase';

export interface MaintenanceRecord {
    id: string;
    vehicle_id: string;
    type: 'preventive' | 'corrective' | 'inspection';
    description: string;
    cost?: number;
    performed_at: string;
    performed_by?: string;
    next_maintenance_km?: number;
    next_maintenance_date?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
}

export const maintenanceRepo = {
    async getMaintenanceRecords(): Promise<(MaintenanceRecord & { vehicle?: { plate: string; model: string } })[]> {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select(`
                *,
                vehicle:vehicles(plate, model)
            `)
            .order('performed_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getMaintenanceByVehicle(vehicleId: string): Promise<MaintenanceRecord[]> {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('performed_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getUpcomingMaintenance(): Promise<MaintenanceRecord[]> {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .eq('status', 'scheduled')
            .order('next_maintenance_date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async createMaintenanceRecord(record: Partial<MaintenanceRecord>) {
        const { data, error } = await supabase
            .from('maintenance_records')
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateMaintenanceRecord(id: string, updates: Partial<MaintenanceRecord>) {
        const { error } = await supabase
            .from('maintenance_records')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteMaintenanceRecord(id: string) {
        const { error } = await supabase
            .from('maintenance_records')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
