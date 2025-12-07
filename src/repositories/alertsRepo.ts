import { supabase } from '../services/supabase';
import { Alert } from '../types';

export const alertsRepo = {
    async getAlerts(): Promise<Alert[]> {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((a: any) => ({
            id: a.id,
            type: a.type as 'Critical' | 'Warning' | 'Info',
            message: a.message,
            timestamp: new Date(a.created_at).toLocaleString(), // Format as needed
            vehicleId: a.vehicle_id,
            resolved_at: a.resolved_at,
        }));
    },

    async getAlertsByVehicle(vehicleId: string): Promise<Alert[]> {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((a: any) => ({
            id: a.id,
            type: a.type as 'Critical' | 'Warning' | 'Info',
            message: a.message,
            timestamp: new Date(a.created_at).toLocaleString(),
            vehicleId: a.vehicle_id,
            resolved_at: a.resolved_at,
        }));
    },

    async resolveAlert(id: string) {
        const { error } = await supabase
            .from('alerts')
            .update({ resolved_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    subscribeToAlerts(callback: (alert: Alert) => void) {
        return supabase
            .channel('alerts-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'alerts' },
                (payload) => {
                    const newAlert = payload.new as any;
                    callback({
                        id: newAlert.id,
                        type: newAlert.type as 'Critical' | 'Warning' | 'Info',
                        message: newAlert.message,
                        timestamp: new Date(newAlert.created_at).toLocaleString(),
                        vehicleId: newAlert.vehicle_id,
                    });
                }
            )
            .subscribe();
    }
};
