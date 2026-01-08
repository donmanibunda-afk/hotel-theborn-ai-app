import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AnalysisResult } from '../types';
import { COLORS } from '../constants';

interface AnalysisChartProps {
  data: AnalysisResult['chartData'];
  type: AnalysisResult['chartType'];
  color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1628] border border-[#2A3342] p-3 rounded-lg shadow-xl">
        <p className="text-gray-300 text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, type, color }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3342" />
            <XAxis dataKey="name" stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} name="Current" />
            <Line type="monotone" dataKey="value2" stroke="#B0B8C4" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Previous" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3342" />
            <XAxis dataKey="name" stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} name="Current" />
            <Bar dataKey="value2" fill="#2A3342" radius={[4, 4, 0, 0]} name="Target" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
             <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={[color, '#4A90E2', '#50C878', '#FF6B6B'][index % 4]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3342" />
            <XAxis dataKey="name" stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#B0B8C4" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color${color.replace('#', '')})`} 
              strokeWidth={3}
              name="Performance"
            />
          </AreaChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default AnalysisChart;