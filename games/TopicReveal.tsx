import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, HelpCircle, Eye, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS, THEME_BG_LIGHT, THEME_TEXT_COLORS } from '../types';

interface Card {
    id: number;
    content: string;
    isRevealed: boolean;
}

export const TopicReveal: React.FC = () => {
    const { themeColor } = useClass();
    const [cards, setCards] = useState<Card[]>([]);
    const [input, setInput] = useState('');
    const [isSetup, setIsSetup] = useState(true);

    const addCard = () => {
        if (!input.trim()) return;
        setCards([...cards, { id: Date.now(), content: input, isRevealed: false }]);
        setInput('');
    };

    const removeCard = (id: number) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const toggleReveal = (id: number) => {
        setCards(cards.map(c => c.id === id ? { ...c, isRevealed: !c.isRevealed } : c));
    };

    const resetAll = () => {
        setCards(cards.map(c => ({ ...c, isRevealed: false })));
    };

    if (isSetup) {
        return (
            <div className="max-w-2xl mx-auto py-8 animate-fade-in">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <Unlock className={THEME_TEXT_COLORS[themeColor]} />
                        Setup Mystery Board
                    </h2>
                    
                    <div className="flex gap-4 mb-8">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCard()}
                            placeholder="Enter a topic, question, or reward..."
                            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-300 font-medium"
                        />
                        <Button onClick={addCard} icon={<Plus size={20}/>}>Add</Button>
                    </div>

                    <div className="space-y-2 mb-8 max-h-[400px] overflow-y-auto">
                        {cards.length === 0 && <div className="text-center text-slate-400 py-4">No cards added yet.</div>}
                        {cards.map((card, i) => (
                            <div key={card.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                    <span className="font-bold text-slate-700">{card.content}</span>
                                </div>
                                <button onClick={() => removeCard(card.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>

                    <Button onClick={() => setIsSetup(false)} disabled={cards.length === 0} className="w-full">
                        Start Game
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 animate-fade-in">
             <div className="flex justify-between items-center mb-8">
                <Button variant="secondary" onClick={() => setIsSetup(true)}>Edit Board</Button>
                <h1 className="text-2xl font-black text-slate-800">Topic Reveal</h1>
                <Button variant="secondary" onClick={resetAll}>Hide All</Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {cards.map((card, i) => (
                     <div key={card.id} className="aspect-[4/3] perspective-1000 group cursor-pointer" onClick={() => toggleReveal(card.id)}>
                         <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${card.isRevealed ? 'rotate-y-180' : ''}`}>
                             
                             {/* Front */}
                             <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-lg border-b-8 border-r-8 border-black/10 flex flex-col items-center justify-center ${THEME_COLORS[themeColor]} hover:brightness-110 transition-all`}>
                                 <HelpCircle size={64} className="text-white/20 mb-2" />
                                 <span className="text-6xl font-black text-white/40">{i + 1}</span>
                             </div>

                             {/* Back */}
                             <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl border-2 border-slate-100 flex items-center justify-center p-6 text-center transform">
                                 <p className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                                     {card.content}
                                 </p>
                             </div>

                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};