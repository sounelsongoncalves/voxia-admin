import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { settingsRepo, SystemPreferences } from '../repositories/settingsRepo';
import { adminsRepo } from '../repositories/adminsRepo';
import { appSettingsRepo, AppSettings } from '../repositories/appSettingsRepo';
import { Admin } from '../types';
import { useToast } from '../components/ToastContext';
import { useUser } from '../components/UserContext';
import { useAppSettings } from '../components/AppSettingsContext';

interface SettingsProps {
  initialTab?: 'general' | 'profile' | 'security' | 'users';
}

export const Settings: React.FC<SettingsProps> = ({ initialTab = 'profile' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user: currentUser, loading: userLoading, refreshUser } = useUser();
  const { settings: appSettings, refreshSettings } = useAppSettings();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // General Settings Form State
  const [generalForm, setGeneralForm] = useState({
    orgName: '',
    primaryColor: '#000000',
    supportEmail: '',
    supportPhone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    userName: '',
    email: '',
    phone: '',
    country: 'Portugal',
    address: '',
    city: '',
    postalCode: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // User Management State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'operator' as 'owner' | 'manager' | 'operator',
  });

  const handleEditClick = (admin: Admin) => {
    setSelectedUser(admin);
    setEditForm({
      name: admin.name,
      phone: admin.phone || '',
      role: admin.role,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedUser(admin);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      // Update Profile (Name, Phone)
      await adminsRepo.updateProfile(selectedUser.id, {
        name: editForm.name,
        phone: editForm.phone,
      });

      // Update Role if changed
      if (selectedUser.role !== editForm.role) {
        await adminsRepo.updateAdminRole(selectedUser.id, editForm.role);
      }

      showToast(t('settings.users.updateSuccess'), 'success');
      setShowEditModal(false);
      fetchAdmins(); // Refresh list
    } catch (error: any) {
      console.error('Error updating user:', error);
      showToast(t('settings.users.updateError') + (error.message || ''), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminsRepo.deleteAdmin(selectedUser.id);
      showToast(t('settings.users.deleteSuccess'), 'success');
      setShowDeleteModal(false);
      fetchAdmins(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(t('settings.users.deleteError') + (error.message || ''), 'error');
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        firstName: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        userName: currentUser.email.split('@')[0],
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (appSettings) {
      setGeneralForm({
        orgName: appSettings.org_name || '',
        primaryColor: appSettings.primary_color || '#000000',
        supportEmail: appSettings.support_email || '',
        supportPhone: appSettings.support_phone || '',
      });
    }
  }, [appSettings]);

  const fetchAdmins = async () => {
    try {
      const adminsData = await adminsRepo.getAdmins();
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleGeneralUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = appSettings?.logo_url;
      if (logoFile) {
        logoUrl = await appSettingsRepo.uploadLogo(logoFile);
      }

      await appSettingsRepo.updateSettings({
        org_name: generalForm.orgName,
        primary_color: generalForm.primaryColor,
        support_email: generalForm.supportEmail,
        support_phone: generalForm.supportPhone,
        logo_url: logoUrl,
      });

      await refreshSettings();
      showToast(t('settings.general.success'), 'success');
    } catch (error: any) {
      showToast(t('settings.general.error') + error.message, 'error');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      let avatarUrl = currentUser.avatar_url;
      if (avatarFile) {
        avatarUrl = await adminsRepo.uploadAvatar(avatarFile, currentUser.id);
      }

      await adminsRepo.updateProfile(currentUser.id, {
        name: profileForm.firstName,
        phone: profileForm.phone,
        avatar_url: avatarUrl
      });

      await refreshUser(); // Update global user context
      showToast(t('settings.profile.success'), 'success');
    } catch (error: any) {
      showToast(t('settings.profile.error') + error.message, 'error');
    }
  };

  const handlePasswordUpdate = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast(t('settings.security.passwordMismatch'), 'error');
      return;
    }
    try {
      await adminsRepo.updatePassword(securityForm.newPassword);
      showToast(t('settings.security.success'), 'success');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(t('settings.security.error') + error.message, 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const menuItems = [
    { id: 'general', label: t('settings.tabs.general'), icon: 'settings' },
    { id: 'profile', label: t('settings.tabs.profile'), icon: 'person' },
    { id: 'security', label: t('settings.tabs.security'), icon: 'lock' },
    { id: 'users', label: t('settings.tabs.users'), icon: 'group' },
  ];

  if (userLoading || loadingAdmins) return <div className="p-8 text-center">{t('settings.loading')}</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-txt-primary">{t('settings.title')}</h1>

      <div className="flex flex-col md:flex-row bg-surface-1 rounded-2xl overflow-hidden border border-surface-border min-h-[600px] shadow-sm">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 p-4 md:p-6 bg-surface-1">
          <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-2 md:gap-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                  ? 'bg-surface-2 text-txt-primary shadow-sm'
                  : 'text-txt-tertiary hover:text-txt-primary hover:bg-surface-2/50'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'text-brand-primary' : ''}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 bg-surface-1">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold mb-8 text-txt-primary">{t('settings.general.title')}</h2>

              {/* Logo Section */}
              <div className="flex items-center gap-6 mb-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden ring-4 ring-surface-2 bg-surface-2 flex items-center justify-center">
                    {logoFile ? (
                      <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : appSettings?.logo_url ? (
                      <img src={appSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-txt-tertiary">business</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20"
                  >
                    {t('settings.general.changeLogo')}
                  </button>
                  <button
                    onClick={() => setLogoFile(null)}
                    className="px-4 py-2 bg-surface-2 text-txt-primary text-sm font-medium rounded-lg hover:bg-surface-3 transition-colors"
                  >
                    {t('settings.general.remove')}
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                </div>
              </div>

              {/* Form */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.general.orgName')}</label>
                    <input
                      type="text"
                      value={generalForm.orgName}
                      onChange={(e) => setGeneralForm({ ...generalForm, orgName: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.general.primaryColor')}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={generalForm.primaryColor}
                        onChange={(e) => setGeneralForm({ ...generalForm, primaryColor: e.target.value })}
                        className="h-12 w-12 rounded-lg border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={generalForm.primaryColor}
                        onChange={(e) => setGeneralForm({ ...generalForm, primaryColor: e.target.value })}
                        className="flex-1 bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.general.supportEmail')}</label>
                    <input
                      type="email"
                      value={generalForm.supportEmail}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.general.supportPhone')}</label>
                    <input
                      type="text"
                      value={generalForm.supportPhone}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleGeneralUpdate}
                    className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20"
                  >
                    {t('settings.general.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold mb-8 text-txt-primary">{t('settings.profile.title')}</h2>

              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-surface-2">
                    <img
                      src={avatarFile ? URL.createObjectURL(avatarFile) : currentUser?.avatar_url || 'https://i.pravatar.cc/150?u=admin'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20"
                  >
                    {t('settings.profile.uploadImage')}
                  </button>
                  <button
                    onClick={() => setAvatarFile(null)}
                    className="px-4 py-2 bg-surface-2 text-txt-primary text-sm font-medium rounded-lg hover:bg-surface-3 transition-colors"
                  >
                    {t('settings.general.remove')}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              {/* Form */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.firstName')}</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.username')}</label>
                    <input
                      type="text"
                      value={profileForm.userName}
                      onChange={(e) => setProfileForm({ ...profileForm, userName: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.email')}</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    readOnly
                    className="w-full bg-surface-2/50 border-none rounded-lg px-4 py-3 text-txt-tertiary cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.phone')}</label>
                  <div className="flex gap-2">
                    <div className="bg-surface-2 rounded-lg px-4 py-3 flex items-center gap-2 min-w-[100px]">
                      <span className="text-lg">🇵🇹</span>
                      <span className="text-sm text-txt-secondary">+351</span>
                    </div>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="flex-1 bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-border/50">
                  <h3 className="text-lg font-bold mb-6 text-txt-primary">{t('settings.profile.addressTitle')}</h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.country')}</label>
                      <div className="relative">
                        <select
                          value={profileForm.country}
                          onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary appearance-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                        >
                          <option value="Portugal">Portugal</option>
                          <option value="Spain">Espanha</option>
                          <option value="United States">Estados Unidos</option>
                          <option value="Brazil">Brasil</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-txt-tertiary pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.address')}</label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.city')}</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.profile.postalCode')}</label>
                        <input
                          type="text"
                          value={profileForm.postalCode}
                          onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                          className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20"
                  >
                    {t('settings.profile.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-4xl animate-fade-in space-y-10">
              <div>
                <h2 className="text-xl font-bold mb-2 text-txt-primary">{t('settings.security.title')}</h2>
                <p className="text-sm text-txt-tertiary mb-8">{t('settings.security.subtitle')}</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.security.currentPassword')}</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.security.newPassword')}</label>
                      <input
                        type="password"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-txt-tertiary uppercase tracking-wide">{t('settings.security.confirmPassword')}</label>
                      <input
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary placeholder-txt-tertiary focus:ring-2 focus:ring-brand-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordUpdate}
                      className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20"
                    >
                      {t('settings.security.updatePassword')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-surface-border/50">
                <h3 className="text-lg font-bold mb-6 text-txt-primary">{t('settings.security.twoFactorTitle')}</h3>
                <div className="space-y-4">
                  {/* 2FA Items */}
                  {[
                    { title: 'Google Authenticator', desc: t('settings.security.twoFactor.google'), icon: 'lock', active: true },
                    { title: 'Okta Verify', desc: t('settings.security.twoFactor.okta'), icon: 'verified_user', active: false },
                    { title: 'Email', desc: t('settings.security.twoFactor.email'), icon: 'mail', active: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-transparent hover:border-surface-border transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.active ? 'bg-brand-primary/10 text-brand-primary' : 'bg-surface-3 text-txt-tertiary'}`}>
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-txt-primary text-sm">{item.title}</p>
                          <p className="text-xs text-txt-tertiary">{item.desc}</p>
                        </div>
                      </div>
                      <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.active
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        : 'bg-surface-3 text-txt-primary hover:bg-surface-border'
                        }`}>
                        {item.active ? t('settings.security.active') : t('settings.security.activate')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="max-w-4xl animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-txt-primary">{t('settings.users.title')}</h2>
                <button onClick={() => navigate('/settings/users/create')} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-hover transition-colors">
                  {t('settings.users.addNew')}
                </button>
              </div>
              <div className="grid gap-4">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-transparent hover:border-surface-border transition-all group">
                    <div className="flex items-center gap-4">
                      <img src={admin.avatar_url || 'https://i.pravatar.cc/150'} className="w-10 h-10 rounded-full object-cover" alt={admin.name} />
                      <div>
                        <p className="font-bold text-sm text-txt-primary">{admin.name}</p>
                        <p className="text-xs text-txt-tertiary">{admin.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${admin.role === 'owner' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-surface-3 text-txt-secondary'
                        }`}>
                        {admin.role}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2 text-txt-tertiary hover:text-brand-primary hover:bg-surface-3 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(admin)}
                          className="p-2 text-txt-tertiary hover:text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-1 rounded-2xl shadow-2xl w-full max-w-md border border-surface-border animate-scale-in">
            <div className="p-6 border-b border-surface-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-txt-primary">{t('settings.users.editTitle')}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-txt-tertiary hover:text-txt-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-txt-tertiary uppercase">{t('settings.profile.firstName')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-txt-tertiary uppercase">{t('settings.profile.phone')}</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-txt-tertiary uppercase">{t('settings.users.role')}</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full bg-surface-2 border-none rounded-lg px-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                >
                  <option value="operator">Operator</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-surface-border flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg text-txt-primary hover:bg-surface-2 transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-1 rounded-2xl shadow-2xl w-full max-w-md border border-surface-border animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-semantic-error/10 text-semantic-error flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-txt-primary mb-2">{t('settings.users.deleteTitle')}</h3>
              <p className="text-txt-secondary mb-6">
                {t('settings.users.deleteConfirmation', { name: selectedUser.name })}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-surface-border text-txt-primary hover:bg-surface-2 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-lg bg-semantic-error text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-semantic-error/20"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
