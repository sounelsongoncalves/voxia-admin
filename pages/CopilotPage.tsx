import React, { useState, useEffect, useRef } from 'react';
import { copilotService } from '../services/copilot';
import { aiSettingsRepo, AISettings } from '../repositories/aiSettingsRepo';

import { settingsRepo } from '../repositories/settingsRepo';

export const CopilotPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Settings State
    const [settings, setSettings] = useState<AISettings>({ provider: 'openai', model: 'gpt-4o', hasKey: false });
    const [apiKey, setApiKey] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const init = async () => {
            await loadHistory();
            await loadSettings();
            await checkAutoAnalysis();
        };
        init();
    }, []);

    const checkAutoAnalysis = async () => {
        try {
            const prefs = await settingsRepo.getPreferences();
            if (prefs?.copilot_auto_analysis) {
                // Trigger auto-analysis
                setLoading(true);
                const autoMsg = { role: 'admin', content: '🔄 Análise Automática Iniciada...', created_at: new Date().toISOString() };
                setMessages(prev => [...prev, autoMsg]);

                try {
                    const response = await copilotService.query({ question: 'Faça uma análise breve dos KPIs atuais da frota e sugira ações.' });
                    const aiMsg = { role: 'ai', content: response.answer, created_at: new Date().toISOString() };
                    setMessages(prev => [...prev, aiMsg]);
                } catch (err) {
                    console.error('Auto-analysis failed', err);
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Failed to check preferences', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        const history = await copilotService.getHistory();
        setMessages(history);
    };

    const loadSettings = async () => {
        const s = await aiSettingsRepo.getSettings();
        if (s) setSettings(s);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'admin', content: input, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await copilotService.query({ question: userMsg.content });
            const aiMsg = { role: 'ai', content: response.answer, created_at: new Date().toISOString() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg = { role: 'ai', content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique suas configurações de IA.', created_at: new Date().toISOString() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await aiSettingsRepo.saveSettings(settings.provider, settings.model, apiKey);
            setSettings(prev => ({ ...prev, hasKey: !!apiKey }));
            setApiKey(''); // Clear input
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar configurações.');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-txt-primary">Centro de Inteligência Artificial</h1>
                <div className="flex bg-surface-2 rounded-lg p-1 border border-surface-border">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-brand-primary text-bg-main shadow-sm' : 'text-txt-tertiary hover:text-txt-primary'}`}
                    >
                        Conversa
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-brand-primary text-bg-main shadow-sm' : 'text-txt-tertiary hover:text-txt-primary'}`}
                    >
                        Configurações
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-surface-1 border border-surface-border rounded-xl overflow-hidden flex flex-col">
                {activeTab === 'chat' ? (
                    <div className="flex flex-col h-full">
                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 && (
                                <div className="text-center text-txt-tertiary mt-20">
                                    <span className="material-symbols-outlined text-6xl mb-4">smart_toy</span>
                                    <p>Olá! Sou o Copiloto Voxia. Como posso ajudar com sua frota hoje?</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'admin'
                                        ? 'bg-brand-primary text-bg-main rounded-tr-none'
                                        : 'bg-surface-2 text-txt-primary border border-surface-border rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-surface-2 text-txt-primary border border-surface-border rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-surface-border bg-surface-1">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Digite sua mensagem para o Copiloto..."
                                    className="w-full bg-surface-2 border border-surface-border rounded-xl pl-4 pr-12 py-3 text-txt-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none placeholder-txt-tertiary"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-2xl mx-auto w-full">
                        <h2 className="text-xl font-bold text-txt-primary mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">settings_suggest</span>
                            Configurações do Modelo
                        </h2>

                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Provedor de IA</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, provider: 'openai', model: 'gpt-4o' })}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.provider === 'openai'
                                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                            : 'bg-surface-2 border-surface-border text-txt-tertiary hover:border-txt-tertiary'
                                            }`}
                                    >
                                        <span className="font-bold">OpenAI</span>
                                        <span className="text-xs">GPT-4o, GPT-4 Turbo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, provider: 'google', model: 'gemini-1.5-pro' })}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.provider === 'google'
                                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                            : 'bg-surface-2 border-surface-border text-txt-tertiary hover:border-txt-tertiary'
                                            }`}
                                    >
                                        <span className="font-bold">Google</span>
                                        <span className="text-xs">Gemini 1.5 Pro, Flash</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">Modelo</label>
                                <select
                                    value={settings.model}
                                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-txt-primary focus:border-brand-primary outline-none"
                                >
                                    {settings.provider === 'openai' ? (
                                        <>
                                            <option value="gpt-4o">GPT-4o (Recomendado)</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recomendado)</option>
                                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-txt-secondary">
                                    API Key {settings.hasKey && <span className="text-semantic-success text-xs ml-2">(Chave salva)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={settings.hasKey ? "••••••••••••••••" : "sk-..."}
                                    className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-txt-primary focus:border-brand-primary outline-none placeholder-txt-tertiary"
                                />
                                <p className="text-xs text-txt-tertiary">
                                    Sua chave é criptografada e armazenada com segurança. O frontend nunca tem acesso à chave real.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="w-full py-3 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
