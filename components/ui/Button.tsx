import React from 'react';
import { useClass } from '../../context/ClassContext';
import { THEME_COLORS } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const { themeColor } = useClass();
  
  let baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  let variantStyles = "";

  switch (variant) {
    case 'primary':
      variantStyles = `${THEME_COLORS[themeColor]} text-white shadow-lg shadow-indigo-200 hover:opacity-90`;
      break;
    case 'secondary':
      variantStyles = "bg-white text-slate-700 shadow-md hover:bg-slate-50";
      break;
    case 'outline':
      variantStyles = "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50";
      break;
    case 'ghost':
      variantStyles = "text-slate-600 hover:bg-slate-100";
      break;
    case 'danger':
      variantStyles = "bg-red-50 text-red-600 hover:bg-red-100";
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};