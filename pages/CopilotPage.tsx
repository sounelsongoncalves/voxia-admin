import React, { useState, useEffect, useRef } from 'react';
import { copilotService } from '../services/copilot';
import { aiSettingsRepo, AISettings } from '../repositories/aiSettingsRepo';

import { settingsRepo } from '../repositories/settingsRepo';

export const CopilotPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');

    // Chat State
    const [conversations, setConversations] = useState<any[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Settings State
    const [settings, setSettings] = useState<AISettings>({ provider: 'openai', model: 'gpt-4o', hasKey: false });
    const [apiKey, setApiKey] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const init = async () => {
            await loadSettings();
            await loadConversations();
        };
        init();
    }, []);

    const loadConversations = async () => {
        const all = await copilotService.getAllConversations();
        setConversations(all);
    };

    const selectConversation = async (id: string) => {
        setCurrentConversationId(id);
        setLoading(true);
        try {
            const msgs = await copilotService.getConversationMessages(id);
            setMessages(msgs);
        } catch (error) {
            console.error('Failed to load conversation', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAutoAnalysis = async () => {
        try {
            const prefs = await settingsRepo.getPreferences();
            if (prefs?.copilot_auto_analysis) {
                // Trigger auto-analysis
                setLoading(true);
                const autoMsg = { role: 'admin', content: '🔄 Análise Automática Iniciada...', created_at: new Date().toISOString() };
                setMessages(prev => [...prev, autoMsg]);

                try {
                    // Start a new conversation for auto-analysis? Or use current?
                    // For now, let's assume it starts a new one if none active
                    const response = await copilotService.query({
                        question: 'Faça uma análise breve dos KPIs atuais da frota e sugira ações.',
                        conversationId: currentConversationId || undefined
                    });

                    if (!currentConversationId && response.conversationId) {
                        setCurrentConversationId(response.conversationId);
                        loadConversations();
                    }

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

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja apagar esta conversa?')) return;

        try {
            await copilotService.deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (currentConversationId === id) {
                handleNewChat();
            }
        } catch (error) {
            console.error('Failed to delete conversation', error);
            alert('Erro ao apagar conversa.');
        }
    };

    const loadSettings = async () => {
        const s = await aiSettingsRepo.getSettings();
        if (s) setSettings(s);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        const content = input;
        const file = selectedFile;

        // Optimistic UI update
        const userMsg = {
            role: 'admin',
            content: content + (file ? `\n[Arquivo anexado: ${file.name}]` : ''),
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);

        setInput('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setLoading(true);

        try {
            let attachment = undefined;
            if (file) {
                // Convert to base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => {
                        const result = reader.result as string;
                        // Remove data URL prefix (e.g., "data:image/png;base64,")
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                const base64Content = await base64Promise;

                attachment = {
                    name: file.name,
                    type: file.type,
                    content: base64Content
                };
            }

            const response = await copilotService.query({
                question: content,
                conversationId: currentConversationId || undefined,
                attachment
            });

            if (!currentConversationId && response.conversationId) {
                setCurrentConversationId(response.conversationId);
                loadConversations();
            }

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

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
        setCurrentConversationId(null);
    };

    const suggestionCards = [
        { icon: 'analytics', text: 'Analisar desempenho da frota hoje', action: 'Faça uma análise do desempenho da frota hoje.' },
        { icon: 'warning', text: 'Identificar motoristas com comportamento de risco', action: 'Quais motoristas tiveram alertas de segurança recentes?' },
        { icon: 'local_gas_station', text: 'Relatório de consumo de combustível', action: 'Gere um relatório de consumo de combustível dos veículos.' },
        { icon: 'route', text: 'Otimizar rotas de entrega pendentes', action: 'Como posso otimizar as rotas pendentes?' },
    ];

    const handleCardClick = (action: string) => {
        setInput(action);
        // Optionally auto-submit:
        // handleSendMessage({ preventDefault: () => {} } as React.FormEvent);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-9rem)] gap-6 overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-bg-main relative rounded-2xl overflow-hidden">

                {/* Header / Top Bar (Optional, can be hidden if cleaner) */}
                {/* <div className="p-4 border-b border-surface-border flex justify-between items-center">
                    <h1 className="text-lg font-bold text-txt-primary">Voxia Copilot</h1>
                </div> */}

                {activeTab === 'settings' ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setActiveTab('chat')} className="p-2 hover:bg-surface-2 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-txt-secondary">arrow_back</span>
                                </button>
                                <h2 className="text-2xl font-bold text-txt-primary">Configurações</h2>
                            </div>

                            <form onSubmit={handleSaveSettings} className="space-y-6 bg-surface-1 p-6 rounded-2xl border border-surface-border">
                                {/* Settings Form Content (Reused) */}
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
                                            <span className="text-xs">GPT-4o</span>
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
                                            <span className="text-xs">Gemini Pro</span>
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
                                    <label className="text-sm font-medium text-txt-secondary">API Key</label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder={settings.hasKey ? "••••••••••••••••" : "sk-..."}
                                        className="w-full bg-bg-main border border-surface-border rounded-lg py-2.5 px-4 text-txt-primary focus:border-brand-primary outline-none placeholder-txt-tertiary"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="w-full py-3 rounded-lg bg-brand-primary text-bg-main font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto w-full animate-fade-in">
                                    <div className="mb-8 text-center">
                                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">Olá, Administrador</span>
                                        </h1>
                                        <p className="text-xl md:text-2xl text-txt-secondary font-light">Como posso ajudar sua frota hoje?</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        {suggestionCards.map((card, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleCardClick(card.action)}
                                                className="p-6 rounded-2xl bg-surface-1 border border-surface-border hover:bg-surface-2 hover:border-brand-primary/50 transition-all text-left group flex flex-col gap-3"
                                            >
                                                <span className="material-symbols-outlined text-brand-primary bg-brand-primary/10 p-2 rounded-lg w-fit group-hover:scale-110 transition-transform">{card.icon}</span>
                                                <span className="text-txt-primary font-medium">{card.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-4xl mx-auto w-full pb-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-4 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role !== 'admin' && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${msg.role === 'admin'
                                                ? 'bg-surface-2 text-txt-primary rounded-tr-sm' // Darker bubble for user, similar to print but dark mode
                                                : 'bg-surface-1 text-txt-primary border border-surface-border rounded-tl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex gap-4 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                                            </div>
                                            <div className="bg-surface-1 border border-surface-border rounded-2xl rounded-tl-sm px-6 py-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-2 h-2 bg-txt-tertiary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-bg-main/95 backdrop-blur-sm sticky bottom-0 z-10">
                            <div className="max-w-4xl mx-auto relative">
                                {selectedFile && (
                                    <div className="absolute -top-12 left-0 bg-surface-1 border border-surface-border rounded-lg p-2 flex items-center gap-2 shadow-lg animate-fade-in">
                                        <span className="material-symbols-outlined text-brand-primary">description</span>
                                        <span className="text-sm text-txt-primary max-w-[200px] truncate">{selectedFile.name}</span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-1 hover:bg-surface-2 rounded-full text-txt-tertiary hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="relative bg-surface-1 border border-surface-border rounded-2xl shadow-lg flex items-end p-2 transition-colors focus-within:border-brand-primary/50">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.txt,.csv,.json,.png,.jpg,.jpeg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-txt-tertiary hover:text-brand-primary transition-colors rounded-xl hover:bg-surface-2"
                                        title="Anexar arquivo"
                                    >
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </button>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e as any);
                                            }
                                        }}
                                        placeholder="Digite sua mensagem para o Copiloto..."
                                        className="flex-1 bg-transparent border-none outline-none text-txt-primary py-3 px-2 max-h-32 resize-none placeholder-txt-tertiary scrollbar-hide"
                                        rows={1}
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || (!input.trim() && !selectedFile)}
                                        className="p-3 bg-brand-primary text-bg-main rounded-xl hover:bg-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">arrow_upward</span>
                                    </button>
                                </form>
                                <p className="text-center text-xs text-txt-tertiary mt-2">
                                    O Copiloto pode cometer erros. Verifique informações importantes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar (History) */}
            <div className="w-80 hidden lg:flex flex-col bg-surface-1 rounded-2xl border border-surface-border overflow-hidden">
                <div className="p-4 border-b border-surface-border">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Pesquisar conversa"
                            className="w-full bg-surface-2 border border-surface-border rounded-lg py-2.5 pl-9 pr-4 text-sm text-txt-primary outline-none focus:border-brand-primary transition-colors placeholder-txt-tertiary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-txt-tertiary uppercase tracking-wider mb-3 px-2">Histórico</h3>
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <div key={conv.id} className="group relative">
                                    <button
                                        onClick={() => selectConversation(conv.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate pr-8 ${currentConversationId === conv.id
                                            ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                            : 'text-txt-secondary hover:bg-surface-2 hover:text-txt-primary'
                                            }`}
                                    >
                                        Conversa {formatDate(conv.created_at)}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Apagar conversa"
                                    >
                                        <span className="material-symbols-outlined text-xs">delete</span>
                                    </button>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <p className="text-xs text-txt-tertiary px-2">Nenhuma conversa salva.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-surface-border space-y-2">
                    <button
                        onClick={handleNewChat}
                        className="w-full py-3 bg-brand-primary text-bg-main font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nova Conversa
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className="w-full py-3 bg-surface-2 text-txt-primary font-medium rounded-xl hover:bg-surface-3 transition-colors flex items-center justify-center gap-2 border border-surface-border"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
