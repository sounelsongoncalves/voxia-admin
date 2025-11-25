
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminOnboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
      <div className="max-w-2xl w-full bg-surface-1 border border-surface-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-surface-2 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-brand-primary">rocket_launch</span>
          </div>
          <h1 className="text-3xl font-bold text-txt-primary">Bem-vindo à Voxia!</h1>
          <p className="text-txt-tertiary mt-2">Vamos configurar seu ambiente administrativo em poucos passos.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-surface-2 rounded-xl border border-brand-primary/30">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-bg-main flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="text-txt-primary font-bold">Configurar Perfil da Empresa</h3>
              <p className="text-sm text-txt-tertiary mt-1">Defina nome, logo e configurações regionais.</p>
            </div>
            <span className="material-symbols-outlined text-brand-primary ml-auto">check_circle</span>
          </div>

          <div className="flex items-start gap-4 p-4 bg-surface-1 rounded-xl border border-surface-border hover:border-brand-primary cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-surface-3 text-txt-primary flex items-center justify-center font-bold shrink-0 border border-surface-border">2</div>
            <div>
              <h3 className="text-txt-primary font-bold">Importar Dados da Frota</h3>
              <p className="text-sm text-txt-tertiary mt-1">Adicione veículos e motoristas ou importe via CSV.</p>
            </div>
            <span className="material-symbols-outlined text-txt-tertiary ml-auto">arrow_forward</span>
          </div>

          <div className="flex items-start gap-4 p-4 bg-surface-1 rounded-xl border border-surface-border opacity-50">
            <div className="w-8 h-8 rounded-full bg-surface-3 text-txt-primary flex items-center justify-center font-bold shrink-0 border border-surface-border">3</div>
            <div>
              <h3 className="text-txt-primary font-bold">Convidar Equipe</h3>
              <p className="text-sm text-txt-tertiary mt-1">Adicione despachantes e gerentes.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="text-txt-tertiary hover:text-txt-primary text-sm font-medium underline mr-6"
          >
            Pular Configuração
          </button>
          <button
            onClick={() => navigate('/vehicles/create')}
            className="px-6 py-3 bg-brand-primary text-bg-main font-bold rounded-xl hover:bg-brand-hover transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
