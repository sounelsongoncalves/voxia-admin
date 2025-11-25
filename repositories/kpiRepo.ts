import { supabase } from '../services/supabase';

// KPI interfaces matching the views
export interface KmByDriver {
    driver_id: string;
    driver_name: string;
    total_km: number;
}

export interface KmByVehicle {
    vehicle_id: string;
    vehicle_plate: string;
    total_km: number;
}

export interface StopVsDriveTime {
    driver_id: string;
    driver_name: string;
    total_drive_hours: number;
    total_stop_hours: number;
}

export interface FuelEfficiency {
    vehicle_id: string;
    vehicle_plate: string;
    avg_fuel_efficiency_km_per_l: number;
}

export interface OnTimeRate {
    driver_id: string;
    driver_name: string;
    total_trips: number;
    on_time_trips: number;
    on_time_rate_percent: number;
}

export interface BreakdownBySeverity {
    severity: string;
    count: number;
}

export const kpiRepo = {
    async getKmByDriver(): Promise<KmByDriver[]> {
        const { data, error } = await supabase
            .from('v_km_by_driver')
            .select('*')
            .order('total_km', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getKmByVehicle(): Promise<KmByVehicle[]> {
        const { data, error } = await supabase
            .from('v_km_by_vehicle')
            .select('*')
            .order('total_km', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getStopVsDriveTime(): Promise<StopVsDriveTime[]> {
        const { data, error } = await supabase
            .from('v_stop_vs_drive_time')
            .select('*');

        if (error) throw error;
        return data || [];
    },

    async getFuelEfficiency(): Promise<FuelEfficiency[]> {
        const { data, error } = await supabase
            .from('v_fuel_efficiency')
            .select('*')
            .order('avg_fuel_efficiency_km_per_l', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getOnTimeRate(): Promise<OnTimeRate[]> {
        const { data, error } = await supabase
            .from('v_on_time_rate')
            .select('*')
            .order('on_time_rate_percent', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getBreakdownBySeverity(): Promise<BreakdownBySeverity[]> {
        const { data, error } = await supabase
            .from('v_breakdowns_by_severity')
            .select('*');

        if (error) throw error;
        return data || [];
    },

    async getOnlineDriversCount(): Promise<number> {
        const { count, error } = await supabase
            .from('v_online_drivers')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    },

    async getVehiclesInUseCount(): Promise<number> {
        const { count, error } = await supabase
            .from('v_vehicles_in_use')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    },

    // RPC functions for more complex queries
    async getFleetSummary(): Promise<any> {
        const { data, error } = await supabase
            .rpc('get_fleet_summary');

        if (error) throw error;
        return data;
    },

    async getDriverPerformance(driverId: string): Promise<any> {
        const { data, error } = await supabase
            .rpc('get_driver_performance', { p_driver_id: driverId });

        if (error) throw error;
        return data;
    },

    async getVehicleUtilization(vehicleId: string): Promise<any> {
        const { data, error } = await supabase
            .rpc('get_vehicle_utilization', { p_vehicle_id: vehicleId });

        if (error) throw error;
        return data;
    },
};
