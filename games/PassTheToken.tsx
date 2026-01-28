import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Play, Pause, FastForward, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS, THEME_BG_LIGHT, THEME_TEXT_COLORS } from '../types';

export const PassTheToken: React.FC = () => {
    const { students, themeColor } = useClass();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(300); // ms per move

    const toggleRun = () => setIsRunning(!isRunning);

    useEffect(() => {
        let interval: any;
        if (isRunning && students.length > 0) {
            interval = setInterval(() => {
                setActiveIndex(prev => {
                    if (prev === null) return 0;
                    return (prev + 1) % students.length;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isRunning, students.length, speed]);

    const stopRandom = () => {
        // Spin fast then stop
        setSpeed(50);
        setIsRunning(true);
        
        setTimeout(() => {
            setSpeed(100);
            setTimeout(() => {
                setSpeed(300);
                setTimeout(() => {
                    setIsRunning(false);
                    // Determine winner visually
                }, 1000);
            }, 800);
        }, 1000);
    };

    if (students.length === 0) return <div className="text-center p-10 text-slate-400">Add students to play.</div>;

    // Layout Logic: Circle
    const radius = 250; // px
    const centerX = 300;
    const centerY = 300;

    return (
        <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
            {/* Header Controls */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8 flex gap-4">
                <Button onClick={toggleRun} icon={isRunning ? <Pause size={20}/> : <Play size={20} />}>
                    {isRunning ? 'Pause' : 'Start Passing'}
                </Button>
                <Button variant="secondary" onClick={stopRandom} icon={<FastForward size={20}/>}>
                    Random Stop
                </Button>
            </div>

            {/* Visual Arena */}
            <div className="relative w-[340px] h-[340px] md:w-[600px] md:h-[600px] flex items-center justify-center">
                 {/* Center Token Display */}
                 <div className="absolute z-20 flex flex-col items-center justify-center p-6 bg-white rounded-full shadow-2xl border-4 border-slate-100 w-48 h-48 text-center">
                     <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Current Turn</span>
                     {activeIndex !== null ? (
                         <motion.h2 
                            key={activeIndex}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-2xl font-black ${THEME_TEXT_COLORS[themeColor]}`}
                         >
                             {students[activeIndex].name}
                         </motion.h2>
                     ) : (
                         <span className="text-slate-300 font-bold">Waiting...</span>
                     )}
                 </div>

                 {/* Students Circle */}
                 {students.map((student, i) => {
                     // Calculate position based on index
                     const total = students.length;
                     const angle = (i / total) * 2 * Math.PI - Math.PI / 2; // Start at top
                     
                     // Adaptive radius based on screen size (handled via responsive container but logic here is px based)
                     // For simplicity in this specialized view, we use CSS transforms mostly, but calculated positions are cleaner for circle
                     // Using a simpler Grid for mobile fallback, Circle for Desktop could be better. 
                     // Let's do a flex grid that pulses for robustness on all screens instead of hard SVG circle.
                     
                     return null; 
                 })}
                 
                 {/* 
                    Fallback: Since Circular layout with absolute positioning is hard to make responsive 
                    perfectly without complex math in ResizeObserver, let's use a Card Grid where the "Token"
                    jumps between cards visually.
                 */}
                 
                 <div className="w-full h-full grid grid-cols-3 md:grid-cols-4 gap-4 content-center">
                    {students.map((student, i) => (
                        <motion.div
                            key={student.id}
                            animate={{
                                scale: activeIndex === i ? 1.1 : 1,
                                borderColor: activeIndex === i ? 'var(--theme-color)' : 'transparent',
                                backgroundColor: activeIndex === i ? '#fff' : 'rgba(255,255,255,0.5)'
                            }}
                            className={`relative p-3 rounded-xl flex flex-col items-center justify-center border-2 transition-colors duration-200 ${activeIndex === i ? 'shadow-lg z-10' : 'border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors duration-200 ${activeIndex === i ? `${THEME_BG_LIGHT[themeColor]} ${THEME_TEXT_COLORS[themeColor]}` : 'bg-slate-200 text-slate-400'}`}>
                                <User size={16} />
                            </div>
                            <span className={`text-xs font-bold text-center truncate w-full ${activeIndex === i ? 'text-slate-800' : 'text-slate-400'}`}>
                                {student.name}
                            </span>
                            
                            {activeIndex === i && (
                                <motion.div 
                                    layoutId="token"
                                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${THEME_COLORS[themeColor]} border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold`}
                                >
                                    ★
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                 </div>
            </div>
        </div>
    );
};