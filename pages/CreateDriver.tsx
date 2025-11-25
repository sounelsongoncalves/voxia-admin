import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { driversRepo } from '../repositories/driversRepo';
import { adminsRepo } from '../repositories/adminsRepo';
import { Status } from '../types';
import { useToast } from '../components/ToastContext';

export const CreateDriver: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('mode') === 'edit';
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Driver Form Data
  const [driverData, setDriverData] = useState({
    name: '',
    cpf: '',
    licenseNumber: '',
    licenseCategory: '',
    licenseExpiry: '',
    phone: '',
    email: '',
    status: Status.Active,
  });

  // Admin Form Data
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operator',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (editMode && editId) {
      loadDriverData(editId);
    }
  }, [editMode, editId]);

  const loadDriverData = async (id: string) => {
    try {
      setLoading(true);
      const driver = await driversRepo.getDriverById(id);
      if (driver) {
        setDriverData({
          name: driver.name,
          cpf: '', // Not in Driver type, maybe fetch from somewhere else or leave empty
          licenseNumber: '', // Not in Driver type
          licenseCategory: driver.license_category || '',
          licenseExpiry: driver.license_expiry || '',
          phone: driver.phone || '',
          email: driver.email || '',
          status: driver.status,
        });
      }
    } catch (err) {
      console.error('Failed to load driver:', err);
      showToast('Erro ao carregar dados do motorista.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDriverData({ ...driverData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isCreatingAdmin) {
        // Admin Creation Logic
        if (adminData.password !== adminData.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        await adminsRepo.createAdmin(
          adminData.email,
          adminData.name,
          adminData.role as 'manager' | 'operator',
          adminData.password,
          adminData.phone
        );
        showToast('✅ Administrador criado com sucesso!', 'success');
        navigate('/settings'); // Redirect to settings/users list
      } else {
        // Driver Logic
        if (!driverData.name) {
          throw new Error('Nome é obrigatório');
        }

        if (editMode && editId) {
          // Update Logic
          await driversRepo.updateDriver(editId, {
            name: driverData.name,
            phone: driverData.phone,
            email: driverData.email,
            status: driverData.status,
            license_category: driverData.licenseCategory,
            license_expiry: driverData.licenseExpiry,
          });
          showToast('✅ Motorista atualizado com sucesso!', 'success');
        } else {
          // Create Logic
          if (!driverData.cpf || !driverData.licenseNumber) {
            throw new Error('NIF e Carta de Condução são obrigatórios');
          }

          const driverPwd = (driverData as any).password;
          const driverConfirmPwd = (driverData as any).confirmPassword;

          if (!driverPwd) {
            throw new Error('A senha é obrigatória para criar o acesso do motorista.');
          }

          if (driverPwd !== driverConfirmPwd) {
            throw new Error('As senhas não coincidem.');
          }

          await driversRepo.createDriver({
            name: driverData.name,
            cpf: driverData.cpf,
            license_number: driverData.licenseNumber,
            license_category: driverData.licenseCategory || 'C',
            license_expiry: driverData.licenseExpiry,
            phone: driverData.phone,
            email: driverData.email,
            status: driverData.status,
          }, driverPwd);
          showToast('✅ Motorista registado com sucesso!', 'success');
        }
        navigate('/drivers');
      }
    } catch (err: any) {
      console.error('Failed to save:', err);
      setError(err.message || 'Erro ao salvar. Tente novamente.');
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
        <span className="cursor-pointer hover:text-txt-primary" onClick={() => navigate(isCreatingAdmin ? '/settings' : '/drivers')}>
          {isCreatingAdmin ? 'Utilizadores' : 'Motoristas'}
        </span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-txt-primary">
          {editMode ? 'Editar Motorista' : (isCreatingAdmin ? 'Adicionar Admin' : 'Adicionar Motorista')}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-txt-primary">
          {editMode ? 'Editar Motorista' : (isCreatingAdmin ? 'Registar Novo Administrador' : 'Registar Novo Motorista')}
        </h1>

        {/* Toggle Switch - Hide in Edit Mode */}
        {!editMode && (
          <div className="bg-surface-2 p-1 rounded-lg flex items-center border border-surface-border">
            <button
              type="button"
              onClick={() => setIsCreatingAdmin(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!isCreatingAdmin ? 'bg-brand-primary text-bg-main shadow-sm' : 'text-txt-tertiary hover:text-txt-primary'}`}
            >
              Motorista
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingAdmin(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${isCreatingAdmin ? 'bg-brand-primary text-bg-main shadow-sm' : 'text-txt-tertiary hover:text-txt-primary'}`}
            >
              Administrador
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-6 space-y-8">

          {error && (
            <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm">
              {error}
            </div>
          )}

          {isCreatingAdmin ? (
            /* ADMIN FORM */
            <>
              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">admin_panel_settings</span>
                  Dados do Administrador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Nome Completo</label>
                    <input
                      name="name"
                      value={adminData.name}
                      onChange={handleAdminChange}
                      type="text"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Email Corporativo</label>
                    <input
                      name="email"
                      value={adminData.email}
                      onChange={handleAdminChange}
                      type="email"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Telemóvel</label>
                    <input
                      name="phone"
                      value={adminData.phone}
                      onChange={handleAdminChange}
                      type="tel"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Função</label>
                    <select
                      name="role"
                      value={adminData.role}
                      onChange={handleAdminChange}
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    >
                      <option value="manager">Gestor</option>
                      <option value="operator">Operador</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-border w-full"></div>

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
                      value={adminData.password}
                      onChange={handleAdminChange}
                      type="password"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Confirmar Senha</label>
                    <input
                      name="confirmPassword"
                      value={adminData.confirmPassword}
                      onChange={handleAdminChange}
                      type="password"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* DRIVER FORM */
            <>
              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">person</span>
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-txt-secondary">Nome Completo</label>
                    <input
                      name="name"
                      value={driverData.name}
                      onChange={handleDriverChange}
                      type="text"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">NIF</label>
                    <input
                      name="cpf"
                      value={driverData.cpf}
                      onChange={handleDriverChange}
                      type="text"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Status Inicial</label>
                    <select
                      name="status"
                      value={driverData.status}
                      onChange={handleDriverChange}
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    >
                      <option value={Status.Active}>Ativo</option>
                      <option value={Status.Inactive}>Inativo</option>
                      <option value={Status.Warning}>Em Análise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-border w-full"></div>

              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">badge</span>
                  Carta de Condução
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Número de Registro</label>
                    <input
                      name="licenseNumber"
                      value={driverData.licenseNumber}
                      onChange={handleDriverChange}
                      type="text"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Categoria</label>
                    <select
                      name="licenseCategory"
                      value={driverData.licenseCategory}
                      onChange={handleDriverChange}
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Validade</label>
                    <input
                      name="licenseExpiry"
                      value={driverData.licenseExpiry}
                      onChange={handleDriverChange}
                      type="date"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-border w-full"></div>

              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">contact_phone</span>
                  Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Telemóvel</label>
                    <input
                      name="phone"
                      value={driverData.phone}
                      onChange={handleDriverChange}
                      type="tel"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Email</label>
                    <input
                      name="email"
                      value={driverData.email}
                      onChange={handleDriverChange}
                      type="email"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-border w-full"></div>

              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-primary">lock</span>
                  Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Senha de Acesso</label>
                    <input
                      name="password"
                      value={(driverData as any).password || ''}
                      onChange={handleDriverChange}
                      type="password"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-txt-secondary">Confirmar Senha</label>
                    <input
                      name="confirmPassword"
                      value={(driverData as any).confirmPassword || ''}
                      onChange={handleDriverChange}
                      type="password"
                      className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(isCreatingAdmin ? '/settings' : '/drivers')}
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
              {loading ? 'A guardar...' : isCreatingAdmin ? 'Criar Administrador' : 'Guardar Motorista'}
            </button>
          </div>
        </form>
      </div>
    </div >
  );
};
