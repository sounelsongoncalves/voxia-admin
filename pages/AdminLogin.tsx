import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify user is in admins table
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, role')
        .eq('id', authData.user.id)
        .single();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Não tem permissões de administrador.');
      }

      // Success - navigate to home
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main relative overflow-hidden">
      {/* Abstract Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-semantic-info opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-surface-1 border border-surface-border rounded-2xl shadow-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-surface-2 mb-4">
            <span className="material-symbols-outlined text-4xl text-brand-primary">local_shipping</span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">Voxia Admin</h1>
          <p className="text-txt-tertiary text-sm mt-2">Insira as suas credenciais para acessar a frota.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error/20 text-semantic-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-txt-tertiary uppercase mb-2">Endereço de Email</label>
            <input
              type="email"
              placeholder="admin@voxia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-surface-1 border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors placeholder-txt-tertiary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-txt-tertiary uppercase mb-2">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-surface-1 border border-surface-border rounded-lg px-4 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors placeholder-txt-tertiary disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-bg-main font-bold py-3 px-4 rounded-lg transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-txt-tertiary hover:text-brand-primary transition-colors">Esqueceu-se da senha?</a>
        </div>
      </div>
    </div>
  );
};