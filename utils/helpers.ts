import { Student } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const parseStudentInput = (text: string): Student[] => {
  return text
    .split(/\n|,/) // Split by newline or comma
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(name => ({
      id: generateId(),
      name
    }));
};

// Simple particle explosion for fun effects
export const triggerConfetti = (x: number, y: number) => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = '8px';
    el.style.height = '8px';
    el.style.backgroundColor = color;
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 4;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let posX = 0;
    let posY = 0;
    let opacity = 1;

    const animate = () => {
      posX += vx;
      posY += vy + 0.2; // Gravity
      opacity -= 0.02;

      el.style.transform = `translate(${posX}px, ${posY}px)`;
      el.style.opacity = opacity.toString();

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };
    requestAnimationFrame(animate);
  }
};