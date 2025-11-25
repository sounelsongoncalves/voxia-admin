import { supabase } from '../services/supabase';
import { Driver, Status } from '../types';

export const driversRepo = {
    async getDrivers(filters?: { online?: boolean }): Promise<Driver[]> {
        let query = supabase
            .from('v_driver_stats')
            .select('*')
            .order('name');

        if (filters?.online) {
            const { data: onlineDrivers } = await supabase.from('v_online_drivers').select('id');
            const onlineIds = onlineDrivers?.map((d: any) => d.id) || [];
            if (onlineIds.length > 0) {
                query = query.in('id', onlineIds);
            } else {
                return [];
            }
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((driver: any) => ({
            id: driver.id,
            name: driver.name,
            status: driver.status as Status,
            rating: driver.rating || 5.0,
            tripsCompleted: driver.trips_completed || 0,
            avatar: driver.avatar_url || '',
            email: driver.email,
            phone: driver.phone,
            license_category: driver.license_category,
            license_expiry: driver.license_expiry,
        }));
    },

    async getDriverById(id: string): Promise<Driver | null> {
        const { data, error } = await supabase
            .from('v_driver_stats')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            name: data.name,
            status: data.status as Status,
            rating: data.rating || 5.0,
            tripsCompleted: data.trips_completed || 0,
            avatar: data.avatar_url || '',
            email: data.email,
            phone: data.phone,
            license_category: data.license_category,
            license_expiry: data.license_expiry,
        };
    },

    async createDriver(driver: Partial<Driver>, password?: string) {
        if (!password) {
            throw new Error('Password is required to create a driver account.');
        }

        // 1. Create Auth User via Edge Function (Admin context)
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
            body: {
                email: driver.email,
                password: password,
                user_metadata: {
                    name: driver.name,
                    role: 'driver'
                }
            }
        });

        if (userError) {
            console.error('Error creating user:', userError);
            throw new Error(`Failed to create user account: ${userError.message || 'Unknown error'}`);
        }

        if (!userData || !userData.id) {
            // Fallback: check if it returned an error object in data
            if (userData && userData.error) {
                throw new Error(userData.error);
            }
            throw new Error('Failed to create user account: No ID returned.');
        }

        // 2. Insert Driver Record with the returned ID
        const { data, error } = await supabase
            .from('drivers')
            .insert({
                id: userData.id, // Use the Auth User ID
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                status: driver.status || 'active',
                rating: driver.rating,
                avatar_url: driver.avatar,
                license_category: driver.license_category,
                license_expiry: driver.license_expiry,
                // fcm_token is null initially
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateDriver(id: string, updates: Partial<Driver>) {
        const { error } = await supabase
            .from('drivers')
            .update({
                name: updates.name,
                email: updates.email,
                phone: updates.phone,
                status: updates.status,
                rating: updates.rating,
                avatar_url: updates.avatar,
                license_category: updates.license_category,
                license_expiry: updates.license_expiry,
            })
            .eq('id', id);

        if (error) throw error;
    }
};
