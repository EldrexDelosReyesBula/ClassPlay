import React, { useState } from 'react';
import { LucideIcon, Edit2, Check } from 'lucide-react';
import { useClass } from '../../context/ClassContext';
import { THEME_BG_LIGHT, THEME_TEXT_COLORS, GameType } from '../../types';
import { Modal } from './Modal';
import * as Icons from 'lucide-react';

interface GameCardProps {
  gameType: GameType;
  title: string;
  description: string;
  defaultIcon: LucideIcon;
  onClick: () => void;
}

// Predefined list of safe/relevant icons for schools
const AVAILABLE_ICONS = [
    'LayoutGrid', 'Grip', 'Disc', 'Repeat', 'Presentation', 'HelpCircle', 
    'ListOrdered', 'Dices', 'Zap', 'Star', 'Trophy', 'Lightbulb', 
    'Target', 'Compass', 'Map', 'BookOpen', 'PenTool', 'Smile'
];

export const GameCard: React.FC<GameCardProps> = ({ gameType, title, description, defaultIcon, onClick }) => {
  const { themeColor, customIcons, setCustomIcon } = useClass();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingIcon, setIsEditingIcon] = useState(false);

  // Resolve Icon
  const iconName = customIcons[gameType];
  const DisplayIcon = iconName && (Icons as any)[iconName] ? (Icons as any)[iconName] : defaultIcon;

  const handleIconSelect = (name: string) => {
      setCustomIcon(gameType, name);
      setIsEditingIcon(false);
  };

  return (
    <>
    <div 
        className="group relative flex flex-col items-start p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
    >
      <div className="flex justify-between w-full">
        <div className={`mb-4 p-4 rounded-2xl ${THEME_BG_LIGHT[themeColor]} ${THEME_TEXT_COLORS[themeColor]} group-hover:scale-110 transition-transform duration-300`}>
            <DisplayIcon size={32} strokeWidth={1.5} />
        </div>
        
        {/* Edit Icon Button - Visible on Hover */}
        <button 
            onClick={(e) => { e.stopPropagation(); setIsEditingIcon(true); }}
            className={`h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            title="Change Icon"
        >
            <Edit2 size={14} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
         <DisplayIcon size={80} />
      </div>
    </div>

    {/* Icon Selection Modal */}
    <Modal 
        isOpen={isEditingIcon} 
        onClose={() => setIsEditingIcon(false)}
        title={`Customize Icon for ${title}`}
    >
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 p-2">
            {AVAILABLE_ICONS.map(name => {
                const Icon = (Icons as any)[name];
                const isSelected = iconName === name || (!iconName && Icon === defaultIcon);
                return (
                    <button
                        key={name}
                        onClick={() => handleIconSelect(name)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${isSelected ? `bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Icon size={24} />
                        {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />}
                    </button>
                )
            })}
        </div>
    </Modal>
    </>
  );
};