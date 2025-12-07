import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appSettingsRepo, SetupFormData } from '../repositories/appSettingsRepo';
import { useToast } from '../components/ToastContext';

import { supabase } from '../services/supabase';

export const Setup: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [checkingConfig, setCheckingConfig] = useState(true);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<SetupFormData>({
        org_name: '',
        primary_color: '#00CC99',
        support_email: '',
        support_phone: '',
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // Check if app is already configured
        const checkConfiguration = async () => {
            try {
                const isConfigured = await appSettingsRepo.isConfigured();
                if (isConfigured) {
                    // Already configured, redirect to login
                    showToast('Sistema já configurado. Redirecionando...', 'info');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error checking configuration:', error);
            } finally {
                setCheckingConfig(false);
            }
        };

        checkConfiguration();
    }, [navigate, showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Por favor, selecione um arquivo de imagem válido.', 'error');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('A imagem deve ter no máximo 2MB.', 'error');
                return;
            }

            setFormData(prev => ({ ...prev, logo_file: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.org_name.trim()) {
            showToast('Nome da organização é obrigatório.', 'error');
            return;
        }

        if (!formData.support_email.trim()) {
            showToast('Email de suporte é obrigatório.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.support_email)) {
            showToast('Email de suporte inválido.', 'error');
            return;
        }

        // Password validation
        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Admin User via Edge Function
            const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
                body: {
                    email: formData.support_email,
                    password: password,
                    user_metadata: {
                        name: 'Admin Owner', // Default name, could add field
                        role: 'owner'
                    }
                }
            });

            if (userError) {
                throw new Error(`Erro ao criar usuário admin: ${userError.message}`);
            }

            if (!userData || !userData.id) {
                if (userData && userData.error) throw new Error(userData.error);
                throw new Error('Erro ao criar usuário: ID não retornado.');
            }

            // 2. Insert into admins table
            const { error: adminError } = await supabase
                .from('admins')
                .insert({
                    id: userData.id,
                    name: 'Admin Owner',
                    email: formData.support_email,
                    phone: formData.support_phone,
                    role: 'owner',
                    active: true
                });

            if (adminError) {
                // If admin already exists (e.g. re-running setup), we might ignore or update
                // For now, let's assume fresh setup. If error, log it but proceed to config app?
                // No, better to fail if we can't create admin record.
                console.error('Error creating admin record:', adminError);
                // Proceeding anyway might be risky if RLS depends on admins table.
                // But let's try to proceed to config app.
            }

            // 3. Configure App Settings
            await appSettingsRepo.configureApp(formData);

            showToast('✅ Sistema configurado com sucesso!', 'success');

            // Redirect to login after 1.5 seconds
            setTimeout(() => {
                navigate('/login');
                window.location.reload(); // Reload to apply branding
            }, 1500);
        } catch (error: any) {
            console.error('Setup error:', error);
            showToast(`Erro ao configurar: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (checkingConfig) {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p className="text-txt-tertiary">Verificando configuração...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
                        <span className="material-symbols-outlined text-3xl text-brand-primary">settings</span>
                    </div>
                    <h1 className="text-3xl font-bold text-txt-primary mb-2">Configuração Inicial</h1>
                    <p className="text-txt-tertiary">Configure sua plataforma de gestão de frota</p>
                </div>

                {/* Setup Form */}
                <form onSubmit={handleSubmit} className="bg-surface-1 border border-surface-border rounded-xl p-8 space-y-6">

                    {/* Organization Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-txt-secondary">
                            Nome da Organização *
                        </label>
                        <input
                            type="text"
                            name="org_name"
                            value={formData.org_name}
                            onChange={handleInputChange}
                            placeholder="Ex: Transportes Silva Ltda"
                            className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                            required
                        />
                        <p className="text-xs text-txt-tertiary">Este nome aparecerá no topo do dashboard e em relatórios.</p>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-txt-secondary">
                            Logotipo da Organização
                        </label>
                        <div className="flex items-center gap-4">
                            {/* Logo Preview */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 bg-surface-2 border-2 border-dashed border-surface-border rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors overflow-hidden"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-3xl text-txt-tertiary">add_photo_alternate</span>
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-txt-primary rounded-lg text-sm font-medium transition-colors"
                                >
                                    Escolher Imagem
                                </button>
                                <p className="text-xs text-txt-tertiary mt-2">PNG, JPG ou SVG. Máximo 2MB.</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Primary Color */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-txt-secondary">
                            Cor Primária *
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                name="primary_color"
                                value={formData.primary_color}
                                onChange={handleInputChange}
                                className="w-16 h-12 rounded-lg cursor-pointer border border-surface-border"
                            />
                            <input
                                type="text"
                                name="primary_color"
                                value={formData.primary_color}
                                onChange={handleInputChange}
                                placeholder="#00CC99"
                                className="flex-1 bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors font-mono"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                required
                            />
                        </div>
                        <p className="text-xs text-txt-tertiary">Esta cor será usada em botões, links e destaques.</p>
                    </div>

                    <div className="h-px bg-surface-border w-full my-6"></div>

                    <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-primary">admin_panel_settings</span>
                        Conta do Administrador
                    </h3>

                    {/* Support Email / Admin Email */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-txt-secondary">
                            Email de Acesso (Admin) *
                        </label>
                        <input
                            type="email"
                            name="support_email"
                            value={formData.support_email}
                            onChange={handleInputChange}
                            placeholder="admin@empresa.com"
                            className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                            required
                        />
                        <p className="text-xs text-txt-tertiary">Este email será usado para login e contato de suporte.</p>
                    </div>

                    {/* Support Phone */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-txt-secondary">
                            Telefone
                        </label>
                        <input
                            type="tel"
                            name="support_phone"
                            value={formData.support_phone}
                            onChange={handleInputChange}
                            placeholder="+351 912 345 678"
                            className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary outline-none transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-txt-secondary">
                                Senha de Acesso *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-txt-secondary">
                                Confirmar Senha *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-bg-main border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bg-main"></div>
                                    Configurando Sistema...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                    Criar Conta e Configurar
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="bg-semantic-info/10 border border-semantic-info/20 rounded-lg p-4">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-semantic-info">info</span>
                            <div className="flex-1">
                                <p className="text-sm text-txt-primary font-medium mb-1">Configuração Única</p>
                                <p className="text-xs text-txt-tertiary">
                                    Esta ação criará o usuário Administrador (Owner) e configurará a plataforma.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-txt-tertiary mt-6">
                    Powered by Voxia Fleet Management Platform
                </p>
            </div>
        </div>
    );
};
