import { useState } from 'react';
import { BookCheck, MessageSquare, Presentation, Search, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useAppContext } from '../hooks/useAppContext';

// Premium Brutalist Design System
const BRUTALIST = {
    colors: {
        background: "#0a0a0a",
        surface: "#141414",
        surfaceElevated: "#1a1a1a",
        border: "#000000",
        accent: {
            cyan: "#00f0ff",
            orange: "#ff5500",
            lime: "#ccff00",
            yellow: "#facc15",
            pink: "#ff0080"
        }
    },
    shadow: (color = "#000") => `8px 8px 0px 0px ${color}`,
    borderWidth: "4px"
};

const Dashboard = ({ onNavigate }) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { xp, level, progressToNextLevel, nextLevelXP } = useAppContext();

    const topics = Object.keys(contentData);
    const filteredTopics = topics.filter(t => t.toLowerCase().includes(search.toLowerCase()));
    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Technical Grid Background */}
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(${BRUTALIST.colors.accent.cyan} 1px, transparent 1px),
                        linear-gradient(90deg, ${BRUTALIST.colors.accent.cyan} 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.1)_50%)] bg-[length:100%_4px]" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 flex flex-col gap-5 sm:gap-6 pb-10 px-3 sm:px-0"
            >
                {/* Header Section - Terminal Style */}
                <header className="space-y-6">
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative"
                    >
                        {/* Decorative corner accents */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 border-l-4 border-t-4 border-[#00f0ff]" />
                        <div className="absolute -top-2 -right-2 w-4 h-4 border-r-4 border-t-4 border-[#ff5500]" />
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-4 border-b-4 border-[#ccff00]" />
                        
                        <div className="bg-[#141414] border-4 border-black px-6 py-5 text-center relative"
                            style={{ boxShadow: BRUTALIST.shadow('#00f0ff') }}
                        >
                            <div className="absolute top-1 left-4 text-[10px] font-mono text-[#00f0ff] tracking-widest">
                                &gt; SISTEMA_DE_CALCULO_V1.0
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-[0.15em] uppercase text-white mt-2" style={{ textShadow: '2px 2px 0 #00f0ff' }}>
                                Cálculo <span className="text-[#00f0ff]">Precision</span>
                            </h1>
                            <div className="absolute bottom-1 right-4 text-[8px] font-mono text-[#ff5500] tracking-widest">
                                GUIDORIZZI_AI
                            </div>
                        </div>
                    </motion.div>

                    {/* Gamification Stats - Technical Display */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-stretch gap-3"
                    >
                        {/* Level Indicator - Circular Technical */}
                        <div className="relative flex-shrink-0 w-[100px] sm:w-[120px]">
                            <div className="absolute inset-0 border-4 border-[#00f0ff] opacity-20" />
                            <div 
                                className="w-full aspect-square bg-[#141414] border-4 border-black flex items-center justify-center relative overflow-hidden"
                                style={{ boxShadow: BRUTALIST.shadow('#00f0ff') }}
                            >
                                {/* Inner technical pattern */}
                                <div className="absolute inset-2 border border-[#00f0ff]/30" />
                                <div className="absolute inset-4 border border-dashed border-[#00f0ff]/20" />
                                
                                {/* Progress arc simulation */}
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        background: `conic-gradient(from 180deg, #ff5500 ${progressToNextLevel * 3.6}deg, transparent ${progressToNextLevel * 3.6}deg)`,
                                        opacity: 0.8
                                    }}
                                />
                                
                                <div className="flex flex-col items-center z-10">
                                    <span className="text-[8px] font-mono text-[#00f0ff] uppercase tracking-widest">LVL</span>
                                    <span className="text-5xl font-black text-white leading-none my-1" style={{ textShadow: '3px 3px 0 #ff5500' }}>{level}</span>
                                    <div className="w-8 h-1 bg-[#00f0ff] mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* XP Bar - Technical Progress */}
                        <div className="flex-1 flex flex-col gap-2 justify-center">
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-black text-[#ff5500] font-mono">
                                    {xp}<span className="text-sm text-[#ccff00]">_XP</span>
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                    TARGET: {nextLevelXP}
                                </span>
                            </div>
                            
                            {/* Technical Progress Bar */}
                            <div className="relative bg-[#141414] border-4 border-black p-1" style={{ boxShadow: '4px 4px 0 #000' }}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#ccff00] to-[#ff5500] opacity-50" />
                                <div className="flex items-center h-8 relative overflow-hidden">
                                    <div 
                                        className="h-full bg-[#ccff00] border-r-2 border-black relative"
                                        style={{ width: `${progressToNextLevel}%` }}
                                    >
                                        {/* Scanline effect on progress */}
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:4px_100%]" />
                                    </div>
                                </div>
                                <div className="absolute -right-2 -top-2 bg-[#ccff00] text-black text-[8px] font-black px-2 py-0.5">
                                    {progressToNextLevel}%
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </header>

                {/* Search - Terminal Input Style */}
                <motion.div variants={itemVariants} className="relative z-50">
                    <div className={cn(
                        "relative flex items-center bg-[#141414] border-4 border-black transition-all duration-150",
                        isFocused ? "border-[#00f0ff]" : ""
                    )}
                    style={{
                        boxShadow: isFocused ? BRUTALIST.shadow('#00f0ff') : '4px 4px 0 #000'
                    }}
                    >
                        <div className="ml-4 w-6 h-6 flex items-center justify-center">
                            <Search className="w-5 h-5 text-[#00f0ff]" strokeWidth={3} />
                        </div>
                        <div className="w-2 h-2 bg-[#00f0ff] animate-pulse ml-2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="DIGITE_O_TOPICO..."
                            className="w-full min-w-0 bg-transparent px-3 py-4 focus:outline-none placeholder:text-zinc-600 text-[#00f0ff] font-mono text-sm sm:text-base tracking-wider"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {isFocused && search && (
                            <motion.div
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 8 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="absolute top-full left-0 right-0 bg-[#0a0a0a] border-4 border-[#00f0ff] z-50"
                                style={{ boxShadow: '8px 8px 0 #00f0ff' }}
                            >
                                <div className="p-1">
                                    {filteredTopics.map((t, i) => (
                                        <button
                                            key={t}
                                            onMouseDown={() => { setSearch(t); setIsFocused(false); }}
                                            className={cn(
                                                "flex items-center gap-3 w-full text-left p-3 font-mono text-sm transition-all border-2 border-transparent",
                                                i % 2 === 0 ? "bg-[#141414] hover:bg-[#1a1a1a]" : "bg-[#1a1a1a] hover:bg-[#141414]",
                                                "hover:border-[#00f0ff] text-white hover:text-[#00f0ff]"
                                            )}
                                        >
                                            <span className="text-[#ff5500]">{`>`}</span>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Navigation Cards - Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <Card
                        variants={itemVariants}
                        title="Flashcards AI"
                        description="REFORCE_CONCEITOS"
                        icon={<BookCheck className="w-7 h-7" />}
                        color="cyan"
                        accentColor="#00f0ff"
                        onClick={() => onNavigate('flashcards', currentTopic)}
                    />
                    <Card
                        variants={itemVariants}
                        title="Modo Aula"
                        description="APRESENTACAO_HD"
                        icon={<Presentation className="w-7 h-7" />}
                        color="orange"
                        accentColor="#ff5500"
                        onClick={() => onNavigate('presentation', currentTopic)}
                    />
                    <Card
                        variants={itemVariants}
                        title="Chat IA"
                        description="TIRE_SUAS_DUVIDAS"
                        icon={<MessageSquare className="w-7 h-7" />}
                        color="lime"
                        accentColor="#ccff00"
                        onClick={() => onNavigate('chat')}
                    />
                    <Card
                        variants={itemVariants}
                        title="Desafio"
                        description="TESTE_CONHECIMENTO"
                        icon={<Trophy className="w-7 h-7" />}
                        color="yellow"
                        accentColor="#facc15"
                        onClick={() => onNavigate('quiz', currentTopic)}
                    />
                </div>

                {/* Bottom decorative element */}
                <motion.div 
                    variants={itemVariants}
                    className="flex items-center justify-center gap-2 pt-4"
                >
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
                    <span className="text-[10px] font-mono text-zinc-600 tracking-[0.3em]">
                        SISTEMA_ONLINE
                    </span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
                </motion.div>
            </motion.div>
        </div>
    );
};

const Card = ({ title, description, icon, color, accentColor, onClick, variants }) => {
    return (
        <motion.button
            variants={variants}
            whileTap={{
                scale: 0.97,
                transition: { duration: 0.1 }
            }}
            onClick={onClick}
            className="group relative p-4 sm:p-5 text-left transition-all bg-[#141414] border-4 border-black hover:border-transparent"
            style={{
                boxShadow: BRUTALIST.shadow('#000')
            }}
        >
            {/* Hover glow effect */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 30px ${accentColor}30, ${BRUTALIST.shadow(accentColor)}`
                }}
            />
            
            {/* Corner accents on hover */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-transparent group-hover:border-white/50 transition-colors" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-transparent group-hover:border-white/50 transition-colors" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-transparent group-hover:border-white/50 transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-transparent group-hover:border-white/50 transition-colors" />

            <div className="flex items-center gap-4 relative z-10">
                {/* Icon Container */}
                <div 
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-110"
                    style={{ 
                        borderColor: accentColor,
                        color: accentColor,
                        backgroundColor: `${accentColor}10`
                    }}
                >
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 
                        className="font-black text-lg sm:text-xl tracking-wider uppercase leading-none"
                        style={{ color: accentColor, textShadow: `2px 2px 0 ${accentColor}40` }}
                    >
                        {title}
                    </h3>
                    <p className="text-zinc-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest mt-2">
                        {description}
                    </p>
                </div>

                {/* Arrow indicator */}
                <div className="text-zinc-700 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </motion.button>
    );
};

export default Dashboard;