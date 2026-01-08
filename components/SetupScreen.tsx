import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  Server, 
  FileSpreadsheet, 
  Link as LinkIcon, 
  ShieldCheck,
  Loader2,
  AlertCircle,
  Key
} from 'lucide-react';
import { verifyApiKey } from '../services/geminiService';
import { AppConfig } from '../types';
import { read, utils } from 'xlsx';

interface SetupScreenProps {
  onComplete: (config: Omit<AppConfig, 'isConfigured'>) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null); // Base64
  const [processedMimeType, setProcessedMimeType] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [notebookUrl, setNotebookUrl] = useState('');
  const [manualApiKey, setManualApiKey] = useState('');
  
  const [status, setStatus] = useState({
    excel: 'idle', // idle, verifying, success, error
    sheet: 'idle',
    notebook: 'idle',
    api: 'idle' 
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setStatus(prev => ({ ...prev, excel: 'verifying' }));
      
      try {
        let csvContent = '';
        
        // Check if it's an Excel file
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = read(arrayBuffer);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert to CSV
          csvContent = utils.sheet_to_csv(worksheet);
        } else {
          // Assume text/csv
          csvContent = await file.text();
        }

        // Encode to UTF-8 Base64 (Safe for Korean characters)
        const encoder = new TextEncoder();
        const bytes = encoder.encode(csvContent);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        setFileData(base64Data);
        setProcessedMimeType('text/csv'); // Always send as CSV to Gemini for best compatibility
        
        setTimeout(() => {
          setStatus(prev => ({ ...prev, excel: 'success' }));
        }, 800);

      } catch (error) {
        console.error("File processing error:", error);
        setStatus(prev => ({ ...prev, excel: 'error' }));
      }
    }
  };

  const handleUrlInput = (type: 'sheet' | 'notebook', value: string) => {
    if (type === 'sheet') setSheetUrl(value);
    if (type === 'notebook') setNotebookUrl(value);
  };

  const handleUrlBlur = (type: 'sheet' | 'notebook') => {
    const value = type === 'sheet' ? sheetUrl : notebookUrl;
    if (value) simulateVerification(type);
  };

  const simulateVerification = (type: 'excel' | 'sheet' | 'notebook') => {
    setStatus(prev => ({ ...prev, [type]: 'verifying' }));
    setTimeout(() => {
      setStatus(prev => ({ ...prev, [type]: 'success' }));
    }, 1500);
  };

  const handleApiVerification = async () => {
    if (!manualApiKey.trim()) return;
    
    setStatus(prev => ({ ...prev, api: 'verifying' }));
    const isValid = await verifyApiKey(manualApiKey);
    setStatus(prev => ({ ...prev, api: isValid ? 'success' : 'error' }));
  };

  const isAllVerified = status.excel === 'success' || status.sheet === 'success' || status.notebook === 'success'; 

  const handleFinish = () => {
    onComplete({
      excelFileName: excelFile?.name || null,
      uploadedFileData: fileData,
      uploadedFileMimeType: processedMimeType || 'text/csv',
      googleSheetUrl: sheetUrl || null,
      notebookLmUrl: notebookUrl || null,
      geminiApiKey: manualApiKey || null,
      lastVerified: new Date()
    });
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 font-pretendard">
      <div className="max-w-4xl w-full bg-[#1A2332] rounded-2xl border border-[#2A3342] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Info Panel */}
        <div className="md:w-1/3 bg-[#0A1628] p-8 border-r border-[#2A3342] flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-white">HOTEL THEBORN <span className="text-[#FFD700]">PRO</span></h1>
            <p className="text-gray-400 text-sm mb-6">AI 전략 경영 분석 시스템 설정</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 rounded-full bg-[#4A90E2]/20 text-[#4A90E2] flex items-center justify-center">1</div>
                <span>데이터 소스 업로드</span>
              </div>
              <div className="h-8 w-px bg-[#2A3342] ml-4"></div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status.api === 'success' ? 'bg-[#50C878]/20 text-[#50C878]' : 'bg-[#2A3342] text-gray-500'}`}>
                  2
                </div>
                <span>API Key 직접 입력</span>
              </div>
              <div className="h-8 w-px bg-[#2A3342] ml-4"></div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center">3</div>
                <span>분석 리포트 생성</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-8">
            v2.5.5 Build 20250110
          </div>
        </div>

        {/* Right: Configuration Form */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Database size={20} className="text-[#4A90E2]" />
            시스템 통합 설정
          </h2>

          <div className="space-y-6">
            
            {/* 1. Excel Upload */}
            <div className={`p-4 rounded-xl border transition-all ${status.excel === 'success' ? 'bg-[#50C878]/10 border-[#50C878]' : 'bg-[#0A1628] border-[#2A3342]'}`}>
              <div className="flex justify-between items-start mb-2">
                <label className="flex items-center gap-2 font-semibold text-gray-200">
                  <FileSpreadsheet size={18} />
                  손익 및 점유율 데이터 (Excel/CSV)
                </label>
                {status.excel === 'verifying' && <Loader2 size={16} className="animate-spin text-[#4A90E2]" />}
                {status.excel === 'success' && <CheckCircle size={16} className="text-[#50C878]" />}
                {status.excel === 'error' && <AlertCircle size={16} className="text-[#E74C3C]" />}
              </div>
              <input 
                type="file" 
                id="excel-upload"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label 
                htmlFor="excel-upload"
                className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#2A3342] rounded-lg cursor-pointer hover:border-[#4A90E2] hover:bg-[#2A3342] transition-colors group"
              >
                {excelFile ? (
                  <span className="text-[#50C878] font-medium flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    {excelFile.name} (변환 완료)
                  </span>
                ) : (
                  <div className="text-center text-gray-500 group-hover:text-gray-300">
                    <Upload size={24} className="mx-auto mb-2" />
                    <span className="text-sm">클릭하여 파일 업로드 (Excel 자동 변환)</span>
                  </div>
                )}
              </label>
            </div>

            {/* 2. Google Sheets */}
            <div className={`p-4 rounded-xl border transition-all ${status.sheet === 'success' ? 'bg-[#50C878]/10 border-[#50C878]' : 'bg-[#0A1628] border-[#2A3342]'}`}>
              <div className="flex justify-between items-start mb-2">
                <label className="flex items-center gap-2 font-semibold text-gray-200">
                  <LinkIcon size={18} />
                  Google Sheets 링크
                </label>
                {status.sheet === 'verifying' && <Loader2 size={16} className="animate-spin text-[#4A90E2]" />}
                {status.sheet === 'success' && <CheckCircle size={16} className="text-[#50C878]" />}
              </div>
              <input 
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => handleUrlInput('sheet', e.target.value)}
                onBlur={() => handleUrlBlur('sheet')}
                className="w-full bg-[#1A2332] border border-[#2A3342] rounded-lg px-3 py-2 text-sm text-white focus:border-[#4A90E2] outline-none"
              />
            </div>

            {/* 3. NotebookLM */}
            <div className={`p-4 rounded-xl border transition-all ${status.notebook === 'success' ? 'bg-[#50C878]/10 border-[#50C878]' : 'bg-[#0A1628] border-[#2A3342]'}`}>
              <div className="flex justify-between items-start mb-2">
                <label className="flex items-center gap-2 font-semibold text-gray-200">
                  <Database size={18} />
                  NotebookLM 링크
                </label>
                {status.notebook === 'verifying' && <Loader2 size={16} className="animate-spin text-[#4A90E2]" />}
                {status.notebook === 'success' && <CheckCircle size={16} className="text-[#50C878]" />}
              </div>
              <input 
                type="text"
                placeholder="https://notebooklm.google.com/notebook/..."
                value={notebookUrl}
                onChange={(e) => handleUrlInput('notebook', e.target.value)}
                onBlur={() => handleUrlBlur('notebook')}
                className="w-full bg-[#1A2332] border border-[#2A3342] rounded-lg px-3 py-2 text-sm text-white focus:border-[#4A90E2] outline-none"
              />
            </div>

            {/* 4. Gemini API Key Integration (Manual Input) */}
            <div className={`p-4 rounded-xl border transition-all ${status.api === 'success' ? 'bg-[#50C878]/10 border-[#50C878]' : status.api === 'error' ? 'bg-[#E74C3C]/10 border-[#E74C3C]' : 'bg-[#0A1628] border-[#2A3342]'}`}>
              <div className="flex justify-between items-start mb-3">
                <label className="flex items-center gap-2 font-semibold text-gray-200">
                  <Server size={18} />
                  Gemini API Key 설정
                </label>
                {status.api === 'verifying' && <Loader2 size={16} className="animate-spin text-[#4A90E2]" />}
                {status.api === 'success' && <ShieldCheck size={16} className="text-[#50C878]" />}
                {status.api === 'error' && <AlertCircle size={16} className="text-[#E74C3C]" />}
              </div>
              
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">
                  보안을 위해 API Key를 수동으로 입력 후 연결해주세요.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="password"
                      value={manualApiKey}
                      onChange={(e) => setManualApiKey(e.target.value)}
                      placeholder="AI Studio API Key 입력"
                      className="w-full bg-[#1A2332] border border-[#2A3342] rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-[#4A90E2] outline-none placeholder-gray-600"
                      disabled={status.api === 'success'}
                    />
                  </div>
                  <button
                    onClick={handleApiVerification}
                    disabled={!manualApiKey || status.api === 'verifying' || status.api === 'success'}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap
                      ${status.api === 'success' 
                        ? 'bg-[#50C878]/20 text-[#50C878] cursor-default' 
                        : 'bg-[#4A90E2] hover:bg-[#357ABD] text-white disabled:bg-[#2A3342] disabled:text-gray-500'}
                    `}
                  >
                    {status.api === 'success' ? '연결됨' : '연결 확인'}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinish}
              disabled={!isAllVerified && status.api !== 'success'}
              className="w-full py-4 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20"
            >
              분석 대시보드 진입
              <ArrowRight size={18} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;