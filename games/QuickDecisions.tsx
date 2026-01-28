import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Timer } from 'lucide-react';

const DiceFace = ({ val }: { val: number }) => {
    const icons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[val];
    return <Icon size={120} strokeWidth={1} />;
};

export const QuickDecisions: React.FC = () => {
    const [diceVal, setDiceVal] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    
    const [coinSide, setCoinSide] = useState<'HEADS' | 'TAILS'>('HEADS');
    const [isFlipping, setIsFlipping] = useState(false);

    const rollDice = () => {
        setIsRolling(true);
        let count = 0;
        const interval = setInterval(() => {
            setDiceVal(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 10) {
                clearInterval(interval);
                setIsRolling(false);
            }
        }, 80);
    };

    const flipCoin = () => {
        setIsFlipping(true);
        setTimeout(() => {
            setCoinSide(Math.random() > 0.5 ? 'HEADS' : 'TAILS');
            setIsFlipping(false);
        }, 1000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-12 animate-fade-in grid md:grid-cols-2 gap-8 px-4">
            
            {/* Dice Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center justify-between min-h-[400px]">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-8">Dice Roller</h3>
                
                <motion.div 
                    key={isRolling ? 'rolling' : 'static'}
                    animate={isRolling ? { rotate: [0, 180, 360], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-indigo-600"
                >
                    <DiceFace val={diceVal} />
                </motion.div>

                <Button onClick={rollDice} disabled={isRolling} className="w-full mt-8">
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                </Button>
            </div>

            {/* Coin Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center justify-between min-h-[400px]">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-8">Coin Flipper</h3>
                
                <div className="relative w-40 h-40">
                    <motion.div 
                        animate={isFlipping ? { rotateY: [0, 720, 1440] } : { rotateY: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className={`w-full h-full rounded-full border-4 flex items-center justify-center text-3xl font-black shadow-lg ${coinSide === 'HEADS' ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
                    >
                        {isFlipping ? '...' : coinSide}
                    </motion.div>
                </div>

                <Button onClick={flipCoin} disabled={isFlipping} variant="secondary" className="w-full mt-8" icon={<Coins size={20}/>}>
                    {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </Button>
            </div>

        </div>
    );
};