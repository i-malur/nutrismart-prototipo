import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  Sparkles,
  ChefHat,
  CalendarDays,
  ShoppingCart,
  BookmarkCheck,
  Check,
  Trash2
} from 'lucide-react';
import { UserProfile, PantryItem } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  pantryItems: PantryItem[];
  onSaveToLibrary?: (item: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestionData?: {
    type: 'recipe' | 'weekly_plan' | 'shopping_list';
    title: string;
    description: string;
    content: any;
  };
}

const STORAGE_KEY = 'nutrismart_chat_history';

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  user,
  pantryItems = [],
  onSaveToLibrary,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar histórico do chat:', e);
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Olá, ${user.name}! Sou a NutriSmart IA 🥗. Estou conectada à sua dispensa virtual (${pantryItems.length} alimentos cadastrados) e considerando suas restrições alimentares. Como posso te ajudar hoje?`,
        timestamp: 'Agora'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Erro ao guardar histórico:', e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleClearChat = () => {
    const initialMsg: ChatMessage[] = [
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'ai',
        text: `Olá, ${user.name}! Histórico limpo. Como posso te ajudar agora?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMsg);
    setSavedMessageIds([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      // Requisita a API do backend conectada ao Gemini
      const res = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userContext: user,
          pantryItems
        })
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let suggestionData = data.suggestionData;

      // Se o backend retornou um objeto estruturado ou se precisamos criar um card a partir da resposta da IA:
      if (!suggestionData && data.reply) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('receita') || lowerQuery.includes('cozinhar') || lowerQuery.includes('prato')) {
          suggestionData = {
            type: 'recipe',
            title: 'Sugestão Personalizada da IA',
            description: 'Receita gerada com base nos alimentos da sua dispensa.',
            content: {
              instructions: data.reply
            }
          };
        } else if (lowerQuery.includes('cardápio') || lowerQuery.includes('semanal') || lowerQuery.includes('plano')) {
          suggestionData = {
            type: 'weekly_plan',
            title: 'Cardápio Semanal Personalizado',
            description: 'Planejamento de 7 dias criado pela IA com o que você tem em casa.',
            content: {
              summary: data.reply
            }
          };
        } else if (lowerQuery.includes('compras') || lowerQuery.includes('lista') || lowerQuery.includes('comprar')) {
          suggestionData = {
            type: 'shopping_list',
            title: 'Lista de Compras Recomendada',
            description: 'Itens sugeridos pela IA para completar suas refeições.',
            content: {
              summary: data.reply
            }
          };
        }
      }

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Aqui está a sugestão nutricional para você:',
        timestamp: timeStr,
        suggestionData
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Erro na chamada da IA:', err);

      const errorResponse: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Desculpe, tive um problema ao consultar o servidor da IA. Verifique se o servidor está rodando e tente novamente!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSuggestion = (msg: ChatMessage) => {
    if (!msg.suggestionData) return;
    if (onSaveToLibrary) {
      onSaveToLibrary(msg.suggestionData);
    }
    setSavedMessageIds(prev => [...prev, msg.id]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#FAF7EE] shadow-2xl border-l border-[#EFE6D1] flex flex-col animate-in slide-in-from-right duration-300">

      {/* Header */}
      <div className="bg-[#0C6816] text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#63D753] text-[#0C6816] flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
              Assistente NutriSmart IA
              <span className="w-2 h-2 rounded-full bg-[#63D753] animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#D0F4A4]">Nutrição personalizada em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Limpar Histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          const isSaved = savedMessageIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${isAI ? 'bg-[#0C6816] text-white' : 'bg-[#D0F4A4] text-[#0C6816]'
                }`}>
                {isAI ? <Bot className="w-4 h-4" /> : user.name.charAt(0)}
              </div>

              <div className={`max-w-[85%] space-y-2 ${isAI ? '' : 'items-end'}`}>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${isAI
                    ? 'bg-white text-[#1F2E1E] border border-[#EFE6D1] rounded-tl-xs'
                    : 'bg-[#0C6816] text-white rounded-tr-xs'
                  }`}>
                  <p>{msg.text}</p>
                </div>

                {/* Card de Resposta da IA com os Detalhes */}
                {isAI && msg.suggestionData && (
                  <div className="bg-white border border-[#63D753]/60 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#0C6816] bg-[#D0F4A4] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {msg.suggestionData.type === 'recipe' && '🥗 RECEITA SUGERIDA'}
                        {msg.suggestionData.type === 'weekly_plan' && '📅 CARDÁPIO SEMANAL'}
                        {msg.suggestionData.type === 'shopping_list' && '🛒 LISTA DE COMPRAS'}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#0C6816]">
                      {msg.suggestionData.title}
                    </h4>

                    <p className="text-xs text-[#5E6B52]">
                      {msg.suggestionData.description}
                    </p>

                    <div className="bg-[#FAF7EE] p-3 rounded-xl border border-[#EFE6D1] space-y-2 text-xs text-[#1F2E1E]">
                      {msg.suggestionData.type === 'recipe' && (
                        <>
                          <p className="font-bold text-[#0C6816]">Ingredientes:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {msg.suggestionData.content.ingredients?.map((ing: string, i: number) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                          <p className="font-bold text-[#0C6816] pt-1">Modo de Preparo:</p>
                          <p className="text-[11px] leading-relaxed">
                            {msg.suggestionData.content.instructions}
                          </p>
                        </>
                      )}

                      {msg.suggestionData.type === 'shopping_list' && (
                        <>
                          <p className="font-bold text-[#0C6816]">Itens Recomendados:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {msg.suggestionData.content.items?.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {msg.suggestionData.type === 'weekly_plan' && (
                        <>
                          <p className="font-bold text-[#0C6816]">Destaques do Plano:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {msg.suggestionData.content.highlights?.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleSaveSuggestion(msg)}
                      disabled={isSaved}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${isSaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#0C6816] hover:bg-[#095011] text-white shadow-xs active:scale-95'
                        }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Salvo em Sugestões & Salvos</span>
                        </>
                      ) : (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-[#D0F4A4]" />
                          <span>Salvar este Item</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-[#5E6B52] block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#0C6816] font-semibold bg-white p-3 rounded-2xl border border-[#EFE6D1] w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-[#63D753]" />
            <span>NutriSmart IA está analisando sua dispensa...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chips */}
      <div className="p-2.5 bg-white border-t border-[#EFE6D1] overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
        <button
          onClick={() => handleSendMessage('Sugerir receitas com o que tenho na dispensa')}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] border border-[#EFE6D1] rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <ChefHat className="w-3.5 h-3.5 text-[#63D753]" />
          <span>Sugerir Receitas</span>
        </button>

        <button
          onClick={() => handleSendMessage('Criar uma sugestão de cardápio semanal')}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] border border-[#EFE6D1] rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
          <span>Cardápio Semanal</span>
        </button>

        <button
          onClick={() => handleSendMessage('O que preciso comprar para a semana?')}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] border border-[#EFE6D1] rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
          <span>Lista de Compras</span>
        </button>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-[#EFE6D1] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Digite sua dúvida sobre nutrição..."
          className="flex-1 px-4 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#1F2E1E] outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="w-10 h-10 bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};