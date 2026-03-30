import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, PlayCircle, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { queryNotebook } from '../services/api';

const ExerciseList = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(true);
            try {
                const notebookId = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';
                const response = await queryNotebook(notebookId, `Gere uma lista de 3 exercícios práticos sobre ${topic} baseados no Guidorizzi. Retorne como uma lista simples.`);

                // Simulating parsing of the text response into an array
                // In a real app, you'd want structured JSON from NotebookLM
                const lines = (response.answer || response.content || '').split('\n').filter(l => l.trim().length > 10).slice(0, 3);
                setExercises(lines.map((line, i) => ({
                    id: i,
                    title: `Exercício ${i + 1}`,
                    content: line,
                    difficulty: i === 2 ? 'Difícil' : (i === 1 ? 'Médio' : 'Fácil')
                })));
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [topic]);

    const difficultyStyles = {
        'Fácil': { color: 'text-zinc-950', bg: 'bg-[#22c55e]', border: 'border-[#22c55e] shadow-[2px_2px_0_#22c55e]' },
        'Médio': { color: 'text-zinc-950', bg: 'bg-[#00f0ff]', border: 'border-[#00f0ff] shadow-[2px_2px_0_#00f0ff]' },
        'Difícil': { color: 'text-zinc-950', bg: 'bg-[#ff5500]', border: 'border-[#ff5500] shadow-[2px_2px_0_#ff5500]' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 pb-20"
        >
            <header className="flex items-center justify-between border-b-2 border-white/20 pb-6 mb-4">
                <motion.button
                    whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-[#00f0ff] hover:shadow-[2px_2px_0_#00f0ff] hover:text-[#00f0ff] transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase">{topic}</h2>
                    <p className="text-[#00f0ff] text-[10px] uppercase font-black tracking-widest mt-2 bg-zinc-900 border-2 border-[#00f0ff] inline-block px-2 py-0.5">Lista de Exercícios</p>
                </div>
                <div className="w-12" />
            </header>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-20 gap-4"
                    >
                        <div className="relative w-16 h-16 bg-zinc-950 border-2 border-[#00f0ff] shadow-[4px_4px_0_#00f0ff] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
                        </div>
                        <p className="text-zinc-400 bg-zinc-950 border-2 border-white/20 px-4 py-2 shadow-[2px_2px_0_rgba(255,255,255,0.2)] text-xs font-black uppercase tracking-widest mt-4">
                            GERANDO PROBLEMAS...
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {exercises.map((ex, i) => {
                            const style = difficultyStyles[ex.difficulty] || difficultyStyles['Médio'];
                            return (
                                <motion.div
                                    key={ex.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative p-8 bg-zinc-950 border-2 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.2)] transition-all hover:border-white/40"
                                >
                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <div className="space-y-4 w-full">
                                            <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
                                                <h3 className="font-black text-2xl uppercase tracking-tight text-white">{ex.title}</h3>
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2", style.bg, style.color, style.border)}>
                                                    <Star className="w-3 h-3 fill-current" />
                                                    {ex.difficulty}
                                                </div>
                                            </div>
                                            <p className="text-zinc-300 text-lg leading-relaxed font-bold font-mono py-4">"{ex.content}"</p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between mt-4 p-4 border-2 border-white/10 bg-zinc-900">
                                        <motion.button
                                            whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px white" }}
                                            whileTap={{ scale: 0.95, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                                            className="flex items-center gap-3 px-6 py-3 border-2 border-white bg-white text-zinc-950 text-sm font-black uppercase tracking-widest transition-all"
                                        >
                                            <PlayCircle className="w-5 h-5 fill-current" />
                                            RESOLVER
                                        </motion.button>

                                        <label className="relative cursor-pointer flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-2">Feito</span>
                                            <input type="checkbox" className="sr-only peer" />
                                            <motion.div
                                                whileTap={{ scale: 0.8 }}
                                                className="w-12 h-12 border-2 border-white/20 bg-zinc-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-checked:shadow-[4px_4px_0_theme(colors.emerald.500)] flex items-center justify-center transition-all group-hover:border-white/40"
                                            >
                                                <CheckCircle2 className="w-6 h-6 text-zinc-800 peer-checked:text-zinc-950 transition-colors" />
                                            </motion.div>
                                        </label>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ExerciseList;
