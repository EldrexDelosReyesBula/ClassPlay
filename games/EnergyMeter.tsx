import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { motion } from 'framer-motion';
import { Zap, Volume2, VolumeX, Meh, Smile, Frown } from 'lucide-react';
import { THEME_COLORS, THEME_TEXT_COLORS } from '../types';

export const EnergyMeter: React.FC = () => {
    const { themeColor } = useClass();
    const [energy, setEnergy] = useState(50); // 0 to 100

    const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const newEnergy = Math.max(0, Math.min(100, Math.round((x / width) * 100)));
        setEnergy(newEnergy);
    };

    const getEmoji = () => {
        if (energy < 30) return <Frown size={48} />;
        if (energy > 80) return <Zap size={48} />;
        return <Smile size={48} />;
    };

    const getLabel = () => {
        if (energy < 20) return "Sleepy / Low";
        if (energy < 40) return "Calm / Focused";
        if (energy < 70) return "Active / Engaged";
        if (energy < 90) return "High Energy";
        return "Chaotic!";
    };

    const getColor = () => {
        if (energy < 40) return 'bg-teal-500';
        if (energy < 75) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in flex flex-col items-center">
            <h1 className="text-3xl font-black text-slate-800 mb-12">Classroom Energy Meter</h1>

            <div className="relative w-full h-24 bg-slate-200 rounded-full shadow-inner overflow-hidden cursor-pointer" onClick={handleBarClick}>
                 {/* Fill */}
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energy}%` }}
                    className={`h-full ${getColor()} transition-colors duration-500`}
                 />
                 
                 {/* Markers */}
                 <div className="absolute top-0 bottom-0 left-[33%] w-1 bg-white/50" />
                 <div className="absolute top-0 bottom-0 left-[66%] w-1 bg-white/50" />
            </div>

            <div className="mt-12 flex flex-col items-center text-center">
                <motion.div 
                    key={getLabel()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-6xl mb-4 ${energy > 80 ? 'text-rose-500 animate-bounce' : 'text-slate-700'}`}
                >
                    {getEmoji()}
                </motion.div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">{energy}%</h2>
                <p className="text-xl text-slate-500 font-medium">{getLabel()}</p>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-2xl">
                 <button onClick={() => setEnergy(20)} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-500 hover:text-teal-600">
                     <VolumeX size={32} />
                     <span className="font-bold">Quiet</span>
                 </button>
                 <button onClick={() => setEnergy(50)} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-500 hover:text-amber-600">
                     <Smile size={32} />
                     <span className="font-bold">Normal</span>
                 </button>
                 <button onClick={() => setEnergy(90)} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-500 hover:text-rose-600">
                     <Volume2 size={32} />
                     <span className="font-bold">Loud</span>
                 </button>
            </div>
        </div>
    );
};