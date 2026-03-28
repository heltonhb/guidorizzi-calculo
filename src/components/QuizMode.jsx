import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, Sparkles, CheckCircle2, XCircle, Trophy, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizQuestions } from '../services/api';
import { useToast } from './Toast';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Fallback local questions (used when API is unavailable)
const LOCAL_QUESTIONS = {
    'Limites': [
        { text: 'Qual o valor de $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?', options: ['0', '1', '$\\infty$', 'Não existe'], correct: 1, explanation: 'Este é um limite fundamental demonstrado geometricamente no Guidorizzi Vol. 1.' },
        { text: '$\\lim_{x \\to \\infty} \\frac{1}{x}$ é igual a:', options: ['1', '0', '$\\infty$', 'Não existe'], correct: 1, explanation: 'Quando $x$ cresce sem limite, $\\frac{1}{x}$ tende a zero.' },
        { text: 'Se $f(x)$ é contínua em $a$, então $\\lim_{x \\to a} f(x)$ é:', options: ['$f(a)$', '0', '$\\infty$', 'Indefinido'], correct: 0, explanation: 'Pela definição de continuidade: $\\lim_{x \\to a} f(x) = f(a)$.' },
    ],
    'Derivadas': [
        { text: 'Qual a derivada de $f(x) = x^2$?', options: ['$2x$', '$x^2$', '$2$', '$x$'], correct: 0, explanation: 'Pela regra do tombo: $\\frac{d}{dx}x^n = nx^{n-1}$.' },
        { text: 'A derivada de $\\sin(x)$ é:', options: ['$-\\cos(x)$', '$\\cos(x)$', '$\\sin(x)$', '$-\\sin(x)$'], correct: 1, explanation: 'Resultado fundamental: $(\\sin x)\' = \\cos x$.' },
        { text: 'A regra da cadeia afirma que $[f(g(x))]\'$ é:', options: ['$f\'(x) \\cdot g\'(x)$', '$f\'(g(x)) \\cdot g\'(x)$', '$f(g\'(x))$', '$f\'(g(x))$'], correct: 1, explanation: 'Regra da cadeia: derivar a função externa e multiplicar pela derivada da interna.' },
    ],
    'default': [
        { text: 'Qual a derivada de $f(x) = x^2$?', options: ['$2x$', '$x^2$', '$2$', '$x$'], correct: 0, explanation: 'Pela regra do tombo: $\\frac{d}{dx}x^n = nx^{n-1}$.' },
        { text: '$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ é:', options: ['0', '1', '$\\infty$', 'Não existe'], correct: 1, explanation: 'Limite fundamental demonstrado geometricamente no Vol. 1.' },
        { text: '$\\int x\\,dx$ é igual a:', options: ['$x$', '$\\frac{x^2}{2} + C$', '$2x + C$', '$x^2 + C$'], correct: 1, explanation: 'Pela regra da potência para integrais: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.' },
    ],
};

