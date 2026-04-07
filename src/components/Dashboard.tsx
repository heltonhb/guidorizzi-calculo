import React, { useState } from 'react';
import { Presentation, Search, Zap, ArrowRight, Sparkles, MessageSquare, Wand2, Trophy, BookCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useStudyMetrics } from '../hooks/useStudyMetrics';
import { useAppContext } from '../hooks/useAppContext';
import ThemeToggle from './ThemeToggle';
import { ProgressBar } from './ProgressBar';

const Dashboard = ({ onNavigate }) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { metrics, getOverallPerformance, getProblemAreas, getRecentSessions } = useStudyMetrics();
    const { xp, level, progressToNextLevel, nextLevelXP, streak } = useAppContext();

    const topics = Object.keys(contentData);
    const filteredTopics = topics.filter(t => t.toLowerCase().includes(search.toLowerCase()));
    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');

    // Stats
    const topicsStudied = Object.keys(metrics.topics || {}).length;
    const overallScore = getOverallPerformance();

    return (
        <div className="relative min-h-screen w-full bg-zinc-950 overflow-hidden px-4 sm:px-8 py-12 pb-32">
            {/* Massive Hero Background Effect */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-premium-blue/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <header className="relative z-20 flex justify-between items-start mb-20">
                <div className="flex flex-col">
                    <p className="text-[10px] font-black text-premium-blue uppercase tracking-[0.3em] mb-4">V2.0 // Radical Release</p>
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[14vw] sm:text-9xl font-black leading-[0.8] tracking-tighter uppercase text-white mix-blend-difference"
                    >
                        CÁLCULO<br />
                        <span className="text-premium-blue ml-12 sm:ml-24 block">PRECISION</span>
                    </motion.h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('profile')} className="w-12 h-12 rounded-2xl bg-zinc-900 border-4 border-premium-blue flex items-center justify-center hover:bg-premium-blue/20 transition-colors shadow-[6px_6px_0_theme(colors.premium-blue)]">
                        <Trophy className="w-6 h-6 text-white" />
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            {/* Asymmetric Search */}
            <div className="relative z-40 w-full max-w-2xl ml-auto mr-4 sm:mr-12 mb-20 -mt-8 sm:-mt-16">
                <div className={cn(
                    "flex flex-col bg-zinc-900/90 backdrop-blur-xl border-4 rounded-2xl transition-all duration-500",
                    isFocused ? "border-premium-blue shadow-[12px_12px_0_theme(colors.premium-blue)]" : "border-zinc-800 shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
                )}>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="DATA INGESTION..."
                            className="w-full bg-transparent px-6 py-6 focus:outline-none placeholder:text-zinc-600 text-white font-black uppercase text-xl sm:text-2xl tracking-widest"
                        />
                        <div className="px-6 border-l-4 border-zinc-800 flex items-center justify-center h-full">
                            <Search className={cn("w-8 h-8 transition-colors", isFocused ? "text-premium-blue" : "text-zinc-600")} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isFocused && search && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t-4 border-zinc-800 bg-zinc-950 overflow-hidden rounded-b-xl"
                            >
                                {filteredTopics.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setSearch(t); setIsFocused(false); }}
                                        className="flex items-center gap-4 w-full text-left p-6 hover:bg-zinc-800 text-lg font-bold uppercase tracking-wider text-white transition-colors border-b-2 border-zinc-800 last:border-0"
                                    >
                                        <Sparkles className="w-6 h-6 text-premium-blue" />
                                        {t}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Navigation Grid - Asymmetric Layout */}
            <div className="relative z-30 w-full min-h-[750px] mt-12 sm:mt-24 px-2 sm:px-0">

                {/* Mode: Flashcards */}
                <motion.div
                    initial={{ x: -100, opacity: 0, rotate: -5 }} animate={{ x: 0, opacity: 1, rotate: -2 }}
                    className="absolute sm:top-0 sm:left-12 left-2 top-0 w-[90%] sm:w-[45%]"
                >
                    <RadicalCard
                        title="Neural Flashcards"
                        number="01"
                        icon={<BookCheck className="w-12 h-12" />}
                        onClick={() => onNavigate('flashcards', currentTopic)}
                    />
                </motion.div>

                {/* Mode: Aula */}
                <motion.div
                    initial={{ x: 100, opacity: 0, rotate: 5 }} animate={{ x: 0, opacity: 1, rotate: 3 }}
                    className="absolute sm:top-40 sm:right-12 right-2 top-[260px] w-[95%] sm:w-[45%] z-10"
                >
                    <RadicalCard
                        title="Modo Aula"
                        number="02"
                        icon={<Presentation className="w-12 h-12" />}
                        onClick={() => onNavigate('presentation', currentTopic)}
                    />
                </motion.div>

                {/* Mode: Chat IA */}
                <motion.div
                    initial={{ y: 100, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: -1 }}
                    className="absolute sm:top-[440px] sm:left-[20%] left-6 top-[540px] w-[90%] sm:w-[60%] z-20"
                >
                    <RadicalCard
                        title="Chat IA Core"
                        number="03"
                        icon={<MessageSquare className="w-12 h-12" />}
                        onClick={() => onNavigate('chat')}
                        accent
                    />
                </motion.div>

            </div>

            {/* Extreme Fixed Progress Footer */}
            <div className="fixed bottom-0 left-0 w-full border-t-4 border-premium-blue bg-zinc-950 p-6 z-50 shadow-[0_-12px_32px_rgba(17,82,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full flex-1">
                    <ProgressBar xp={xp} level={level} progressToNextLevel={progressToNextLevel} nextLevelXP={nextLevelXP} />
                </div>
                {streak > 0 && (
                    <div className="flex-shrink-0 px-4 py-2 bg-premium-blue text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                        🔥 {streak} Dia(s)
                    </div>
                )}
            </div>

        </div>
    );
};

const RadicalCard = ({ title, number, icon, onClick, accent = false }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative w-full text-left p-8 sm:p-12 transition-all duration-300",
                "bg-zinc-900 border-4 rounded-[2rem] overflow-hidden",
                accent ? "border-premium-blue shadow-[16px_16px_0_theme(colors.premium-blue)] hover:shadow-[24px_24px_0_theme(colors.premium-blue)] hover:-translate-y-2 hover:-translate-x-2"
                    : "border-zinc-700 shadow-[12px_12px_0_rgba(255,255,255,0.1)] hover:border-white hover:shadow-[20px_20px_0_rgba(255,255,255,0.2)] hover:-translate-y-2 hover:-translate-x-2"
            )}
        >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-6xl sm:text-8xl font-black text-premium-blue">{number}</span>
            </div>

            <div className={cn(
                "mb-12 inline-flex p-4 rounded-2xl border-4 transition-colors duration-500",
                accent ? "bg-premium-blue border-white text-white" : "bg-zinc-800 border-zinc-600 text-premium-blue group-hover:bg-premium-blue group-hover:text-white group-hover:border-premium-blue"
            )}>
                {icon}
            </div>

            <h2 className={cn(
                "text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter break-words",
                accent ? "text-premium-blue" : "text-white"
            )}>{title}</h2>

            <div className="mt-12 flex items-center gap-4 text-zinc-500 group-hover:text-white transition-colors duration-500">
                <span className="text-sm font-bold uppercase tracking-widest">Execute Node</span>
                <ArrowRight className="w-6 h-6" />
            </div>
        </button>
    );
};

export default Dashboard;
