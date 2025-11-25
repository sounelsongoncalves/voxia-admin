
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsRepo } from '../repositories/tripsRepo';
import { driversRepo } from '../repositories/driversRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Driver, Vehicle } from '../types';

import { useToast } from '../components/ToastContext';

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    driver: '',
    vehicle: '',
    cargoType: '',
    startTime: '',
    tempFront: '',
    tempRear: '',
    jobDescription: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, vehiclesData] = await Promise.all([
          driversRepo.getDrivers(),
          vehiclesRepo.getVehicles()
        ]);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.origin || !formData.destination) {
      setError('Origem e destino são obrigatórios');
      return;
    }
    if (!formData.driver || !formData.vehicle) {
      setError('Motorista e veículo são obrigatórios');
      return;
    }
    if (!formData.startTime) {
      setError('Data e hora de partida são obrigatórias');
      return;
    }
    if (!formData.jobDescription) {
      setError('Descrição do trabalho é obrigatória');
      return;
    }

    setLoading(true);
    try {
      await tripsRepo.createTrip({
        origin: formData.origin,
        destination: formData.destination,
        driverId: formData.driver,
        vehicleId: formData.vehicle,
        tempFront: formData.tempFront ? Number(formData.tempFront) : undefined,
        tempRear: formData.tempRear ? Number(formData.tempRear) : undefined,
        jobDescription: formData.jobDescription,
        cargoType: formData.cargoType,
      } as any);

      showToast('✅ Viagem criada com sucesso!', 'success');
      navigate('/trips');
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      setError(err.message || 'Erro ao criar viagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-txt-tertiary mb-2">
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/trips')}>Viagens</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">Nova Viagem</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Criar Nova Viagem</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-6">

            {/* Route Section */}
            <div>
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">map</span>
                Rota e Horário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Origem</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">trip_origin</span>
                    <input
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      type="text"
                      placeholder="Morada de partida..."
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Destino</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">location_on</span>
                    <input
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      type="text"
                      placeholder="Morada de chegada..."
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Data e Hora de Partida</label>
                  <input
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    type="datetime-local"
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-surface-border w-full"></div>

            {/* Resources Section */}
            <div>
              <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary">local_shipping</span>
                Recursos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Motorista</label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">Selecione um motorista</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Veículo</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.model} - {v.plate}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-txt-secondary">Tipo de Carga</label>
                  <select
                    name="cargoType"
                    value={formData.cargoType}
                    onChange={handleChange}
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="general">Carga Geral</option>
                    <option value="refrigerated">Refrigerada</option>
                    <option value="dangerous">Perigosa</option>
                    <option value="grain">Granel</option>
                  </select>
                </div>

                {/* Refrigerated Cargo Fields */}
                {formData.cargoType === 'refrigerated' && (
                  <div className="grid grid-cols-2 gap-4 md:col-span-2 bg-surface-2 p-4 rounded-lg border border-surface-border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-txt-secondary">Motor da Frente (°C)</label>
                      <input
                        name="tempFront"
                        value={formData.tempFront}
                        onChange={handleChange}
                        type="number"
                        min="-30"
                        max="30"
                        placeholder="Ex: -18"
                        className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-txt-secondary">Motor de Trás (°C)</label>
                      <input
                        name="tempRear"
                        value={formData.tempRear}
                        onChange={handleChange}
                        type="number"
                        min="-30"
                        max="30"
                        placeholder="Ex: -18"
                        className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-txt-secondary">Descrição do Trabalho / Carga <span className="text-semantic-error">*</span></label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={(e: any) => handleChange(e as any)}
                    rows={3}
                    placeholder="Descreva os detalhes da carga e instruções especiais..."
                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'A criar...' : 'Confirmar Viagem'}
              </button>
            </div>
          </form>
        </div>

        {/* Map Preview Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-1 border border-surface-border rounded-xl overflow-hidden h-96 flex flex-col">
            <div className="p-4 border-b border-surface-border bg-surface-3">
              <h3 className="font-bold text-txt-primary">Prévia da Rota</h3>
            </div>
            <div className="flex-1 relative bg-bg-sec">
              {/* Route Preview Map */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(#2A2E35 1px, transparent 1px),
                    linear-gradient(to right, rgba(42, 46, 53, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(42, 46, 53, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px, 40px 40px, 40px 40px'
                }}
              ></div>

              {/* Route Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 100 100 Q 200 150 300 300"
                  stroke="#00CC99"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8 4"
                  className="opacity-70"
                />
                <circle cx="100" cy="100" r="6" fill="#00CC99" />
                <circle cx="300" cy="300" r="6" fill="#FFC107" />
              </svg>

              {/* Distance Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-surface-1/90 backdrop-blur-sm border border-surface-border p-3 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-txt-tertiary">Distância Estimada</span>
                  <span className="text-sm font-bold text-txt-primary">452 km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-txt-tertiary">Tempo Estimado</span>
                  <span className="text-sm font-bold text-txt-primary">6h 45min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-brand-primary">auto_awesome</span>
            <div>
              <h4 className="font-bold text-brand-primary text-sm mb-1">Sugestão do Copiloto</h4>
              <p className="text-xs text-txt-secondary leading-relaxed">
                O veículo <strong>Volvo FH 540</strong> está disponível e tem a melhor eficiência de combustível para esta rota.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