const QuizMode = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [source, setSource] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadQuiz();
    }, [topic]);

    const loadQuiz = async () => {
        setLoading(true);
        setQuizStarted(false);
        setShowResults(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowFeedback(false);

        try {
            const data = await generateQuizQuestions(topic, 5);
            if (data?.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setSource(data.source || 'NotebookLM');
                toast.success(`${data.questions.length} questões geradas sobre "${topic}"!`);
            } else {
                throw new Error('Nenhuma questão retornada');
            }
        } catch (error) {
            console.error('Error loading quiz, falling back to local:', error);
            // Fallback to local questions
            const localQ = LOCAL_QUESTIONS[topic] || LOCAL_QUESTIONS['default'];
            setQuestions(localQ);
            setSource('Banco Local (offline)');
            toast.info('Usando banco de questões local. Conecte ao servidor para questões do Guidorizzi.');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setSelectedAnswer(null);
        setShowFeedback(false);
    };

    const handleAnswer = (index) => {
        if (showFeedback) return;
        setSelectedAnswer(index);
        setShowFeedback(true);
        if (index === questions[currentQuestionIndex].correct) {
            setScore(s => s + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setShowFeedback(false);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            setShowResults(true);
        }
    };

    const getResultMessage = () => {
        const pct = Math.round((score / questions.length) * 100);
        if (pct >= 80) return { emoji: '🏆', text: 'Excelente!', sub: 'Você domina este assunto!' };
        if (pct >= 60) return { emoji: '👏', text: 'Muito Bem!', sub: 'Continue praticando para dominar.' };
        if (pct >= 40) return { emoji: '💪', text: 'Bom Esforço!', sub: 'Revise o material e tente novamente.' };
        return { emoji: '📚', text: 'Continue Estudando!', sub: 'Releia o Guidorizzi e volte mais forte.' };
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-6">
            <div className="w-20 h-20 rounded-[28px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
            <div className="text-center space-y-2">
                <span className="text-zinc-400 font-black uppercase tracking-widest text-[10px] block">
                    Gerando Questões com IA
                </span>
                <p className="text-zinc-600 text-xs max-w-[200px]">
                    Consultando o Guidorizzi sobre "{topic}"...
                </p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8 pb-20"
        >
            <header className="flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={quizStarted && !showResults ? () => setQuizStarted(false) : onBack}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6 text-zinc-400" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold tracking-tight">
                        {quizStarted ? `Quiz: ${topic}` : 'Desafio Guidorizzi'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">
                        {quizStarted && !showResults
                            ? `Questão ${currentQuestionIndex + 1} de ${questions.length}`
                            : `${questions.length} questões • ${source}`
                        }
                    </p>
                </div>
                <button
                    onClick={loadQuiz}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-zinc-500 hover:text-purple-400 transition-colors"
                    title="Gerar novas questões"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            {!quizStarted ? (
                /* Pre-quiz screen */
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-8 py-8"
                >
                    <div className="w-28 h-28 rounded-[36px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Zap className="w-14 h-14 text-purple-400 fill-purple-400/20" />
                    </div>

                    <div className="text-center space-y-3">
                        <h3 className="text-3xl font-black text-white">{topic}</h3>
                        <p className="text-zinc-500 text-sm max-w-[280px]">
                            {questions.length} questões de múltipla escolha baseadas no Guidorizzi
                        </p>
                        {source.includes('LIVE') && (
                            <div className="flex items-center gap-2 justify-center text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                <div className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </div>
                                Questões geradas pela IA
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                        {[
                            { label: 'Fáceis', count: 2, color: 'text-emerald-400' },
                            { label: 'Médias', count: 2, color: 'text-amber-400' },
                            { label: 'Difíceis', count: 1, color: 'text-red-400' },
                        ].map(d => (
                            <div key={d.label} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <p className={cn("text-lg font-black", d.color)}>{d.count}</p>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{d.label}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startQuiz}
                        className="w-full max-w-xs py-6 rounded-[32px] bg-purple-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3"
                    >
                        <Sparkles className="w-5 h-5" />
                        Iniciar Desafio
                    </button>
                </motion.div>
            ) : (
                <div className="flex-1 flex flex-col gap-8">
                    {/* Progress dots */}
                    {!showResults && (
                        <div className="flex justify-center gap-2">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i === currentQuestionIndex ? "bg-purple-500 w-6" :
                                            i < currentQuestionIndex ? "bg-purple-500/40" : "bg-white/10"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {!showResults ? (
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="space-y-10"
                            >
                                <div className="p-10 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl min-h-[200px] flex items-center justify-center text-center">
                                    <div className="prose prose-invert prose-lg">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {questions[currentQuestionIndex].text}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {questions[currentQuestionIndex].options.map((opt, i) => {
                                        const isCorrect = i === questions[currentQuestionIndex].correct;
                                        const isSelected = selectedAnswer === i;
                                        let optionStyle = 'bg-white/5 border-white/10';
                                        if (showFeedback) {
                                            if (isCorrect) optionStyle = 'bg-emerald-500/20 border-emerald-500/40';
                                            else if (isSelected && !isCorrect) optionStyle = 'bg-red-500/20 border-red-500/40';
                                            else optionStyle = 'bg-white/3 border-white/5 opacity-50';
                                        }
                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={!showFeedback ? { x: 10, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
                                                whileTap={!showFeedback ? { scale: 0.98 } : {}}
                                                onClick={() => handleAnswer(i)}
                                                disabled={showFeedback}
                                                className={cn(
                                                    `w-full p-6 border rounded-[28px] text-left flex items-center gap-4 group transition-all`,
                                                    optionStyle
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors border',
                                                    showFeedback && isCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                                                        showFeedback && isSelected && !isCorrect ? 'bg-red-500 text-white border-red-500' :
                                                            'bg-white/5 border-white/10 text-zinc-500 group-hover:bg-purple-500 group-hover:text-white'
                                                )}>
                                                    {showFeedback && isCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                                                        showFeedback && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                                                            String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="text-zinc-300 font-medium text-sm">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {opt}
                                                    </ReactMarkdown>
                                                </div>
                                            </motion.button>
                                        );
                                    })}

                                    {showFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4 mt-2"
                                        >
                                            <div className={cn(
                                                'p-5 rounded-[24px] border',
                                                selectedAnswer === questions[currentQuestionIndex].correct
                                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                                    : 'bg-red-500/10 border-red-500/20'
                                            )}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {selectedAnswer === questions[currentQuestionIndex].correct
                                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                        : <XCircle className="w-5 h-5 text-red-400" />
                                                    }
                                                    <span className="font-black text-sm">
                                                        {selectedAnswer === questions[currentQuestionIndex].correct ? 'Correto!' : 'Incorreto'}
                                                    </span>
                                                </div>
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {questions[currentQuestionIndex].explanation}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNextQuestion}
                                                className="w-full py-5 rounded-[28px] bg-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20"
                                            >
                                                {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão →' : 'Ver Resultado'}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-8 py-12"
                            >
                                {(() => {
                                    const result = getResultMessage();
                                    const pct = Math.round((score / questions.length) * 100);
                                    return (
                                        <>
                                            <div className={cn(
                                                "w-32 h-32 rounded-full border flex items-center justify-center mb-4",
                                                pct >= 60 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"
                                            )}>
                                                <span className="text-5xl">{result.emoji}</span>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-4xl font-black text-white">{result.text}</h3>
                                                <p className="text-zinc-500 font-medium">Você acertou {score} de {questions.length} questões ({pct}%).</p>
                                                <p className="text-zinc-600 text-sm">{result.sub}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={onBack}
                                        className="flex-1 py-5 rounded-[28px] bg-white/5 border border-white/10 font-bold text-sm text-zinc-400"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={loadQuiz}
                                        className="flex-1 py-5 rounded-[28px] bg-purple-500/20 border border-purple-500/30 font-bold text-sm text-purple-400 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Novas Questões
                                    </button>
                                </div>
                                <button
                                    onClick={startQuiz}
                                    className="w-full py-5 rounded-[28px] bg-emerald-500 font-bold text-sm text-black shadow-xl shadow-emerald-500/10"
                                >
                                    Tentar Novamente (mesmas questões)
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default QuizMode;
