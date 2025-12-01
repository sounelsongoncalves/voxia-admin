import React, { useState, useEffect } from 'react';
import { copilotService } from '../services/copilot';

export const Copilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<{ type: 'user' | 'ai', text: string, cards?: any[], tables?: any[] }[]>([
    { type: 'ai', text: 'Olá Administrador. Estou analisando os dados da sua frota. Como posso ajudar hoje?' }
  ]);

  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    setSuggestions(copilotService.getSuggestions());
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const all = await copilotService.getAllConversations();
      if (all.length > 0) {
        const latestId = all[0].id;
        setConversationId(latestId);

        const historyData = await copilotService.getConversationMessages(latestId);
        if (historyData && historyData.length > 0) {
          const formattedHistory = historyData.map((msg: any) => ({
            type: msg.role === 'admin' ? 'user' : 'ai',
            text: msg.content
          }));

          setHistory([
            { type: 'ai', text: 'Olá Administrador. Estou analisando os dados da sua frota. Como posso ajudar hoje?' },
            ...formattedHistory
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userQuery = query;
    setHistory(prev => [...prev, { type: 'user', text: userQuery }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await copilotService.query({
        question: userQuery,
        conversationId: conversationId || undefined
      });

      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      setHistory(prev => [...prev, {
        type: 'ai',
        text: response.answer,
        cards: response.cards,
        tables: response.tables,
      }]);

      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Copilot error:', error);
      setHistory(prev => [...prev, {
        type: 'ai',
        text: 'Desculpe, ocorreu um erro ao processar sua consulta. Por favor, tente novamente.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-surface-3 text-txt-primary rotate-45' : 'bg-brand-primary text-bg-main hover:bg-brand-hover hover:scale-110'
          }`}
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'add' : 'smart_toy'}</span>
      </button>

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-surface-1 border-l border-surface-border shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-border bg-surface-3">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-brand-primary mr-2">smart_toy</span>
            <h2 className="font-bold text-txt-primary">IA Voxia</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-txt-tertiary hover:text-txt-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-main">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                  ? 'bg-brand-primary text-bg-main rounded-tr-sm'
                  : 'bg-surface-2 text-txt-secondary rounded-tl-sm border border-surface-border'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-surface-border bg-surface-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre sua frota..."
              className="w-full bg-surface-1 text-txt-primary text-sm rounded-xl pl-4 pr-10 py-3 border border-surface-border focus:border-brand-primary focus:outline-none placeholder-txt-tertiary"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-brand-primary hover:bg-surface-2 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {suggestions.slice(0, 3).map((suggestion, idx) => (
              <span
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[10px] text-txt-tertiary whitespace-nowrap px-2 py-1 rounded bg-surface-1 border border-surface-border hover:border-brand-primary hover:text-brand-primary cursor-pointer transition-colors"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};