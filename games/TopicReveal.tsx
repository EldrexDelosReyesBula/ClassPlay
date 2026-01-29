import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, HelpCircle, Eye, Unlock, Edit2, Check, X, Shuffle, Tag, Layout } from 'lucide-react';
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
        // Auto-add emoji if none exists and no emoji was typed
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
            <div className="max-w-4xl mx-auto py-8 animate-fade-in pb-32">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <Unlock className={THEME_TEXT_COLORS[themeColor]} />
                        Setup Mystery Board
                    </h2>
                    
                    <div className="flex gap-4 mb-8">
                        <div className="flex-1 relative">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCard()}
                                placeholder="Enter a topic, question, or reward..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-300 font-medium transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-lg border border-slate-100">
                                Press Enter
                            </div>
                        </div>
                        <Button onClick={addCard} icon={<Plus size={20}/>} className="rounded-2xl">Add</Button>
                    </div>

                    <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto pr-2">
                        {cards.length === 0 && (
                            <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                <Layout size={48} className="mx-auto mb-4 opacity-20"/>
                                <p className="font-medium">No cards added yet.</p>
                                <p className="text-sm opacity-60">Add topics above to get started.</p>
                            </div>
                        )}
                        {cards.map((card, i) => (
                            <div key={card.id} className="flex justify-between items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-slate-200 hover:shadow-sm">
                                <div className="flex items-start gap-4 flex-1">
                                    <span className="w-8 h-8 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-1">{i + 1}</span>
                                    
                                    {editingId === card.id ? (
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                                    <Tag size={10} /> Group / Title (Front)
                                                </label>
                                                <input 
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    placeholder="Optional Label (e.g. 'Group 1')"
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:border-indigo-300 focus:outline-none w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Topic / Reward (Back)
                                                </label>
                                                <input 
                                                    autoFocus
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                    className="px-3 py-2 rounded-xl border border-indigo-300 focus:outline-none bg-white font-bold text-slate-800 text-lg shadow-sm w-full"
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <Button onClick={saveEdit} className="!py-2 !px-4 !text-sm !rounded-xl bg-green-500 hover:bg-green-600 shadow-green-200">
                                                    <Check size={16}/> Save
                                                </Button>
                                                <Button onClick={cancelEdit} variant="secondary" className="!py-2 !px-4 !text-sm !rounded-xl">
                                                    <X size={16}/> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col py-1">
                                            {card.title && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md w-fit mb-1">
                                                    {card.title}
                                                </span>
                                            )}
                                            <span className="font-bold text-slate-700 text-lg leading-snug">{card.content}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {editingId !== card.id && (
                                    <div className="flex gap-1 ml-4">
                                        <button onClick={() => startEditing(card)} className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-sm">
                                            <Edit2 size={18}/>
                                        </button>
                                        <button onClick={() => removeCard(card.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-sm">
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={shuffleCards} disabled={cards.length < 2} icon={<Shuffle size={18}/>} className="flex-1">
                            Shuffle
                        </Button>
                        <Button onClick={() => setIsSetup(false)} disabled={cards.length === 0} className="flex-[2] shadow-xl shadow-indigo-200">
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
                <Button variant="secondary" onClick={() => setIsSetup(true)} icon={<Edit2 size={16}/>}>Edit Board</Button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg md:text-2xl font-black text-slate-800">Topic Reveal</h1>
                    <span className="text-xs text-slate-400 font-bold">{cards.filter(c => !c.isRevealed).length} Hidden</span>
                </div>
                <Button variant="secondary" onClick={resetAll} icon={<Eye size={16}/>}>Hide All</Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {cards.map((card, i) => (
                     <div key={card.id} className="aspect-[4/3] perspective-1000 group cursor-pointer" onClick={() => toggleReveal(card.id)}>
                         <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${card.isRevealed ? 'rotate-y-180' : ''}`}>
                             
                             {/* Front */}
                             <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-lg border-b-8 border-r-8 border-black/10 flex flex-col items-center justify-center ${THEME_COLORS[themeColor]} hover:brightness-110 transition-all`}>
                                 <HelpCircle size={64} className="text-white/20 mb-2" />
                                 <span className="text-2xl md:text-4xl font-black text-white/90 text-center px-4 leading-tight">
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