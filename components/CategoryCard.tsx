import React from 'react';
import { Category } from '../types';
import { COLORS } from '../constants';

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl flex flex-col items-start justify-between transition-all duration-300 group
        ${isSelected 
          ? 'bg-[#1A2332] border-2 shadow-[0_0_20px_rgba(74,144,226,0.3)]' 
          : 'bg-[#1A2332] border border-[#2A3342] hover:bg-[#2A3342] hover:border-[#4A90E2]'}
      `}
      style={{
        borderColor: isSelected ? category.color : undefined
      }}
    >
      <div 
        className="p-2 rounded-lg mb-3 transition-colors"
        style={{ 
          backgroundColor: isSelected ? `${category.color}20` : 'rgba(255,255,255,0.05)',
          color: category.color
        }}
      >
        {category.icon}
      </div>
      
      <div className="text-left">
        <h3 className="text-sm font-bold text-white mb-1">{category.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      {isSelected && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${category.color}10 0%, transparent 100%)`
          }}
        />
      )}
    </button>
  );
};

export default CategoryCard;