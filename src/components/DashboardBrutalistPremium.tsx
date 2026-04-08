import { useState, ReactNode } from 'react';
import { BookCheck, MessageSquare, Presentation, Search, Trophy } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useAppContext } from '../hooks/useAppContext';

interface DashboardProps {
    onNavigate: (view: string, topic?: string) => void;
}

interface PremiumCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    accentColor: string;
    onClick: () => void;
    variants: Variants;
}

const DashboardBrutalistPremium = ({ onNavigate }: DashboardProps) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { xp, level, progressToNextLevel, nextLevelXP } = useAppContext();

    const topics = Object.keys(contentData);
    const filteredTopics = topics.filter(t => t.toLowerCase().includes(search.toLowerCase()));

    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { type: 'spring' as const, stiffness: 350, damping: 30 } 
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-10 px-4 sm:px-6"
            style={{
                backgroundImage: `
                    linear-gradient(0deg, transparent 24%, rgba(255, 200, 0, 0.03) 25%, rgba(255, 200, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 200, 0, 0.03) 75%, rgba(255, 200, 0, 0.03) 76%, transparent 77%, transparent),
                    linear-gradient(90deg, transparent 24%, rgba(255, 200, 0, 0.03) 25%, rgba(255, 200, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 200, 0, 0.03) 75%, rgba(255, 200, 0, 0.03) 76%, transparent 77%, transparent)
                `,
                backgroundSize: '50px 50px',
                backgroundColor: '#0a0a0a'
            }}
        >
            {/* HEADER: Level Badge + XP Progress */}
            <header className="space-y-6">
                {/* Level Badge - Brutalist Premium */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-4"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#ccff00] to-[#00f0ff] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
                        <div className="relative w-32 h-32 rounded-none bg-zinc-950 border-4 border-[#ccff00] flex flex-col items-center justify-center shadow-[8px_8px_0_rgba(204,255,0,0.5)]">
                            <p className="text-4xl font-black text-[#ccff00] font-mono">{level}</p>
                            <p className="text-[11px] font-black text-[#ccff00] uppercase tracking-widest mt-1">LEVEL</p>
                        </div>
                    </div>

                    {/* XP Stats Block */}
                    <div className="flex-1 space-y-3">
                        <div className="bg-zinc-950 border-3 border-[#ff5500] px-5 py-4 shadow-[6px_6px_0_rgba(255,85,0,0.6)]">
                            <p className="text-3xl font-black text-[#ff5500] font-mono">{xp}</p>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">XP TOTAL</p>
                        </div>
                        <div className="bg-zinc-950 border-3 border-[#00f0ff] px-5 py-4 shadow-[6px_6px_0_rgba(0,240,255,0.6)]">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">PRÓXIMO NÍVEL</p>
                            <p className="text-lg font-black text-[#00f0ff] font-mono mt-1">{nextLevelXP - progressToNextLevel} XP</p>
                        </div>
                    </div>
                </motion.div>

                {/* XP Progress Bar - Thick Brutalist */}
                <motion.div
                    variants={itemVariants}
                    className="bg-zinc-950 border-4 border-[#ccff00] p-3 shadow-[6px_6px_0_rgba(204,255,0,0.5)]"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-6 bg-zinc-900 border-2 border-[#ccff00] overflow-hidden">
                                <div 
                                    className="h-full bg-[#ccff00] transition-all duration-1000"
                                    style={{ width: `${progressToNextLevel}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-sm font-black text-[#ccff00] font-mono whitespace-nowrap">{progressToNextLevel}%</p>
                    </div>
                </motion.div>
            </header>

            {/* SEARCH BAR - Thick Borders, Sharp Shadow */}
            <motion.div variants={itemVariants} className="relative">
                <div className={cn(
                    "relative flex items-center bg-zinc-950 border-4 transition-all duration-300",
                    isFocused 
                        ? "border-[#00f0ff] shadow-[6px_6px_0_rgba(0,240,255,0.8)]" 
                        : "border-zinc-800 shadow-[6px_6px_0_rgba(0,0,0,0.8)]"
                )}>
                    <Search className={cn(
                        "ml-5 w-6 h-6 transition-colors duration-300 font-bold",
                        isFocused ? "text-[#00f0ff]" : "text-zinc-500"
                    )} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="BUSCAR CONCEITO"
                        className="w-full min-w-0 bg-transparent px-5 py-6 focus:outline-none placeholder:text-zinc-600 text-white font-black uppercase tracking-wider text-base font-mono"
                    />
                </div>

                {/* Dropdown Results */}
                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 8 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border-3 border-[#00f0ff] shadow-[6px_6px_0_rgba(0,240,255,0.6)] z-50"
                        >
                            {filteredTopics.map((t, idx) => (
                                <button
                                    key={t}
                                    onClick={() => { setSearch(t); setIsFocused(false); }}
                                    className={cn(
                                        "w-full text-left px-5 py-4 font-black uppercase tracking-wider text-white transition-all font-mono",
                                        idx < filteredTopics.length - 1 ? "border-b-2 border-zinc-800" : "",
                                        "hover:bg-zinc-900 hover:text-[#00f0ff]"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* MENU BUTTONS - Large Blocky Cards */}
            <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PremiumCard
                    variants={itemVariants}
                    title="ESTUDE CONCEITOS"
                    description="Aprofunde-se nos tópicos"
                    icon={<BookCheck className="w-8 h-8" />}
                    accentColor="#00f0ff"
                    onClick={() => onNavigate('study', currentTopic)}
                />
                <PremiumCard
                    variants={itemVariants}
                    title="EXERCÍCIOS"
                    description="Resolva problemas práticos"
                    icon={<Trophy className="w-8 h-8" />}
                    accentColor="#ff5500"
                    onClick={() => onNavigate('quiz', currentTopic)}
                />
                <PremiumCard
                    variants={itemVariants}
                    title="FLASHCARDS AI"
                    description="Reforce com IA personalizadora"
                    icon={<Presentation className="w-8 h-8" />}
                    accentColor="#ccff00"
                    onClick={() => onNavigate('flashcards', currentTopic)}
                />
                <PremiumCard
                    variants={itemVariants}
                    title="CHAT GUIDORIZZI"
                    description="Converse com IA especializada"
                    icon={<MessageSquare className="w-8 h-8" />}
                    accentColor="#00d084"
                    onClick={() => onNavigate('chat')}
                />
            </div>

            {/* Bottom Navigation Spacer */}
            <div className="h-20" />
        </motion.div>
    );
};

const PremiumCard = ({ title, description, icon, accentColor, onClick, variants }: PremiumCardProps) => {
    return (
        <motion.button
            variants={variants}
            whileHover={{ x: -4, y: -4, boxShadow: `10px 10px 0px ${accentColor}80` }}
            whileTap={{ x: 2, y: 2 }}
            onClick={onClick}
            className="group relative w-full p-8 text-left transition-all bg-zinc-950 overflow-hidden outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950"
            style={{
                border: `4px solid ${accentColor}`,
                boxShadow: `8px 8px 0px ${accentColor}66`,
                backgroundColor: '#0a0a0a'
            }}
        >
            <div className="relative z-10 flex items-start gap-6">
                {/* Icon Box */}
                <div 
                    className="flex-shrink-0 w-20 h-20 flex items-center justify-center border-3 transition-transform duration-300 group-hover:scale-115"
                    style={{
                        borderColor: accentColor,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{ color: accentColor }}>
                        {icon}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                    <h3 
                        className="font-black text-xl tracking-tight uppercase font-mono"
                        style={{ color: accentColor }}
                    >
                        {title}
                    </h3>
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mt-2 font-mono">
                        {description}
                    </p>
                </div>
            </div>

            {/* Subtle grid texture overlay on hover */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                    backgroundImage: `linear-gradient(0deg, transparent 24%, ${accentColor}20 25%, ${accentColor}20 26%, transparent 27%, transparent 74%, ${accentColor}20 75%, ${accentColor}20 76%, transparent 77%),
                        linear-gradient(90deg, transparent 24%, ${accentColor}20 25%, ${accentColor}20 26%, transparent 27%, transparent 74%, ${accentColor}20 75%, ${accentColor}20 76%, transparent 77%)`,
                    backgroundSize: '30px 30px'
                }}
            />
        </motion.button>
    );
};

export default DashboardBrutalistPremium;
