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
            <header className="space-y-8">
                {/* Title */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-orange-500 border-4 border-black text-black px-6 py-4 font-black text-2xl md:text-3xl tracking-widest uppercase shadow-[6px_6px_0_rgba(0,0,0,1)] text-center"
                >
                    Cálculo Precision
                </motion.div>

                {/* Gamification Stats */}
                <div className="flex items-center justify-between gap-4">
                    {/* Level Circle */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative flex-shrink-0 w-[110px] h-[110px] bg-zinc-800 border-4 border-black rounded-full shadow-[6px_6px_0_rgba(0,0,0,1)] flex items-center justify-center p-1"
                    >
                        {/* Segment overlay using conic gradient */}
                        <div
                            className="absolute inset-[4px] rounded-full"
                            style={{ background: `conic-gradient(#f97316 ${progressToNextLevel}%, transparent ${progressToNextLevel}%)`, WebkitMask: 'radial-gradient(transparent 58%, black 60%)' }}
                        ></div>
                        {/* Static dark overlay to make empty parts look distinct, optional */}
                        <div className="absolute inset-[4px] rounded-full border-4 border-orange-500 border-dashed opacity-30"></div>

                        <div className="flex flex-col items-center z-10 translate-y-1">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none">Level</span>
                            <span className="text-4xl font-black text-white leading-none my-1">{level}</span>
                            <span className="text-[8px] font-black text-orange-400 text-center leading-[1.1] max-w-[70px] uppercase">Estudante de Cálculo</span>
                        </div>
                    </motion.div>

                    {/* XP and Progress */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex-1 space-y-3"
                    >
                        <div>
                            <p className="text-3xl font-black text-orange-500">{xp} <span className="text-lg">XP</span></p>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{nextLevelXP - progressToNextLevel} para próximo nível</p>
                        </div>
                        <div className="bg-zinc-800 border-4 border-black p-1 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center">
                            <div className="flex-1 h-6 bg-zinc-900 border-r-4 border-black overflow-hidden flex">
                                <div
                                    className="h-full bg-lime-400 border-r-4 border-black"
                                    style={{ width: `${progressToNextLevel}%` }}
                                />
                            </div>
                            <p className="text-xs font-black text-lime-400 w-12 text-center">{progressToNextLevel}%</p>
                        </div>
                    </motion.div>
                </div>
            </header>

            <motion.div variants={itemVariants} className="relative z-50">
                <div className={cn(
                    "relative flex items-center bg-zinc-400 border-4 border-black transition-all duration-200 mt-2",
                    isFocused ? "shadow-[8px_8px_0_theme(colors.black)] translate-x-[-2px] translate-y-[-2px]" : "shadow-[6px_6px_0_rgba(0,0,0,1)]"
                )}>
                    <Search className="ml-4 w-6 h-6 text-black flex-shrink-0" strokeWidth={3} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="O QUE VAMOS ESTUDAR HOJE?"
                        className="w-full min-w-0 bg-transparent px-3 py-4 focus:outline-none placeholder:text-zinc-700 text-black font-black uppercase tracking-wider text-sm sm:text-base md:text-lg"
                    />
                </div>

                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 5 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 left-0 right-0 p-2 bg-zinc-900 border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] z-50"
                        >
                            {filteredTopics.map(t => (
                                <button
                                    key={t}
                                    onMouseDown={() => { setSearch(t); setIsFocused(false); }}
                                    className="flex items-center gap-3 w-full text-left p-4 hover:bg-zinc-800 text-sm font-black uppercase tracking-wider text-white transition-colors border-4 border-transparent hover:border-black"
                                >
                                    {t}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="space-y-4 mt-2">
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
            border: "border-cyan-400",
            text: "text-cyan-400",
            iconColor: "text-cyan-400",
            shadowColor: "#22d3ee", // cyan-400
        },
        signal: {
            border: "border-orange-500",
            text: "text-orange-500",
            iconColor: "text-orange-500",
            shadowColor: "#f97316", // orange-500
        },
        lime: {
            border: "border-lime-400",
            text: "text-lime-400",
            iconColor: "text-lime-400",
            shadowColor: "#a3e635", // lime-400
        },
        emerald: {
            border: "border-emerald-400",
            text: "text-emerald-400",
            iconColor: "text-emerald-400",
            shadowColor: "#34d399", // emerald-400
        }
    };

    const colors = colorMap[color] || colorMap.cyan;

    return (
        <motion.button
            variants={variants}
            whileHover={{ x: -4, y: -4 }}
            whileTap={{ x: 2, y: 2 }}
            onClick={onClick}
            className={cn(
                "group relative w-full p-4 sm:p-5 text-left transition-all bg-zinc-900 overflow-visible",
                "border-4 rounded-none outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black focus:ring-white",
                colors.border
            )}
            style={{
                // Stacked shadow effect to simulate 3D depth
                boxShadow: `
                    2px 2px 0px 0px #000,
                    4px 4px 0px 0px #000,
                    6px 6px 0px 0px #000,
                    8px 8px 0px 0px #000,
                    10px 10px 0px 0px #000
                `
            }}
        >
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                {/* Icon Box */}
                <div className={cn(
                    "flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-4 rounded-none transition-transform duration-200 group-hover:scale-110",
                    "bg-[#111111]",
                    colors.border
                )}>
                    <div className={colors.iconColor}>
                        {icon}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={cn("font-black text-lg sm:text-xl tracking-tight uppercase leading-none", colors.text)}>
                        {title}
                    </h3>
                    <p className="text-zinc-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-2 truncate sm:whitespace-normal">
                        {description}
                    </p>
                </div>
            </div>

            {/* Inner background highlight on hover matching brutalist principles */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none z-0" />
        </motion.button>
    );
};

export default Dashboard;
