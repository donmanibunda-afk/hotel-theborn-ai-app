import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, Category, AppConfig } from '../types';
import AnalysisChart from './AnalysisChart';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Zap, Search, RefreshCw, Send, Sparkles, User, Bot } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface AnalysisPanelProps {
  category: Category;
  result: AnalysisResult | null;
  isLoading: boolean;
  onRequestAnalysis: (prompt: string) => void;
  onReset: () => void;
  config?: AppConfig;
}

interface FollowUpMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ category, result, isLoading, onRequestAnalysis, onReset, config }) => {
  const [prompt, setPrompt] = useState('');
  const [followUps, setFollowUps] = useState<FollowUpMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset conversation when main result changes
    setFollowUps([]);
  }, [result]);

  useEffect(() => {
    // Auto scroll to bottom when follow-ups change
    if (followUps.length > 0 || isFollowUpLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUps, isFollowUpLoading]);

  // Suggestions based on category
  const getSuggestions = (catId: string) => {
    switch (catId) {
      case 'revenue': return ['2025년 4분기 RevPAR 예측해줘', 'ADR 상승이 점유율에 미친 영향 분석', '주말 vs 주중 수익성 비교'];
      case 'occupancy': return ['지난달 대비 점유율 하락 원인은?', '다음 달 예상 점유율 및 예약 추이', 'OTA vs 직영 점유율 비교'];
      case 'cost': return ['최근 인건비 상승 추이 분석', '수도광열비 절감 방안 제안', '고정비 vs 변동비 비율 분석'];
      default: return ['전년 동기 대비 성과 비교', '향후 3개월 트렌드 예측', '주요 리스크 요인 및 대응 방안'];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    onRequestAnalysis(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onRequestAnalysis(prompt);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !result) return;

    const currentQuestion = followUpInput;
    setFollowUpInput('');
    setIsFollowUpLoading(true);

    // Build history for context
    const history = followUps.flatMap(f => [
      { role: 'user', content: f.question },
      { role: 'model', content: f.answer }
    ]);

    try {
      const answer = await chatWithAI(
        currentQuestion, 
        history, 
        category, 
        config,
        result // Pass the current analysis result as context
      );
      
      setFollowUps(prev => [...prev, {
        id: Date.now().toString(),
        question: currentQuestion,
        answer: answer || "죄송합니다. 답변을 생성하지 못했습니다.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#2A3342] border-t-[#4A90E2] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 bg-[#4A90E2] rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Data</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              AI가 '{prompt || category.name}' 관련 데이터를 심층 분석 중입니다...
            </p>
        </div>
      </div>
    );
  }

  // INPUT VIEW (When no result)
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
         <div className="w-full max-w-3xl flex flex-col items-center text-center">
            <div className="mb-6 p-6 rounded-3xl bg-[#1A2332] border border-[#2A3342] shadow-2xl shadow-blue-900/10 text-[#FFD700] transform hover:scale-105 transition-transform duration-300">
               {React.cloneElement(category.icon as React.ReactElement, { size: 48 })}
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {category.name} <span className="text-[#4A90E2] font-light">Analysis</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg max-w-xl leading-relaxed">
              {category.description}
              <br/>
              <span className="text-sm text-gray-500">원하시는 분석 내용을 입력하시면 AI가 맞춤형 리포트를 생성합니다.</span>
            </p>

            <form onSubmit={handleSubmit} className="w-full relative group z-10">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="text-gray-500 group-focus-within:text-[#4A90E2] transition-colors" size={24} />
              </div>
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`"${category.name}" 관련 궁금한 점을 입력하세요 (예: 2025년 상반기 전망)`}
                className="w-full bg-[#1A2332] border-2 border-[#2A3342] rounded-2xl py-6 pl-16 pr-32 text-lg text-white placeholder-gray-500 focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/10 outline-none transition-all shadow-xl"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!prompt.trim()}
                className="absolute right-3 top-3 bottom-3 px-6 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl font-bold transition-all disabled:opacity-0 disabled:translate-x-4 flex items-center gap-2"
              >
                분석하기 <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
               {getSuggestions(category.id).map((s, idx) => (
                 <button 
                   key={idx}
                   onClick={() => handleSuggestionClick(s)}
                   className="px-4 py-2 bg-[#1A2332] border border-[#2A3342] hover:border-[#4A90E2] hover:bg-[#2A3342] rounded-full text-sm text-gray-300 transition-colors"
                 >
                   {s}
                 </button>
               ))}
            </div>
         </div>
      </div>
    );
  }

  // RESULT VIEW
  return (
    <div className="h-full flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
      <div className="p-8 pb-4 flex items-center justify-between shrink-0 bg-[#0A1628] z-10">
         <h3 className="text-xl font-bold flex items-center gap-2 text-white">
           <span className="text-[#4A90E2]">Analyzed:</span> {prompt || category.name}
         </h3>
         <button 
           onClick={onReset}
           className="flex items-center gap-2 px-4 py-2 bg-[#1A2332] hover:bg-[#2A3342] border border-[#2A3342] rounded-lg text-sm font-medium text-gray-300 transition-colors"
         >
           <RefreshCw size={16} />
           New Analysis
         </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar space-y-8" ref={scrollRef}>
        
        {/* 1. Dashboard Content */}
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-[#1A2332] p-6 rounded-2xl border border-[#2A3342] shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#FFD700] text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                <Zap size={16} />
                AI Executive Summary
              </span>
              <div className="h-px bg-[#2A3342] flex-1"></div>
            </div>
            <p className="text-gray-200 leading-relaxed text-lg">
              {result.summary}
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-6">
            {result.kpis.map((kpi, idx) => (
              <div key={idx} className="bg-[#1A2332] p-5 rounded-xl border border-[#2A3342] flex flex-col hover:border-[#4A90E2]/50 transition-colors">
                <span className="text-sm text-gray-400 mb-2">{kpi.label}</span>
                <div className="flex items-end gap-3 mt-auto">
                  <span className="text-3xl font-bold text-white tracking-tight">{kpi.value}</span>
                  <div className={`flex items-center text-sm font-medium mb-1.5 px-2 py-0.5 rounded-full ${
                    kpi.trend > 0 ? 'bg-green-500/10 text-green-400' : kpi.trend < 0 ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {kpi.trend > 0 ? <TrendingUp size={12} className="mr-1" /> : kpi.trend < 0 ? <TrendingDown size={12} className="mr-1" /> : <Minus size={12} className="mr-1" />}
                    {Math.abs(kpi.trend)}%
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{kpi.trendLabel}</span>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="bg-[#1A2332] p-6 rounded-2xl border border-[#2A3342] h-[400px] shadow-lg">
            <h4 className="text-base font-semibold text-gray-300 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#4A90E2]"></div>
              Trend Visualization
            </h4>
            <div className="w-full h-[300px]">
              <AnalysisChart data={result.chartData} type={result.chartType} color={category.color} />
            </div>
          </div>

          {/* Insights & Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <div className="bg-[#1A2332] p-6 rounded-2xl border border-[#2A3342] hover:border-[#4A90E2]/30 transition-colors">
              <h4 className="text-base font-semibold text-[#4A90E2] mb-5 flex items-center gap-2">
                <Search size={18} />
                Deep Insights
              </h4>
              <ul className="space-y-4">
                {result.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-gray-300 leading-snug">
                    <span className="min-w-[6px] h-[6px] rounded-full bg-[#4A90E2] mt-2.5 shadow-[0_0_8px_#4A90E2]"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Plan */}
            <div className="bg-[#1A2332] p-6 rounded-2xl border border-[#2A3342] hover:border-[#50C878]/30 transition-colors">
              <h4 className="text-base font-semibold text-[#50C878] mb-5 flex items-center gap-2">
                <ArrowRight size={18} />
                Strategic Actions
              </h4>
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block border-b border-[#2A3342] pb-1">Short Term (1M)</span>
                  <ul className="space-y-3">
                    {result.actions.shortTerm.map((action, idx) => (
                      <li key={idx} className="text-base text-gray-300 flex items-start gap-3">
                        <div className="min-w-[6px] h-[6px] bg-[#50C878] rounded-full mt-2.5"></div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block border-b border-[#2A3342] pb-1">Mid Term (3M)</span>
                  <ul className="space-y-3">
                    {result.actions.midTerm.map((action, idx) => (
                      <li key={idx} className="text-base text-gray-300 flex items-start gap-3">
                        <div className="min-w-[6px] h-[6px] bg-[#FFD700] rounded-full mt-2.5"></div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Follow-up Conversation Section */}
        {followUps.length > 0 && (
          <div className="border-t border-[#2A3342] pt-8">
            <h4 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-[#FFD700]" />
              추가 분석 질의응답
            </h4>
            <div className="space-y-8">
              {followUps.map((msg) => (
                <div key={msg.id} className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Question */}
                  <div className="flex justify-end">
                    <div className="bg-[#2A3342] text-white rounded-2xl rounded-br-none px-6 py-4 max-w-[80%] shadow-lg">
                      <div className="flex items-center gap-2 mb-2 opacity-50 text-xs">
                        <User size={12} />
                        추가 질문
                      </div>
                      <p className="text-base leading-relaxed">{msg.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="flex justify-start w-full">
                    <div className="bg-[#1A2332] border border-[#2A3342] text-gray-200 rounded-2xl rounded-bl-none px-6 py-5 max-w-[95%] shadow-lg overflow-hidden">
                      <div className="flex items-center gap-2 mb-3 opacity-50 text-xs text-[#FFD700]">
                        <Bot size={14} />
                        AI 분석 답변
                      </div>
                      {/* Markdown Renderer used here */}
                      <MarkdownRenderer content={msg.answer} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isFollowUpLoading && (
           <div className="space-y-4 pt-4">
              <div className="flex justify-end">
                <div className="bg-[#2A3342] text-white rounded-2xl rounded-br-none px-6 py-4 max-w-[80%] opacity-50">
                  <p>{followUpInput || "분석 중..."}</p>
                </div>
              </div>
              <div className="flex justify-start">
                 <div className="bg-[#1A2332] border border-[#2A3342] rounded-2xl rounded-bl-none px-6 py-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-bounce delay-200"></div>
                    <span className="text-sm text-gray-400 ml-2">추가 분석을 진행하고 있습니다...</span>
                 </div>
              </div>
           </div>
        )}
        
        {/* Invisible anchor for scrolling */}
        <div ref={bottomRef} />
      </div>

      {/* 3. Sticky Bottom Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A1628] via-[#0A1628] to-transparent z-20">
         <div className="max-w-[1540px] mx-auto">
            <form onSubmit={handleFollowUpSubmit} className="relative flex items-center bg-[#1A2332] border border-[#2A3342] rounded-2xl shadow-2xl focus-within:border-[#4A90E2] focus-within:ring-2 focus-within:ring-[#4A90E2]/20 transition-all">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="현재 분석 결과에 대해 추가로 궁금한 점을 물어보세요..."
                className="flex-1 bg-transparent text-white px-6 py-4 text-base focus:outline-none placeholder-gray-500"
                disabled={isFollowUpLoading}
              />
              <button 
                type="submit"
                disabled={!followUpInput.trim() || isFollowUpLoading}
                className="p-3 mr-2 text-[#4A90E2] hover:bg-[#2A3342] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;