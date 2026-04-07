import { useState } from 'react';
import { BookCheck, MessageSquare, Presentation, Search, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useAppContext } from '../hooks/useAppContext';

const Dashboard = ({ onNavigate }) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { xp, level, progressToNextLevel, nextLevelXP } = useAppContext();

    const topics = Object.keys(contentData);
    const filteredTopics = topics.filter(t => t.toLowerCase().includes(search.toLowerCase()));

    // If no filtered topics, the search itself becomes the topic
    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');

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
            <header className="space-y-6">
                {/* Title */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 text-black px-6 py-4 font-black text-2xl md:text-3xl tracking-widest uppercase rounded-xl shadow-[6px_6px_0_rgba(0,0,0,0.4)]"
                >
                    Cálculo Precision
                </motion.div>

                {/* Gamification Circle + Stats */}
                <div className="flex items-center gap-6">
                    {/* Level Circle */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-shrink-0"
                    >
                        <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-orange-500 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,127,0,0.4)]">
                            <p className="text-2xl font-black text-orange-400">{level}</p>
                            <p className="text-[10px] font-bold text-orange-300 text-center">ESTUDANTE</p>
                        </div>
                    </motion.div>

                    {/* XP and Progress */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex-1 space-y-3"
                    >
                        <div>
                            <p className="text-2xl font-black text-orange-400">{xp} <span className="text-lg">XP</span></p>
                            <p className="text-xs text-zinc-400">{nextLevelXP - progressToNextLevel} para próximo nível</p>
                        </div>
                        <div className="bg-zinc-900 border-3 border-orange-500 p-2 rounded-lg shadow-[4px_4px_0_rgba(255,127,0,0.3)]">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-4 bg-zinc-800 border-2 border-yellow-300 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-yellow-300 to-orange-400"
                                        style={{ width: `${progressToNextLevel}%` }}
                                    />
                                </div>
                                <p className="text-sm font-black text-yellow-300 w-10 text-right">{progressToNextLevel}%</p>
                            </div>
                        </div>
                    </motion.div>
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
                                    {t}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Stats de Progresso - REMOVIDO para manter layout limpo */}

            <div className="space-y-4">
                <Card
                    variants={itemVariants}
                    title="Flashcards AI"
                    description="Reforce conceitos fundamentais"
                    icon={<BookCheck className="w-8 h-8" />}
                    color="signal"
                    onClick={() => onNavigate('flashcards', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Modo Aula"
                    description="Apresentação em alta definição"
                    icon={<Presentation className="w-8 h-8" />}
                    color="cyan"
                    onClick={() => onNavigate('presentation', currentTopic)}
                />
                <Card
                    variants={itemVariants}
                    title="Chat IA"
                    description="Tire dúvidas agora mesmo"
                    icon={<MessageSquare className="w-8 h-8" />}
                    color="emerald"
                    onClick={() => onNavigate('chat')}
                />
                <Card
                    variants={itemVariants}
                    title="Desafio Guidorizzi"
                    description="Teste seus conhecimentos"
                    icon={<Trophy className="w-8 h-8" />}
                    color="lime"
                    onClick={() => onNavigate('quiz', currentTopic)}
                />
            </div>
        </motion.div>
    );
};

const Card = ({ title, description, icon, color, onClick, variants }) => {
    const colorMap = {
        cyan: {
            border: "border-[#00f0ff]",
            text: "text-[#00f0ff]",
            bg: "bg-cyan-600/10",
            shadow: "shadow-[5px_5px_0_#00f0ff]",
            iconColor: "text-[#00f0ff]",
            iconBg: "bg-cyan-950",
            iconBorder: "border-[#00f0ff]"
        },
        signal: {
            border: "border-[#ff5500]",
            text: "text-[#ff5500]",
            bg: "bg-orange-600/10",
            shadow: "shadow-[5px_5px_0_#ff5500]",
            iconColor: "text-[#ff5500]",
            iconBg: "bg-orange-950",
            iconBorder: "border-[#ff5500]"
        },
        lime: {
            border: "border-[#ccff00]",
            text: "text-[#ccff00]",
            bg: "bg-lime-600/10",
            shadow: "shadow-[5px_5px_0_#ccff00]",
            iconColor: "text-[#ccff00]",
            iconBg: "bg-lime-950",
            iconBorder: "border-[#ccff00]"
        },
        emerald: {
            border: "border-[#22c55e]",
            text: "text-[#22c55e]",
            bg: "bg-emerald-600/10",
            shadow: "shadow-[5px_5px_0_#22c55e]",
            iconColor: "text-[#22c55e]",
            iconBg: "bg-emerald-950",
            iconBorder: "border-[#22c55e]"
        }
    };

    const colors = colorMap[color] || colorMap.cyan;

    return (
        <motion.button
            variants={variants}
            whileHover={{ x: -3, y: -3 }}
            whileTap={{ x: 3, y: 3, boxShadow: "0px 0px 0px transparent" }}
            onClick={onClick}
            className={cn(
                "group relative w-full p-5 text-left transition-all bg-zinc-950 overflow-hidden",
                "border-4 rounded-xl outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-white",
                colors.border,
                colors.shadow,
                colors.bg
            )}
        >
            <div className="flex items-start gap-4">
                {/* Icon Box */}
                <div className={cn(
                    "flex-shrink-0 w-16 h-16 flex items-center justify-center border-3 rounded-lg transition-transform duration-300 group-hover:scale-110",
                    colors.iconBg,
                    colors.iconBorder
                )}>
                    <div className={colors.iconColor}>
                        {icon}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={cn("font-black text-lg tracking-tight uppercase", colors.text)}>
                        {title}
                    </h3>
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mt-1">
                        {description}
                    </p>
                </div>
            </div>
        </motion.button>
    );
};

export default Dashboard;
