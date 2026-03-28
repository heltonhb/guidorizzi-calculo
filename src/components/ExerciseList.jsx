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
        'Fácil': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        'Médio': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        'Difícil': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 pb-20"
        >
            <header className="flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6 text-zinc-400" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold tracking-tight">{topic}</h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Lista de Exercícios</p>
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
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Gerando Problemas...</p>
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
                                    className="group relative p-8 rounded-[40px] bg-zinc-900/60 border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>

                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <div className="space-y-2">
                                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider", style.bg, style.color, style.border)}>
                                                <Star className="w-3 h-3 fill-current" />
                                                {ex.difficulty}
                                            </div>
                                            <h3 className="font-extrabold text-xl leading-tight text-white">{ex.title}</h3>
                                            <p className="text-zinc-400 text-base leading-relaxed mt-4 font-medium italic">"{ex.content}"</p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center justify-between mt-8">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-zinc-950 text-sm font-black transition-all shadow-xl shadow-white/5"
                                        >
                                            <PlayCircle className="w-5 h-5 fill-current" />
                                            Resolver Agora
                                        </motion.button>

                                        <label className="relative cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <motion.div
                                                whileTap={{ scale: 0.8 }}
                                                className="w-14 h-14 rounded-3xl border border-white/10 bg-white/5 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition-all group-hover:border-white/20 shadow-inner"
                                            >
                                                <CheckCircle2 className="w-7 h-7 text-zinc-600 peer-checked:text-white transition-colors" />
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
