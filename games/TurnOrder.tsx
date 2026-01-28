import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { shuffleArray } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { ListOrdered, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_TEXT_COLORS, THEME_BG_LIGHT } from '../types';

export const TurnOrder: React.FC = () => {
  const { students, themeColor } = useClass();
  const [order, setOrder] = useState<string[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);

  const generateOrder = () => {
    const shuffled = shuffleArray(students.map(s => s.name));
    setOrder(shuffled);
    setRevealedIndex(-1);
  };

  const revealNext = () => {
    if (revealedIndex < order.length - 1) {
      setRevealedIndex(prev => prev + 1);
    }
  };

  const revealAll = () => {
    setRevealedIndex(order.length - 1);
  };

  if (students.length === 0) return <div className="text-center p-10 text-slate-400">Add students first.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2">
                <ListOrdered className={THEME_TEXT_COLORS[themeColor]} />
                <h2 className="text-xl font-bold">Turn Order</h2>
             </div>
             <div className="flex gap-2">
                <Button onClick={generateOrder} variant="secondary">
                    {order.length > 0 ? 'Reshuffle' : 'Generate Order'}
                </Button>
                {order.length > 0 && (
                     <Button onClick={revealNext} disabled={revealedIndex >= order.length - 1}>
                        Reveal Next
                     </Button>
                )}
             </div>
        </div>

        <div className="space-y-3">
            <AnimatePresence>
                {order.map((name, index) => (
                    <motion.div
                        key={`${name}-${index}`} // Key by index to allow reshuffling animation
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                            opacity: index <= revealedIndex ? 1 : 0.3,
                            x: 0,
                            scale: index === revealedIndex ? 1.02 : 1
                        }}
                        className={`flex items-center p-4 rounded-2xl border ${index <= revealedIndex ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}
                    >
                        <div className={`w-10 h-10 rounded-full ${index <= revealedIndex ? THEME_BG_LIGHT[themeColor] : 'bg-slate-200'} flex items-center justify-center font-bold mr-4 transition-colors`}>
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            {index <= revealedIndex ? (
                                <motion.span 
                                    initial={{ filter: 'blur(10px)' }}
                                    animate={{ filter: 'blur(0px)' }}
                                    className="text-lg font-bold text-slate-800"
                                >
                                    {name}
                                </motion.span>
                            ) : (
                                <span className="text-slate-400 font-medium">???</span>
                            )}
                        </div>
                        {index === revealedIndex && (
                            <ArrowDown size={20} className="text-slate-300 animate-bounce" />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        
        {order.length > 0 && revealedIndex < order.length - 1 && (
            <div className="mt-8 text-center">
                <button onClick={revealAll} className="text-sm text-slate-400 hover:text-slate-600 underline">
                    Reveal All
                </button>
            </div>
        )}
    </div>
  );
};