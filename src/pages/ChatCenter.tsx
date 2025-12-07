import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTranslation } from 'react-i18next';
import { chatRepo } from '../repositories/chatRepo';
import { ChatMessage } from '../types';

export const ChatCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const urlDriverId = searchParams.get('threadId');

  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New features state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Chat Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          setCurrentThreadId(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    if (!currentThreadId) {
      alert(t('chat.errorNoThread'));
      return;
    }

    const textToSend = messageInput;
    setMessageInput('');
    setShowEmojiPicker(false);

    try {
      await chatRepo.sendMessage(currentThreadId, textToSend);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessageInput(textToSend); // Restore text if failed

      if (error.message?.includes('sender_role') || error.code === '42703') {
        alert('Erro de Configuração do Banco de Dados: A coluna "sender_role" está faltando na tabela chat_messages. Por favor, execute o script de correção SQL.');
      } else {
        alert(t('chat.sendError'));
      }
    }
  };

  const activeDriver = drivers.find(d => d.id === activeDriverId);

  const handleDeleteThread = async () => {
    if (!currentThreadId || !activeDriverId) return;

    try {
      await chatRepo.deleteThread(currentThreadId);
      setMessages([]);
      setCurrentThreadId(null);
      setIsDeleteModalOpen(false);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to delete thread:', error);
      alert(t('chat.deleteError'));
    }
  };

  // Emoji Handler
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    // Don't close picker immediately to allow multiple emojis
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('chat.fileTooBig'));
      return;
    }

    if (!currentThreadId) {
      alert(t('chat.errorNoThread'));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (currentThreadId) {
          await chatRepo.sendMessage(currentThreadId, `[image]${base64}[/image]`);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert(t('chat.imageSendError'));
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderMessageContent = (text: string) => {
    if (text.startsWith('[image]') && text.endsWith('[/image]')) {
      const src = text.replace('[image]', '').replace('[/image]', '');
      return (
        <img
          src={src}
          alt={t('chat.sentImage')}
          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity mt-1"
          onClick={() => window.open(src, '_blank')}
        />
      );
    }
    return <p className="leading-relaxed whitespace-pre-wrap pt-1">{text}</p>;
  };

  // Filter drivers for modal
  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-9rem)] bg-surface-1 border border-surface-border rounded-2xl overflow-hidden flex shadow-2xl relative">

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-surface-border rounded-xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete</span>
            </div>
            <h3 className="text-lg font-bold text-txt-primary mb-2">{t('chat.deleteConfirmTitle') || 'Excluir Conversa?'}</h3>
            <p className="text-txt-secondary text-sm mb-6">
              {t('chat.deleteConfirmMessage') || 'Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.'}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 px-4 bg-surface-2 hover:bg-surface-3 text-txt-primary rounded-lg transition-colors font-medium"
              >
                {t('common.cancel') || 'Cancelar'}
              </button>
              <button
                onClick={handleDeleteThread}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('common.delete') || 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-surface-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-surface-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-txt-primary">{t('chat.newChatModal.title')}</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-txt-tertiary hover:text-txt-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 border-b border-surface-border">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary">search</span>
                <input
                  type="text"
                  placeholder={t('chat.newChatModal.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-main border border-surface-border rounded-lg py-2 pl-10 pr-4 text-sm text-txt-primary focus:border-brand-primary outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredDrivers.map(driver => (
                <div
                  key={driver.id}
                  onClick={() => {
                    setActiveDriverId(driver.id);
                    setIsNewChatModalOpen(false);
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-surface-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center overflow-hidden border border-surface-border">
                    {driver.avatar ? (
                      <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-txt-tertiary font-bold">{driver.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-txt-primary">{driver.name}</h4>
                    <p className="text-xs text-txt-tertiary capitalize">{driver.status}</p>
                  </div>
                </div>
              ))}
              {filteredDrivers.length === 0 && (
                <div className="text-center py-8 text-txt-tertiary text-sm">
                  {t('chat.noConversations')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-surface-1 border-r border-surface-border ${activeDriverId ? 'hidden md:flex' : 'flex'}`}>

        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-txt-primary">{t('chat.title')}</h2>
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
              <p className="text-sm">{t('chat.loading')}</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center text-txt-tertiary py-8">
              <p>{t('chat.noConversations')}</p>
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
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate max-w-[140px] ${activeDriverId === driver.id ? 'text-txt-secondary' : 'text-txt-tertiary'}`}>
                        {driver.lastMessage || t('chat.tapToStart')}
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
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-xl transition-colors shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_comment</span>
            {t('chat.newChat')}
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
                    {t('chat.onlineNow')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 text-txt-tertiary hover:text-red-500 hover:bg-surface-2 rounded-lg transition-colors"
                  title={t('chat.deleteConfirm')}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <button className="p-2 text-txt-tertiary hover:text-txt-primary hover:bg-surface-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-[#0b141a] bg-opacity-95" onClick={() => setShowEmojiPicker(false)}>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-txt-tertiary opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">chat_bubble_outline</span>
                  <p>{t('chat.noMessages')}</p>
                  <p className="text-sm">{t('chat.startMessage')}</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.isMe;
                  const prevMsg = messages[index - 1];
                  const isSequence = prevMsg && prevMsg.isMe === isMe;

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? 'mt-0.5' : 'mt-3'}`}>
                      <div className={`max-w-[85%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-3 py-1.5 rounded-lg text-sm shadow-sm relative break-words min-w-[80px] ${isMe
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' // WhatsApp dark green
                            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none' // WhatsApp dark gray
                            }`}
                        >
                          <div className="flex flex-wrap items-end gap-x-2 relative">
                            {renderMessageContent(msg.text)}
                            {/* Spacer to prevent text from being covered by floating timestamp if we used absolute, 
                                but here we use flex-wrap so just ensure min-width or margin */}
                            <div className={`text-[10px] ml-auto h-fit mb-0.5 flex items-center gap-0.5 shrink-0 ${isMe ? 'text-[#8696a0]' : 'text-[#8696a0]'}`}>
                              <span className="whitespace-nowrap">{msg.timestamp}</span>
                              {isMe && (
                                <span className={`material-symbols-outlined text-[14px] ${true ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`}>done_all</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 md:p-4 bg-[#202c33] border-t border-surface-border relative">
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 ml-0 md:ml-4 z-50 shadow-2xl rounded-2xl overflow-hidden w-full max-w-[300px]">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={"dark" as any}
                    width="100%"
                    height={350}
                    lazyLoadEmojis={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}

              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button
                  className="p-2 text-[#8696a0] hover:text-txt-primary rounded-full transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>

                <div className="flex-1 bg-[#2a3942] rounded-2xl flex items-center px-4 py-2 transition-all">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 bg-transparent text-[#d1d7db] text-sm outline-none placeholder-[#8696a0] py-1"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <button
                    className="p-1 text-[#8696a0] hover:text-txt-primary transition-colors ml-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <button
                    className="p-1 text-[#8696a0] hover:text-txt-primary transition-colors ml-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-full flex items-center justify-center shadow-lg transition-all ${messageInput.trim()
                    ? 'bg-[#00a884] text-white hover:bg-[#008f6f]'
                    : 'bg-[#2a3942] text-[#8696a0] cursor-not-allowed'
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

            <h2 className="text-3xl font-bold text-txt-primary mb-3">{t('chat.emptyState.title')}</h2>
            <p className="text-txt-secondary max-w-md mb-8">
              {t('chat.emptyState.description')}
            </p>

            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-8 py-3 bg-brand-primary hover:bg-brand-hover text-bg-main font-bold rounded-xl transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_comment</span>
              {t('chat.newChat')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
