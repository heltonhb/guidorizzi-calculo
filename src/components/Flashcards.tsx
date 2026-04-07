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
import { preprocessMathContent } from '../utils/mathPreprocessor';
import { useAppContext } from '../hooks/useAppContext';

const Flashcards = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState(null);
    const [known, setKnown] = useState(new Set());
    const [source, setSource] = useState('');
    const toast = useToast();

    // Gamification
    const { onFlashcardReview } = useAppContext();

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
                setSource(data.source || 'Guidorizzi API');
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
        // Gamification: adicionar XP ao revisar flashcard
        onFlashcardReview();

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
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="relative w-24 h-24 bg-zinc-950 rounded-2xl border-2 border-premium-blue shadow-[6px_6px_0_theme(colors.premium-blue)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-premium-blue animate-spin" />
            </div>
            <div className="text-center space-y-3 bg-zinc-950 rounded-2xl border-2 border-white/20 p-6 shadow-[6px_6px_0_rgba(255,255,255,0.2)]">
                <h3 className="text-xl font-black text-white tracking-widest uppercase">Gerando Flashcards com IA</h3>
                <p className="text-zinc-400 font-bold max-w-[250px] leading-relaxed mx-auto uppercase text-xs tracking-wider">
                    CONSULTANDO O GUIDORIZZI SOBRE "{topic}"...
                </p>
            </div>
        </div>
    );

    // Error / Empty state
    if (flashcards.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-8 text-center">
            <div className="w-24 h-24 bg-zinc-950 rounded-2xl border-2 border-white/20 shadow-[6px_6px_0_rgba(255,255,255,0.2)] flex items-center justify-center mb-4">
                <BookCheck className="w-10 h-10 text-zinc-500" />
            </div>
            <div className="space-y-3 bg-zinc-950 rounded-2xl border-2 border-white/20 p-6 shadow-[6px_6px_0_rgba(255,255,255,0.2)]">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Flashcards para "{topic}"</h2>
                <p className="text-zinc-400 font-bold text-xs max-w-[280px] uppercase tracking-wider">
                    {error || 'Gere flashcards inteligentes baseados no conteúdo do Guidorizzi.'}
                </p>
            </div>
            <button
                onClick={loadFlashcards}
                className="w-full max-w-xs py-5 rounded-2xl bg-premium-blue border-2 border-premium-blue text-white hover:bg-zinc-950 hover:text-premium-blue font-black uppercase tracking-widest text-sm shadow-[6px_6px_0_theme(colors.premium-blue)] hover:shadow-[0px_0px_0_transparent] transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1"
            >
                <Sparkles className="w-5 h-5" />
                {error ? 'TENTAR NOVAMENTE' : 'GERAR FLASHCARDS'}
            </button>
            <button onClick={onBack} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors mt-4">VOLTAR AO DASHBOARD</button>
        </div>
    );

    const knownCount = known.size;
    const progress = Math.round((knownCount / flashcards.length) * 100);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 p-8">
            <header className="w-full max-w-sm flex items-center justify-between border-b-2 border-white/20 pb-4">
                <button onClick={onBack} className="w-10 h-10 flex items-center rounded-xl justify-center bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] text-white hover:border-premium-blue hover:shadow-[2px_2px_0_theme(colors.premium-blue)] hover:text-premium-blue transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Flashcards</h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest border-2 border-white/10 rounded-full px-2 py-0.5 mt-1 bg-zinc-900 inline-block">
                        {currentIndex + 1} / {flashcards.length}
                    </p>
                </div>
                <button
                    onClick={loadFlashcards}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] text-zinc-400 hover:border-premium-blue hover:shadow-[2px_2px_0_theme(colors.premium-blue)] hover:text-premium-blue transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    title="Gerar novos flashcards"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </header>

            {/* Progress bar */}
            <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-[10px] font-black rounded-xl uppercase tracking-widest bg-zinc-950 border-2 border-white/20 p-2 shadow-[2px_2px_0_rgba(255,255,255,0.2)]">
                    <span className="text-zinc-400 truncate max-w-[150px]">{topic}</span>
                    <span className={cn(
                        progress >= 80 ? 'text-emerald-400' : progress >= 40 ? 'text-amber-400' : 'text-zinc-500'
                    )}>
                        {knownCount}/{flashcards.length} DOMINADOS
                    </span>
                </div>
                <div className="h-3 rounded-full border-2 border-white/20 bg-zinc-950 w-full overflow-hidden">
                    <motion.div
                        className="h-full bg-premium-blue"
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
                                "absolute inset-0 backface-hidden rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 shadow-[6px_6px_0_rgba(255,255,255,0.1)] transition-colors",
                                known.has(currentIndex)
                                    ? "bg-emerald-950 border-emerald-500 text-emerald-50 shadow-[6px_6px_0_theme(colors.emerald.500)]"
                                    : "bg-zinc-950 border-white/20"
                            )}>
                                {known.has(currentIndex) && (
                                    <div className="absolute top-4 right-4 bg-emerald-500 rounded-full text-zinc-900 border-2 border-emerald-950 p-1">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-bold prose-p:tracking-wide">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {preprocessMathContent(flashcards[currentIndex]?.front || '')}
                                    </ReactMarkdown>
                                </div>
                                <p className="absolute bottom-6 rounded-xl text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2 border-2 border-zinc-800 bg-zinc-900 px-3 py-1">
                                    <Eye className="w-3 h-3" /> VER RESPOSTA
                                </p>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden rounded-2xl bg-white text-zinc-950 border-4 border-zinc-950 shadow-[6px_6px_0_rgba(255,255,255,0.2)] p-8 flex flex-col items-center justify-center text-center transform rotate-y-180 overflow-y-auto">
                                <div className="prose prose-zinc prose-sm max-w-none w-full prose-headings:font-black prose-headings:uppercase font-medium text-left">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {preprocessMathContent(flashcards[currentIndex]?.back || '')}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full max-w-sm justify-between mt-4">
                <button
                    onClick={prevCard}
                    className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-zinc-950 shadow-[4px_4px_0_rgba(255,255,255,0.2)] flex items-center justify-center text-white hover:border-premium-blue hover:text-premium-blue hover:shadow-[4px_4px_0_theme(colors.premium-blue)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex-1 h-14 rounded-2xl bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:border-white hover:shadow-[4px_4px_0_rgba(255,255,255,0.5)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <RotateCcw className="w-4 h-4" />
                    VIRAR
                </button>
                <button
                    onClick={toggleKnown}
                    className={cn(
                        "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border-2 shadow-[4px_4px_0_rgba(255,255,255,0.2)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
                        known.has(currentIndex)
                            ? "bg-emerald-500 border-emerald-500 text-zinc-950 shadow-[4px_4px_0_theme(colors.emerald.500)]"
                            : "bg-zinc-950 border-white/20 text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-[4px_4px_0_theme(colors.emerald.500)]"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {known.has(currentIndex) ? 'SEI' : 'MARCAR'}
                </button>
                <button
                    onClick={nextCard}
                    className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-zinc-950 shadow-[4px_4px_0_rgba(255,255,255,0.2)] flex items-center justify-center text-white hover:border-premium-blue hover:text-premium-blue hover:shadow-[4px_4px_0_theme(colors.premium-blue)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Source badge */}
            {source && (
                <div className="px-3 py-1 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-2">
                    FONTE: {source}
                </div>
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
