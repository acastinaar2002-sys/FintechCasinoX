import React from 'react';
import { Message } from '../types';
import { Diamond, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
          isUser ? 'bg-slate-800 border-slate-700' : 'bg-[#D4C28A] border-[#D4C28A]'
        }`}>
          {isUser ? <User size={14} className="text-slate-300" /> : <Diamond size={14} className="text-black" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-lg ${
            isUser 
              ? 'bg-slate-800 text-white rounded-tr-sm border border-slate-700' 
              : 'bg-white/10 backdrop-blur-md text-slate-100 rounded-tl-sm border border-white/10'
          }`}>
             {message.attachment && (
              <div className="mb-3">
                <img 
                  src={message.attachment.data} 
                  alt="User upload" 
                  className="max-w-full rounded-lg max-h-60 object-cover border border-white/20" 
                />
              </div>
            )}
            {message.content}
            {message.isLoading && (
               <span className="inline-block w-2 h-2 ml-2 rounded-full bg-[#D4C28A] animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] text-slate-600 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};