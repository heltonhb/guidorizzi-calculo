import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, ChevronRight, Hash, Star } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import contentData from '../data/content.json';
import { cn } from '../lib/utils';

const NavigationSidebar = () => {
    const { isSidebarOpen, toggleSidebar, currentTopic, navigateTo, userProgress } = useAppContext();

    const topics = Object.keys(contentData);

    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const overlayVariants = {
        open: { opacity: 1 },
        closed: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#111] border-r-[6px] border-black z-[1001] flex flex-col shadow-[10px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                        {/* Header */}
                        <div className="p-6 bg-[#CCFF00] border-b-[4px] border-black flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Book className="w-6 h-6 text-black" strokeWidth={3} />
                                <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">Índice</h2>
                            </div>
                            <button 
                                onClick={toggleSidebar}
                                className="p-1 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" strokeWidth={3} />
                            </button>
                        </div>

                        {/* Search in Sidebar (Optional Placeholder) */}
                        <div className="p-4 bg-[#222] border-b-[4px] border-black">
                            <div className="bg-black/40 border-[2px] border-zinc-700 p-2 text-[10px] text-zinc-500 font-mono uppercase tracking-[2px]">
                                Guidorizzi Volume 1
                            </div>
                        </div>

                        {/* Navigation List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {topics.map((topic, index) => {
                                const isActive = currentTopic === topic;
                                const progress = userProgress?.[topic] || 0;

                                return (
                                    <motion.button
                                        key={topic}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigateTo('dashboard', topic)}
                                        className={cn(
                                            "w-full flex flex-col p-4 rounded-none border-[3px] transition-all text-left relative overflow-hidden group",
                                            isActive 
                                                ? "bg-black border-[#CCFF00] shadow-[4px_4px_0px_#CCFF00]" 
                                                : "bg-[#1A1A1A] border-black hover:border-zinc-500"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                isActive ? "text-[#CCFF00]" : "text-zinc-500"
                                            )}>
                                                Cap {index + 1}
                                            </span>
                                            {progress === 100 && <Star className="w-3 h-3 text-[#CCFF00] fill-[#CCFF00]" />}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Hash className={cn(
                                                "w-4 h-4",
                                                isActive ? "text-[#CCFF00]" : "text-zinc-600"
                                            )} />
                                            <span className={cn(
                                                "text-sm font-black uppercase tracking-tight",
                                                isActive ? "text-white" : "text-zinc-300 group-hover:text-white transition-colors"
                                            )}>
                                                {topic}
                                            </span>
                                        </div>

                                        {/* Progress bar in sidebar item */}
                                        <div className="absolute bottom-0 left-0 h-[3px] bg-zinc-800 w-full">
                                            <div 
                                                className="h-full bg-[#CCFF00]" 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-[#00FFFF] border-t-[4px] border-black">
                            <p className="text-[10px] font-black text-black uppercase tracking-widest text-center">
                                V1.0 Precision Calculus
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NavigationSidebar;
