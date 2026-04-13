import { useState } from 'react';
import { BookCheck, MessageSquare, Presentation, Search, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import contentData from '../data/content.json';
import { useAppContext } from '../hooks/useAppContext';
import { performDeepSearch } from '../utils/searchUtils';

const NeobrutalistCard = ({ title, colorCode, icon, onClick }: { title: string, colorCode: string, icon: React.ReactNode, onClick: () => void }) => (
    <motion.button
        whileTap={{ scale: 0.96, x: 4, y: 4, boxShadow: '4px 4px 0px #000' }}
        whileHover={{ x: -2, y: -2, boxShadow: '10px 10px 0px #000' }}
        onClick={onClick}
        className={cn(
            "w-full flex items-center p-5 rounded-lg bg-[#111111] border-[4px] shadow-[8px_8px_0px_#000] transition-all",
        )}
        style={{ borderColor: colorCode }}
    >
        <div className="flex-shrink-0 mr-4 flex items-center justify-center p-1" style={{ color: colorCode }}>
            {icon}
        </div>
        <div className="flex-1 text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-widest uppercase italic" style={{ color: colorCode, textShadow: '2px 2px 0px #000' }}>
                {title}
            </h3>
        </div>
    </motion.button>
);

const Dashboard = ({ onNavigate }: { onNavigate: (view: string, topic?: string) => void }) => {
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { xp, level, progressToNextLevel, nextLevelXP, userProgress } = useAppContext();

    const filteredTopics = performDeepSearch(search, contentData);

    const currentTopic = search.trim() !== '' ? search : (filteredTopics[0] || 'Limites');

    return (
        <div className="min-h-[100dvh] bg-[#222222] relative overflow-x-hidden pt-6 font-mono selection:bg-[#CCFF00] selection:text-black flex flex-col items-center">
            {/* Dark circuit board texture using CSS pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.15] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
            
            <div className="relative z-10 w-full max-w-[420px] px-6 pb-24 space-y-8">

                {/* Top Header */}
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#FFA800] border-[4px] border-black rounded-xl p-3 shadow-[8px_8px_0px_0px_#000] text-center w-full"
                >
                    <h1 className="text-[1.75rem] font-black text-black tracking-tighter uppercase leading-tight">
                        Cálculo Precision
                    </h1>
                </motion.div>

                {/* Level and XP Section */}
                <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-row items-center gap-6 w-full"
                >
                    {/* Level Badge */}
                    <div className="relative flex-shrink-0 w-[115px] h-[115px] bg-[#2A2A2A] rounded-full border-[6px] border-[#FF4F00] shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center z-10">
                        {/* Circular progress visual approximation */}
                        <div className="absolute inset-1 rounded-full border-[6px] border-[#FF9F0A] border-t-transparent opacity-90 rotate-[45deg]" />
                        <div className="absolute inset-1 rounded-full border-[6px] border-[#CCFF00] border-b-transparent border-r-transparent opacity-80 rotate-[130deg]" />

                        <p className="text-[#FF9F0A] text-[10px] font-black uppercase tracking-widest mt-1">Level</p>
                        <p className="text-[#FF9F0A] text-5xl font-black leading-none drop-shadow-[2px_2px_0px_#000]">{level}</p>
                        <p className="text-[#FF9F0A] text-[8px] font-black uppercase text-center leading-tight mt-1 max-w-[80%] mx-auto opacity-90">
                            Estudante de Cálculo
                        </p>
                    </div>

                    {/* XP Progress Data */}
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[2rem] font-black text-[#FFA800] drop-shadow-[2px_2px_0px_#000]">{xp} XP</span>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-300 tracking-wide">
                            {nextLevelXP - Math.round(nextLevelXP * progressToNextLevel / 100)} para próximo nível
                        </p>

                        <div className="h-6 w-full bg-[#111] rounded border-[3px] border-[#FFA800] shadow-[4px_4px_0px_0px_#000] mt-2 relative overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressToNextLevel}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-0 left-0 bottom-0 bg-[#CCFF00]"
                            />
                            <div className="absolute right-2 top-0 bottom-0 flex items-center z-10 mix-blend-difference">
                                <span className="text-[11px] font-black text-[#CCFF00] tracking-widest drop-shadow-[1px_1px_0px_#000]">{Math.round(progressToNextLevel)}%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="w-full relative pt-2">
                    {/* Search Input */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-50"
                    >
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-20">
                            <Search className="h-6 w-6 text-black" strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder="O QUE VAMOS ESTUDAR HOJE?"
                            className="w-full h-[3.5rem] pl-[52px] pr-4 bg-[#A8A8A8] border-[4px] border-black font-black text-black rounded-lg shadow-[6px_6px_0px_0px_#000] placeholder:text-zinc-800 transition-all uppercase outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_#000]"
                        />

                        <AnimatePresence>
                            {isFocused && search && filteredTopics.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 8 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 bg-[#E0E0E0] border-[4px] border-black rounded-lg shadow-[6px_6px_0px_#000] z-[100] overflow-hidden"
                                >
                                    {filteredTopics.slice(0, 5).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setSearch(t); setIsFocused(false); }}
                                            className="block w-full text-left px-5 py-3 hover:bg-black hover:text-[#CCFF00] text-black text-sm font-black uppercase transition-colors border-b-[3px] border-black border-dashed last:border-0"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Recent Progress Section */}
                    {Object.entries(userProgress).length > 0 && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="bg-black border-[4px] border-black rounded-lg p-5 shadow-[6px_6px_0px_#FFA800] space-y-4 mt-8"
                        >
                            <h2 className="text-sm font-black text-[#FFA800] uppercase tracking-[3px] flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Seu Progresso
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(userProgress).filter(([_, prog]) => (prog as number) > 0).map(([topic, prog]) => (
                                    <div key={topic} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{topic}</span>
                                            <span className="text-[10px] font-black text-[#CCFF00]">{prog as number}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-[#1A1A1A] border-[2px] border-[#333] overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${prog}%` }}
                                                className="h-full bg-[#CCFF00]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-5 mt-8 relative z-0"
                    >
                        <NeobrutalistCard
                            title="FLASHCARDS"
                            colorCode="#CCFF00"
                            icon={<BookCheck className="w-8 h-8" strokeWidth={2.5} />}
                            onClick={() => onNavigate('flashcards', currentTopic)}
                        />
                        <NeobrutalistCard
                            title="MODO AULA"
                            colorCode="#00FFFF"
                            icon={<Presentation className="w-8 h-8" strokeWidth={2.5} />}
                            onClick={() => onNavigate('presentation', currentTopic)}
                        />
                        <NeobrutalistCard
                            title="CHAT IA"
                            colorCode="#2962FF"
                            icon={<MessageSquare className="w-8 h-8" strokeWidth={2.5} />}
                            onClick={() => onNavigate('chat')}
                        />
                        <NeobrutalistCard
                            title="DESAFIO DO GUIDORIZZI"
                            colorCode="#FF6D00"
                            icon={<Trophy className="w-8 h-8" strokeWidth={2.5} />}
                            onClick={() => onNavigate('quiz', currentTopic)}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
