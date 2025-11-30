
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatRepo } from '../repositories/chatRepo';
import { ChatMessage } from '../types';

export const ChatCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlDriverId = searchParams.get('threadId');

  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (urlDriverId) {
      setActiveDriverId(urlDriverId);
    }
  }, [urlDriverId]);

  useEffect(() => {
    const initThread = async () => {
      if (activeDriverId) {
        try {
          const threadId = await chatRepo.getOrCreateThread(activeDriverId);
          setCurrentThreadId(threadId);
        } catch (error) {
          console.error('Failed to get/create thread:', error);
        }
      } else {
        setCurrentThreadId(null);
      }
    };
    initThread();
  }, [activeDriverId]);

  useEffect(() => {
    if (currentThreadId) {
      fetchMessages(currentThreadId);
      const subscription = chatRepo.subscribeToMessages(currentThreadId, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await chatRepo.getThreads();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
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
    if (!messageInput.trim() || !currentThreadId) return;

    try {
      await chatRepo.sendMessage(currentThreadId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeDriver = drivers.find(d => d.id === activeDriverId);



  return (
    <div className="h-[calc(100vh-9rem)] bg-surface-1 border border-surface-border rounded-2xl overflow-hidden flex shadow-2xl">

      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-surface-1 border-r border-surface-border ${activeDriverId ? 'hidden md:flex' : 'flex'}`}>

        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-txt-primary">Chat</h2>
            <button className="p-2 hover:bg-surface-2 rounded-full transition-colors text-txt-tertiary hover:text-txt-primary">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>

        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-txt-tertiary">
              <span className="material-symbols-outlined animate-spin mb-2">progress_activity</span>
              <p className="text-sm">Carregando...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center text-txt-tertiary py-8">
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setActiveDriverId(driver.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${activeDriverId === driver.id
                  ? 'bg-brand-primary/10 border-brand-primary/20'
                  : 'bg-transparent border-transparent hover:bg-surface-2'
                  }`}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-lg font-bold text-txt-tertiary overflow-hidden border border-surface-border">
                      {driver.avatar ? (
                        <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        driver.name.charAt(0)
                      )}
                    </div>
                    {/* Online Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-1 ${driver.status === 'active' ? 'bg-semantic-success' : 'bg-txt-tertiary'}`}></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-bold truncate ${activeDriverId === driver.id ? 'text-brand-primary' : 'text-txt-primary'}`}>
                        {driver.name}
                      </h3>
                      {/* <span className="text-[10px] text-txt-tertiary">{driver.lastMessageTime}</span> */}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate max-w-[140px] ${activeDriverId === driver.id ? 'text-txt-secondary' : 'text-txt-tertiary'}`}>
                        {driver.lastMessage || 'Toque para iniciar conversa'}
                      </p>
                      {activeDriverId !== driver.id && driver.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-surface-border">
          <button className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-xl transition-colors shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add_comment</span>
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col bg-bg-main relative ${!activeDriverId ? 'hidden md:flex' : 'flex'}`}>
        {activeDriver ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-surface-border flex justify-between items-center px-6 bg-surface-1/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveDriverId(null)}
                  className="md:hidden p-2 -ml-2 text-txt-tertiary hover:text-txt-primary"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center font-bold text-txt-tertiary overflow-hidden border border-surface-border">
                    {activeDriver.avatar ? (
                      <img src={activeDriver.avatar} alt={activeDriver.name} className="w-full h-full object-cover" />
                    ) : (
                      activeDriver.name.charAt(0)
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-semantic-success border-2 border-surface-1"></div>
                </div>

                <div>
                  <h2 className="font-bold text-txt-primary text-lg">{activeDriver.name}</h2>
                  <p className="text-xs text-semantic-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-success"></span>
                    Online agora
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">phone</span>
                </button>
                <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-sec/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-txt-tertiary opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">chat_bubble_outline</span>
                  <p>Nenhuma mensagem ainda.</p>
                  <p className="text-sm">Envie um "Olá" para começar!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.isMe;
                  const isLast = index === messages.length - 1;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`max-w-[70%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-4 rounded-2xl text-sm shadow-sm relative ${isMe
                            ? 'bg-brand-primary text-bg-main rounded-br-none'
                            : 'bg-surface-1 text-txt-primary border border-surface-border rounded-bl-none'
                            }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-txt-tertiary font-medium">{msg.timestamp}</span>
                          {isMe && isLast && (
                            <span className="material-symbols-outlined text-[14px] text-brand-primary">done_all</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface-1 border-t border-surface-border">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <button className="p-3 text-txt-tertiary hover:text-brand-primary hover:bg-surface-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>

                <div className="flex-1 bg-surface-2 border border-surface-border rounded-2xl flex items-center px-4 py-2 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent text-txt-primary text-sm outline-none placeholder-txt-tertiary py-2"
                  />
                  <button className="p-2 text-txt-tertiary hover:text-txt-primary transition-colors">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-full flex items-center justify-center shadow-lg transition-all ${messageInput.trim()
                    ? 'bg-brand-primary text-bg-main hover:bg-brand-hover shadow-brand-primary/20 transform hover:scale-105'
                    : 'bg-surface-3 text-txt-disabled cursor-not-allowed'
                    }`}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg-sec/30">
            <div className="w-64 h-64 mb-8 relative">
              <div className="absolute inset-0 bg-brand-primary/5 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 bg-brand-primary/10 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-9xl text-brand-primary/40">forum</span>
              </div>

              {/* Floating Elements Animation */}
              <div className="absolute top-0 right-10 bg-surface-1 p-3 rounded-2xl shadow-lg border border-surface-border animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="material-symbols-outlined text-brand-primary">chat</span>
              </div>
              <div className="absolute bottom-10 left-0 bg-surface-1 p-3 rounded-2xl shadow-lg border border-surface-border animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="material-symbols-outlined text-semantic-info">mail</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-txt-primary mb-3">Comece a Conversar!</h2>
            <p className="text-txt-secondary max-w-md mb-8">
              Selecione uma conversa da lista ou inicie um novo chat para se comunicar com seus motoristas em tempo real.
            </p>

            <button className="px-8 py-3 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-xl transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2">
              <span className="material-symbols-outlined">add_comment</span>
              Nova Conversa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
