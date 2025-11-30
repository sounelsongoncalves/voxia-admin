import { supabase } from '../services/supabase';

export interface AuditLog {
    id: string;
    actor_admin_id?: string;
    actor_driver_id?: string;
    entity: string;
    entity_id?: string;
    action: string;
    before?: any;
    after?: any;
    created_at: string;
    admin?: { name: string; email: string; avatar_url: string };
    driver?: { name: string; email: string; avatar_url: string };
}

export const auditLogsRepo = {
    async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
        *,
        admin:actor_admin_id(name, email, avatar_url),
        driver:actor_driver_id(name, email, avatar_url)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data as AuditLog[];
    },

    async getAuditLogsByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
        *,
        admin:actor_admin_id(name, email, avatar_url),
        driver:actor_driver_id(name, email, avatar_url)
      `)
            .eq('entity', entity)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data as AuditLog[];
    },

    async createAuditLog(log: Partial<AuditLog>) {
        const { error } = await supabase
            .from('audit_logs')
            .insert(log);

        if (error) throw error;
    },
};
