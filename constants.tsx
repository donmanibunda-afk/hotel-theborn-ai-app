import React from 'react';
import { 
  DollarSign, 
  Hotel, 
  BarChart3, 
  Utensils, 
  Wallet, 
  Globe, 
  TrendingUp, 
  Users, 
  PieChart, 
  Lightbulb 
} from 'lucide-react';
import { Category, ChartDataPoint } from './types';

export const COLORS = {
  primary: '#4A90E2',      // Main Blue
  secondary: '#FFD700',    // Gold Accent
  background: {
    dark: '#0A1628',       // Main Background
    card: '#1A2332',       // Card Background
    elevated: '#2A3342'    // Elevated Element
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B8C4',
    accent: '#FFD700'
  },
  status: {
    success: '#50C878',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#4A90E2'
  }
};

export const CATEGORIES: Category[] = [
  {
    id: "revenue",
    name: "수익 관리 (RevPAR)",
    icon: <DollarSign className="w-6 h-6" />,
    color: "#FFD700",
    description: "객실 수익 최적화 및 RevPAR 전략",
    kpis: ["RevPAR", "ADR", "OCC", "TRevPAR"]
  },
  {
    id: "occupancy",
    name: "객실 점유율 (OCC)",
    icon: <Hotel className="w-6 h-6" />,
    color: "#4A90E2",
    description: "객실 판매 현황 및 수요 예측",
    kpis: ["점유율", "판매객실수", "가용객실수"]
  },
  {
    id: "pricing",
    name: "가격 전략",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "#50C878",
    description: "동적 가격 설정 및 수익 극대화",
    kpis: ["ADR", "가격탄력성", "경쟁사대비가격"]
  },
  {
    id: "fnb",
    name: "식음료 운영 (F&B)",
    icon: <Utensils className="w-6 h-6" />,
    color: "#FF6B6B",
    description: "레스토랑/조식 매출 및 원가율 관리",
    kpis: ["F&B매출", "원가율", "객단가"]
  },
  {
    id: "cost",
    name: "운영 및 비용 효율",
    icon: <Wallet className="w-6 h-6" />,
    color: "#9B59B6",
    description: "F&B 원가율, 인건비 생산성, 수도광열비 유닛 코스트, CPOR(객실당 원가)",
    kpis: ["CPOR", "인건비생산성", "에너지UnitCost"]
  },
  {
    id: "channel",
    name: "판매 전략",
    icon: <Globe className="w-6 h-6" />,
    color: "#E67E22", 
    description: "과거 데이터 기반 채널별 최적 판매 전략 수립",
    kpis: ["채널Mix", "전략성공률", "채널수익성"]
  },
  {
    id: "forecast",
    name: "수요 예측",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "#E67E22",
    description: "향후 3개월 수요 및 매출 예측",
    kpis: ["예상OCC", "예상매출", "성수기지수"]
  },
  {
    id: "customer",
    name: "가격 민감도 분석",
    icon: <Users className="w-6 h-6" />,
    color: "#1ABC9C",
    description: "가격 상승에 따른 점유율 변화 및 민감도 분석",
    kpis: ["가격탄력성", "ADR저항선", "이탈률"]
  },
  {
    id: "profit",
    name: "재무 및 손익 진단",
    icon: <PieChart className="w-6 h-6" />,
    color: "#3498DB",
    description: "월별 P&L 분석, GOP 마진 관리, 요일별/시즌별 수익 편차 분석",
    kpis: ["영업이익", "GOP마진", "수익편차"]
  },
  {
    id: "strategy",
    name: "전략 제안",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "#F39C12",
    description: "데이터 기반 신규 프로모션 제안",
    kpis: ["전략효과예측", "ROI", "실행우선순위"]
  }
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: 'Jan', value: 4000, value2: 2400 },
  { name: 'Feb', value: 3000, value2: 1398 },
  { name: 'Mar', value: 2000, value2: 9800 },
  { name: 'Apr', value: 2780, value2: 3908 },
  { name: 'May', value: 1890, value2: 4800 },
  { name: 'Jun', value: 2390, value2: 3800 },
  { name: 'Jul', value: 3490, value2: 4300 },
];