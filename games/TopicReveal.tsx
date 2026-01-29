import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, HelpCircle, Eye, Unlock, Edit2, Check, X, Shuffle, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS, THEME_BG_LIGHT, THEME_TEXT_COLORS } from '../types';
import { shuffleArray } from '../utils/helpers';

interface Card {
    id: number;
    title?: string;
    content: string;
    isRevealed: boolean;
}

const EMOJIS = ['🌟', '🔥', '💡', '🚀', '🎨', '🏆', '🧩', '🎲', '🎸', '🍎', '🌈', '⚡', '💎', '🔑', '🎁', '🎈'];

export const TopicReveal: React.FC = () => {
    const { themeColor } = useClass();
    const [cards, setCards] = useState<Card[]>([]);
    const [input, setInput] = useState('');
    const [isSetup, setIsSetup] = useState(true);

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const addCard = () => {
        if (!input.trim()) return;
        
        let content = input.trim();
        // Auto-add emoji if none exists
        const hasEmoji = /\p{Emoji}/u.test(content);
        if (!hasEmoji) {
             const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
             content = `${randomEmoji} ${content}`;
        }

        setCards([...cards, { id: Date.now(), content: content, isRevealed: false }]);
        setInput('');
    };

    const removeCard = (id: number) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const startEditing = (card: Card) => {
        setEditingId(card.id);
        setEditContent(card.content);
        setEditTitle(card.title || '');
    };

    const saveEdit = () => {
        if (!editContent.trim()) return;
        setCards(cards.map(c => c.id === editingId ? { ...c, content: editContent, title: editTitle.trim() || undefined } : c));
        setEditingId(null);
        setEditContent('');
        setEditTitle('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
        setEditTitle('');
    };

    const toggleReveal = (id: number) => {
        setCards(cards.map(c => c.id === id ? { ...c, isRevealed: !c.isRevealed } : c));
    };

    const resetAll = () => {
        setCards(cards.map(c => ({ ...c, isRevealed: false })));
    };

    const shuffleCards = () => {
        setCards(shuffleArray([...cards]));
    };

    if (isSetup) {
        return (
            <div className="max-w-3xl mx-auto py-8 animate-fade-in">
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

                    <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2">
                        {cards.length === 0 && <div className="text-center text-slate-400 py-4">No cards added yet.</div>}
                        {cards.map((card, i) => (
                            <div key={card.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                                    
                                    {editingId === card.id ? (
                                        <div className="flex-1 flex flex-col gap-2">
                                            <input 
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Label (Optional)"
                                                className="px-2 py-1 rounded border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/2"
                                            />
                                            <div className="flex gap-2">
                                                <input 
                                                    autoFocus
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                    className="flex-1 px-2 py-1 rounded border border-indigo-300 focus:outline-none bg-white font-bold text-slate-800"
                                                />
                                                <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                                                <button onClick={cancelEdit} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {card.title && <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>}
                                            <span className="font-bold text-slate-700 truncate">{card.content}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {editingId !== card.id && (
                                    <div className="flex gap-1">
                                        <button onClick={() => startEditing(card)} className="text-slate-400 hover:text-indigo-500 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Edit2 size={16}/>
                                        </button>
                                        <button onClick={() => removeCard(card.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={shuffleCards} disabled={cards.length < 2} icon={<Shuffle size={18}/>} className="flex-1">
                            Shuffle
                        </Button>
                        <Button onClick={() => setIsSetup(false)} disabled={cards.length === 0} className="flex-[2]">
                            Start Game
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 animate-fade-in pb-32">
             <div className="flex justify-between items-center mb-8 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <Button variant="secondary" onClick={() => setIsSetup(true)}>Edit</Button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg md:text-2xl font-black text-slate-800">Topic Reveal</h1>
                    <span className="text-xs text-slate-400 font-bold">{cards.filter(c => !c.isRevealed).length} Hidden</span>
                </div>
                <Button variant="secondary" onClick={resetAll}>Hide All</Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {cards.map((card, i) => (
                     <div key={card.id} className="aspect-[4/3] perspective-1000 group cursor-pointer" onClick={() => toggleReveal(card.id)}>
                         <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${card.isRevealed ? 'rotate-y-180' : ''}`}>
                             
                             {/* Front */}
                             <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-lg border-b-8 border-r-8 border-black/10 flex flex-col items-center justify-center ${THEME_COLORS[themeColor]} hover:brightness-110 transition-all`}>
                                 <HelpCircle size={64} className="text-white/20 mb-2" />
                                 <span className="text-4xl md:text-6xl font-black text-white/40">
                                    {card.title ? card.title : (i + 1)}
                                 </span>
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