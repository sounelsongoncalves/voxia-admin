import { supabase } from '../services/supabase';

export interface Geofence {
    id: string;
    name: string;
    type: 'circle' | 'polygon';
    center_lat?: number;
    center_lng?: number;
    radius_m?: number;
    polygon_coords?: any;
    active: boolean;
    created_at: string;
}

export const geofencesRepo = {
    async getGeofences(): Promise<Geofence[]> {
        const { data, error } = await supabase
            .from('geofences')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getGeofenceById(id: string): Promise<Geofence | null> {
        const { data, error } = await supabase
            .from('geofences')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async createGeofence(geofence: Partial<Geofence>) {
        const { data, error } = await supabase
            .from('geofences')
            .insert(geofence)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateGeofence(id: string, updates: Partial<Geofence>) {
        const { error } = await supabase
            .from('geofences')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteGeofence(id: string) {
        const { error } = await supabase
            .from('geofences')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async toggleGeofence(id: string, active: boolean) {
        const { error } = await supabase
            .from('geofences')
            .update({ active })
            .eq('id', id);

        if (error) throw error;
    },
};
