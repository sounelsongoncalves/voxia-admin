
import React, { useEffect, useState } from 'react';
import { geofencesRepo, Geofence } from '../repositories/geofencesRepo';

export const Geofences: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'circle',
    center_lat: '',
    center_lng: '',
    radius_m: '500',
    active: true
  });

  useEffect(() => {
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const data = await geofencesRepo.getGeofences();
      setGeofences(data);
    } catch (error) {
      console.error('Failed to fetch geofences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await geofencesRepo.createGeofence({
        name: formData.name,
        type: formData.type as 'circle' | 'polygon',
        center_lat: parseFloat(formData.center_lat),
        center_lng: parseFloat(formData.center_lng),
        radius_m: parseInt(formData.radius_m),
        active: formData.active
      });
      setShowModal(false);
      setFormData({
        name: '',
        type: 'circle',
        center_lat: '',
        center_lng: '',
        radius_m: '500',
        active: true
      });
      fetchGeofences();
    } catch (error) {
      console.error('Failed to create geofence:', error);
      alert('Erro ao criar geofence');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta zona?')) {
      try {
        await geofencesRepo.deleteGeofence(id);
        fetchGeofences();
      } catch (error) {
        console.error('Failed to delete geofence:', error);
      }
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await geofencesRepo.toggleGeofence(id, !currentStatus);
      fetchGeofences();
    } catch (error) {
      console.error('Failed to toggle geofence:', error);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Geofences</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">add_location_alt</span>
          Adicionar Zona
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[600px] bg-surface-2 rounded-xl border border-surface-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA9cRHBi-RGRn_NFcKnD76wp0mQ_rdtOw7VEznMdGXQEGQ5xrGW6nLbcu7axC-4D7LQvj5xn2STa3_ldLpVlRM21u51RWPOdaKpJS9NQmw28MZUsH6gUYvvmhcdPuMkS-qyfr1lJ2mnbIpDwO6xty32WOuUmg7M2bzPFUFkLBdAkgiIydytTNMmms_u0BXPjZwIqFNCUcbQpWph_yN6i1rz67MOFS7I7bXS7BBH5ZtafupJq_J_2tzGp6MxMs9Bep12r3Xfp2JAUdFO")' }}></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="bg-surface-1/90 backdrop-blur px-4 py-2 rounded-lg border border-surface-border text-txt-primary font-medium shadow-xl">Mapa Interativo de Zonas</p>
          </div>
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="p-2 bg-surface-1 rounded-lg border border-surface-border hover:bg-surface-3"><span className="material-symbols-outlined">add</span></button>
            <button className="p-2 bg-surface-1 rounded-lg border border-surface-border hover:bg-surface-3"><span className="material-symbols-outlined">remove</span></button>
          </div>
        </div>

        <div className="bg-surface-1 border border-surface-border rounded-xl h-[600px] flex flex-col">
          <div className="p-4 border-b border-surface-border">
            <h3 className="font-bold text-txt-primary">Zonas Cadastradas</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <p className="text-center text-txt-tertiary py-4">Carregando...</p>
            ) : geofences.length === 0 ? (
              <p className="text-center text-txt-tertiary py-4">Nenhuma zona cadastrada</p>
            ) : (
              geofences.map(geo => (
                <div key={geo.id} className="p-3 hover:bg-surface-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-surface-border mb-2 group relative">
                  <div className="flex justify-between items-start">
                    <h4 className="text-txt-primary font-bold">{geo.name}</h4>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleToggle(geo.id, geo.active); }}
                      className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${geo.active ? 'bg-semantic-success/20 text-semantic-success' : 'bg-surface-3 text-txt-disabled'}`}
                    >
                      {geo.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-txt-tertiary mt-1">{geo.type === 'circle' ? 'Circular' : 'Polígono'} • Raio: {geo.radius_m}m</p>
                  <p className="text-[10px] text-txt-tertiary font-mono mt-1">{geo.center_lat?.toFixed(4)}, {geo.center_lng?.toFixed(4)}</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(geo.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-semantic-error hover:bg-semantic-error/10 rounded transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Geofence Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-txt-primary mb-4">Nova Zona</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1">Nome da Zona</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                  placeholder="Ex: CD Principal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-txt-secondary mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.center_lat}
                    onChange={e => setFormData({ ...formData, center_lat: e.target.value })}
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    placeholder="-23.5505"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-txt-secondary mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.center_lng}
                    onChange={e => setFormData({ ...formData, center_lng: e.target.value })}
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    placeholder="-46.6333"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1">Raio (metros)</label>
                <input
                  type="number"
                  required
                  value={formData.radius_m}
                  onChange={e => setFormData({ ...formData, radius_m: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:border-brand-primary outline-none"
                  placeholder="500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-txt-primary font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
