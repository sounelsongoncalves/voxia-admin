import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsRepo, SystemPreferences } from '../repositories/settingsRepo';
import { adminsRepo } from '../repositories/adminsRepo';
import { Admin } from '../types';
import { useToast } from '../components/ToastContext';

interface SettingsProps {
  initialTab?: 'general' | 'users' | 'profile';
}

export const Settings: React.FC<SettingsProps> = ({ initialTab = 'general' }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<SystemPreferences | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'profile'>(initialTab);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prefsData, adminsData, currentUserData] = await Promise.all([
        settingsRepo.getPreferences(),
        adminsRepo.getAdmins(),
        adminsRepo.getCurrentAdmin()
      ]);
      setPrefs(prefsData);
      setAdmins(adminsData);
      setCurrentUser(currentUserData);
      if (currentUserData) {
        setProfileForm(prev => ({ ...prev, name: currentUserData.name, phone: currentUserData.phone || '' }));
      }
    } catch (error) {
      console.error('Error fetching settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof SystemPreferences) => {
    if (!prefs) return;
    const newValue = !prefs[key];
    setPrefs({ ...prefs, [key]: newValue }); // Optimistic
    try {
      await settingsRepo.updatePreferences({ [key]: newValue });
    } catch (error) {
      console.error('Error updating preference:', error);
      setPrefs({ ...prefs, [key]: !newValue }); // Revert
    }
  };

  const handleRoleChange = async (id: string, newRole: 'owner' | 'manager' | 'operator') => {
    try {
      await adminsRepo.updateAdminRole(id, newRole);
      setAdmins(admins.map(a => a.id === id ? { ...a, role: newRole } : a));
    } catch (error) {
      showToast('Erro ao atualizar função.', 'error');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const isActive = currentStatus === 'Ativo';
    try {
      await adminsRepo.toggleAdminStatus(id, !isActive);
      setAdmins(admins.map(a => a.id === id ? { ...a, status: !isActive ? 'Ativo' : 'Inativo', active: !isActive } : a));
    } catch (error) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário permanentemente?')) return;

    try {
      await adminsRepo.deleteAdmin(id);
      setAdmins(admins.filter(a => a.id !== id));
      showToast('Usuário excluído com sucesso.', 'success');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast('Erro ao excluir usuário: ' + (error.message || 'Erro desconhecido'), 'error');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileLoading(true);

    try {
      let avatarUrl = currentUser.avatar_url;

      if (avatarFile) {
        avatarUrl = await adminsRepo.uploadAvatar(avatarFile, currentUser.id);
      }

      await adminsRepo.updateProfile(currentUser.id, {
        name: profileForm.name,
        phone: profileForm.phone,
        avatar_url: avatarUrl
      });

      if (profileForm.password) {
        if (profileForm.password !== profileForm.confirmPassword) {
          showToast('As senhas não coincidem.', 'error');
          setProfileLoading(false);
          return;
        }
        await adminsRepo.updatePassword(profileForm.password);
      }

      showToast('Perfil atualizado com sucesso!', 'success');
      fetchData(); // Refresh data
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast('Erro ao atualizar perfil: ' + error.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-txt-tertiary">Carregando configurações...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-txt-primary">Configurações</h1>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-txt-tertiary hover:text-txt-primary'}`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'users' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-txt-tertiary hover:text-txt-primary'}`}
        >
          Gestão de Utilizadores
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-txt-tertiary hover:text-txt-primary'}`}
        >
          Meu Perfil
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-txt-primary mb-4 border-b border-surface-border pb-2">Perfil da Organização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-txt-tertiary mb-2">Nome da Empresa</label>
                <input type="text" value="Voxia Logística" className="w-full bg-surface-1 border border-surface-border rounded-lg px-4 py-2 text-txt-primary focus:border-brand-primary outline-none" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-txt-tertiary mb-2">Email do Admin</label>
                <input type="email" value="admin@voxia.com" className="w-full bg-surface-1 border border-surface-border rounded-lg px-4 py-2 text-txt-primary focus:border-brand-primary outline-none" readOnly />
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-txt-primary mb-4 border-b border-surface-border pb-2">Preferências do Sistema</h2>
            <div className="space-y-4">
              {[
                { key: 'dark_mode', label: 'Modo Escuro', desc: 'Forçar tema escuro em todas as contas' },
                { key: 'realtime_notifications', label: 'Notificações em Tempo Real', desc: 'Receber alertas críticos' },
                { key: 'copilot_auto_analysis', label: 'Auto-Análise do Copiloto IA', desc: 'IA busca melhorias proativamente' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-txt-primary font-medium">{item.label}</p>
                    <p className="text-sm text-txt-tertiary">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key as keyof SystemPreferences)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${prefs?.[item.key as keyof SystemPreferences] ? 'bg-brand-primary' : 'bg-surface-3'}`}
                  >
                    <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${prefs?.[item.key as keyof SystemPreferences] ? 'bg-bg-main right-1' : 'bg-txt-tertiary left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-surface-1 border border-surface-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4 border-b border-surface-border pb-2">
            <h2 className="text-lg font-semibold text-txt-primary">Gestão de Utilizadores (RBAC)</h2>
            <button
              onClick={() => navigate('/settings/users/create')}
              className="px-4 py-2 bg-brand-primary text-bg-main rounded-lg text-sm font-bold hover:bg-brand-hover transition-colors"
            >
              Adicionar Utilizador
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-txt-tertiary border-b border-surface-border">
                  <th className="pb-2 px-4">Utilizador</th>
                  <th className="pb-2 px-4">Função</th>
                  <th className="pb-2 px-4">Status</th>
                  <th className="pb-2 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {admin.avatar_url ? (
                          <img src={admin.avatar_url} alt={admin.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-txt-tertiary">
                            <span className="material-symbols-outlined text-sm">person</span>
                          </div>
                        )}
                        <div>
                          <p className="text-txt-primary font-medium">{admin.name}</p>
                          <p className="text-xs text-txt-tertiary">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={admin.role}
                        onChange={(e) => handleRoleChange(admin.id, e.target.value as any)}
                        disabled={currentUser?.role !== 'owner' && currentUser?.role !== 'manager'}
                        className="bg-surface-2 border border-surface-border rounded px-2 py-1 text-xs text-txt-primary outline-none focus:border-brand-primary"
                      >
                        <option value="owner">Super Admin</option>
                        <option value="manager">Gestor</option>
                        <option value="operator">Operador</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleStatusToggle(admin.id, admin.status || 'Ativo')}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${admin.status === 'Ativo' ? 'bg-semantic-success/10 text-semantic-success' : 'bg-semantic-error/10 text-semantic-error'}`}
                      >
                        {admin.status || 'Ativo'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(admin.id)}
                        className="p-1.5 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded transition-colors"
                        title="Excluir Usuário"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === 'profile' && currentUser && (
        <div className="bg-surface-1 border border-surface-border rounded-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-txt-primary mb-6 border-b border-surface-border pb-2">Editar Meu Perfil</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-brand-primary" />
                ) : currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover border-2 border-surface-border" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-surface-3 flex items-center justify-center border-2 border-surface-border">
                    <span className="material-symbols-outlined text-4xl text-txt-tertiary">person</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <p className="text-sm text-txt-tertiary">Clique para alterar a foto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Nome Completo</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-txt-primary focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-txt-secondary">Telemóvel</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+351 ..."
                  className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-txt-primary focus:border-brand-primary outline-none"
                />
              </div>
            </div>

            <div className="border-t border-surface-border pt-4 mt-4">
              <h3 className="text-sm font-bold text-txt-primary mb-4">Alterar Senha (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Nova Senha</label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-txt-primary focus:border-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">Confirmar Senha</label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-2.5 text-txt-primary focus:border-brand-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-2.5 bg-brand-primary text-bg-main rounded-lg font-bold hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {profileLoading ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
