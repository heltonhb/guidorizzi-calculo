import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, BookCheck, Loader2, Sparkles, RefreshCw, CheckCircle2, Eye, BrainCircuit } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-8">
            <div className="relative w-32 h-32 bg-zinc-900 border-8 border-premium-blue outline outline-8 outline-zinc-950 shadow-[16px_16px_0_theme(colors.premium-blue)] rounded-sm flex items-center justify-center animate-pulse mb-12 transform -rotate-6">
                <BrainCircuit className="w-16 h-16 text-white" />
            </div>
            <div className="text-center bg-zinc-900 border-4 border-white p-8 shadow-[12px_12px_0_rgba(255,255,255,0.2)] transform rotate-2 max-w-lg">
                <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Forjando Tiles</h3>
                <p className="text-premium-blue font-bold uppercase text-lg tracking-widest">
                    EXTRAINDO CONCEITOS DO GUIDORIZZI...
                </p>
            </div>
        </div>
    );

    // Error / Empty state
    if (flashcards.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-8">
            <div className="w-32 h-32 bg-zinc-900 border-8 border-rose-500 shadow-[16px_16px_0_theme(colors.rose.500)] flex items-center justify-center mb-12 transform rotate-6">
                <BookCheck className="w-16 h-16 text-rose-500" />
            </div>
            <div className="bg-zinc-900 border-4 border-white p-8 shadow-[12px_12px_0_rgba(255,255,255,0.2)] transform -rotate-2 max-w-lg text-center mb-12">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Processo Falhou</h2>
                <p className="text-rose-500 font-black text-sm uppercase tracking-widest leading-relaxed">
                    {error || 'Não foi possível extrair os blocos lógicos.'}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                <button
                    onClick={loadFlashcards}
                    className="flex-1 py-6 bg-premium-blue border-4 border-premium-blue text-white font-black uppercase tracking-widest text-lg shadow-[8px_8px_0_rgba(255,255,255,0.2)] hover:bg-white hover:text-premium-blue hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4"
                >
                    <RefreshCw className="w-6 h-6" />
                    TENTAR NOVAMENTE
                </button>
                <button
                    onClick={onBack}
                    className="flex-1 py-6 bg-zinc-900 border-4 border-zinc-700 text-zinc-400 font-black uppercase tracking-widest text-lg shadow-[8px_8px_0_rgba(0,0,0,0.5)] hover:border-white hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all"
                >
                    ABORTAR
                </button>
            </div>
        </div>
    );

    const knownCount = known.size;
    const progress = Math.round((knownCount / flashcards.length) * 100);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col px-4 py-8 sm:p-12 overflow-hidden relative">

            {/* Ambient Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <header className="relative z-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-4 py-4 px-6 bg-zinc-900 border-4 border-white text-white font-black uppercase tracking-widest shadow-[8px_8px_0_theme(colors.premium-blue)] hover:bg-premium-blue hover:shadow-[12px_12px_0_rgba(255,255,255,0.2)] transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
                >
                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform" />
                    Voltar
                </button>

                <div className="flex flex-col items-start sm:items-end">
                    <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter mix-blend-difference">Flashcards</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="px-4 py-1 bg-premium-blue border-2 border-white text-white font-black text-sm uppercase tracking-widest shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                            {currentIndex + 1} / {flashcards.length}
                        </div>
                        <button
                            onClick={loadFlashcards}
                            className="p-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors"
                            title="Regerar"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Core Interaction Area */}
            <div className="relative z-40 flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-8 sm:mt-0 pb-32">

                {/* Physical Tile Stack Effect */}
                <div className="relative w-full max-w-2xl h-[450px] sm:h-[500px] perspective-1000">

                    {/* Underlying physical cards */}
                    <div className="absolute inset-0 bg-zinc-900 border-4 sm:border-8 border-zinc-800 rounded-sm translate-x-8 translate-y-8 rotate-6 z-0 shadow-[16px_16px_0_rgba(0,0,0,0.8)]" />
                    <div className="absolute inset-0 bg-zinc-800 border-4 sm:border-8 border-zinc-700 rounded-sm translate-x-4 translate-y-4 -rotate-2 z-10 shadow-[16px_16px_0_rgba(0,0,0,0.6)]" />

                    {/* Active Flapping Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 100, opacity: 0, rotate: 10 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            exit={{ x: -100, opacity: 0, rotate: -10 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="absolute inset-0 z-20 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-full h-full relative preserve-3d"
                            >
                                {/* Front Face */}
                                <div className={cn(
                                    "absolute inset-0 backface-hidden rounded-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center border-4 sm:border-8 transition-colors shadow-[16px_16px_0_theme(colors.premium-blue)]",
                                    known.has(currentIndex)
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-50"
                                        : "bg-zinc-950 border-white text-white"
                                )}>
                                    <div className="absolute top-6 left-6 text-premium-blue opacity-50">
                                        <BrainCircuit className="w-12 h-12" />
                                    </div>
                                    {known.has(currentIndex) && (
                                        <div className="absolute top-6 right-6 bg-emerald-500 rounded-none border-4 border-emerald-950 p-2 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform rotate-12">
                                            <CheckCircle2 className="w-8 h-8 text-zinc-950" />
                                        </div>
                                    )}

                                    <div className="prose prose-invert prose-xl sm:prose-2xl max-w-none w-full prose-headings:font-black prose-headings:uppercase prose-p:font-bold prose-p:tracking-tight prose-strong:text-premium-blue leading-tight mb-12 flex justify-center">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {preprocessMathContent(flashcards[currentIndex]?.front || '')}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full p-6 flex justify-center">
                                        <div className="px-6 py-3 bg-zinc-900 border-4 border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-3 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                                            <RotateCcw className="w-4 h-4" /> Tap to Flip
                                        </div>
                                    </div>
                                </div>

                                {/* Back Face */}
                                <div className="absolute inset-0 backface-hidden rounded-sm bg-premium-blue text-white border-4 sm:border-8 border-white shadow-[16px_16px_0_rgba(255,255,255,0.2)] p-8 sm:p-12 flex flex-col items-center justify-center text-center transform rotate-y-180 overflow-y-auto">
                                    <div className="prose prose-invert prose-lg sm:prose-xl max-w-none w-full prose-headings:font-black prose-headings:uppercase font-bold text-left prose-p:leading-[1.8] prose-strong:text-zinc-900 border-l-8 pl-6 border-zinc-900">
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

                {/* Massive Controls */}
                <div className="w-full max-w-2xl mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 z-30 relative px-4 sm:px-0">
                    <button
                        onClick={prevCard}
                        className="py-6 sm:py-8 bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white hover:shadow-[12px_12px_0_rgba(255,255,255,0.2)] transition-all active:translate-x-2 active:translate-y-2 active:shadow-none font-black uppercase tracking-widest text-sm sm:text-xl"
                    >
                        <ChevronLeft className="w-8 h-8 mr-2 hidden sm:block" /> Anterior
                    </button>

                    <button
                        onClick={toggleKnown}
                        className={cn(
                            "py-6 sm:py-8 border-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex items-center justify-center transition-all active:translate-x-2 active:translate-y-2 active:shadow-none font-black uppercase tracking-widest text-sm sm:text-xl gap-3",
                            known.has(currentIndex)
                                ? "bg-emerald-500 border-white text-zinc-950 hover:shadow-[12px_12px_0_rgba(255,255,255,0.5)]"
                                : "bg-premium-blue border-white text-white hover:bg-white hover:text-premium-blue hover:border-premium-blue hover:shadow-[12px_12px_0_theme(colors.premium-blue)]"
                        )}
                    >
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                        {known.has(currentIndex) ? 'Dominado' : 'Marcar'}
                    </button>

                    <button
                        onClick={nextCard}
                        className="sm:col-span-2 py-6 sm:py-8 bg-zinc-950 border-4 border-white shadow-[12px_12px_0_rgba(255,255,255,0.2)] flex items-center justify-center text-white hover:bg-white hover:text-zinc-950 hover:shadow-[8px_8px_0_rgba(0,0,0,0.5)] transition-all active:translate-x-2 active:translate-y-2 active:shadow-none font-black uppercase tracking-widest text-lg sm:text-2xl"
                    >
                        Próximo <ChevronRight className="w-8 h-8 ml-2 hidden sm:block" />
                    </button>
                </div>
            </div>

            {/* Global Progress Bar anchored to bottom */}
            <div className="fixed bottom-0 left-0 w-full bg-zinc-950 border-t-8 border-zinc-900 p-6 z-50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div className="text-xl font-black text-white uppercase tracking-widest w-full sm:w-64 truncate">
                    {topic}
                </div>
                <div className="w-full sm:flex-1 h-6 bg-zinc-900 border-4 border-zinc-800 rounded-none overflow-hidden relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>
                <div className="hidden sm:block text-xl font-black text-emerald-500 uppercase tracking-widest min-w-[80px] text-right">
                    {progress}%
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                
                /* Brutalist scrollbar overrides for the back of the card */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 12px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                    border-left: 4px solid rgba(255,255,255,0.2);
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #fff;
                    border: 2px solid #1152d4; /* premium-blue border to match backface */
                }
            `}} />
        </div>
    );
};

export default Flashcards;
