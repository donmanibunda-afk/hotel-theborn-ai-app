import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Category, AnalysisResult, AppConfig } from '../types';
import CategoryCard from './CategoryCard';
import AnalysisPanel from './AnalysisPanel';
import { generateAnalysis, verifyApiKey } from '../services/geminiService';
import { RefreshCw, LayoutGrid, FileText, Link, ShieldCheck, Settings, X, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface DashboardProps {
  config: AppConfig;
  onConfigUpdate: (updates: Partial<AppConfig>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ config, onConfigUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsApiKey, setSettingsApiKey] = useState(config.geminiApiKey || '');
  const [apiVerifyStatus, setApiVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  // Auto-analysis effect when category changes
  useEffect(() => {
    const performAutoAnalysis = async () => {
      setIsLoading(true);
      setAnalysisResult(null);
      
      // Default prompt explicitly requesting 2017-2025 analysis
      const autoPrompt = `2017년 1월부터 2025년 12월까지의 전체 데이터를 바탕으로 '${selectedCategory.name}' 주제에 부합하는 심층 분석을 수행해주세요. 기간 내 주요 트렌드 변화, 성과 지표(KPI) 분석, 그리고 향후 개선을 위한 구체적인 전략을 도출해 주세요.`;
      
      const result = await generateAnalysis(selectedCategory, config, autoPrompt);
      setAnalysisResult(result);
      setIsLoading(false);
    };

    performAutoAnalysis();
  }, [selectedCategory, config.geminiApiKey, config.excelFileName, config.uploadedFileData]);

  const handleRequestAnalysis = async (prompt: string) => {
    setIsLoading(true);
    const result = await generateAnalysis(selectedCategory, config, prompt);
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleCategoryChange = (category: Category) => {
    if (category.id === selectedCategory.id) return;
    setSelectedCategory(category);
    // Analysis is triggered by useEffect
  };

  const handleVerifyAndSaveKey = async () => {
    setApiVerifyStatus('verifying');
    const isValid = await verifyApiKey(settingsApiKey);
    if (isValid) {
      setApiVerifyStatus('success');
      onConfigUpdate({ geminiApiKey: settingsApiKey });
      setTimeout(() => {
        setIsSettingsOpen(false);
        setApiVerifyStatus('idle');
      }, 1000);
    } else {
      setApiVerifyStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A1628] text-white overflow-hidden font-pretendard">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-[#2A3342] bg-[#0A1628]/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#0A1628] border border-[#4A90E2] flex items-center justify-center">
            <span className="font-bold text-lg">H</span>
          </div>
          <h1 className="font-bold text-lg tracking-tight">HOTEL THEBORN <span className="text-[#FFD700] font-light">PRO</span></h1>
        </div>
        
        {/* Config Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-gray-400">
           {config.excelFileName && (
             <div className="flex items-center gap-1.5" title={config.excelFileName}>
               <FileText size={14} className="text-[#50C878]" />
               <span className="max-w-[100px] truncate">{config.excelFileName}</span>
             </div>
           )}
           {config.googleSheetUrl && (
             <div className="flex items-center gap-1.5">
               <Link size={14} className="text-[#4A90E2]" />
               <span>Sheets Connected</span>
             </div>
           )}
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${
               config.geminiApiKey 
                 ? 'bg-[#1A2332] border-[#2A3342] text-gray-400 hover:text-white' 
                 : 'bg-[#E74C3C]/10 border-[#E74C3C] text-[#E74C3C] animate-pulse'
             }`}
           >
              {config.geminiApiKey ? (
                <>
                  <ShieldCheck size={14} className="text-[#FFD700]" />
                  <span>Gemini Pro Active</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  <span>API Key Missing</span>
                </>
              )}
           </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1A2332] rounded-full border border-[#2A3342]">
            <span className={`w-2 h-2 rounded-full ${config.geminiApiKey ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
            <span className="text-xs text-gray-400">{config.geminiApiKey ? 'System Online' : 'Offline Mode'}</span>
          </div>
          <button 
            onClick={() => {
              setSettingsApiKey(config.geminiApiKey || '');
              setIsSettingsOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2A3342] rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Category Grid */}
        <div className="w-[360px] flex-shrink-0 border-r border-[#2A3342] bg-[#0A1628] overflow-y-auto custom-scrollbar p-4 hidden lg:block">
          <div className="flex items-center gap-2 mb-4 text-gray-400 px-1">
            <LayoutGrid size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Analysis Modules</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                isSelected={selectedCategory.id === cat.id}
                onClick={() => handleCategoryChange(cat)}
              />
            ))}
          </div>
        </div>

        {/* Center: Analysis Panel (Now takes full remaining width) */}
        <div className="flex-1 overflow-hidden relative flex flex-col min-w-0 bg-[#0A1628]">
          <div className="p-0 h-full w-full max-w-[1600px] mx-auto">
             <AnalysisPanel 
                category={selectedCategory} 
                result={analysisResult} 
                isLoading={isLoading} 
                onRequestAnalysis={handleRequestAnalysis}
                onReset={() => setAnalysisResult(null)}
                config={config}
             />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2332] rounded-2xl border border-[#2A3342] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#2A3342] flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings size={20} className="text-[#4A90E2]" />
                환경 설정
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Gemini API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={settingsApiKey}
                    onChange={(e) => {
                      setSettingsApiKey(e.target.value);
                      setApiVerifyStatus('idle');
                    }}
                    placeholder="AI Studio API Key 입력"
                    className="w-full bg-[#0A1628] border border-[#2A3342] rounded-lg pl-10 pr-3 py-3 text-sm text-white focus:border-[#4A90E2] outline-none transition-colors"
                  />
                </div>
                {apiVerifyStatus === 'error' && (
                  <p className="text-xs text-[#E74C3C] mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    API Key 검증에 실패했습니다. 다시 확인해주세요.
                  </p>
                )}
                {apiVerifyStatus === 'success' && (
                  <p className="text-xs text-[#50C878] mt-2 flex items-center gap-1">
                    <CheckCircle size={12} />
                    API Key가 성공적으로 연결되었습니다.
                  </p>
                )}
              </div>

              <div className="bg-[#0A1628] rounded-lg p-4 border border-[#2A3342]">
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Current Configuration</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Excel Source:</span>
                    <span className="text-gray-400">{config.excelFileName || 'Not Uploaded'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sheet Link:</span>
                    <span className="text-gray-400">{config.googleSheetUrl ? 'Connected' : 'Not Connected'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-[#2A3342] bg-[#0A1628]/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleVerifyAndSaveKey}
                disabled={!settingsApiKey || apiVerifyStatus === 'verifying'}
                className="px-6 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {apiVerifyStatus === 'verifying' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    검증 중...
                  </>
                ) : (
                  '저장 및 연결'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;