import { supabase } from '../services/supabase';
import { Admin } from '../types';

export const adminsRepo = {
    async getAdmins(): Promise<Admin[]> {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((admin: any) => ({
            ...admin,
            status: admin.active ? 'Ativo' : 'Inativo'
        }));
    },

    async getAdminById(id: string): Promise<Admin | null> {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return {
            ...data,
            status: data.active ? 'Ativo' : 'Inativo'
        };
    },

    async getCurrentAdmin(): Promise<Admin | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        return await this.getAdminById(session.user.id);
    },

    async updateAdminRole(id: string, role: 'owner' | 'manager' | 'operator') {
        // Only owner/manager can update roles (enforced by RLS too, but good to check)
        const currentAdmin = await this.getCurrentAdmin();
        if (!currentAdmin || (currentAdmin.role !== 'owner' && currentAdmin.role !== 'manager')) {
            throw new Error('Permissão negada. Apenas owners e managers podem alterar roles.');
        }

        const { error } = await supabase
            .from('admins')
            .update({ role })
            .eq('id', id);

        if (error) throw error;
    },

    async toggleAdminStatus(id: string, active: boolean) {
        const currentAdmin = await this.getCurrentAdmin();
        if (!currentAdmin || (currentAdmin.role !== 'owner' && currentAdmin.role !== 'manager')) {
            throw new Error('Permissão negada.');
        }

        const { error } = await supabase
            .from('admins')
            .update({ active })
            .eq('id', id);

        if (error) throw error;
    },

    async createAdmin(email: string, name: string, role: 'manager' | 'operator', password?: string, phone?: string) {
        const currentAdmin = await this.getCurrentAdmin();
        if (!currentAdmin || currentAdmin.role !== 'owner') {
            throw new Error('Permissão negada. Apenas owners podem criar novos admins.');
        }

        if (!password) {
            throw new Error('Senha é obrigatória para criar um novo administrador.');
        }

        // 1. Create Auth User via Edge Function
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
            body: {
                email,
                password,
                user_metadata: {
                    name,
                    role
                }
            }
        });

        if (userError) {
            console.error('Error creating admin user:', userError);
            throw new Error(`Erro ao criar usuário admin: ${userError.message || 'Erro desconhecido'}`);
        }

        if (!userData || !userData.id) {
            if (userData && userData.error) throw new Error(userData.error);
            throw new Error('Erro ao criar usuário: ID não retornado.');
        }

        // 2. Insert into admins table
        const { data, error } = await supabase
            .from('admins')
            .insert({
                id: userData.id, // Use Auth ID
                email,
                name,
                role,
                phone,
                active: true,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateProfile(id: string, updates: { name?: string; phone?: string; avatar_url?: string }) {
        const { error } = await supabase
            .from('admins')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async uploadAvatar(file: File, userId: string): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('admin-avatars')
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('admin-avatars')
            .getPublicUrl(fileName);

        return data.publicUrl;
    },

    async updatePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    async deleteAdmin(id: string) {
        const currentAdmin = await this.getCurrentAdmin();
        if (!currentAdmin || currentAdmin.role !== 'owner') {
            throw new Error('Permissão negada. Apenas owners podem excluir admins.');
        }

        // 1. Delete from admins table first (due to foreign key constraints usually, but here auth is parent)
        // Actually, deleting from auth usually cascades or we should delete from auth and let it cascade if configured.
        // However, standard practice with Supabase client is we can't delete from auth directly without service role.
        // We need an Edge Function for this.

        const { error } = await supabase.functions.invoke('delete-user', {
            body: { userId: id }
        });

        if (error) throw error;

        // If the edge function handles auth deletion, we might still need to manually clean up the public table 
        // if cascade isn't set up. But let's assume we want to call the edge function.
        // If no edge function exists yet, we will fail.
        // Alternatively, we can just "soft delete" by setting active = false, but the user asked for "delete".

        // Let's try to delete from the public table first to see if RLS allows it for owners.
        const { error: dbError } = await supabase
            .from('admins')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;
    }
};
