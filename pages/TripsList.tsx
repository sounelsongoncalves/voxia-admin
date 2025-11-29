
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripsRepo } from '../repositories/tripsRepo';
import { Trip, Status } from '../types';

import { useToast } from '../components/ToastContext';

export const TripsList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripsRepo.getTrips();
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      try {
        await tripsRepo.deleteTrip(id);
        setTrips(trips.filter(t => t.id !== id));
        showToast('Viagem excluída com sucesso', 'success');
      } catch (error) {
        console.error('Failed to delete trip:', error);
        showToast('Erro ao excluir viagem', 'error');
      }
    }
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  };

  const filteredTrips = trips.filter(t => !statusFilter || t.status === statusFilter);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-txt-tertiary">Carregando viagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Gestão de Viagens</h1>
        <button
          onClick={() => navigate('/trips/create')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Criar Viagem
        </button>
      </div>

      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-surface-border flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[250px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
            <input
              type="text"
              placeholder="Buscar por ID, Origem ou Motorista..."
              className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-sm text-txt-primary outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer"
          >
            <option value="">Todos os Status</option>
            <option value={Status.Active}>Ativo</option>
            <option value={Status.Accepted}>Aceita</option>
            <option value={Status.Completed}>Concluído</option>
            <option value={Status.InTransit}>Em Trânsito</option>
            <option value={Status.Warning}>Alerta</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">ID da Viagem</th>
                <th className="px-6 py-4">Rota</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <td className="px-6 py-4 font-mono text-brand-primary font-medium">{trip.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-txt-primary font-medium">{trip.origin}</span>
                      <div className="flex items-center gap-1 text-xs text-txt-tertiary mt-0.5">
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-txt-secondary font-medium">{trip.driver}</td>
                  <td className="px-6 py-4 text-txt-tertiary">{trip.vehicle}</td>
                  <td className="px-6 py-4 text-txt-secondary font-mono">{trip.eta}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${trip.status === Status.InTransit ? 'bg-semantic-info/10 text-semantic-info border-semantic-info/20' :
                      trip.status === Status.Completed ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' :
                        trip.status === Status.Accepted ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                          trip.status === Status.Warning ? 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20' :
                            'bg-surface-3 text-txt-disabled border-surface-border'
                      }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                        title="Editar"
                        onClick={(e) => { e.stopPropagation(); navigate('/trips/create'); }}
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                        title="Excluir"
                        onClick={(e) => handleDelete(e, trip.id)}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                      <button
                        className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 rounded-lg transition-colors"
                        title="Detalhes"
                        onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-txt-tertiary">
                    Nenhuma viagem encontrada com este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-txt-tertiary">
          <span>Mostrando <span className="text-txt-primary font-bold">1-{trips.length}</span> de <span className="text-txt-primary font-bold">{trips.length}</span> viagens</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              Anterior
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-bg-main font-bold">1</button>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary transition-colors">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
