
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { alertsRepo } from '../repositories/alertsRepo';
import { Alert } from '../types';
import { useToast } from '../components/ToastContext';

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Info'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Resolved'>((searchParams.get('status') === 'open' ? 'Open' : 'All'));
  const [openContextId, setOpenContextId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertsRepo.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Subscribe to realtime alerts
    const subscription = alertsRepo.subscribeToAlerts((newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update params when filters change
  useEffect(() => {
    const params: any = {};
    if (statusFilter === 'Open') params.status = 'open';
    if (statusFilter === 'Resolved') params.status = 'resolved';
    setSearchParams(params);
  }, [statusFilter, setSearchParams]);

  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = filter === 'All' || alert.type === filter;
    const statusMatch = statusFilter === 'All'
      ? true
      : statusFilter === 'Open'
        ? !alert.resolved_at
        : !!alert.resolved_at;
    return typeMatch && statusMatch;
  });

  const counts = {
    Critical: alerts.filter(a => a.type === 'Critical' && (!a.resolved_at)).length,
    Warning: alerts.filter(a => a.type === 'Warning' && (!a.resolved_at)).length,
    Info: alerts.filter(a => a.type === 'Info' && (!a.resolved_at)).length,
  };

  const handleResolve = async (id: string) => {
    if (window.confirm('Tem certeza que deseja marcar este alerta como resolvido?')) {
      try {
        await alertsRepo.resolveAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
        showToast('Alerta resolvido com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to resolve alert:', error);
        showToast('Erro ao resolver alerta. Tente novamente.', 'error');
      }
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await alertsRepo.resolveAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      showToast('Alerta arquivado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to archive alert:', error);
      showToast('Erro ao arquivar alerta.', 'error');
    }
  };

  const handleViewOnMap = (vehicleId?: string) => {
    if (vehicleId) {
      navigate(`/map?vehicle=${vehicleId}`);
    } else {
      navigate('/map');
    }
  };

  const toggleContext = (id: string) => {
    setOpenContextId(openContextId === id ? null : id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Critical': return 'error';
      case 'Warning': return 'warning';
      case 'Info': return 'info';
      default: return 'notifications';
    }
  };

  // Helper to extract classes for Tailwind
  const getColorClasses = (type: string) => {
    switch (type) {
      case 'Critical': return {
        iconBg: 'bg-semantic-error/10',
        text: 'text-semantic-error',
        border: 'border-semantic-error/20',
        badgeBg: 'bg-semantic-error/10'
      };
      case 'Warning': return {
        iconBg: 'bg-semantic-warning/10',
        text: 'text-semantic-warning',
        border: 'border-semantic-warning/20',
        badgeBg: 'bg-semantic-warning/10'
      };
      case 'Info': return {
        iconBg: 'bg-semantic-info/10',
        text: 'text-semantic-info',
        border: 'border-semantic-info/20',
        badgeBg: 'bg-semantic-info/10'
      };
      default: return {
        iconBg: 'bg-surface-2',
        text: 'text-txt-primary',
        border: 'border-surface-border',
        badgeBg: 'bg-surface-2'
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Central de Alertas</h1>
          <p className="text-sm text-txt-tertiary mt-1">Monitore e gerencie notificações importantes da frota em tempo real.</p>
        </div>
        <button
          onClick={() => showToast('Todos os alertas marcados como lidos.', 'success')}
          className="text-sm text-brand-primary hover:underline"
        >
          Marcar todos como lidos
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('Critical')}
          className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between relative overflow-hidden cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-error"></div>
          <div>
            <p className="text-txt-tertiary text-xs font-medium uppercase tracking-wider">Críticos</p>
            <p className="text-3xl font-bold text-txt-primary mt-1">{counts.Critical}</p>
          </div>
          <div className="p-3 rounded-lg bg-semantic-error/10 text-semantic-error">
            <span className="material-symbols-outlined">error</span>
          </div>
        </div>
        <div
          onClick={() => setFilter('Warning')}
          className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between relative overflow-hidden cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-warning"></div>
          <div>
            <p className="text-txt-tertiary text-xs font-medium uppercase tracking-wider">Avisos</p>
            <p className="text-3xl font-bold text-txt-primary mt-1">{counts.Warning}</p>
          </div>
          <div className="p-3 rounded-lg bg-semantic-warning/10 text-semantic-warning">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
        <div
          onClick={() => setFilter('Info')}
          className="bg-surface-1 border border-surface-border rounded-xl p-4 flex items-center justify-between relative overflow-hidden cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-info"></div>
          <div>
            <p className="text-txt-tertiary text-xs font-medium uppercase tracking-wider">Informativos</p>
            <p className="text-3xl font-bold text-txt-primary mt-1">{counts.Info}</p>
          </div>
          <div className="p-3 rounded-lg bg-semantic-info/10 text-semantic-info">
            <span className="material-symbols-outlined">info</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-surface-border pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {(['All', 'Critical', 'Warning', 'Info'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${filter === type
                ? 'bg-surface-2 text-txt-primary border border-brand-primary shadow-[0_0_10px_rgba(0,204,153,0.1)]'
                : 'text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 border border-transparent'
                }`}
            >
              {type === 'All' ? 'Todos os Tipos' : type === 'Critical' ? 'Críticos' : type === 'Warning' ? 'Avisos' : 'Informativos'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-txt-tertiary">Status:</span>
          <div className="flex bg-surface-2 rounded-lg p-1 border border-surface-border">
            {(['All', 'Open', 'Resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${statusFilter === status
                  ? 'bg-brand-primary text-bg-main shadow-sm'
                  : 'text-txt-tertiary hover:text-txt-primary'
                  }`}
              >
                {status === 'All' ? 'Todos' : status === 'Open' ? 'Abertos' : 'Resolvidos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const colors = getColorClasses(alert.type);
          const isContextOpen = openContextId === alert.id;

          return (
            <div key={alert.id} className="flex flex-col gap-2">
              <div className="bg-surface-1 border border-surface-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-surface-2 transition-colors group shadow-sm">
                {/* Icon */}
                <div className={`p-3 rounded-full shrink-0 ${colors.iconBg} ${colors.text}`}>
                  <span className="material-symbols-outlined">{getIcon(alert.type)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${colors.text} ${colors.border} ${colors.badgeBg}`}>
                      {alert.type === 'Critical' ? 'Crítico' : alert.type === 'Warning' ? 'Aviso' : 'Info'}
                    </span>
                    <span className="text-xs text-txt-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-txt-primary font-medium text-sm">{alert.message}</p>
                  {alert.vehicleId && (
                    <div
                      onClick={() => navigate(`/vehicles/${alert.vehicleId}`)}
                      className="flex items-center gap-1 mt-1 text-xs text-brand-primary cursor-pointer hover:underline w-fit"
                    >
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      Veículo: {alert.vehicleId}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end sm:border-l sm:border-surface-border sm:pl-4">
                  <button
                    onClick={() => handleViewOnMap(alert.vehicleId)}
                    className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                    title="Ver no Mapa"
                  >
                    <span className="material-symbols-outlined">map</span>
                  </button>
                  <button
                    onClick={() => handleArchive(alert.id)}
                    className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 rounded-lg transition-colors"
                    title="Arquivar"
                  >
                    <span className="material-symbols-outlined">archive</span>
                  </button>
                  <button
                    onClick={() => toggleContext(alert.id)}
                    className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 text-white text-sm font-medium leading-normal transition-colors ${isContextOpen ? 'bg-surface-3' : 'bg-surface-2 hover:bg-brand-primary'}`}
                  >
                    <span className="truncate">{isContextOpen ? 'Fechar Contexto' : 'Abrir Contexto'}</span>
                  </button>
                </div>
              </div>

              {/* Context Panel */}
              {isContextOpen && (
                <div className="p-6 bg-surface-2 rounded-xl border border-brand-primary/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h3 className="text-xl font-bold text-txt-primary mb-1">Contexto do Alerta</h3>
                  <p className="text-txt-secondary text-sm mb-4">ID: {alert.id} | Status: Pendente</p>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="text-txt-primary font-semibold mb-2">Detalhes Operacionais</h4>
                      <div className="space-y-2">
                        <p className="text-txt-secondary text-sm"><span className="font-medium text-txt-primary/80">Ocorrência:</span> {alert.message}</p>
                        <p className="text-txt-secondary text-sm"><span className="font-medium text-txt-primary/80">Veículo:</span> {alert.vehicleId || 'N/A'}</p>
                        <p className="text-semantic-warning text-sm mt-2 bg-semantic-warning/10 p-2 rounded border border-semantic-warning/20">
                          <span className="font-bold">Sugestão IA:</span> Verifique o histórico de manutenção recente deste veículo.
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="mt-4 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-brand-primary text-white text-sm font-bold leading-normal hover:bg-brand-hover transition-colors"
                      >
                        <span className="truncate">Marcar como Resolvido</span>
                      </button>
                    </div>
                    <div className="flex-1 bg-center bg-no-repeat aspect-video bg-cover rounded-lg border border-surface-border" data-alt="Map showing context" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBun42w_vOShq2iYOjhN8ameFvzUHqrWhp2xc39_lCeaOS14betEvb7rL_ImoU20b3LODFSAJ3DLEso9yTF0Ebst8GpZjzsX7BQKpHmGD_Bv6ITZYvhtozcRIYVtDaMqbnvfqdd2FMjPWsiIHwmSqTm80-0BtB6ohS81QCzpCSm_HTXbnkSf5VdITm8npNV-AYrGrzAD3vyJHALXFS237GRbCqnz6qcHffmlSJj-lpUKdR_xO_czzbbCTbzV5joEI8jtA3YZd9ReuIn")' }}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-surface-1 border border-surface-border rounded-xl border-dashed">
            <div className="p-4 bg-surface-2 rounded-full mb-3">
              <span className="material-symbols-outlined text-4xl text-txt-disabled">notifications_off</span>
            </div>
            <p className="text-txt-primary font-medium">Tudo limpo por aqui!</p>
            <p className="text-txt-tertiary text-sm mt-1">Nenhum alerta encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
