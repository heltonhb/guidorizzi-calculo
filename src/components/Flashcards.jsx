import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, BookCheck, Loader2, Sparkles, RefreshCw, CheckCircle2, Eye } from 'lucide-react';
import { generateFlashcards } from '../services/api';
import { useToast } from './Toast';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const Flashcards = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState(null);
    const [known, setKnown] = useState(new Set());
    const [source, setSource] = useState('');
    const toast = useToast();

    useEffect(() => {
        loadFlashcards();
    }, [topic]);

    const loadFlashcards = async () => {
        setLoading(true);
        setError(null);
        setKnown(new Set());
        setCurrentIndex(0);
        setIsFlipped(false);

        try {
            const data = await generateFlashcards(topic);
            if (data?.flashcards && data.flashcards.length > 0) {
                setFlashcards(data.flashcards);
                setSource(data.source || 'NotebookLM');
                toast.success(`${data.flashcards.length} flashcards gerados para "${topic}"!`);
            } else {
                setFlashcards([]);
                setError('A IA não retornou flashcards. Tente novamente.');
            }
        } catch (err) {
            console.error('Error loading flashcards:', err);
            setError(err.message || 'Erro ao gerar flashcards');
            setFlashcards([]);
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    const toggleKnown = () => {
        setKnown(prev => {
            const next = new Set(prev);
            if (next.has(currentIndex)) {
                next.delete(currentIndex);
            } else {
                next.add(currentIndex);
            }
            return next;
        });
    };

    // Loading state
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-6">
            <div className="relative">
                <div className="w-20 h-20 rounded-[28px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <span className="text-zinc-400 font-black uppercase tracking-widest text-[10px] block">
                    Gerando Flashcards com IA
                </span>
                <p className="text-zinc-600 text-xs max-w-[200px]">
                    Consultando o Guidorizzi sobre "{topic}"...
                </p>
            </div>
        </div>
    );

    // Error / Empty state
    if (flashcards.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center">
            <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <BookCheck className="w-10 h-10 text-zinc-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Flashcards para "{topic}"</h2>
                <p className="text-zinc-500 text-sm max-w-[280px]">
                    {error || 'Gere flashcards inteligentes baseados no conteúdo do Guidorizzi.'}
                </p>
            </div>
            <button
                onClick={loadFlashcards}
                className="w-full max-w-xs py-6 rounded-[32px] bg-orange-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
            >
                <Sparkles className="w-5 h-5" />
                {error ? 'Tentar Novamente' : 'Gerar Flashcards com IA'}
            </button>
            <button onClick={onBack} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Voltar ao Dashboard</button>
        </div>
    );

    const knownCount = known.size;
    const progress = Math.round((knownCount / flashcards.length) * 100);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 p-8">
            <header className="w-full max-w-sm flex items-center justify-between">
                <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">Flashcards</h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                        {currentIndex + 1} de {flashcards.length}
                    </p>
                </div>
                <button
                    onClick={loadFlashcards}
                    className="text-zinc-500 hover:text-orange-400 transition-colors"
                    title="Gerar novos flashcards"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            {/* Progress bar */}
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-zinc-600">{topic}</span>
                    <span className={cn(
                        progress >= 80 ? 'text-emerald-400' : progress >= 40 ? 'text-amber-400' : 'text-zinc-500'
                    )}>
                        {knownCount}/{flashcards.length} dominados
                    </span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                    />
                </div>
            </div>

            {/* Card */}
            <div
                className="relative w-full max-w-sm h-80 perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-full h-80 relative preserve-3d"
                        >
                            {/* Front */}
                            <div className={cn(
                                "absolute inset-0 backface-hidden rounded-[48px] p-8 flex flex-col items-center justify-center text-center border",
                                known.has(currentIndex)
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-white/5 border-white/10"
                            )}>
                                {known.has(currentIndex) && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                )}
                                <div className="prose prose-invert prose-lg max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {flashcards[currentIndex]?.front || ''}
                                    </ReactMarkdown>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-6 flex items-center gap-1.5">
                                    <Eye className="w-3 h-3" /> Toque para ver resposta
                                </p>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden bg-white text-zinc-900 rounded-[48px] p-8 flex items-center justify-center text-center transform rotate-y-180 overflow-auto">
                                <div className="prose prose-zinc prose-sm max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {flashcards[currentIndex]?.back || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={prevCard}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-6 h-14 rounded-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Virar
                </button>
                <button
                    onClick={toggleKnown}
                    className={cn(
                        "px-6 h-14 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 border transition-all",
                        known.has(currentIndex)
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-emerald-400"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {known.has(currentIndex) ? 'Sei' : 'Marcar'}
                </button>
                <button
                    onClick={nextCard}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Source badge */}
            {source && (
                <p className="text-[9px] text-zinc-700 font-medium">
                    Fonte: {source}
                </p>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}} />
        </div>
    );
};

export default Flashcards;
