import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, GameType, ThemeColor } from '../types';

interface ClassContextType {
  students: Student[];
  setStudents: (students: Student[]) => void;
  className: string;
  setClassName: (name: string) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
  addStudent: (name: string) => void;
  removeStudent: (id: string) => void;
  resetSession: () => void;
  // New features
  customIcons: Record<string, string>; // GameType -> IconName
  setCustomIcon: (gameType: GameType, iconName: string) => void;
  analyticsConsent: boolean | null;
  setAnalyticsConsent: (consent: boolean) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

const STORAGE_KEY = 'landecs_classplay_v1';

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState<string>('My Class');
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
  const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});
  const [analyticsConsent, setAnalyticsConsentState] = useState<boolean | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed.students || []);
        setClassName(parsed.className || 'My Class');
        setThemeColor(parsed.themeColor || 'indigo');
        setCustomIcons(parsed.customIcons || {});
        
        if (parsed.analyticsConsent !== undefined) {
            setAnalyticsConsentState(parsed.analyticsConsent);
        }
      } catch (e) {
        console.error("Failed to load saved session", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const state = {
      students,
      className,
      themeColor,
      customIcons,
      analyticsConsent
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [students, className, themeColor, customIcons, analyticsConsent]);

  const addStudent = (name: string) => {
    setStudents(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name }]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const resetSession = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        setStudents([]);
        setClassName('My Class');
        setThemeColor('indigo');
        setCustomIcons({});
        setActiveGame(GameType.NONE);
        setAnalyticsConsentState(null);
        localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setCustomIcon = (gameType: GameType, iconName: string) => {
      setCustomIcons(prev => ({ ...prev, [gameType]: iconName }));
  };

  const setAnalyticsConsent = (consent: boolean) => {
      setAnalyticsConsentState(consent);
  };

  return (
    <ClassContext.Provider value={{
      students,
      setStudents,
      className,
      setClassName,
      themeColor,
      setThemeColor,
      activeGame,
      setActiveGame,
      addStudent,
      removeStudent,
      resetSession,
      customIcons,
      setCustomIcon,
      analyticsConsent,
      setAnalyticsConsent
    }}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};