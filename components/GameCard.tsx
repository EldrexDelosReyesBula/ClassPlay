import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useClass } from '../context/ClassContext';
import { THEME_BG_LIGHT, THEME_TEXT_COLORS } from '../types';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: string; // Optional override
}

export const GameCard: React.FC<GameCardProps> = ({ title, description, icon: Icon, onClick }) => {
  const { themeColor } = useClass();

  return (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-start p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full"
    >
      <div className={`mb-4 p-4 rounded-2xl ${THEME_BG_LIGHT[themeColor]} ${THEME_TEXT_COLORS[themeColor]} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
         <Icon size={80} />
      </div>
    </button>
  );
};