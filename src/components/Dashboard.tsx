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
        <div className="circuit-bg rounded-2xl p-8 -mx-4 sm:mx-0">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 sm:gap-8 pb-10 px-2 sm:px-0"
            >
            <header className="space-y-6">
                {/* Title with header-clip */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="header-clip bg-[#FF9F1C] text-[#1A1A1A] px-6 py-4 font-black text-2xl md:text-3xl tracking-widest uppercase brutal-shadow"
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
                        <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-4 border-[#FF9F1C] flex flex-col items-center justify-center brutal-shadow">
                            <p className="text-2xl font-black text-[#FF9F1C]">{level}</p>
                            <p className="text-[10px] font-bold text-[#CCFF00] text-center">ESTUDANTE</p>
                        </div>
                    </motion.div>

                    {/* XP and Progress */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex-1 space-y-3"
                    >
                        <div>
                            <p className="text-2xl font-black text-[#FF9F1C]">{xp} <span className="text-lg">XP</span></p>
                            <p className="text-xs text-[#00E5FF]">{nextLevelXP - progressToNextLevel} para próximo nível</p>
                        </div>
                        <div className="bg-[#333333] border-3 border-[#FF9F1C] p-2 rounded-lg brutal-shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-4 bg-[#1A1A1A] border-2 border-[#CCFF00] rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#CCFF00] to-[#FF9F1C]"
                                        style={{ width: `${progressToNextLevel}%` }}
                                    />
                                </div>
                                <p className="text-sm font-black text-[#CCFF00] w-10 text-right">{progressToNextLevel}%</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <motion.div variants={itemVariants} className="relative z-50">
                <div className={cn(
                    "relative flex items-center bg-[#333333] border-3 transition-all duration-300 brutal-shadow-sm",
                    isFocused ? "border-[#FF9F1C]" : "border-[#00E5FF]"
                )}>
                    <Search className={cn(
                        "ml-5 w-6 h-6 transition-colors duration-300",
                        isFocused ? "text-[#FF9F1C]" : "text-[#00E5FF]"
                    )} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="O QUE VAMOS ESTUDAR HOJE?"
                        className="w-full min-w-0 bg-transparent px-4 py-5 focus:outline-none placeholder:text-[#4A4A4A] text-white font-bold uppercase tracking-wider text-sm sm:text-base"
                    />
                </div>

                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 5 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 left-0 right-0 p-2 bg-[#1A1A1A] border-2 border-[#00E5FF] brutal-shadow-sm z-50"
                        >
                            {filteredTopics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setSearch(t); setIsFocused(false); }}
                                    className="flex items-center gap-3 w-full text-left p-4 hover:bg-[#333333] text-sm font-bold uppercase tracking-wider text-white transition-colors border-2 border-transparent hover:border-[#00E5FF]"
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
        </div>
    );
};

const Card = ({ title, description, icon, color, onClick, variants }) => {
    const colorMap = {
        cyan: {
            border: "border-[#00E5FF]",
            text: "text-[#00E5FF]",
            bg: "bg-cyan-950/30",
            shadow: "brutal-shadow",
            iconColor: "text-[#00E5FF]",
            iconBg: "bg-[#1A1A1A]",
            iconBorder: "border-[#00E5FF]"
        },
        signal: {
            border: "border-[#FF9F1C]",
            text: "text-[#FF9F1C]",
            bg: "bg-orange-950/30",
            shadow: "brutal-shadow",
            iconColor: "text-[#FF9F1C]",
            iconBg: "bg-[#1A1A1A]",
            iconBorder: "border-[#FF9F1C]"
        },
        lime: {
            border: "border-[#CCFF00]",
            text: "text-[#CCFF00]",
            bg: "bg-lime-950/30",
            shadow: "brutal-shadow",
            iconColor: "text-[#CCFF00]",
            iconBg: "bg-[#1A1A1A]",
            iconBorder: "border-[#CCFF00]"
        },
        emerald: {
            border: "border-[#00E5FF]",
            text: "text-[#00E5FF]",
            bg: "bg-cyan-950/30",
            shadow: "brutal-shadow",
            iconColor: "text-[#00E5FF]",
            iconBg: "bg-[#1A1A1A]",
            iconBorder: "border-[#00E5FF]"
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
                "group relative w-full p-5 text-left transition-all bg-[#333333] overflow-hidden",
                "border-4 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-[#00E5FF]",
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
