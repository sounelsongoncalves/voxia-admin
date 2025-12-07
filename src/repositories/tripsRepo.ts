import { supabase } from '../services/supabase';
import { Trip, Status } from '../types';
import { settingsRepo } from './settingsRepo';

export const tripsRepo = {
    async getTrips(): Promise<Trip[]> {
        const { data, error } = await supabase
            .from('trips')
            .select(`
        id,
        origin,
        destination,
        status,
        window_end,
        started_at,
        cargo_json,
        driver_id,
        vehicle_id,
        trailer_id,
        temp_front_c,
        temp_rear_c,
        job_description,
        driver:drivers(name),
        vehicle:vehicles(model),
        trailer:trailers(plate)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((trip: any) => ({
            id: trip.id,
            origin: trip.origin,
            destination: trip.destination,
            driver: trip.driver?.name || 'N/A',
            vehicle: trip.vehicle?.model || 'N/A',
            trailer: trip.trailer?.plate || 'N/A',
            status: mapDbStatusToFrontend(trip.status),
            eta: trip.window_end ? new Date(trip.window_end).toLocaleString() : '-',
            progress: 0,
            startTime: trip.started_at ? new Date(trip.started_at).toLocaleString() : undefined,
            cargo: trip.cargo_json ? {
                type: trip.cargo_json.cargo_type || trip.cargo_json.type,
                weight: trip.cargo_json.weight,
                value: trip.cargo_json.value
            } : undefined,
            driverId: trip.driver_id,
            vehicleId: trip.vehicle_id,
            trailerId: trip.trailer_id,
            tempFront: trip.temp_front_c,
            tempRear: trip.temp_rear_c,
            jobDescription: trip.job_description,
        }));
    },

    async getTripById(id: string): Promise<Trip | null> {
        const { data, error } = await supabase
            .from('trips')
            .select(`
        id,
        origin,
        destination,
        status,
        window_end,
        started_at,
        cargo_json,
        driver_id,
        vehicle_id,
        trailer_id,
        temp_front_c,
        temp_rear_c,
        job_description,
        driver:drivers(name),
        vehicle:vehicles(model),
        trailer:trailers(plate)
      `)
            .eq('id', id)
            .single();

        if (error) return null;

        const tripData = data as any;

        return {
            id: tripData.id,
            origin: tripData.origin,
            destination: tripData.destination,
            driver: tripData.driver?.name || 'N/A',
            vehicle: tripData.vehicle?.model || 'N/A',
            trailer: tripData.trailer?.plate || 'N/A',
            status: mapDbStatusToFrontend(tripData.status),
            eta: tripData.window_end ? new Date(tripData.window_end).toLocaleString() : '-',
            progress: 0,
            startTime: tripData.started_at ? new Date(tripData.started_at).toLocaleString() : undefined,
            cargo: tripData.cargo_json ? {
                type: tripData.cargo_json.cargo_type || tripData.cargo_json.type,
                weight: tripData.cargo_json.weight,
                value: tripData.cargo_json.value
            } : undefined,
            driverId: tripData.driver_id,
            vehicleId: tripData.vehicle_id,
            trailerId: tripData.trailer_id,
            tempFront: tripData.temp_front_c,
            tempRear: tripData.temp_rear_c,
            jobDescription: tripData.job_description,
        };
    },

    async createTrip(trip: Partial<Trip> & { driverId: string; vehicleId: string }) {
        const { data, error } = await supabase
            .from('trips')
            .insert({
                origin: trip.origin,
                destination: trip.destination,
                driver_id: trip.driverId,
                vehicle_id: trip.vehicleId,
                trailer_id: trip.trailerId,
                status: 'assigned',
                temp_front_c: trip.tempFront,
                temp_rear_c: trip.tempRear,
                job_description: trip.jobDescription,
                cargo_json: {
                    temp_front: trip.tempFront,
                    temp_rear: trip.tempRear,
                    description: trip.jobDescription,
                    cargo_type: (trip as any).cargoType,
                    trailer_id: trip.trailerId
                }
            })
            .select()
            .single();

        if (error) throw error;

        // Push Notification Logic
        try {
            // Check system preferences first
            const preferences = await settingsRepo.getPreferences();
            if (preferences?.realtime_notifications) {
                const { data: driverData } = await supabase
                    .from('drivers')
                    .select('fcm_token')
                    .eq('id', trip.driverId)
                    .single();

                if (driverData?.fcm_token) {
                    await supabase.functions.invoke('push-notification', {
                        body: {
                            driver_id: trip.driverId,
                            trip_id: data.id,
                            title: 'Nova Viagem atribuída',
                            message: `Tem uma nova viagem ${data.id.substring(0, 8)} para ${trip.destination}.`,
                            data: { type: 'NEW_TRIP', tripId: data.id }
                        }
                    });
                    console.log('Push notification sent to driver');
                } else {
                    console.warn('Driver has no FCM token, skipping push notification');
                }
            } else {
                console.log('Realtime notifications disabled in settings');
            }
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
            // Don't throw, just log
        }

        // Insert into notifications table for persistence
        try {
            await supabase.from('notifications').insert({
                user_id: trip.driverId,
                title: 'Nova Viagem atribuída',
                message: `Tem uma nova viagem ${data.id.substring(0, 8)} para ${trip.destination}.`,
                type: 'NEW_TRIP',
                data: { tripId: data.id }
            });
        } catch (dbError) {
            console.error('Failed to save notification to DB:', dbError);
        }

        return data;
    },

    async updateTripStatus(id: string, status: Status) {
        const dbStatus = mapFrontendStatusToDb(status);
        const { error } = await supabase
            .from('trips')
            .update({ status: dbStatus })
            .eq('id', id);

        if (error) throw error;
    },

    async assignTrip(tripId: string, driverId: string, vehicleId: string) {
        const { data, error } = await supabase
            .from('trips')
            .update({ driver_id: driverId, vehicle_id: vehicleId, status: 'assigned' })
            .eq('id', tripId)
            .select()
            .single();

        if (error) throw error;

        // Push Notification Logic
        try {
            // Check system preferences first
            const preferences = await settingsRepo.getPreferences();
            if (preferences?.realtime_notifications) {
                const { data: driverData } = await supabase
                    .from('drivers')
                    .select('fcm_token')
                    .eq('id', driverId)
                    .single();

                if (driverData?.fcm_token) {
                    await supabase.functions.invoke('push-notification', {
                        body: {
                            driver_id: driverId,
                            trip_id: tripId,
                            title: 'Nova Viagem atribuída',
                            message: `Tem uma nova viagem ${tripId.substring(0, 8)} para ${data.destination}.`,
                            data: { type: 'NEW_TRIP', tripId: tripId }
                        }
                    });
                    console.log('Push notification sent to driver');
                } else {
                    console.warn('Driver has no FCM token, skipping push notification');
                }
            } else {
                console.log('Realtime notifications disabled in settings');
            }
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
            // Don't throw, just log
        }

        // Insert into notifications table for persistence
        try {
            await supabase.from('notifications').insert({
                user_id: driverId,
                title: 'Nova Viagem atribuída',
                message: `Tem uma nova viagem ${tripId.substring(0, 8)} para ${data.destination}.`,
                type: 'NEW_TRIP',
                data: { tripId: tripId }
            });
        } catch (dbError) {
            console.error('Failed to save notification to DB:', dbError);
        }
    },

    async getTripsByVehicle(vehicleId: string): Promise<Trip[]> {
        const { data, error } = await supabase
            .from('trips')
            .select(`
        id,
        origin,
        destination,
        status,
        window_end,
        started_at,
        cargo_json,
        driver_id,
        vehicle_id,
        temp_front_c,
        temp_rear_c,
        job_description,
        driver:drivers(name),
        vehicle:vehicles(model)
      `)
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((trip: any) => ({
            id: trip.id,
            origin: trip.origin,
            destination: trip.destination,
            driver: trip.driver?.name || 'N/A',
            vehicle: trip.vehicle?.model || 'N/A',
            status: mapDbStatusToFrontend(trip.status),
            eta: trip.window_end ? new Date(trip.window_end).toLocaleString() : '-',
            progress: 0,
            startTime: trip.started_at ? new Date(trip.started_at).toLocaleString() : undefined,
            cargo: trip.cargo_json ? {
                type: trip.cargo_json.cargo_type || trip.cargo_json.type,
                weight: trip.cargo_json.weight,
                value: trip.cargo_json.value
            } : undefined,
            driverId: trip.driver_id,
            vehicleId: trip.vehicle_id,
            tempFront: trip.temp_front_c,
            tempRear: trip.temp_rear_c,
            jobDescription: trip.job_description,
        }));
    },

    async getTripsByDriver(driverId: string): Promise<Trip[]> {
        const { data, error } = await supabase
            .from('trips')
            .select(`
        id,
        origin,
        destination,
        status,
        window_end,
        started_at,
        cargo_json,
        driver_id,
        vehicle_id,
        temp_front_c,
        temp_rear_c,
        job_description,
        driver:drivers(name),
        vehicle:vehicles(model)
      `)
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((trip: any) => ({
            id: trip.id,
            origin: trip.origin,
            destination: trip.destination,
            driver: trip.driver?.name || 'N/A',
            vehicle: trip.vehicle?.model || 'N/A',
            status: mapDbStatusToFrontend(trip.status),
            eta: trip.window_end ? new Date(trip.window_end).toLocaleString() : '-',
            progress: 0,
            startTime: trip.started_at ? new Date(trip.started_at).toLocaleString() : undefined,
            cargo: trip.cargo_json ? {
                type: trip.cargo_json.cargo_type || trip.cargo_json.type,
                weight: trip.cargo_json.weight,
                value: trip.cargo_json.value
            } : undefined,
            driverId: trip.driver_id,
            vehicleId: trip.vehicle_id,
            tempFront: trip.temp_front_c,
            tempRear: trip.temp_rear_c,
            jobDescription: trip.job_description,
        }));
    },

    async deleteTrip(id: string) {
        const { error } = await supabase
            .from('trips')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Helper functions for status mapping
function mapDbStatusToFrontend(dbStatus: string): Status {
    switch (dbStatus) {
        case 'planned': return Status.Pending;
        case 'assigned': return Status.Pending;
        case 'accepted': return Status.Accepted;
        case 'started': return Status.Active;
        case 'in_progress': return Status.InTransit;
        case 'done': return Status.Completed;
        case 'canceled': return Status.Inactive;
        default: return Status.Pending;
    }
}

function mapFrontendStatusToDb(status: Status): string {
    switch (status) {
        case Status.Pending: return 'assigned'; // Default to assigned when setting to pending
        case Status.Accepted: return 'accepted';
        case Status.Active: return 'started';
        case Status.InTransit: return 'in_progress';
        case Status.Completed: return 'done';
        case Status.Inactive: return 'canceled';
        default: return 'planned';
    }
}
