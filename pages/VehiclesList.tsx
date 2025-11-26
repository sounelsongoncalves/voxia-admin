
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { driversRepo } from '../repositories/driversRepo';
import { Vehicle, Driver, Status } from '../types';

import { useToast } from '../components/ToastContext';

export const VehiclesList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const in_use = searchParams.get('in_use') === 'true';
        const [vehiclesData, driversData] = await Promise.all([
          vehiclesRepo.getVehicles({ in_use }),
          driversRepo.getDrivers()
        ]);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await vehiclesRepo.deleteVehicle(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        showToast('Veículo excluído com sucesso', 'success');
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
        showToast('Erro ao excluir veículo', 'error');
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

  const filteredVehicles = vehicles.filter(v => !statusFilter || v.status === statusFilter);

  // Helper para encontrar nome do motorista
  const getDriverName = (driverId?: string) => {
    if (!driverId) return 'Sem motorista';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Desconhecido';
  };

  // Helper para cor do combustível
  const getFuelColor = (level: number) => {
    if (level > 50) return 'bg-semantic-success';
    if (level > 20) return 'bg-semantic-warning';
    return 'bg-semantic-error';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Gestão de Veículos</h1>
          <p className="text-sm text-txt-tertiary mt-1">Gerencie toda a frota, status e manutenções.</p>
        </div>
        <button
          onClick={() => navigate('/vehicles/create')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar Veículo
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden shadow-sm">

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-surface-border flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
              <input
                type="text"
                placeholder="Buscar por Matrícula, Modelo ou Motorista..."
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
              <option value={Status.Inactive}>Inativo</option>
              <option value={Status.Error}>Manutenção</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors" title="Exportar">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors" title="Filtros Avançados">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Matrícula / Modelo</th>
                <th className="px-6 py-4">Motorista Atual</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Combustível</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                    Carregando veículos...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                    Nenhum veículo encontrado com este filtro
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-txt-primary font-mono font-bold text-base">{vehicle.plate}</span>
                        <span className="text-xs text-txt-tertiary">{vehicle.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs text-txt-tertiary border border-surface-border">
                          {getDriverName(vehicle.driverId).charAt(0)}
                        </div>
                        <span className="text-txt-secondary font-medium">{getDriverName(vehicle.driverId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-txt-tertiary">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span className="truncate max-w-[150px]">{vehicle.location || 'Desconhecida'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-txt-secondary">{vehicle.fuel}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getFuelColor(vehicle.fuel)}`}
                            style={{ width: `${vehicle.fuel}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === Status.Active ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                        vehicle.status === Status.Error ? 'bg-semantic-error/10 text-semantic-error border-semantic-error/20' :
                          'bg-surface-3 text-txt-disabled border-surface-border'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vehicle.status === Status.Active ? 'bg-brand-primary' :
                          vehicle.status === Status.Error ? 'bg-semantic-error' :
                            'bg-txt-disabled'
                          }`}></span>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title="Editar"
                          onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/create?id=${vehicle.id}`); }}
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                          title="Excluir"
                          onClick={(e) => handleDelete(e, vehicle.id)}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        <button
                          className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title="Detalhes"
                          onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${vehicle.id}`); }}
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-txt-tertiary">
          <span>Mostrando <span className="text-txt-primary font-bold">1-4</span> de <span className="text-txt-primary font-bold">24</span> veículos</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-2 hover:text-txt-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              Anterior
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-bg-main font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors">3</button>
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
