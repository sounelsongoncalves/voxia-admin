
import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { kpiRepo } from '../repositories/kpiRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Status } from '../types';

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fuelData, setFuelData] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState({
    total: 0,
    inTransit: 0,
    stopped: 0,
    maintenance: 0,
    available: 0
  });
  const [driverStats, setDriverStats] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalFuelCost: 0,
    totalKm: 0,
    safetyScore: 0,
    maintenanceCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Fleet Stats
        const vehicles = await vehiclesRepo.getVehicles();
        const stats = {
          total: vehicles.length,
          inTransit: vehicles.filter(v => v.status === Status.InTransit).length,
          stopped: vehicles.filter(v => v.status === Status.Inactive).length,
          maintenance: vehicles.filter(v => v.status === Status.Error).length,
          available: vehicles.filter(v => v.status === Status.Active).length
        };
        setFleetStats(stats);

        // 2. Fetch KPI Data
        const kmByDriver = await kpiRepo.getKmByDriver();
        const onTimeRate = await kpiRepo.getOnTimeRate();
        const fuelEff = await kpiRepo.getFuelEfficiency();
        const driversList = await import('../repositories/driversRepo').then(m => m.driversRepo.getDrivers());

        // Merge driver stats
        const mergedDriverStats = kmByDriver.map(km => {
          const onTime = onTimeRate.find(r => r.driver_id === km.driver_id);
          const driverInfo = driversList.find(d => d.id === km.driver_id);

          return {
            id: km.driver_id,
            name: km.driver_name,
            totalKm: km.total_km,
            trips: onTime?.total_trips || 0,
            onTimeRate: onTime?.on_time_rate_percent || 0,
            rating: driverInfo?.rating || 5.0,
            efficiency: onTime?.on_time_rate_percent || 100 // Using OnTimeRate as efficiency proxy
          };
        });
        setDriverStats(mergedDriverStats);

        // 3. Calculate Top KPIs
        const totalKm = kmByDriver.reduce((acc, curr) => acc + curr.total_km, 0);

        // Estimated fuel cost based on KM (e.g., R$ 2.50 per km average)
        const estimatedFuelCost = totalKm * 2.5;

        const avgRating = driversList.reduce((acc, d) => acc + (d.rating || 5), 0) / (driversList.length || 1);
        const safetyScore = Math.round(avgRating * 20);

        setKpis({
          totalFuelCost: estimatedFuelCost,
          totalKm,
          safetyScore: safetyScore,
          maintenanceCount: stats.maintenance
        });

        // 4. Prepare Chart Data (using fuel efficiency data)
        // Mapping efficiency to a chart format
        setFuelData(fuelEff.map(f => f.avg_fuel_efficiency_km_per_l * 20)); // Scaling for chart

      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-txt-tertiary">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Relatórios e Analytics</h1>
          <p className="text-sm text-txt-tertiary mt-1">Análise detalhada de performance, custos e segurança da frota.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-1 rounded-lg p-1 border border-surface-border">
            {['7 Dias', '30 Dias', 'Este Mês', 'Ano'].map((period, idx) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${idx === 1
                  ? 'bg-surface-3 text-txt-primary shadow-sm'
                  : 'text-txt-tertiary hover:text-txt-primary hover:bg-surface-2'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-1 hover:bg-surface-2 border border-surface-border text-txt-primary text-sm font-medium rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Custo Est. Combustível"
          value={`R$ ${kpis.totalFuelCost.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          trend="+2.4%"
          trendUp={false}
          icon="local_gas_station"
          color="error"
        />
        <StatsCard
          title="KM Total Percorrido"
          value={`${kpis.totalKm.toLocaleString('pt-BR')} km`}
          trend="+12%"
          trendUp={true}
          icon="speed"
          color="primary"
        />
        <StatsCard
          title="Pontuação de Segurança"
          value={`${kpis.safetyScore}/100`}
          trend="+1.5pts"
          trendUp={true}
          icon="gpp_good"
          color="info"
        />
        <StatsCard
          title="Veículos em Manutenção"
          value={kpis.maintenanceCount.toString()}
          trend="Dentro do esperado"
          trendUp={true}
          icon="build"
          color="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Efficiency Chart Simulation */}
        <div className="lg:col-span-2 bg-surface-1 border border-surface-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-txt-primary">Consumo de Combustível (L/100km)</h3>
            <select className="bg-bg-main border border-surface-border rounded-lg px-3 py-1.5 text-xs text-txt-primary outline-none">
              <option>Todos os Veículos</option>
              <option>Pesados</option>
              <option>Médios</option>
            </select>
          </div>

          {/* Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 pt-4">
            {(fuelData.length > 0 ? fuelData : [65, 59, 80, 81, 56, 55, 40, 70, 65, 90, 85, 75]).slice(0, 12).map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group cursor-pointer">
                <div className="relative w-full flex justify-center items-end h-full">
                  <div
                    className="w-full max-w-[24px] bg-brand-primary/20 border-t-2 border-brand-primary rounded-t-sm transition-all duration-300 group-hover:bg-brand-primary/40 relative"
                    style={{ height: `${Math.min(value, 100)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-3 text-txt-primary text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-surface-border">
                      {value.toFixed(1)} L
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-txt-tertiary mt-2">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status / Distribution */}
        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-txt-primary mb-6">Distribuição da Frota</h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-txt-secondary">Em Trânsito</span>
                <span className="text-txt-primary font-bold">
                  {fleetStats.total > 0 ? Math.round((fleetStats.inTransit / fleetStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-2">
                <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${fleetStats.total > 0 ? (fleetStats.inTransit / fleetStats.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-txt-secondary">Parados / Inativos</span>
                <span className="text-txt-primary font-bold">
                  {fleetStats.total > 0 ? Math.round((fleetStats.stopped / fleetStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-2">
                <div className="bg-semantic-info h-2 rounded-full" style={{ width: `${fleetStats.total > 0 ? (fleetStats.stopped / fleetStats.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-txt-secondary">Manutenção</span>
                <span className="text-txt-primary font-bold">
                  {fleetStats.total > 0 ? Math.round((fleetStats.maintenance / fleetStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-2">
                <div className="bg-semantic-warning h-2 rounded-full" style={{ width: `${fleetStats.total > 0 ? (fleetStats.maintenance / fleetStats.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-txt-secondary">Disponível</span>
                <span className="text-txt-primary font-bold">
                  {fleetStats.total > 0 ? Math.round((fleetStats.available / fleetStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-2">
                <div className="bg-semantic-success h-2 rounded-full" style={{ width: `${fleetStats.total > 0 ? (fleetStats.available / fleetStats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-surface-2 rounded-lg border border-surface-border">
            <h4 className="text-sm font-bold text-txt-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary text-lg">lightbulb</span>
              Insight do Copiloto
            </h4>
            <p className="text-xs text-txt-secondary leading-relaxed">
              A eficiência de combustível caiu 1.2% nos finais de semana. Considere revisar as rotas de sábado para evitar congestionamentos locais.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-border">
          <h3 className="text-lg font-bold text-txt-primary">Performance por Motorista</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-txt-secondary uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4 text-center">Viagens</th>
                <th className="px-6 py-4 text-center">KM Total</th>
                <th className="px-6 py-4 text-center">Segurança</th>
                <th className="px-6 py-4 text-center">Eficiência</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-1">
              {driverStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-txt-tertiary">
                    Nenhum dado de performance disponível
                  </td>
                </tr>
              ) : (
                driverStats.map((driver) => (
                  <tr key={driver.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-brand-primary font-bold">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-txt-primary">{driver.name}</p>
                          <p className="text-xs text-txt-tertiary">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-txt-secondary">{driver.trips}</td>
                    <td className="px-6 py-4 text-center text-txt-secondary font-mono">{driver.totalKm.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${driver.rating >= 4.5 ? 'text-semantic-success' :
                        driver.rating >= 4.0 ? 'text-semantic-info' : 'text-semantic-warning'
                        }`}>
                        {driver.rating.toFixed(1)}/5.0
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${driver.rating >= 4.5 ? 'bg-brand-primary' : 'bg-semantic-warning'}`}
                            style={{ width: `${driver.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-txt-tertiary">{driver.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-primary hover:text-brand-hover text-xs font-medium hover:underline">
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
