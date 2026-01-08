import React from 'react';

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  kpis: string[];
}

export interface KPI {
  label: string;
  value: string;
  trend: number; // percentage
  trendLabel: string; // e.g., "vs last month"
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number; // For comparison or secondary metrics
}

export interface AnalysisResult {
  categoryId: string;
  summary: string;
  kpis: KPI[];
  chartData: ChartDataPoint[];
  chartType: 'area' | 'line' | 'bar' | 'pie' | 'composed';
  insights: string[];
  actions: {
    shortTerm: string[];
    midTerm: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface AppConfig {
  isConfigured: boolean;
  excelFileName: string | null;
  uploadedFileData: string | null; // Base64 encoded data
  uploadedFileMimeType: string | null;
  googleSheetUrl: string | null;
  notebookLmUrl: string | null;
  lastVerified: Date | null;
  geminiApiKey?: string | null;
}