import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, BookCheck, RefreshCw, CheckCircle2, BrainCircuit } from 'lucide-react';
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
                setSource(data.source || 'GROQ (LLAMA 3)');
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2a2a2a] relative overflow-hidden"
            style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
            <div className="relative w-32 h-32 bg-black border-4 border-white shadow-[12px_12px_0_black] flex items-center justify-center animate-pulse mb-8 transform -rotate-6 z-10">
                <BrainCircuit className="w-16 h-16 text-white" />
            </div>
            <div className="text-center bg-black border-4 border-white px-8 py-6 shadow-[8px_8px_0_black] transform rotate-2 z-10 max-w-sm w-full mx-4">
                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-4">Gerando Cards</h3>
                <p className="text-[#f97316] font-black uppercase text-sm tracking-widest">
                    Aguarde o processamento...
                </p>
            </div>
        </div>
    );

    // Error / Empty state
    if (flashcards.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2a2a2a] relative overflow-hidden"
            style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
            <div className="w-32 h-32 bg-black border-4 border-[#ef4444] shadow-[12px_12px_0_#ef4444] flex items-center justify-center mb-12 transform rotate-6 z-10">
                <BookCheck className="w-16 h-16 text-[#ef4444]" />
            </div>
            <div className="bg-black border-4 border-white p-8 shadow-[8px_8px_0_black] transform -rotate-2 max-w-sm w-full mx-4 text-center z-10 mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Processo Falhou</h2>
                <p className="text-[#ef4444] font-black text-sm uppercase tracking-widest leading-relaxed">
                    {error || 'Não foi possível extrair os cards.'}
                </p>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-sm mx-4 z-10">
                <button
                    onClick={loadFlashcards}
                    className="w-full py-4 bg-[#f97316] border-4 border-black text-black font-black uppercase tracking-widest text-lg shadow-[6px_6px_0_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_black] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    <RefreshCw className="w-6 h-6" strokeWidth={3} />
                    TENTAR NOVAMENTE
                </button>
                <button
                    onClick={onBack}
                    className="w-full py-4 bg-black border-4 border-white text-white font-black uppercase tracking-widest text-lg shadow-[6px_6px_0_black] hover:bg-white hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_black] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
                >
                    VOLTAR
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen bg-[#2a2a2a] flex flex-col justify-between overflow-hidden relative"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.8) 2px, transparent 2px)',
                backgroundSize: '40px 40px',
                backgroundPosition: 'center top'
            }}
        >
            {/* Top Bar: Back Button */}
            <div className="relative z-50 flex items-center p-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-black border-4 border-white text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={3} /> VOLTAR
                </button>
            </div>

            {/* Title Section (Matching Reference Image) */}
            <div className="relative z-50 flex flex-col items-center pt-2">
                <div className="bg-black border-4 border-white px-8 py-2 z-10 w-fit shadow-[4px_4px_0_black]">
                    <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                        FLASHCARDS
                    </h1>
                </div>
                {/* Counter overlay overlapping bottom */}
                <div className="bg-black border-4 border-white px-6 py-1 -mt-3 z-20 shadow-[4px_4px_0_black]">
                    <span className="text-xl font-black text-white tracking-widest">
                        {currentIndex + 1} / {flashcards.length}
                    </span>
                </div>
            </div>

            {/* Main Flashcard Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 relative z-10">
                {/* 3D Stacked Deck Container */}
                <div className="relative w-full max-w-[340px] sm:max-w-sm aspect-[3/4] perspective-1000 my-6">
                    {/* Shadow Layer (Black) */}
                    <div className="absolute inset-0 bg-black translate-x-4 translate-y-4"></div>
                    {/* Middle Layer (White) */}
                    <div className="absolute inset-0 bg-white border-4 border-black translate-x-2 translate-y-2"></div>

                    {/* Top Flipping Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className={cn(
                                "w-full h-full border-4 border-white flex flex-col items-center justify-center p-6 sm:p-8 text-center",
                                known.has(currentIndex) ? "bg-[#064e3b]" : "bg-[#2a2a2a]"
                            )} style={isFlipped ? { transform: 'scaleX(-1)' } : {}}>

                                <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                                    <div className="prose prose-invert max-w-none w-full">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                p: ({ children }) => <p className="text-white font-black text-2xl sm:text-3xl leading-tight tracking-tight">{children}</p>,
                                                strong: ({ children }) => <strong className="text-[#f97316]">{children}</strong>,
                                                em: ({ children }) => <em className="text-cyan-400">{children}</em>,
                                            }}
                                        >
                                            {isFlipped ? (flashcards[currentIndex]?.back || '') : preprocessMathContent(flashcards[currentIndex]?.front || '')}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Wireframe Button "VER RESPOSTA" on front face */}
                                    {!isFlipped && (
                                        <div className="mt-12 mb-4 w-full">
                                            {/* Wireframe border effect */}
                                            <div className="p-1 border-[1px] border-white/60 mx-auto w-fit">
                                                <div className="border-2 border-white px-6 sm:px-8 py-3">
                                                    <span className="text-white font-black uppercase tracking-widest text-sm sm:text-base">
                                                        VER RESPOSTA
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Small label for Back face */}
                                    {isFlipped && (
                                        <div className="mt-8 text-white/50 text-xs font-black uppercase tracking-widest">
                                            Vire para a pergunta
                                        </div>
                                    )}
                                </div>

                                {known.has(currentIndex) && (
                                    <div className="absolute top-4 right-4 bg-emerald-500 border-4 border-black p-1 shadow-[2px_2px_0_black]">
                                        <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls Area (Grid Aligned) */}
            <div className="relative z-50 w-full max-w-[340px] sm:max-w-sm mx-auto mb-4">
                <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-2 mb-2">
                    {/* Previous */}
                    <button
                        onClick={prevCard}
                        className="h-12 border-4 border-white bg-black flex flex-col items-center justify-center text-white hover:bg-white hover:text-black active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" strokeWidth={4} />
                    </button>

                    {/* Flip */}
                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="h-12 border-4 border-white bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                        VIRAR <RotateCcw className="w-4 h-4 ml-1" strokeWidth={3} />
                    </button>

                    {/* Mark */}
                    <button
                        onClick={toggleKnown}
                        className={cn(
                            "h-12 border-4 font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-1",
                            known.has(currentIndex)
                                ? "border-emerald-400 bg-black text-emerald-400 hover:bg-emerald-400 hover:text-black"
                                : "border-[#f97316] bg-black text-[#f97316] hover:bg-[#f97316] hover:text-black"
                        )}
                    >
                        MARCAR {known.has(currentIndex) ? '✓' : ''}
                    </button>

                    {/* Next */}
                    <button
                        onClick={nextCard}
                        className="h-12 border-4 border-white bg-black flex items-center justify-center text-white hover:bg-white hover:text-black active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-6 h-6" strokeWidth={4} />
                    </button>
                </div>

                {/* Robot Icon Box (Aligned Right) */}
                <div className="flex justify-end">
                    <div className="w-12 h-12 border-4 border-white bg-black flex items-center justify-center text-white">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Footer Source */}
            <div className="relative z-50 text-center pb-2 pt-4 w-full">
                <span className="text-white font-black tracking-widest text-xs sm:text-sm uppercase drop-shadow-md">FONTE: {source}</span>
            </div>
        </div>
    );
};

export default Flashcards;
