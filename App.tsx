import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ClassProvider, useClass } from './context/ClassContext';
import { StudentManager } from './components/StudentManager';
import { RecitationRoulette } from './games/RecitationRoulette';
import { GroupSpinner } from './games/GroupSpinner';
import { TeamDraft } from './games/TeamDraft';
import { QuickDecisions } from './games/QuickDecisions';
import { TurnOrder } from './games/TurnOrder';
import { PassTheToken } from './games/PassTheToken';
import { PresentationQuest } from './games/PresentationQuest';
import { TopicReveal } from './games/TopicReveal';
import { EnergyMeter } from './games/EnergyMeter';

import { GameCard } from './components/GameCard';
import { GameType, ThemeColor, THEME_COLORS, THEME_TEXT_COLORS } from './types';
import { Users, Disc, LayoutGrid, GraduationCap, Grip, Dices, ListOrdered, Home, Repeat, Presentation, HelpCircle, Zap, Maximize, Minimize } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeGame, setActiveGame, className, students, themeColor, setThemeColor } = useClass();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const renderContent = () => {
    switch (activeGame) {
      case GameType.ROULETTE:
        return <RecitationRoulette />;
      case GameType.GROUPS:
        return <GroupSpinner />;
      case GameType.DRAFT:
        return <TeamDraft />;
      case GameType.PASS_TOKEN:
        return <PassTheToken />;
      case GameType.PRESENTATION:
        return <PresentationQuest />;
      case GameType.TOPIC_REVEAL:
        return <TopicReveal />;
      case GameType.TURN_ORDER:
        return <TurnOrder />;
      case GameType.DECISIONS:
        return <QuickDecisions />;
      case GameType.ENERGY:
        return <EnergyMeter />;
      case GameType.NONE:
      default:
        return (
           <div className="space-y-12 animate-fade-in pb-32">
              {/* Hero */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-full h-2 ${THEME_COLORS[themeColor]}`}></div>
                   <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
                    {className}
                   </h1>
                   <p className="text-slate-500 text-lg font-medium">
                    {students.length} students enrolled • Ready to play
                   </p>
              </div>

              {/* 1. Group Distribution */}
              <div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Group Distribution</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                      <GameCard 
                        title="Group Spinner Arena"
                        description="Randomly assign students into groups with 2D wheel or 3D physics effects."
                        icon={LayoutGrid}
                        onClick={() => setActiveGame(GameType.GROUPS)}
                      />
                      <GameCard 
                        title="Team Draft Table"
                        description="Controlled or random team assignment with click-to-assign draft style."
                        icon={Grip}
                        onClick={() => setActiveGame(GameType.DRAFT)}
                      />
                  </div>
              </div>

              {/* 2. Recitation */}
              <div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Recitation & Participation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                      <GameCard 
                        title="Recitation Roulette"
                        description="Fair random picker with 3D wheel and no-repeat logic."
                        icon={Disc}
                        onClick={() => setActiveGame(GameType.ROULETTE)}
                      />
                      <GameCard 
                        title="Pass-the-Token"
                        description="Turn-based participation where a digital token moves between students."
                        icon={Repeat}
                        onClick={() => setActiveGame(GameType.PASS_TOKEN)}
                      />
                  </div>
              </div>

              {/* 3. Presentation */}
              <div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Presentation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                      <GameCard 
                        title="Presentation Quest"
                        description="Structured group presentation timer with stages (Setup, Speech, Q&A)."
                        icon={Presentation}
                        onClick={() => setActiveGame(GameType.PRESENTATION)}
                      />
                      <GameCard 
                        title="Topic Reveal Board"
                        description="Mystery Box style board. Assign topics or rewards with click-to-reveal cards."
                        icon={HelpCircle}
                        onClick={() => setActiveGame(GameType.TOPIC_REVEAL)}
                      />
                  </div>
              </div>

              {/* 4. Order & Decisions */}
              <div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Order & Decisions</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                      <GameCard 
                        title="Turn Order Reveal"
                        description="Randomize the sequence for presentations or line-ups."
                        icon={ListOrdered}
                        onClick={() => setActiveGame(GameType.TURN_ORDER)}
                      />
                      <GameCard 
                        title="Dice & Randomizer"
                        description="Dice, Coins, and Timers for instant classroom decisions."
                        icon={Dices}
                        onClick={() => setActiveGame(GameType.DECISIONS)}
                      />
                       <GameCard 
                        title="Class Energy Meter"
                        description="Interactive visual gauge to measure or set the classroom energy level."
                        icon={Zap}
                        onClick={() => setActiveGame(GameType.ENERGY)}
                      />
                  </div>
              </div>

              {/* Quick Setup */}
              <div className="pt-8 border-t border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Class Management</h3>
                  <StudentManager />
              </div>
           </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
       
       {/* Top Bar */}
       <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <GraduationCap className={THEME_TEXT_COLORS[themeColor]} size={24} />
             <span className="font-bold text-lg tracking-tight">LanDecs ClassPlay</span>
          </div>

          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1">
                  {(['indigo', 'teal', 'rose', 'amber'] as ThemeColor[]).map((c) => (
                      <button 
                        key={c}
                        onClick={() => setThemeColor(c)}
                        className={`w-5 h-5 rounded-full transition-all ${THEME_COLORS[c]} ${themeColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-50 hover:opacity-100'}`}
                      />
                  ))}
              </div>
              <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>
              <button 
                onClick={toggleFullScreen}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                 {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
          </div>
       </header>

       <main className="flex-1 container mx-auto p-4 md:p-6 max-w-6xl">
          {renderContent()}
       </main>

       {/* Bottom Navigation (MD3 style) - Visible when inside a game */}
       {activeGame !== GameType.NONE && (
           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-50 md:hidden">
              <div className="flex justify-around items-center">
                  <button 
                    onClick={() => setActiveGame(GameType.NONE)}
                    className="flex flex-col items-center gap-1 p-2 text-slate-500"
                  >
                     <Home size={24} />
                     <span className="text-[10px] font-bold">Home</span>
                  </button>
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                     Playing: {activeGame}
                  </div>
              </div>
           </div>
       )}
       
       {/* Desktop Back Button */}
       {activeGame !== GameType.NONE && (
           <button 
             onClick={() => setActiveGame(GameType.NONE)}
             className="hidden md:flex fixed top-20 left-6 z-40 bg-white p-3 rounded-full shadow-md hover:shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all"
             title="Back to Home"
           >
              <Home size={24} />
           </button>
       )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <ClassProvider>
      <MainLayout />
      <Analytics />
    </ClassProvider>
  );
};

export default App;
