import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppSettings } from '../components/AppSettingsContext';

type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP' | 'RESET_PASSWORD';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const [currentView, setCurrentView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 1. First simplified approach: Check if email exists in admin_users table
      // This is because we might not have linked auth.users.id to admin_users.id yet
      const { data: adminByEmail, error: emailError } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('email', email)
        .single();

      if (emailError || !adminByEmail) {
         // Fallback or strict check depending on requirements.
         // If we strictly follow the prompt: "Guard: If email exists in AdminUser, allow access."
         await supabase.auth.signOut();
         throw new Error('Acesso negado. Não tem permissões de administrador.');
      }

      // Optional: Update last_login_at
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminByEmail.id);

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Sign Up logic
    setError('O registo de administradores é feito apenas por convite.');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Forgot Password logic
    setCurrentView('OTP');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for OTP logic
    setCurrentView('RESET_PASSWORD');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Reset Password logic
    setCurrentView('LOGIN');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main relative overflow-hidden font-sans text-txt-primary">
      {/* Abstract Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-semantic-info opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[480px] p-8 md:p-12 bg-surface-1 border border-surface-border rounded-3xl shadow-2xl z-10 relative animate-fade-in">

        {/* Logo Area */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-surface-2 rounded-xl flex items-center justify-center mb-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <img src="/favicon.png" alt="Voxia Logo" className="w-10 h-10 rounded-lg" />
            )}
          </div>
        </div>

        {/* Views */}
        {currentView === 'LOGIN' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Bem-vindo de volta!</h1>
            <p className="text-txt-tertiary text-center mb-8 text-sm">Por favor, insira as suas credenciais para entrar.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm text-center">{error}</div>}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Senha</label>
                  <button type="button" onClick={() => setCurrentView('FORGOT_PASSWORD')} className="text-xs text-brand-primary font-bold hover:underline">Esqueceu a senha?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-brand-primary/20 mt-2"
              >
                {loading ? 'A entrar...' : 'Entrar'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-border"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-surface-1 text-txt-tertiary">ou continue com</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-3 border border-surface-border text-txt-primary py-2.5 rounded-xl transition-colors font-medium text-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>
            </div>

            <p className="text-center mt-8 text-sm text-txt-tertiary">
              Não tem uma conta? <button onClick={() => setCurrentView('SIGNUP')} className="text-brand-primary font-bold hover:underline">Inscrever-se</button>
            </p>
          </div>
        )}

        {/* SIGN UP */}
        {currentView === 'SIGNUP' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Inscrever-se</h1>
            <p className="text-txt-tertiary text-center mb-8 text-sm">Vamos começar com o seu teste gratuito!</p>

            <form onSubmit={handleSignUp} className="space-y-5">
              {error && <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-lg text-semantic-error text-sm text-center">{error}</div>}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Nome de usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Confirme sua senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-brand-primary/20 mt-2"
              >
                Inscrever-se
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-txt-tertiary">
              Já tem uma conta? <button onClick={() => setCurrentView('LOGIN')} className="text-brand-primary font-bold hover:underline">Iniciar sessão</button>
            </p>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {currentView === 'FORGOT_PASSWORD' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Esqueceu sua senha</h1>
            <p className="text-txt-tertiary text-center mb-8 text-sm">Por favor, insira seu e-mail para receber um código de verificação.</p>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-brand-primary/20 mt-2"
              >
                Enviar
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-txt-tertiary">
              Voltar para <button onClick={() => setCurrentView('LOGIN')} className="text-txt-primary font-bold hover:underline">Iniciar sessão</button>
            </p>
          </div>
        )}

        {/* OTP */}
        {currentView === 'OTP' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Verificação OTP</h1>
            <p className="text-txt-tertiary text-center mb-8 text-sm">Enviamos um código de uso único para o seu e-mail.</p>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl text-txt-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-brand-primary/20"
              >
                Verificar OTP
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-txt-tertiary">
              Não recebeu o código OTP? <button className="text-txt-primary font-bold hover:underline">Reenviar OTP</button>
            </p>
          </div>
        )}

        {/* RESET PASSWORD */}
        {currentView === 'RESET_PASSWORD' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-2">Defina uma nova senha</h1>
            <p className="text-txt-tertiary text-center mb-8 text-sm">Sua nova senha deve ser diferente da senha anterior.</p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Confirme sua senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-transparent focus:border-brand-primary rounded-xl px-4 py-3.5 text-txt-primary placeholder-txt-tertiary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-brand-primary/20 mt-2"
              >
                Enviar
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-txt-tertiary">
              Voltar para <button onClick={() => setCurrentView('LOGIN')} className="text-txt-primary font-bold hover:underline">Iniciar sessão</button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};