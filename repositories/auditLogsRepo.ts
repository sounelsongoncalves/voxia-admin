import { supabase } from '../services/supabase';

export interface AuditLog {
    id: string;
    admin_id: string;
    admin_name?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export const auditLogsRepo = {
    async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
        *,
        admin:admins(name)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map((log: any) => ({
            ...log,
            admin_name: log.admin?.name || 'Unknown',
        }));
    },

    async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
        *,
        admin:admins(name)
      `)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((log: any) => ({
            ...log,
            admin_name: log.admin?.name || 'Unknown',
        }));
    },

    async getAuditLogsByAdmin(adminId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
        *,
        admin:admins(name)
      `)
            .eq('admin_id', adminId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((log: any) => ({
            ...log,
            admin_name: log.admin?.name || 'Unknown',
        }));
    },

    async createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
        const { error } = await supabase
            .from('audit_logs')
            .insert(log);

        if (error) throw error;
    },
};
