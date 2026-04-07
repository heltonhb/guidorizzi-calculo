import React, { useState } from 'react';
import { BookOpen, Presentation, Search, Zap, ChevronRight, Sparkles, MessageSquare, Wand2, Trophy, BookCheck } from 'lucide-react';
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

    // If no filtered topics, the search itself becomes the topic
    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');
    const isTopicFromAI = search.trim() !== '' && !topics.includes(search);

    // Métricas calculadas
    const topicsStudied = Object.keys(metrics.topics || {}).length;
    const overallScore = getOverallPerformance();
    const problemAreas = getProblemAreas();
    const recentSessions = getRecentSessions();
    const totalStudyMinutes = Object.values(metrics.topics || {}).reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const bestTopic = Object.entries(metrics.topics || {}).sort((a, b) => (b[1].score || 0) - (a[1].score || 0))[0];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-6 sm:gap-8 pb-10 px-2 sm:px-0"
        >
            <header className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border-2 border-white/20 text-white text-[10px] uppercase font-black tracking-widest shadow-[2px_2px_0_rgba(255,255,255,0.2)]">
                            <div className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 bg-emerald-500"></span>
                            </div>
                            {isTopicFromAI ? 'IA Generativa Ativa' : 'API Online'}
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase px-2 sm:px-0"
                        >
                            Guidorizzi
                            <span className="block text-signal text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-1 tracking-tight">Cálculo Precision</span>
                        </motion.h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-amber-500/50 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-amber-400 hover:shadow-[2px_2px_0_theme(colors.amber.400)] transition-all text-amber-400"
                    title="Meu Perfil"
                  >
                    <Trophy className="w-5 h-5" />
                  </button>
                  <ThemeToggle />
                </div>
              </div>

              {/* Gamification - Progress Bar */}
              <div className="mt-4">
                <ProgressBar 
                  xp={xp} 
                  level={level} 
                  progressToNextLevel={progressToNextLevel} 
                  nextLevelXP={nextLevelXP}
                />
                {streak > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-amber-400">
                    <span className="🔥">{streak} dias seguidos!</span>
                  </div>
                )}
              </div>
            </header>

            <motion.div variants={itemVariants} className="relative z-50">
                <div className={cn(
                    "relative flex items-center bg-zinc-950 border-2 transition-all duration-300",
                    isFocused ? "border-signal shadow-[4px_4px_0_theme(colors.signal)]" : "border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
                )}>
                    <Search className={cn(
                        "ml-5 w-6 h-6 transition-colors duration-300",
                        isFocused ? "text-signal" : "text-zinc-500"
                    )} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="O QUE VAMOS ESTUDAR HOJE?"
                        className="w-full min-w-0 bg-transparent px-4 py-5 focus:outline-none placeholder:text-zinc-600 text-white font-bold uppercase tracking-wider text-sm sm:text-base"
                    />
                </div>

                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 5 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 left-0 right-0 p-2 bg-zinc-950 border-2 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.2)] z-50"
                        >
                            {filteredTopics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setSearch(t); setIsFocused(false); }}
                                    className="flex items-center gap-3 w-full text-left p-4 hover:bg-zinc-800 text-sm font-bold uppercase tracking-wider text-white transition-colors border-2 border-transparent hover:border-white/20"
                                >
                                    <Sparkles className="w-5 h-5 text-signal" />
                                    {t}
                                </button>
                            ))}
                            {!topics.some(t => t.toLowerCase() === search.toLowerCase()) && (
                                <button
                                    onClick={() => setIsFocused(false)}
                                    className="flex items-center gap-3 w-full text-left p-4 bg-signal/10 hover:bg-signal/20 text-sm font-black uppercase tracking-wider transition-colors border-2 border-signal mt-2"
                                >
                                    <Wand2 className="w-5 h-5 text-signal" />
                                    <span className="text-signal">GERAR ALVO: "{search}"</span>
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stats de Progresso */}
            {topicsStudied > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tópicos Totais</p>
                        <p className="text-3xl font-black text-white font-mono">{topicsStudied}</p>
                        <p className="text-xs font-bold text-zinc-500">{totalStudyMinutes} MIN</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Desempenho</p>
                        <p className={cn(
                            "text-3xl font-black font-mono",
                            overallScore >= 70 ? "text-emerald-400" : overallScore >= 40 ? "text-amber-400" : "text-signal"
                        )}>{Math.round(overallScore)}%</p>
                        <p className="text-xs font-bold text-zinc-500">{recentSessions.length} RECENTES</p>
                    </div>
                    {bestTopic && bestTopic[1].score > 0 && (
                        <div className="col-span-2 p-4 bg-emerald-950/20 border-2 border-emerald-500 shadow-[4px_4px_0_theme(colors.emerald.500)] flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-900 flex items-center justify-center border-2 border-emerald-500">
                                <Sparkles className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Excelência</p>
                                <p className="text-lg font-black text-emerald-400 uppercase">{bestTopic[0]} <span className="font-mono">[{Math.round(bestTopic[1].score)}%]</span></p>
                            </div>
                        </div>
                    )}
                    {problemAreas.length > 0 && (
                        <div className="col-span-2 p-4 bg-signal/5 border-2 border-signal shadow-[4px_4px_0_theme(colors.signal)] flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-950 flex items-center justify-center border-2 border-signal">
                                <Zap className="w-5 h-5 text-signal" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-signal uppercase tracking-widest">Atenção Crítica</p>
                                <p className="text-lg font-black text-signal uppercase">{problemAreas.map(a => a.topic).join(' | ')}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            <div className="grid gap-5 pr-2">
                <Card
                    variants={itemVariants}
                    title="Estudar"
                    description="Material didático completo"
                    icon={<BookOpen className="w-6 h-6 text-[#22c55e]" />}
                    color="emerald"
                    onClick={() => onNavigate('study', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Flashcards"
                    description="Reforce conceitos fundamentais"
                    icon={<BookCheck className="w-6 h-6 text-[#ff5500]" />}
                    color="signal"
                    onClick={() => onNavigate('flashcards', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Modo Aula"
                    description="Apresentação em alta definição"
                    icon={<Presentation className="w-6 h-6 text-[#00f0ff]" />}
                    color="cyan"
                    onClick={() => onNavigate('presentation', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Chat IA"
                    description="Tire dúvidas agora mesmo"
                    icon={<MessageSquare className="w-6 h-6 text-[#22c55e]" />}
                    color="emerald"
                    onClick={() => onNavigate('chat')}
                />
                <Card
                    variants={itemVariants}
                    title="Desafio Guidorizzi"
                    description="Teste seus conhecimentos"
                    icon={<Trophy className="w-6 h-6 text-[#ccff00]" />}
                    color="lime"
                    onClick={() => onNavigate('quiz', currentTopic)}
                />
            </div>
        </motion.div>
    );
};

const Card = ({ title, description, icon, color, onClick, variants }) => {
    const shadowColors = {
        cyan: "shadow-[3px_3px_0_#00f0ff] md:shadow-[4px_4px_0_#00f0ff] hover:shadow-[3px_3px_0_#00f0ff] md:hover:shadow-[8px_8px_0_#00f0ff]",
        signal: "shadow-[3px_3px_0_#ff5500] md:shadow-[4px_4px_0_#ff5500] hover:shadow-[3px_3px_0_#ff5500] md:hover:shadow-[8px_8px_0_#ff5500]",
        lime: "shadow-[3px_3px_0_#ccff00] md:shadow-[4px_4px_0_#ccff00] hover:shadow-[3px_3px_0_#ccff00] md:hover:shadow-[8px_8px_0_#ccff00]",
        orange: "shadow-[3px_3px_0_#ff5500] md:shadow-[4px_4px_0_#ff5500] hover:shadow-[3px_3px_0_#ff5500] md:hover:shadow-[8px_8px_0_#ff5500]",
        emerald: "shadow-[3px_3px_0_#22c55e] md:shadow-[4px_4px_0_#22c55e] hover:shadow-[3px_3px_0_#22c55e] md:hover:shadow-[8px_8px_0_#22c55e]"
    };

    const borderColors = {
        cyan: "border-[#00f0ff]",
        signal: "border-[#ff5500]",
        lime: "border-[#ccff00]",
        orange: "border-[#ff5500]",
        emerald: "border-[#22c55e]"
    };

    return (
        <motion.button
            variants={variants}
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
            onClick={onClick}
            className={cn(
                "group relative w-full p-4 sm:p-6 text-left transition-all bg-zinc-950 overflow-hidden",
                "border-2 rounded-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white",
                borderColors[color],
                shadowColors[color]
            )}
        >
            <div className="flex items-center gap-3 sm:gap-6">
                <div className={cn(
                    "flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 bg-zinc-900 transition-transform duration-300 group-hover:rotate-3",
                    borderColors[color]
                )}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base sm:text-xl tracking-tight uppercase truncate">{title}</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase tracking-wider truncate">{description}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-transparent group-hover:border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 flex-shrink-0">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
            </div>
        </motion.button>
    );
};

export default Dashboard;
