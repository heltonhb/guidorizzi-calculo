import React, { useState } from 'react';
import { BookOpen, ListTodo, Presentation, Search, Zap, ChevronRight, Sparkles, MessageSquare, Wand2, Headphones, Trophy, BookCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useStudyMetrics } from '../hooks/useStudyMetrics';

const Dashboard = ({ onNavigate }) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { metrics, getOverallPerformance, getProblemAreas, getRecentSessions } = useStudyMetrics();

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
            className="flex flex-col gap-8 pb-10"
        >
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent"
                    >
                        Guidorizzi
                    </motion.h1>
                    <motion.div
                        whileHover={{ rotate: 15 }}
                        className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10"
                    >
                        <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
                    </motion.div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-black tracking-[0.2em]">
                    <div className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </div>
                    {isTopicFromAI ? 'IA Generativa Ativa' : 'NotebookLM Online'}
                </div>
            </header>

            <motion.div variants={itemVariants} className="relative z-50">
                <div className={cn(
                    "relative flex items-center bg-white/5 border transition-all duration-500 rounded-[24px] overflow-hidden",
                    isFocused ? "border-purple-500/50 ring-4 ring-purple-500/10 bg-white/10" : "border-white/10"
                )}>
                    <Search className={cn(
                        "ml-4 w-5 h-5 transition-colors duration-300",
                        isFocused ? "text-purple-400" : "text-zinc-500"
                    )} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="O que vamos estudar hoje?"
                        className="w-full bg-transparent px-4 py-5 focus:outline-none placeholder:text-zinc-600 text-zinc-200 font-medium"
                    />
                </div>

                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 5 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 p-2 bg-zinc-900/95 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden"
                        >
                            {filteredTopics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setSearch(t); setIsFocused(false); }}
                                    className="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-white/5"
                                >
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    {t}
                                </button>
                            ))}
                            {!topics.some(t => t.toLowerCase() === search.toLowerCase()) && (
                                <button
                                    onClick={() => setIsFocused(false)}
                                    className="flex items-center gap-3 w-full text-left p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-sm font-bold transition-colors border border-purple-500/20 mt-1"
                                >
                                    <Wand2 className="w-4 h-4 text-purple-400 animate-pulse" />
                                    Gerar assunto: "{search}"
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stats de Progresso */}
            {topicsStudied > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 space-y-1">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tópicos</p>
                        <p className="text-2xl font-black text-white">{topicsStudied}</p>
                        <p className="text-[10px] text-zinc-600">{totalStudyMinutes}min estudados</p>
                    </div>
                    <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 space-y-1">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Desempenho</p>
                        <p className={cn(
                            "text-2xl font-black",
                            overallScore >= 70 ? "text-emerald-400" : overallScore >= 40 ? "text-amber-400" : "text-red-400"
                        )}>{overallScore}%</p>
                        <p className="text-[10px] text-zinc-600">{recentSessions.length} sessões recentes</p>
                    </div>
                    {bestTopic && bestTopic[1].score > 0 && (
                        <div className="col-span-2 p-4 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Melhor área</p>
                                <p className="text-sm font-bold text-emerald-400">{bestTopic[0]} — {bestTopic[1].score}%</p>
                            </div>
                        </div>
                    )}
                    {problemAreas.length > 0 && (
                        <div className="col-span-2 p-4 rounded-[24px] bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">Reforço necessário</p>
                                <p className="text-sm font-medium text-red-400">{problemAreas.map(a => a.topic).join(', ')}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            <div className="grid gap-5">
                <Card
                    variants={itemVariants}
                    title="Audio Overview"
                    description="Ouça a explicação baseada no livro"
                    icon={<Headphones className="w-6 h-6 text-purple-400" />}
                    color="purple"
                    onClick={() => onNavigate('audio', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Desafio Guidorizzi"
                    description="Teste seus conhecimentos"
                    icon={<Trophy className="w-6 h-6 text-blue-400" />}
                    color="blue"
                    onClick={() => onNavigate('quiz', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Flashcards AI"
                    description="Reforce conceitos fundamentais"
                    icon={<BookCheck className="w-6 h-6 text-orange-400" />}
                    color="orange"
                    onClick={() => onNavigate('flashcards', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Modo Aula"
                    description="Apresentação em alta definição"
                    icon={<Presentation className="w-6 h-6 text-rose-400" />}
                    color="rose"
                    onClick={() => onNavigate('presentation', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Chat IA"
                    description="Tire dúvidas agora mesmo"
                    icon={<MessageSquare className="w-6 h-6 text-emerald-400" />}
                    color="emerald"
                    onClick={() => onNavigate('chat')}
                />
            </div>
        </motion.div>
    );
};

const Card = ({ title, description, icon, color, onClick, variants }) => {
    const colors = {
        purple: "from-purple-500/20 to-indigo-500/20 group-hover:from-purple-500/40 group-hover:to-indigo-500/40",
        blue: "from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40",
        rose: "from-rose-500/20 to-orange-500/20 group-hover:from-rose-500/40 group-hover:to-orange-500/40",
        orange: "from-orange-500/20 to-yellow-500/20 group-hover:from-orange-500/40 group-hover:to-yellow-500/40",
        emerald: "from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/40 group-hover:to-teal-500/40"
    };

    return (
        <motion.button
            variants={variants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group relative w-full p-px rounded-[32px] overflow-hidden transition-all text-white shadow-xl shadow-black/40"
        >
            <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500 opacity-40 group-hover:opacity-100", colors[color])}></div>
            <div className="relative flex items-center gap-6 w-full p-6 rounded-[31px] bg-zinc-950/80 backdrop-blur-3xl border border-white/5">
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-[22px] bg-white/5 border border-white/10 group-hover:rotate-6 transition-all duration-500">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                </div>
                <div className="flex-1 text-left space-y-1">
                    <h3 className="font-extrabold text-xl tracking-tight">{title}</h3>
                    <p className="text-zinc-500 text-sm font-medium">{description}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
                    <ChevronRight className="w-5 h-5 text-white" />
                </div>
            </div>
        </motion.button>
    );
};

export default Dashboard;
