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
        hidden: { y: 16, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
    };

    return (
        <div className="min-h-screen bg-[#000000]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-8 sm:gap-10 pb-12 px-4 sm:px-6 pt-6 sm:pt-8 max-w-xl mx-auto"
            >
                <header className="space-y-8">
                    <motion.div
                        initial={{ y: -16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-2"
                    >
                        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white leading-[0.96]">
                            Cálculo I
                        </h1>
                        <p className="text-[#A1A1AA] text-base font-normal tracking-wide">
                            Hamilton Guidorizzi
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-5">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex-shrink-0"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#02090A] border border-[#1E2C31] flex flex-col items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <p className="text-2xl font-light text-white">{level}</p>
                                <p className="text-[10px] font-medium text-[#A1A1AA] tracking-widest uppercase">Nível</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 12, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex-1 space-y-3"
                        >
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-light text-white">{xp}</p>
                                <p className="text-sm font-normal text-[#A1A1AA]">XP</p>
                            </div>
                            <div className="h-2 bg-[#061A1C] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#36F4A4] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNextLevel}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-xs text-[#71717A]">
                                {nextLevelXP - progressToNextLevel} XP para próximo nível
                            </p>
                        </motion.div>
                    </div>
                </header>

                <motion.div variants={itemVariants} className="relative z-50">
                    <div className={cn(
                        "relative flex items-center bg-[#061A1C] border border-[#3F3F46] rounded-lg transition-all duration-200",
                        isFocused && "border-[#36F4A4] ring-2 ring-[#36F4A4]/20"
                    )}>
                        <Search className={cn(
                            "ml-4 w-5 h-5 transition-colors duration-200",
                            isFocused ? "text-[#36F4A4]" : "text-[#71717A]"
                        )} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="O que vamos estudar?"
                            className="w-full min-w-0 bg-transparent px-4 py-4 focus:outline-none placeholder:text-[#71717A] text-white font-normal text-base"
                        />
                    </div>

                    <AnimatePresence>
                        {isFocused && search && filteredTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 4 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full mt-2 left-0 right-0 bg-[#02090A] border border-[#1E2C31] rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] z-50 overflow-hidden"
                            >
                                {filteredTopics.slice(0, 5).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setSearch(t); setIsFocused(false); }}
                                        className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#102620] text-sm font-normal text-white transition-colors border-b border-[#1E2C31]/50 last:border-0"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="space-y-3">
                    <Card
                        variants={itemVariants}
                        title="Flashcards"
                        description="Revise conceitos fundamentais"
                        icon={<BookCheck className="w-6 h-6" />}
                        onClick={() => onNavigate('flashcards', currentTopic)}
                    />
                    <Card
                        variants={itemVariants}
                        title="Apresentação"
                        description="Slides em alta definição"
                        icon={<Presentation className="w-6 h-6" />}
                        onClick={() => onNavigate('presentation', currentTopic)}
                    />
                    <Card
                        variants={itemVariants}
                        title="Chat AI"
                        description="Tire suas dúvidas"
                        icon={<MessageSquare className="w-6 h-6" />}
                        onClick={() => onNavigate('chat')}
                    />
                    <Card
                        variants={itemVariants}
                        title="Quiz"
                        description="Teste seus conhecimentos"
                        icon={<Trophy className="w-6 h-6" />}
                        onClick={() => onNavigate('quiz', currentTopic)}
                    />
                </div>
            </motion.div>
        </div>
    );
};

const Card = ({ title, description, icon, onClick, variants }) => {
    return (
        <motion.button
            variants={variants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className="group relative w-full p-5 text-left transition-all bg-[#02090A] border border-[#1E2C31] rounded-lg overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.03)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1),0_8px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#36F4A4]/30"
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#102620] rounded-lg text-[#36F4A4]">
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-normal text-lg text-white tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-[#71717A] mt-0.5">
                        {description}
                    </p>
                </div>
            </div>
        </motion.button>
    );
};

export default Dashboard;
