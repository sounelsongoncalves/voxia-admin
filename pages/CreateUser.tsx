import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminsRepo } from '../repositories/adminsRepo';

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await adminsRepo.createAdmin(
        formData.email,
        formData.name,
        formData.role as any,
        formData.password,
        formData.phone
      );
      navigate('/settings');
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.message || 'Erro ao criar utilizador.');
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
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate('/settings')}>Configurações</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">Adicionar Utilizador</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">Adicionar Novo Utilizador</h1>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-8">

          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error text-semantic-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Info */}
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">person</span>
              Informações do Utilizador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Nome Completo</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Ex: Maria Souza"
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Email Corporativo</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="usuario@voxia.com"
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Telemóvel</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="+351 ..."
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-border w-full"></div>

          {/* Role & Access */}
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">admin_panel_settings</span>
              Permissões e Acesso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Função (Papel)</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  required
                >
                  <option value="">Selecione a função...</option>
                  <option value="manager">Gestor de Frota</option>
                  <option value="operator">Operador</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-border w-full"></div>

          {/* Security */}
          <div>
            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">lock</span>
              Segurança
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Senha Temporária</label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Confirmar Senha</label>
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-txt-tertiary mt-2">O utilizador será solicitado a alterar a senha no primeiro login.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors text-sm font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
