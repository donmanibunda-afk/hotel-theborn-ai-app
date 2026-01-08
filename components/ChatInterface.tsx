import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, Category } from '../types';
import { chatWithAI } from '../services/geminiService';
import { AppConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatInterfacePropsWithConfig {
    currentCategory: Category;
    config?: AppConfig;
}

const ChatInterface: React.FC<ChatInterfacePropsWithConfig> = ({ currentCategory, config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: `안녕하세요, ${currentCategory.name} 담당 AI 분석가입니다. 연결된 ${config?.excelFileName ? '엑셀 데이터' : '데이터'}를 바탕으로 답변해 드립니다.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'ai',
      content: `${currentCategory.name} 분석 화면입니다. ${config?.excelFileName ? `업로드된 ${config.excelFileName}를 기반으로` : ''} 구체적인 전략이나 원인 분석이 필요하시다면 질문해주세요.`,
      timestamp: new Date()
    }]);
  }, [currentCategory, config]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseText = await chatWithAI(userMsg.content, history, currentCategory, config);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText || "죄송합니다. 분석 중 오류가 발생했습니다.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'ai',
          content: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A1628] border-t border-[#2A3342]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 flex gap-3 ${
              msg.role === 'user' 
                ? 'bg-[#2A3342] text-white rounded-br-sm' 
                : 'bg-[#1A2332] border border-[#2A3342] text-gray-200 rounded-bl-sm'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-[#4A90E2]' : 'bg-[#FFD700] text-black'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="flex flex-col w-full overflow-hidden">
                <span className="text-[10px] opacity-50 mb-1">
                  {msg.role === 'ai' ? 'Senior Revenue Manager AI' : 'User'}
                </span>
                {/* Use MarkdownRenderer for AI messages only, to support rich text */}
                {msg.role === 'ai' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1A2332] border border-[#2A3342] rounded-2xl p-4 rounded-bl-sm flex items-center gap-2">
              <Sparkles size={16} className="text-[#FFD700] animate-pulse" />
              <span className="text-xs text-gray-400">AI가 데이터를 분석하며 답변을 작성 중입니다...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0A1628]">
        <div className="relative flex items-center bg-[#1A2332] border border-[#2A3342] rounded-xl overflow-hidden focus-within:border-[#4A90E2] transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`"${currentCategory.name}" 관련 질문을 입력하세요...`}
            className="flex-1 bg-transparent text-white px-4 py-4 text-sm focus:outline-none placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 mr-1 text-[#4A90E2] hover:bg-[#2A3342] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;