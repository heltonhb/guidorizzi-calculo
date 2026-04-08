import { useState, ReactNode } from 'react';
import { BookCheck, MessageSquare, Presentation, Search, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useAppContext } from '../hooks/useAppContext';

interface DashboardProps {
    onNavigate: (view: string, topic?: string) => void;
}

interface ExperimentalCardProps {
    title: string;
    subtitle: string;
    description: string;
    icon: ReactNode;
    accentColor: string;
    secondaryColor: string;
    onClick: () => void;
    variants: Variants;
    position: string;
    className?: string;
    delay?: number;
}

const DashboardBrutalistExperimental = ({ onNavigate }: DashboardProps) => {
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
                staggerChildren: 0.06,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 25, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { type: 'spring' as const, stiffness: 400, damping: 35 } 
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-6 pb-10 px-4 sm:px-6"
            style={{
                backgroundImage: `
                    linear-gradient(45deg, transparent 48%, rgba(0, 240, 255, 0.02) 49%, rgba(0, 240, 255, 0.02) 51%, transparent 52%),
                    linear-gradient(-45deg, transparent 48%, rgba(255, 85, 0, 0.02) 49%, rgba(255, 85, 0, 0.02) 51%, transparent 52%)
                `,
                backgroundSize: '60px 60px',
                backgroundPosition: '0 0, 30px 30px',
                backgroundColor: '#050505'
            }}
        >
            {/* HEADER: Experimental Level & XP Block */}
            <header>
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    className="relative"
                >
                    {/* Main asymmetrical level/xp block with overlapping borders */}
                    <div 
                        className="p-8 bg-zinc-950 relative overflow-hidden"
                        style={{
                            borderLeft: '6px solid #ff5500',
                            borderTop: '6px solid #ff5500',
                            borderRight: '2px solid #00f0ff',
                            borderBottom: '2px solid #00f0ff',
                            boxShadow: '10px 10px 0px rgba(255, 85, 0, 0.7), -5px -5px 0px rgba(0, 240, 255, 0.3)',
                            transform: 'skewY(-1deg)'
                        }}
                    >
                        <div className="flex items-baseline gap-6 font-mono font-black">
                            <div>
                                <p className="text-6xl text-[#ff5500]">{level}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">LEVEL</p>
                            </div>
                            <div className="text-zinc-600">|</div>
                            <div>
                                <p className="text-4xl text-[#00f0ff]">{xp}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">XP</p>
                            </div>
                        </div>

                        {/* Grid overlay texture */}
                        <div 
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `
                                    linear-gradient(0deg, transparent 24%, rgba(255, 85, 0, 0.1) 25%, rgba(255, 85, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 85, 0, 0.1) 75%, rgba(255, 85, 0, 0.1) 76%, transparent 77%),
                                    linear-gradient(90deg, transparent 24%, rgba(255, 85, 0, 0.1) 25%, rgba(255, 85, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 85, 0, 0.1) 75%, rgba(255, 85, 0, 0.1) 76%, transparent 77%)
                                `,
                                backgroundSize: '40px 40px'
                            }}
                        />
                    </div>

                    {/* Overlapping accent block */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-3 -right-3 p-4 bg-zinc-900 border-3"
                        style={{
                            borderColor: '#ccff00',
                            boxShadow: '6px 6px 0px rgba(204, 255, 0, 0.5)'
                        }}
                    >
                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">PRÓXIMO</p>
                        <p className="text-lg font-black text-[#ccff00] font-mono">{nextLevelXP - progressToNextLevel}</p>
                    </motion.div>
                </motion.div>

                {/* Progress bar under level block */}
                <motion.div
                    variants={itemVariants}
                    className="mt-8 bg-zinc-950 p-2 border-2"
                    style={{
                        borderColor: '#ccff00',
                        boxShadow: '4px 4px 0px rgba(204, 255, 0, 0.4)'
                    }}
                >
                    <div className="h-5 bg-zinc-900 border-2" style={{ borderColor: '#ccff00' }}>
                        <div 
                            className="h-full transition-all duration-1000"
                            style={{ 
                                width: `${progressToNextLevel}%`,
                                background: 'linear-gradient(90deg, #ccff00 0%, #00f0ff 100%)'
                            }}
                        />
                    </div>
                </motion.div>
            </header>

            {/* SEARCH BAR - Experimental style */}
            <motion.div variants={itemVariants} className="relative mt-2">
                <div 
                    className={cn(
                        "relative flex items-center bg-zinc-950 transition-all duration-300",
                        isFocused 
                            ? "border-l-4 border-t-4 border-[#00f0ff]"
                            : "border-l-2 border-t-2 border-zinc-700"
                    )}
                    style={{
                        borderRight: isFocused ? '2px solid #ff5500' : '2px solid #333',
                        borderBottom: isFocused ? '2px solid #ff5500' : '2px solid #333',
                        boxShadow: isFocused 
                            ? '8px 8px 0px rgba(0, 240, 255, 0.6), -2px -2px 0px rgba(255, 85, 0, 0.4)'
                            : '6px 6px 0px rgba(0, 0, 0, 0.8)'
                    }}
                >
                    <Search className={cn(
                        "ml-5 w-6 h-6 transition-colors duration-300 font-bold",
                        isFocused ? "text-[#00f0ff]" : "text-zinc-600"
                    )} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="EXPLORAR"
                        className="w-full min-w-0 bg-transparent px-5 py-5 focus:outline-none placeholder:text-zinc-600 text-white font-black uppercase tracking-wider font-mono"
                    />
                </div>

                {/* Dropdown Results - Experimental */}
                <AnimatePresence>
                    {isFocused && search && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 12, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border-2 border-[#00f0ff] z-50"
                            style={{
                                boxShadow: '8px 8px 0px rgba(0, 240, 255, 0.5)'
                            }}
                        >
                            {filteredTopics.map((t, idx) => (
                                <button
                                    key={t}
                                    onClick={() => { setSearch(t); setIsFocused(false); }}
                                    className={cn(
                                        "w-full text-left px-5 py-4 font-black uppercase tracking-wider text-white transition-all font-mono",
                                        idx < filteredTopics.length - 1 ? "border-b-2 border-zinc-800" : "",
                                        "hover:bg-zinc-900 hover:text-[#00f0ff] hover:pl-7"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* MENU - Asymmetrical Overlapping Blocks */}
            <div className="mt-8 relative min-h-[600px] lg:min-h-[700px]">
                {/* Studio Conceitos */}
                <ExperimentalCard
                    variants={itemVariants}
                    title="ESTUDE"
                    subtitle="CONCEITOS"
                    description="Aprofunde-se"
                    icon={<BookCheck className="w-10 h-10" />}
                    accentColor="#00f0ff"
                    secondaryColor="#ff5500"
                    onClick={() => onNavigate('study', currentTopic)}
                    position="top-0 left-0"
                    className="lg:w-1/3"
                />

                {/* Exercícios */}
                <ExperimentalCard
                    variants={itemVariants}
                    title="EXERCÍCIOS"
                    subtitle="PRÁTICOS"
                    description="Resolva"
                    icon={<Trophy className="w-10 h-10" />}
                    accentColor="#ccff00"
                    secondaryColor="#00d084"
                    onClick={() => onNavigate('quiz', currentTopic)}
                    position="top-32 right-0 lg:top-0 lg:left-1/3"
                    className="lg:w-1/3"
                    delay={0.1}
                />

                {/* Flashcards */}
                <ExperimentalCard
                    variants={itemVariants}
                    title="FLASHCARDS"
                    subtitle="TURBO AI"
                    description="Memorize"
                    icon={<Presentation className="w-10 h-10" />}
                    accentColor="#ff5500"
                    secondaryColor="#ccff00"
                    onClick={() => onNavigate('flashcards', currentTopic)}
                    position="top-64 left-0 lg:top-0 lg:left-2/3"
                    className="lg:w-1/3"
                    delay={0.2}
                />

                {/* Chat Guidorizzi */}
                <ExperimentalCard
                    variants={itemVariants}
                    title="CHAT"
                    subtitle="GUIDORIZZI"
                    description="Converse"
                    icon={<MessageSquare className="w-10 h-10" />}
                    accentColor="#00d084"
                    secondaryColor="#00f0ff"
                    onClick={() => onNavigate('chat')}
                    position="top-96 right-0 lg:top-64 lg:left-1/3"
                    className="lg:w-1/3"
                    delay={0.15}
                />
            </div>

            {/* Bottom Navigation Spacer */}
            <div className="h-32" />
        </motion.div>
    );
};

const ExperimentalCard = ({ 
    title, 
    subtitle,
    description, 
    icon, 
    accentColor, 
    secondaryColor,
    onClick, 
    variants, 
    position,
    className,
    delay = 0
}: ExperimentalCardProps) => {
    return (
        <motion.button
            variants={variants}
            transition={{ delay }}
            whileHover={{ x: -6, y: -6 }}
            whileTap={{ x: 3, y: 3 }}
            onClick={onClick}
            className={cn(
                "group absolute lg:relative w-64 p-6 text-left transition-all bg-zinc-950 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950",
                position,
                className
            )}
            style={{
                borderLeft: `5px solid ${accentColor}`,
                borderTop: `5px solid ${accentColor}`,
                borderRight: `3px solid ${secondaryColor}`,
                borderBottom: `3px solid ${secondaryColor}`,
                boxShadow: `12px 12px 0px ${accentColor}55, -4px -4px 0px ${secondaryColor}33`,
                transform: 'perspective(800px) rotateY(-2deg)',
            }}
        >
            <div className="relative z-10 space-y-4">
                {/* Icon with border */}
                <div 
                    className="w-16 h-16 flex items-center justify-center border-3 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6"
                    style={{
                        borderColor: accentColor,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)'
                    }}
                >
                    <div style={{ color: accentColor }}>
                        {icon}
                    </div>
                </div>

                {/* Title - Split into two lines */}
                <div>
                    <p 
                        className="font-black text-2xl tracking-tight font-mono leading-tight"
                        style={{ color: accentColor }}
                    >
                        {title}
                    </p>
                    <p 
                        className="font-black text-lg tracking-tight font-mono leading-tight"
                        style={{ color: secondaryColor }}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider font-mono">
                    {description}
                </p>

                {/* Small indicator */}
                <div className="flex items-center gap-2 pt-2">
                    <Zap className="w-3 h-3" style={{ color: accentColor }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: secondaryColor }}>ATIVO</span>
                </div>
            </div>

            {/* Grid texture overlay */}
            <div 
                className="absolute inset-0 opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity duration-300"
                style={{
                    backgroundImage: `
                        linear-gradient(0deg, transparent 24%, ${accentColor}40 25%, ${accentColor}40 26%, transparent 27%, transparent 74%, ${accentColor}40 75%, ${accentColor}40 76%, transparent 77%),
                        linear-gradient(90deg, transparent 24%, ${accentColor}40 25%, ${accentColor}40 26%, transparent 27%, transparent 74%, ${accentColor}40 75%, ${accentColor}40 76%, transparent 77%)
                    `,
                    backgroundSize: '30px 30px'
                }}
            />
        </motion.button>
    );
};

export default DashboardBrutalistExperimental;
