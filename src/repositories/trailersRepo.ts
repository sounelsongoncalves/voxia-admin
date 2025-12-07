import { supabase } from '../services/supabase';

export interface Trailer {
    id: string;
    plate: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    capacity_kg?: number;
    last_inspection?: string;
}

export const trailersRepo = {
    async getTrailers(): Promise<Trailer[]> {
        const { data, error } = await supabase
            .from('trailers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getTrailerById(id: string): Promise<Trailer | null> {
        const { data, error } = await supabase
            .from('trailers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async createTrailer(trailer: Partial<Trailer>) {
        const { data, error } = await supabase
            .from('trailers')
            .insert({
                plate: trailer.plate,
                type: trailer.type,
                status: trailer.status || 'active',
                capacity_kg: trailer.capacity_kg,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTrailer(id: string, updates: Partial<Trailer>) {
        const { error } = await supabase
            .from('trailers')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTrailer(id: string) {
        const { error } = await supabase
            .from('trailers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
