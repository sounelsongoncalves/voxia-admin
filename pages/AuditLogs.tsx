
import React, { useEffect, useState } from 'react';
import { auditLogsRepo, AuditLog } from '../repositories/auditLogsRepo';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogsRepo.getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.admin_name?.toLowerCase().includes(filter.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt-primary">Audit Logs</h1>
      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-border flex gap-4">
          <input
            type="text"
            placeholder="Filtrar logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-bg-main border border-surface-border rounded-lg px-4 py-2 text-sm text-txt-primary w-64 focus:border-brand-primary outline-none"
          />
          <select className="bg-bg-main border border-surface-border rounded-lg px-4 py-2 text-sm text-txt-primary outline-none">
            <option value="">Todos os Eventos</option>
            <option value="create">Criação</option>
            <option value="update">Edição</option>
            <option value="delete">Exclusão</option>
            <option value="login">Login</option>
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Entidade</th>
              <th className="px-6 py-4">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-txt-tertiary">Carregando logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-txt-tertiary">Nenhum log encontrado</td></tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-4 text-txt-tertiary font-mono">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-txt-primary">{log.admin_name || log.admin_id}</td>
                  <td className="px-6 py-4"><span className="bg-surface-3 px-2 py-1 rounded text-xs border border-surface-border">{log.action}</span></td>
                  <td className="px-6 py-4 text-txt-secondary capitalize">{log.entity_type}</td>
                  <td className="px-6 py-4 text-txt-secondary truncate max-w-xs" title={JSON.stringify(log.changes)}>
                    {log.changes ? JSON.stringify(log.changes) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
