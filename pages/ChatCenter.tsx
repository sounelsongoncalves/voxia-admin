
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatRepo } from '../repositories/chatRepo';
import { ChatMessage } from '../types';

export const ChatCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlThreadId = searchParams.get('threadId');

  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (urlThreadId) {
      setActiveThreadId(urlThreadId);
    }
  }, [urlThreadId]);

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
      const subscription = chatRepo.subscribeToMessages(activeThreadId, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await chatRepo.getThreads();
      setThreads(data);

      // Only set default if no URL param and no active thread
      if (data.length > 0 && !activeThreadId && !urlThreadId) {
        setActiveThreadId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const data = await chatRepo.getMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeThreadId) return;

    try {
      await chatRepo.sendMessage(activeThreadId, messageInput);
      setMessageInput('');
      // Optimistic update or wait for subscription
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <div className="h-[calc(100vh-2rem)] flex bg-surface-1 border border-surface-border rounded-xl overflow-hidden">

      {/* Sidebar List */}
      <div className="w-80 border-r border-surface-border flex flex-col bg-bg-sec">
        <div className="p-4 border-b border-surface-border">
          <h2 className="text-xl font-bold text-txt-primary mb-4">Conversas</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
            <input
              type="text"
              placeholder="Buscar motorista..."
              className="w-full bg-surface-1 border border-surface-border rounded-lg py-2 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary outline-none placeholder-txt-tertiary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-txt-tertiary py-4">Carregando conversas...</p>
          ) : threads.length === 0 ? (
            <p className="text-center text-txt-tertiary py-4">Nenhuma conversa iniciada</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-4 flex gap-3 cursor-pointer border-l-4 transition-colors ${activeThreadId === thread.id
                  ? 'bg-surface-2 border-brand-primary'
                  : 'border-transparent hover:bg-surface-2'
                  }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-lg font-bold text-txt-tertiary">
                    {thread.avatar ? <img src={thread.avatar} alt={thread.name} className="w-full h-full rounded-full object-cover" /> : thread.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-bold truncate ${activeThreadId === thread.id ? 'text-white' : 'text-txt-secondary'}`}>
                      {thread.name}
                    </h3>
                    <span className="text-xs text-txt-tertiary whitespace-nowrap">{thread.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-txt-tertiary truncate max-w-[140px]">{thread.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Chat Area */}
      <div className="flex-1 flex flex-col bg-bg-main relative">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-surface-border flex justify-between items-center px-6 bg-surface-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center font-bold text-txt-tertiary border border-surface-border">
                    {activeThread.avatar ? <img src={activeThread.avatar} alt={activeThread.name} className="w-full h-full rounded-full object-cover" /> : activeThread.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-txt-primary">{activeThread.name}</h2>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[60%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`p-4 rounded-2xl text-sm ${msg.isMe
                        ? 'bg-brand-primary text-bg-main rounded-br-none'
                        : 'bg-surface-2 text-txt-primary border border-surface-border rounded-bl-none'
                        }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-txt-tertiary">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface-3 border-t border-surface-border">
              <div className="flex items-center gap-3 bg-surface-1 border border-surface-border rounded-full px-4 py-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-txt-primary text-sm outline-none placeholder-txt-tertiary"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-brand-primary text-bg-main rounded-full hover:bg-brand-hover transition-colors flex items-center justify-center shadow-lg shadow-brand-primary/20"
                >
                  <span className="material-symbols-outlined text-xl">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-txt-tertiary">
            Selecione uma conversa para iniciar
          </div>
        )}
      </div>
    </div>
  );
};
