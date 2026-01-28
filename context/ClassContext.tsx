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
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

const STORAGE_KEY = 'landecs_classplay_v1';

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState<string>('My Class');
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
  const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed.students || []);
        setClassName(parsed.className || 'My Class');
        setThemeColor(parsed.themeColor || 'indigo');
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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [students, className, themeColor]);

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
        setActiveGame(GameType.NONE);
        localStorage.removeItem(STORAGE_KEY);
    }
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
      resetSession
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