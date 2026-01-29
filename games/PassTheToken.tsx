import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { Play, Pause, Square, User, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
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
        if (!isRunning) {
            setIsRunning(true);
        }
        
        // Spin fast then stop
        setSpeed(50);
        
        // Sequence to slow down
        setTimeout(() => {
            setSpeed(100);
            setTimeout(() => {
                setSpeed(300);
                setTimeout(() => {
                    setIsRunning(false);
                }, 1000);
            }, 800);
        }, 1000);
    };

    if (students.length === 0) return <div className="text-center p-10 text-slate-400">Add students to play.</div>;

    return (
        <div className="flex flex-col items-center justify-center py-4 md:py-8 animate-fade-in w-full pb-48">
            {/* Header Controls - Pill Style */}
            <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100 mb-8 flex items-center">
                <button 
                    onClick={toggleRun} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                        isRunning 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {isRunning ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
                    <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <button 
                    onClick={stopRandom} 
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
                >
                    <Square size={18} fill="currentColor"/>
                    <span>Stop</span>
                </button>
            </div>

            {/* Visual Arena */}
            <div className="relative w-full max-w-4xl flex items-center justify-center min-h-[500px]">
                 {/* Center Token Display */}
                 <div className="absolute z-20 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border-4 border-slate-100 w-40 h-40 md:w-56 md:h-56 text-center transform transition-transform duration-300 hover:scale-105">
                     <span className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Current Turn</span>
                     {activeIndex !== null ? (
                         <motion.h2 
                            key={activeIndex}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-xl md:text-3xl font-black ${THEME_TEXT_COLORS[themeColor]} line-clamp-2 px-2`}
                         >
                             {students[activeIndex].name}
                         </motion.h2>
                     ) : (
                         <span className="text-slate-300 font-bold">Waiting...</span>
                     )}
                 </div>

                 {/* Grid */}
                 <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 p-4 pb-20">
                    {students.map((student, i) => (
                        <motion.div
                            key={student.id}
                            animate={{
                                scale: activeIndex === i ? 1.05 : 1,
                                borderColor: activeIndex === i ? 'var(--theme-color)' : 'transparent',
                                backgroundColor: activeIndex === i ? '#fff' : 'rgba(255,255,255,0.5)'
                            }}
                            className={`relative p-3 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors duration-200 aspect-square ${activeIndex === i ? 'shadow-lg z-10' : 'border-transparent bg-slate-50/50'}`}
                        >
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors duration-200 ${activeIndex === i ? `${THEME_BG_LIGHT[themeColor]} ${THEME_TEXT_COLORS[themeColor]}` : 'bg-slate-200 text-slate-400'}`}>
                                <User size={16} />
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold text-center truncate w-full ${activeIndex === i ? 'text-slate-800' : 'text-slate-400'}`}>
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