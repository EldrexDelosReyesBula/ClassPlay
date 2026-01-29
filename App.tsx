import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"
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

import { GameCard } from './components/ui/GameCard';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { GameType, ThemeColor, THEME_COLORS, THEME_TEXT_COLORS } from './types';
import { Users, Disc, LayoutGrid, GraduationCap, Grip, Dices, ListOrdered, Home, Repeat, Presentation, HelpCircle, Zap, Maximize, Minimize, Search, Settings, ShieldCheck, ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import metadata from './metadata';

const MainLayout: React.FC = () => {
  const { activeGame, setActiveGame, className, students, themeColor, setThemeColor, analyticsConsent, setAnalyticsConsent } = useClass();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Game Launch Confirmation State
  const [pendingGame, setPendingGame] = useState<GameType | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Donation Modal State
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Analytics Logic: Prompt once per month if not enabled
  useEffect(() => {
      const checkAnalyticsPrompt = () => {
          const declinedTimestamp = localStorage.getItem('landecs_analytics_declined_at');
          const now = Date.now();
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;

          if (analyticsConsent === null) {
              // Not decided yet
              setShowOnboarding(true);
          } else if (analyticsConsent === false) {
              // Declined previously, check if we should nag
              if (!declinedTimestamp || (now - parseInt(declinedTimestamp) > thirtyDays)) {
                  setShowOnboarding(true);
              }
          }
      };
      
      // Small delay to ensure smooth load
      const timer = setTimeout(checkAnalyticsPrompt, 1000);
      return () => clearTimeout(timer);
  }, [analyticsConsent]);

  const handleAnalyticsChoice = (choice: boolean) => {
      setAnalyticsConsent(choice);
      if (!choice) {
          localStorage.setItem('landecs_analytics_declined_at', Date.now().toString());
      } else {
          localStorage.removeItem('landecs_analytics_declined_at');
      }
      setShowOnboarding(false);
  };

  // Check for donation prompt every 5 days
  useEffect(() => {
    // Only check if onboarding is done/skipped (analyticsConsent is not null)
    if (analyticsConsent !== null) {
        const lastPrompt = localStorage.getItem('landecs_last_donation_prompt');
        const now = Date.now();
        const fiveDays = 5 * 24 * 60 * 60 * 1000;
        
        if (!lastPrompt || (now - parseInt(lastPrompt) > fiveDays)) {
             // Delay slightly so it doesn't appear instantly on load
             const timer = setTimeout(() => setShowDonationModal(true), 3000);
             return () => clearTimeout(timer);
        }
    }
  }, [analyticsConsent]);

  const dismissDonationModal = () => {
    localStorage.setItem('landecs_last_donation_prompt', Date.now().toString());
    setShowDonationModal(false);
  };

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

  const requestGameLaunch = (game: GameType) => {
      setPendingGame(game);
  };

  const confirmGameLaunch = () => {
      if (pendingGame) {
          setActiveGame(pendingGame);
          setPendingGame(null);
          setSearchTerm('');
      }
  };

  const getGameDescription = (type: string) => {
      return (metadata.gameDescriptions as Record<string, string>)[type] || "Play this game";
  };

  const filterGame = (title: string, desc: string) => {
      const term = searchTerm.toLowerCase();
      return title.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
  };

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
           <div className="space-y-8 md:space-y-12 animate-fade-in pb-32">
              {/* Hero */}
              <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-full h-2 ${THEME_COLORS[themeColor]}`}></div>
                   <h1 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight mb-4 break-words">
                    {className}
                   </h1>
                   <p className="text-slate-500 text-base md:text-lg font-medium">
                    {students.length} students enrolled • Ready to play
                   </p>
              </div>

              {/* 1. Group Distribution */}
              {(filterGame('Group Spinner Arena', getGameDescription('GROUPS')) || filterGame('Team Draft Table', getGameDescription('DRAFT'))) && (
              <div>
                  <h3 className="text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6 px-2">Group Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {filterGame('Group Spinner Arena', getGameDescription('GROUPS')) && (
                          <GameCard 
                            gameType={GameType.GROUPS}
                            title="Group Spinner Arena"
                            description={getGameDescription('GROUPS')}
                            defaultIcon={LayoutGrid}
                            onClick={() => requestGameLaunch(GameType.GROUPS)}
                          />
                      )}
                      {filterGame('Team Draft Table', getGameDescription('DRAFT')) && (
                          <GameCard 
                            gameType={GameType.DRAFT}
                            title="Team Draft Table"
                            description={getGameDescription('DRAFT')}
                            defaultIcon={Grip}
                            onClick={() => requestGameLaunch(GameType.DRAFT)}
                          />
                      )}
                  </div>
              </div>
              )}

              {/* 2. Recitation */}
              {(filterGame('Recitation Roulette', getGameDescription('ROULETTE')) || filterGame('Pass-the-Token', getGameDescription('PASS_TOKEN'))) && (
              <div>
                  <h3 className="text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6 px-2">Recitation & Participation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {filterGame('Recitation Roulette', getGameDescription('ROULETTE')) && (
                          <GameCard 
                            gameType={GameType.ROULETTE}
                            title="Recitation Roulette"
                            description={getGameDescription('ROULETTE')}
                            defaultIcon={Disc}
                            onClick={() => requestGameLaunch(GameType.ROULETTE)}
                          />
                      )}
                      {filterGame('Pass-the-Token', getGameDescription('PASS_TOKEN')) && (
                          <GameCard 
                            gameType={GameType.PASS_TOKEN}
                            title="Pass-the-Token"
                            description={getGameDescription('PASS_TOKEN')}
                            defaultIcon={Repeat}
                            onClick={() => requestGameLaunch(GameType.PASS_TOKEN)}
                          />
                      )}
                  </div>
              </div>
              )}

              {/* 3. Presentation */}
              {(filterGame('Presentation Quest', getGameDescription('PRESENTATION'))) && (
              <div>
                  <h3 className="text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6 px-2">Presentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {filterGame('Presentation Quest', getGameDescription('PRESENTATION')) && (
                          <GameCard 
                            gameType={GameType.PRESENTATION}
                            title="Presentation Quest"
                            description={getGameDescription('PRESENTATION')}
                            defaultIcon={Presentation}
                            onClick={() => requestGameLaunch(GameType.PRESENTATION)}
                          />
                      )}
                  </div>
              </div>
              )}

              {/* 4. Order & Decisions */}
              {(filterGame('Turn Order Reveal', getGameDescription('TURN_ORDER')) || filterGame('Dice & Randomizer', getGameDescription('DECISIONS')) || filterGame('Class Energy Meter', getGameDescription('ENERGY')) || filterGame('Topic Reveal Board', getGameDescription('TOPIC_REVEAL'))) && (
              <div>
                  <h3 className="text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6 px-2">Order & Decisions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                      {filterGame('Turn Order Reveal', getGameDescription('TURN_ORDER')) && (
                          <GameCard 
                            gameType={GameType.TURN_ORDER}
                            title="Turn Order Reveal"
                            description={getGameDescription('TURN_ORDER')}
                            defaultIcon={ListOrdered}
                            onClick={() => requestGameLaunch(GameType.TURN_ORDER)}
                          />
                      )}
                       {filterGame('Topic Reveal Board', getGameDescription('TOPIC_REVEAL')) && (
                          <GameCard 
                            gameType={GameType.TOPIC_REVEAL}
                            title="Topic Reveal Board"
                            description={getGameDescription('TOPIC_REVEAL')}
                            defaultIcon={HelpCircle}
                            onClick={() => requestGameLaunch(GameType.TOPIC_REVEAL)}
                          />
                      )}
                      {filterGame('Dice & Randomizer', getGameDescription('DECISIONS')) && (
                          <GameCard 
                            gameType={GameType.DECISIONS}
                            title="Dice & Randomizer"
                            description={getGameDescription('DECISIONS')}
                            defaultIcon={Dices}
                            onClick={() => requestGameLaunch(GameType.DECISIONS)}
                          />
                      )}
                      {filterGame('Class Energy Meter', getGameDescription('ENERGY')) && (
                           <GameCard 
                            gameType={GameType.ENERGY}
                            title="Class Energy Meter"
                            description={getGameDescription('ENERGY')}
                            defaultIcon={Zap}
                            onClick={() => requestGameLaunch(GameType.ENERGY)}
                          />
                      )}
                  </div>
              </div>
              )}

              {/* Quick Setup */}
              <div className="pt-8 border-t border-slate-200">
                  <h3 className="text-sm md:text-xl font-bold text-slate-800 mb-6 px-2">Class Management</h3>
                  <StudentManager />
              </div>
           </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
       
       {/* Analytics Component - Privacy First */}
       {analyticsConsent && <Analytics />}

       {/* Top Bar */}
       <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveGame(GameType.NONE)}>
             <GraduationCap className={THEME_TEXT_COLORS[themeColor]} size={24} />
             <span className="font-bold text-lg tracking-tight hidden xs:block">ClassPlay</span>
          </div>

          <div className="flex-1 max-w-md mx-2 md:mx-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100/50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden lg:flex items-center gap-1">
                  {(['indigo', 'teal', 'rose', 'amber'] as ThemeColor[]).map((c) => (
                      <button 
                        key={c}
                        onClick={() => setThemeColor(c)}
                        className={`w-5 h-5 rounded-full transition-all ${THEME_COLORS[c]} ${themeColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-50 hover:opacity-100'}`}
                      />
                  ))}
              </div>
              <div className="w-px h-6 bg-slate-200 mx-2 hidden lg:block"></div>
              <button 
                 onClick={() => setShowSettings(true)}
                 className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                  <Settings size={20}/>
              </button>
              <button 
                onClick={toggleFullScreen}
                className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                 {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
          </div>
       </header>

       <main className="flex-1 container mx-auto p-4 md:p-6 max-w-6xl pb-24 md:pb-6">
          {renderContent()}
       </main>

       {/* Game Launch Confirmation */}
       <Modal
           isOpen={!!pendingGame}
           onClose={() => setPendingGame(null)}
           title="Start Activity?"
       >
           <div className="space-y-4">
               <p className="text-slate-600">
                   You are about to launch <span className="font-bold text-slate-800">{pendingGame?.replace('_', ' ')}</span>.
                   Current session data for this game might be overwritten if not saved.
               </p>
               <div className="flex gap-4 pt-4">
                   <Button variant="secondary" onClick={() => setPendingGame(null)} className="flex-1">
                       Cancel
                   </Button>
                   <Button onClick={confirmGameLaunch} className="flex-1">
                       Start Game
                   </Button>
               </div>
           </div>
       </Modal>

       {/* Settings Modal */}
       <Modal
           isOpen={showSettings}
           onClose={() => setShowSettings(false)}
           title="App Settings"
       >
           <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div>
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <ShieldCheck size={18} className="text-teal-600"/>
                           Usage Analytics
                       </h3>
                       <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
                           Share anonymous usage data to help us improve ClassPlay. No student data is ever collected.
                       </p>
                   </div>
                   <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{analyticsConsent ? 'ON' : 'OFF'}</span>
                        <button 
                            onClick={() => handleAnalyticsChoice(!analyticsConsent)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${analyticsConsent ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${analyticsConsent ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                   </div>
               </div>
               
                {/* Mobile Theme Selector in Settings */}
                <div className="lg:hidden">
                   <h3 className="font-bold text-slate-800 mb-3">App Theme</h3>
                   <div className="flex items-center gap-3">
                      {(['indigo', 'teal', 'rose', 'amber'] as ThemeColor[]).map((c) => (
                          <button 
                            key={c}
                            onClick={() => setThemeColor(c)}
                            className={`w-10 h-10 rounded-full transition-all ${THEME_COLORS[c]} ${themeColor === c ? 'ring-4 ring-offset-2 ring-slate-200' : 'opacity-80'}`}
                          />
                      ))}
                   </div>
                </div>

                {/* Donation Section */}
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mt-4">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-2">
                        <Heart size={18} fill="currentColor" className="text-rose-500"/>
                        Support ClassPlay
                    </h3>
                    <p className="text-xs text-rose-600 mb-4 leading-relaxed">
                        Your donation helps keep ClassPlay free and ad-free for teachers worldwide.
                    </p>
                    <a 
                        href="https://www.landecs.org/docs/donation" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-rose-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-rose-600 transition-all shadow-md shadow-rose-200 hover:shadow-lg active:scale-95"
                    >
                        Donate via LanDecs <ExternalLink size={14}/>
                    </a>
                </div>

                {/* Footer Links */}
               <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 mt-6 pt-6 border-t border-slate-100">
                   <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Privacy Policy</a>
                   <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Terms of Use</a>
                   <a href="#" className="hover:text-slate-600 hover:underline transition-colors">License</a>
                   <span className="w-full text-center mt-2 opacity-50">LanDecs ClassPlay v1.0.0</span>
               </div>
           </div>
       </Modal>

       {/* Donation Encouragement Modal */}
       <Modal
           isOpen={showDonationModal}
           onClose={dismissDonationModal}
           title="Support Our Mission"
       >
           <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-sm animate-pulse">
                    <Heart size={32} fill="currentColor" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Keep ClassPlay Free!</h3>
                    <p className="text-slate-600 text-sm leading-relaxed px-2">
                        We're dedicated to building privacy-first tools for education. If you find value in ClassPlay, please consider supporting us to help cover server costs and development.
                    </p>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={dismissDonationModal} className="flex-1">
                        Maybe Later
                    </Button>
                     <a 
                        href="https://www.landecs.org/docs/donation" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={dismissDonationModal}
                        className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-2xl text-sm font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
                    >
                        Donate <Heart size={16} fill="currentColor"/>
                    </a>
                </div>
           </div>
       </Modal>

       {/* Onboarding / Analytics Consent Modal */}
       <Modal
            isOpen={showOnboarding}
            onClose={() => {}} // Force choice
            title="Welcome to ClassPlay!"
       >
            <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                    <ShieldCheck size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Privacy First</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        ClassPlay runs entirely in your browser. We never store your student data on our servers.
                    </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                    <h4 className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-slate-400"/>
                        Help us improve?
                    </h4>
                    <p className="text-xs text-slate-500">
                        We would like to collect anonymous usage statistics (e.g., which games are popular). 
                        This feature is disabled by default unless you opt-in.
                    </p>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => handleAnalyticsChoice(false)} className="flex-1 text-sm">
                        Don't Share
                    </Button>
                    <Button onClick={() => handleAnalyticsChoice(true)} className="flex-1 text-sm">
                        Opt-In
                    </Button>
                </div>
            </div>
       </Modal>

       {/* Bottom Navigation (MD3 style) - Visible when inside a game on mobile */}
       {activeGame !== GameType.NONE && (
           <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-2 z-50 md:hidden safe-area-pb">
              <div className="flex justify-between items-center px-6">
                  <button 
                    onClick={() => setActiveGame(GameType.NONE)}
                    className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-indigo-600"
                  >
                     <Home size={24} />
                     <span className="text-[10px] font-bold">Home</span>
                  </button>
                  <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full shadow-sm max-w-[200px] truncate">
                     {activeGame.replace('_', ' ')}
                  </div>
              </div>
           </div>
       )}
       
       {/* Desktop Back Button */}
       {activeGame !== GameType.NONE && (
           <button 
             onClick={() => setActiveGame(GameType.NONE)}
             className="hidden md:flex fixed top-24 left-4 xl:left-10 z-30 bg-white p-3 rounded-full shadow-md hover:shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all hover:-translate-x-1"
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
    </ClassProvider>
  );
};

export default App;