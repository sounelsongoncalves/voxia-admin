import React, { useState, useEffect } from 'react';
import { auditLogsRepo, AuditLog } from '../repositories/auditLogsRepo';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface GroupedLogs {
  date: string;
  items: AuditLog[];
}

export const AuditLogs: React.FC = () => {
  const [showMentionedOnly, setShowMentionedOnly] = useState(false);
  const [logs, setLogs] = useState<GroupedLogs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await auditLogsRepo.getAuditLogs();

      // Group by date
      const grouped: { [key: string]: AuditLog[] } = {};
      data.forEach(log => {
        const dateKey = format(new Date(log.created_at), "EEEE, dd MMMM", { locale: pt }).toUpperCase();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(log);
      });

      const groupedArray: GroupedLogs[] = Object.keys(grouped).map(date => ({
        date,
        items: grouped[date]
      }));

      setLogs(groupedArray);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUser = (log: AuditLog) => {
    if (log.admin) {
      return {
        name: log.admin.name || log.admin.email,
        avatar: log.admin.avatar_url,
        initials: (log.admin.name || log.admin.email).substring(0, 2).toUpperCase()
      };
    } else if (log.driver) {
      return {
        name: log.driver.name || log.driver.email,
        avatar: log.driver.avatar_url,
        initials: (log.driver.name || log.driver.email).substring(0, 2).toUpperCase()
      };
    }
    return { name: 'Sistema', avatar: null, initials: 'SYS' };
  };

  const formatAction = (log: AuditLog) => {
    switch (log.action) {
      case 'create': return 'criou';
      case 'update': return 'atualizou';
      case 'delete': return 'removeu';
      default: return log.action;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-txt-primary">Registo de Atividade</h1>
        <div className="flex items-center gap-4">
          <button onClick={fetchLogs} className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 transition-colors">
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8 relative">
        {/* Vertical Line Background */}
        <div className="absolute left-5 top-4 bottom-0 w-px bg-surface-border z-0"></div>

        {loading ? (
          <div className="text-center py-8 text-txt-tertiary">Carregando registos...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-txt-tertiary">Nenhum registo encontrado.</div>
        ) : (
          logs.map((group) => (
            <div key={group.date} className="relative z-10">
              <h3 className="text-xs font-bold text-txt-tertiary uppercase mb-6 ml-14">{group.date}</h3>

              <div className="space-y-8">
                {group.items.map((item) => {
                  const user = getUser(item);
                  return (
                    <div key={item.id} className="flex gap-4 group">
                      {/* Avatar / Icon */}
                      <div className="flex-shrink-0 relative">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-bg-main relative z-10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-txt-secondary border-2 border-bg-main relative z-10">
                            {user.initials}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-1 text-sm text-txt-secondary mb-1">
                          <span className="font-bold text-txt-primary">{user.name}</span>
                          <span>{formatAction(item)}</span>
                          <span className="font-bold text-txt-primary">{item.entity}</span>
                          <span className="text-txt-tertiary ml-1">
                            {format(new Date(item.created_at), 'HH:mm')}
                          </span>
                        </div>

                        {/* Details (Before/After) */}
                        {(item.before || item.after) && (
                          <div className="mt-2 bg-surface-2 rounded-lg p-3 text-xs text-txt-secondary border border-surface-border font-mono overflow-x-auto">
                            {item.action === 'update' ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-semantic-error">Antes:</span>
                                  <pre>{JSON.stringify(item.before, null, 2)}</pre>
                                </div>
                                <div>
                                  <span className="text-semantic-success">Depois:</span>
                                  <pre>{JSON.stringify(item.after, null, 2)}</pre>
                                </div>
                              </div>
                            ) : (
                              <pre>{JSON.stringify(item.after || item.before, null, 2)}</pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
