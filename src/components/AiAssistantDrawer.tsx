import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Lightbulb, 
  Flame, 
  RotateCcw,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, PantryItem } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  pantryItems: PantryItem[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  user,
  pantryItems,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Olá, ${user.name}! Sou a NutriSmart IA 🥗. Estou conectada à sua dispensa virtual (${pantryItems.length} alimentos cadastrados) e pronta para sugerir combinações, substituições saudáveis e tirar dúvidas nutricionais. Como posso te ajudar agora?`,
      time: 'Agora'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userContext: user,
          pantryContext: pantryItems
        })
      });

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Desculpe, tive uma instabilidade momentânea. Pode repetir sua dúvida nutricional?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error('Error in chat:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: 'Não consegui me conectar aos servidores no momento. Por favor verifique sua conexão ou tente novamente em instantes.',
          time: 'Agora'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    '🍳 O que preparar rápido com o que tenho na dispensa?',
    '🌱 Qual a melhor substituição vegetal para laticínios?',
    '💧 Como calcular minha meta exata de água diária?',
    '⏱️ Sugira um lanche proteico de menos de 150 kcal'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#EFE6D1] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0C6816] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#63D753] text-[#0C6816] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-base text-white">Assistente NutriSmart IA</h3>
                <span className="w-2 h-2 rounded-full bg-[#63D753] animate-pulse" />
              </div>
              <p className="text-xs text-[#D0F4A4]">Nutrição personalizada em tempo real</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            aria-label="Fechar assistente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7EE]/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#0C6816] text-[#D0F4A4] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-[#0C6816] text-white rounded-br-xs'
                  : 'bg-white border border-[#EFE6D1] text-[#1F2E1E] rounded-bl-xs'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`text-[9px] block text-right mt-1 font-semibold ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-[#5E6B52]'
                }`}>
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-lg bg-[#0C6816] text-[#D0F4A4] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#EFE6D1] rounded-2xl px-4 py-2.5 text-xs text-[#5E6B52] flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#0C6816] border-t-transparent rounded-full animate-spin" />
                <span>NutriSmart IA formulando orientação...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#EFE6D1] space-y-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <p className="text-[11px] font-bold text-[#5E6B52] flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Sugestões rápidas de perguntas:
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] font-medium bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] px-2.5 py-1.5 rounded-lg border border-[#EFE6D1] whitespace-nowrap cursor-pointer transition-colors active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre nutrição..."
              className="flex-1 px-3.5 py-3 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs sm:text-sm text-[#0C6816] outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#0C6816] hover:bg-[#095011] disabled:opacity-50 text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
