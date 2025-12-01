import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage } from '../components/ChatMessage';
import { Send, Trash2, StopCircle, Sparkles, User, Diamond } from 'lucide-react';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Bienvenido a FintechCasinoX. Soy tu Asistente VIP de IA. Puedo explicarte las reglas de los juegos, calcular probabilidades o discutir sobre gestión de riesgos financieros. ¿En qué puedo servirte?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isLoading: true
    }]);

    try {
      // Prompt engineering injection for persona
      const history = [
        { role: 'user', parts: [{ text: "Actua como un asistente sofisticado de un casino fintech de lujo llamado FintechCasinoX. Eres experto en probabilidad, finanzas y juego responsable. Sé breve, elegante y profesional." }] },
        { role: 'model', parts: [{ text: "Entendido. Soy el Concierge AI de FintechCasinoX. Procederé con elegancia y precisión matemática." }] },
        ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
      }))];

      let accumulatedText = '';
      await streamChatResponse(history, userMsg.content, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === modelMsgId 
            ? { ...m, content: accumulatedText }
            : m
        ));
      });
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "Error: El sistema de IA está momentáneamente fuera de servicio.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m => 
        m.id === modelMsgId ? { ...m, isLoading: false } : m
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      content: "Historial borrado. ¿En qué más puedo asistirte hoy?",
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0B0B0C]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#D4C28A] flex items-center justify-center">
                 <Diamond size={16} className="text-black"/>
             </div>
             <div>
                 <h2 className="text-lg font-heading font-bold text-white">Soporte Concierge IA</h2>
                 <p className="text-xs text-[#D4C28A]">Powered by Gemini 2.5</p>
             </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10 bg-[#0B0B0C]">
        <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-[#D4C28A] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre probabilidades, reglas o soporte..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 p-3 max-h-32 min-h-[44px] outline-none resize-none overflow-hidden font-light"
            style={{ height: 'auto' }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl flex-shrink-0 transition-all ${
              input.trim() && !isLoading
                ? 'bg-[#D4C28A] text-black hover:bg-[#C0AE75]'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? <StopCircle size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-3">
           <p className="text-[10px] text-slate-600">
             FintechCasinoX AI puede cometer errores. Verifica la información financiera.
           </p>
        </div>
      </div>
    </div>
  );
};