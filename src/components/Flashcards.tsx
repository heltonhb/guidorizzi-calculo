import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, BookCheck, Loader2, RefreshCw, CheckCircle2, BrainCircuit } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col px-6 py-8 gap-6 overflow-hidden relative">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Top Bar: Back Button + Refresh */}
            <div className="relative z-50 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border-3 border-white text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-zinc-950 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" /> VOLTAR
                </button>
                <button
                    onClick={loadFlashcards}
                    className="p-2 bg-zinc-950 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors"
                    title="Regenerar"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Title Section */}
            <div className="relative z-50 flex flex-col items-center gap-4">
                <div className="border-4 border-white bg-zinc-950 px-12 py-4">
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest">
                        FLASHCARDS
                    </h1>
                </div>
                <div className="border-4 border-white bg-zinc-950 px-6 py-2">
                    <p className="text-white font-black text-2xl tracking-widest">
                        {currentIndex + 1}/{flashcards.length}
                    </p>
                </div>
            </div>

            {/* Main Flashcard Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full"
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-full relative"
                        >
                            {/* Front - with normal text */}
                            <div className={cn(
                                "relative min-h-96 border-8 border-white bg-zinc-900 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-[12px_12px_0_rgba(0,0,0,0.6)] transition-colors",
                                known.has(currentIndex) ? "bg-emerald-900/40 border-emerald-400" : "bg-zinc-900 border-white"
                            )}>
                                {/* Text content - apply mirror only when flipped */}
                                <div className="prose prose-invert prose-lg max-w-none w-full flex justify-center flex-1" style={isFlipped ? { transform: 'scaleX(-1)' } : {}}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ children }) => <p className="text-white font-black text-xl leading-tight">{children}</p>,
                                            strong: ({ children }) => <strong className="text-signal">{children}</strong>,
                                            em: ({ children }) => <em className="text-cyan-300">{children}</em>,
                                        }}
                                    >
                                        {isFlipped ? (flashcards[currentIndex]?.back || '') : preprocessMathContent(flashcards[currentIndex]?.front || '')}
                                    </ReactMarkdown>
                                </div>

                                {/* Label at bottom */}
                                <div className="mt-8 text-white text-sm font-bold uppercase tracking-widest opacity-70">
                                    {isFlipped ? 'RESPOSTA' : 'PERGUNTA'}
                                </div>

                                {known.has(currentIndex) && (
                                    <div className="absolute top-4 right-4 bg-emerald-500 border-3 border-white p-2">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls Base */}
            <div className="relative z-50 flex gap-3 items-center justify-center pb-4">
                {/* Previous */}
                <button
                    onClick={prevCard}
                    className="w-14 h-14 border-4 border-white bg-zinc-950 flex items-center justify-center text-white hover:bg-white hover:text-zinc-950 transition-all font-black text-lg"
                >
                    &lt;
                </button>

                {/* Flip */}
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-6 py-3 border-4 border-white bg-zinc-950 text-white font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all text-sm"
                >
                    VIRAR
                </button>

                {/* Mark */}
                <button
                    onClick={toggleKnown}
                    className={cn(
                        "px-6 py-3 border-4 font-black uppercase tracking-widest transition-all text-sm",
                        known.has(currentIndex)
                            ? "border-emerald-400 bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                            : "border-signal bg-zinc-950 text-signal hover:bg-signal hover:text-zinc-950"
                    )}
                >
                    MARCAR ✓
                </button>

                {/* Next */}
                <button
                    onClick={nextCard}
                    className="w-14 h-14 border-4 border-white bg-zinc-950 flex items-center justify-center text-white hover:bg-white hover:text-zinc-950 transition-all font-black text-lg"
                >
                    &gt;
                </button>

                {/* Bot Icon */}
                <div className="w-14 h-14 border-4 border-white bg-zinc-950 flex items-center justify-center text-white">
                    <BrainCircuit className="w-7 h-7" />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative z-50 mt-2 pt-4 border-t-4 border-white">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-black text-sm uppercase tracking-widest">{topic}</span>
                    <span className="text-signal font-black text-sm uppercase tracking-widest">
                        {Math.round((known.size / flashcards.length) * 100)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-zinc-900 border-3 border-white overflow-hidden">
                    <motion.div
                        className="h-full bg-signal"
                        initial={{ width: 0 }}
                        animate={{ width: `${(known.size / flashcards.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
