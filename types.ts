export interface Student {
  id: string;
  name: string;
}

export enum GameType {
  NONE = 'NONE',
  ROULETTE = 'ROULETTE', // Recitation Roulette
  GROUPS = 'GROUPS', // Group Spinner Arena
  DRAFT = 'DRAFT', // Team Draft Table
  PASS_TOKEN = 'PASS_TOKEN', // Pass-the-Token
  PRESENTATION = 'PRESENTATION', // Presentation Quest
  TOPIC_REVEAL = 'TOPIC_REVEAL', // Topic Reveal Board / Mystery Box
  TURN_ORDER = 'TURN_ORDER', // Turn Order Reveal
  DECISIONS = 'DECISIONS', // Dice & Randomizer Hub
  ENERGY = 'ENERGY', // Class Energy Meter
}

export interface AppState {
  students: Student[];
  className: string;
  themeColor: string;
  activeGame: GameType;
  history: string[]; // Log of picked students/actions
}

export type ThemeColor = 'indigo' | 'teal' | 'rose' | 'amber' | 'violet';

export const THEME_COLORS: Record<ThemeColor, string> = {
  indigo: 'bg-indigo-600',
  teal: 'bg-teal-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-600',
  violet: 'bg-violet-600',
};

export const THEME_TEXT_COLORS: Record<ThemeColor, string> = {
  indigo: 'text-indigo-600',
  teal: 'text-teal-600',
  rose: 'text-rose-600',
  amber: 'text-amber-600',
  violet: 'text-violet-600',
};

export const THEME_BG_LIGHT: Record<ThemeColor, string> = {
  indigo: 'bg-indigo-100', // Slightly darker for MD3 Surface Container
  teal: 'bg-teal-100',
  rose: 'bg-rose-100',
  amber: 'bg-amber-100',
  violet: 'bg-violet-100',
};

export const THEME_BORDER: Record<ThemeColor, string> = {
  indigo: 'border-indigo-200',
  teal: 'border-teal-200',
  rose: 'border-rose-200',
  amber: 'border-amber-200',
  violet: 'border-violet-200',
};