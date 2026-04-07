import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, Sparkles, CheckCircle2, XCircle, Trophy, RefreshCw, Zap, Lightbulb, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizQuestions } from '../services/api';
import { useToast } from './Toast';
import { cn } from '../lib/utils';
import MathDisplay from './MathDisplay';
import LearningObjectives from './LearningObjectives';
import { useLearningPath } from '../hooks/useLearningPath';
import { useAppContext } from '../hooks/useAppContext';

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
    const [currentHintLevel, setCurrentHintLevel] = useState(0);
    const [showLearningPath, setShowLearningPath] = useState(false);
    const toast = useToast();

    // Hook de trilha de aprendizado
    const { getNextStudySuggestion, handleQuizCompletion, generateLearningPath } = useLearningPath(topic);

    // Gamification
    const { onQuizComplete } = useAppContext();

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
                setSource(data.source || 'Guidorizzi API');
                toast.success(`${data.questions.length} questões geradas sobre "${topic}"!`);
            } else {
                throw new Error('Nenhuma questão retornada');
            }
        } catch (error) {
            console.error('Error loading quiz, falling back to local:', error);
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
        setCurrentHintLevel(0);
        if (index === questions[currentQuestionIndex].correct) {
            setScore(s => s + 1);
        }
    };

    // Sistema de hints progressivos
    const getHint = (question, hintLevel) => {
        const questionText = question.text.toLowerCase();

        const hintsByTopic = {
            'limite': [
                'Dica: Pense em como a função se comporta conforme x se aproxima do ponto.',
                'Lembre-se: Para limites, podemos fatorar ou racionalizar expressões.',
                'Atenção: Verifique se é uma forma indeterminada 0/0 ou ∞/∞.'
            ],
            'derivada': [
                'Dica: Lembre-se da definição de derivada como limite do quociente de diferenças.',
                'Pense: Use as regras de derivação: soma, produto, quociente e cadeia.',
                'Atenção: Não esqueça de aplicar a regra da cadeia em funções compostas.'
            ],
            'integral': [
                'Dica: A integral indefinida é a operação inversa da derivação.',
                'Pense: Tente identificar qual técnica aplicar: substituição ou por partes.',
                'Atenção: Não esqueça da constante de integração C!'
            ],
            'continu': [
                'Dica: Uma função é contínua se o gráfico não apresenta saltos.',
                'Pense: Verifique as três condições: função definida, limite existe e são iguais.',
                'Atenção: Use o Teorema do Valor Intermediário para verificar existência de raízes.'
            ],
            'default': [
                'Dica: Releia o enunciado com atenção e identifique os dados importantes.',
                'Pense: Que conceitos do Guidorizzi são necessários para resolver?',
                'Atenção: Verifique se a resposta faz sentido no contexto do problema.'
            ]
        };

        let relevantHints = hintsByTopic['default'];
        for (const [key, hints] of Object.entries(hintsByTopic)) {
            if (questionText.includes(key)) {
                relevantHints = hints;
                break;
            }
        }

        const hintIndex = Math.min(hintLevel - 1, relevantHints.length - 1);
        return relevantHints[hintIndex];
    };

    const handleShowHint = () => {
        if (currentHintLevel < 3) {
            setCurrentHintLevel(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setShowFeedback(false);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            const pct = Math.round((score / questions.length) * 100);
            onQuizComplete(pct);
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

    // ===== LOADING STATE =====
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
            <div className="relative w-28 h-28 bg-zinc-900 border-8 border-premium-blue shadow-[16px_16px_0_theme(colors.premium-blue)] flex items-center justify-center transform -rotate-6">
                <BrainCircuit className="w-12 h-12 text-white animate-pulse" />
            </div>
            <div className="text-center bg-zinc-900 border-4 border-white p-8 shadow-[12px_12px_0_rgba(255,255,255,0.2)] transform rotate-2 max-w-md">
                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-3">
                    Forjando Questões
                </h3>
                <p className="text-premium-blue font-bold uppercase text-sm tracking-widest">
                    CONSULTANDO O GUIDORIZZI SOBRE "{topic}"...
                </p>
            </div>
        </div>
    );

    // ===== MAIN QUIZ UI =====
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8 pb-20 relative"
        >
            {/* Header */}
            <header className="flex items-center justify-between border-b-8 border-zinc-900 pb-6 mb-4">
                <motion.button
                    whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: "0px 0px 0px transparent" }}
                    onClick={quizStarted && !showResults ? () => setQuizStarted(false) : onBack}
                    className="w-14 h-14 flex items-center justify-center bg-zinc-950 border-4 border-white shadow-[8px_8px_0_rgba(255,255,255,1)] hover:bg-white hover:text-zinc-950 transition-colors text-white rounded-none"
                >
                    <ChevronLeft className="w-7 h-7" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-widest text-white">
                        {quizStarted ? `Quiz: ${topic}` : 'Desafio Guidorizzi'}
                    </h2>
                    <p className="text-zinc-500 text-xs uppercase font-black tracking-widest mt-2">
                        <span className="border-4 border-zinc-800 bg-zinc-900 px-4 py-1 inline-block shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                            {quizStarted && !showResults
                                ? `Questão ${currentQuestionIndex + 1} / ${questions.length}`
                                : `${questions.length} Questões • ${source}`
                            }
                        </span>
                    </p>
                </div>
                <button
                    onClick={loadQuiz}
                    className="w-14 h-14 flex items-center justify-center bg-zinc-950 border-4 border-zinc-700 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:border-premium-blue hover:shadow-[8px_8px_0_theme(colors.premium-blue)] hover:text-premium-blue transition-all text-zinc-400 active:translate-x-1 active:translate-y-1 active:shadow-none rounded-none"
                    title="Gerar novas questões"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </header>

            {!quizStarted ? (
                /* ===== PRE-QUIZ SCREEN ===== */
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-10 py-8"
                >
                    <div className="w-32 h-32 bg-zinc-900 border-8 border-premium-blue shadow-[16px_16px_0_theme(colors.premium-blue)] flex items-center justify-center transform rotate-6">
                        <Zap className="w-14 h-14 text-white" fill="currentColor" />
                    </div>

                    <div className="text-center bg-zinc-900 border-4 border-white p-8 shadow-[12px_12px_0_rgba(255,255,255,0.2)] max-w-md w-full">
                        <h3 className="text-3xl font-black text-white uppercase tracking-widest">{topic}</h3>
                        <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest mt-4 max-w-[280px] mx-auto">
                            {questions.length} questões de múltipla escolha baseadas no Guidorizzi
                        </p>
                        {source.includes('LIVE') && (
                            <div className="flex items-center gap-3 justify-center text-xs font-black uppercase tracking-widest text-premium-blue border-t-4 border-zinc-800 pt-4 mt-4">
                                <div className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full bg-premium-blue opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 bg-premium-blue"></span>
                                </div>
                                GERADO POR IA
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                        {[
                            { label: 'Fáceis', count: 2, color: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-[6px_6px_0_theme(colors.emerald.500)]' },
                            { label: 'Médias', count: 2, color: 'text-premium-blue', border: 'border-premium-blue', shadow: 'shadow-[6px_6px_0_theme(colors.premium-blue)]' },
                            { label: 'Difíceis', count: 1, color: 'text-rose-400', border: 'border-rose-500', shadow: 'shadow-[6px_6px_0_theme(colors.rose.500)]' },
                        ].map(d => (
                            <div key={d.label} className={cn("p-5 bg-zinc-950 border-4 text-center rounded-none", d.border, d.shadow)}>
                                <p className={cn("text-3xl font-black", d.color)}>{d.count}</p>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">{d.label}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startQuiz}
                        className="w-full max-w-md py-8 bg-premium-blue border-4 border-white text-white hover:bg-white hover:text-premium-blue font-black uppercase tracking-widest text-xl shadow-[12px_12px_0_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_0_theme(colors.premium-blue)] transition-all flex items-center justify-center gap-4 active:translate-x-2 active:translate-y-2 active:shadow-none mt-4 rounded-none"
                    >
                        <Sparkles className="w-7 h-7" />
                        INICIAR DESAFIO
                    </button>
                </motion.div>
            ) : (
                <div className="flex-1 flex flex-col gap-8">
                    {/* Progress squares */}
                    {!showResults && (
                        <div className="flex justify-center gap-3">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-4 transition-all border-4 rounded-none",
                                        i === currentQuestionIndex ? "bg-premium-blue border-premium-blue w-10 shadow-[4px_4px_0_theme(colors.premium-blue)]" :
                                            i < currentQuestionIndex ? "bg-premium-blue/30 border-premium-blue/50 w-4" : "bg-transparent border-zinc-800 w-4"
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
                                className="space-y-6 max-w-2xl mx-auto w-full"
                            >
                                {/* Question Block */}
                                <div className="p-10 bg-zinc-900 border-4 border-white shadow-[16px_16px_0_rgba(255,255,255,0.2)] min-h-[160px] flex items-center justify-center text-center rounded-none">
                                    <MathDisplay
                                        content={questions[currentQuestionIndex].text}
                                        className="prose prose-invert prose-xl prose-headings:font-black prose-headings:uppercase prose-p:font-bold max-w-none"
                                    />
                                </div>

                                {/* Hint System */}
                                {!showFeedback && currentHintLevel > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 bg-zinc-900 border-4 border-premium-blue shadow-[8px_8px_0_theme(colors.premium-blue)] rounded-none"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Lightbulb className="w-5 h-5 text-premium-blue" />
                                            <span className="text-premium-blue text-sm font-black uppercase tracking-widest">
                                                Dica {currentHintLevel}/3
                                            </span>
                                        </div>
                                        <p className="text-white text-base font-medium">
                                            {getHint(questions[currentQuestionIndex], currentHintLevel)}
                                        </p>
                                    </motion.div>
                                )}

                                {!showFeedback && currentHintLevel < 3 && (
                                    <button
                                        onClick={handleShowHint}
                                        className="w-full py-4 bg-zinc-950 border-4 border-zinc-800 text-zinc-400 hover:border-premium-blue hover:text-premium-blue hover:shadow-[8px_8px_0_theme(colors.premium-blue)] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-none"
                                    >
                                        <Lightbulb className="w-5 h-5" />
                                        Preciso de uma dica ({currentHintLevel}/3)
                                    </button>
                                )}

                                {/* Options */}
                                <div className="grid gap-5">
                                    {questions[currentQuestionIndex].options.map((opt, i) => {
                                        const isCorrect = i === questions[currentQuestionIndex].correct;
                                        const isSelected = selectedAnswer === i;
                                        let optionStyle = 'bg-zinc-950 border-zinc-700 text-zinc-300';
                                        let shadowStyle = 'shadow-[8px_8px_0_rgba(0,0,0,0.5)]';

                                        if (showFeedback) {
                                            if (isCorrect) {
                                                optionStyle = 'bg-emerald-950 border-emerald-500 text-emerald-50';
                                                shadowStyle = 'shadow-[8px_8px_0_theme(colors.emerald.500)]';
                                            }
                                            else if (isSelected && !isCorrect) {
                                                optionStyle = 'bg-rose-950 border-rose-500 text-rose-50';
                                                shadowStyle = 'shadow-[8px_8px_0_theme(colors.rose.500)]';
                                            }
                                            else {
                                                optionStyle = 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50';
                                                shadowStyle = 'shadow-none';
                                            }
                                        }
                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={!showFeedback ? { x: -4, y: -4, boxShadow: "12px 12px 0px 0px rgba(255,255,255,0.3)" } : {}}
                                                whileTap={!showFeedback ? { x: 4, y: 4, boxShadow: "0px 0px 0px transparent" } : {}}
                                                onClick={() => handleAnswer(i)}
                                                disabled={showFeedback}
                                                className={cn(
                                                    `w-full p-6 border-4 text-left flex items-center gap-5 transition-all uppercase font-bold tracking-wide rounded-none`,
                                                    optionStyle,
                                                    shadowStyle
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-10 h-10 flex items-center justify-center text-sm font-black transition-colors border-4 rounded-none',
                                                    showFeedback && isCorrect ? 'bg-emerald-500 text-zinc-950 border-emerald-500' :
                                                        showFeedback && isSelected && !isCorrect ? 'bg-rose-500 text-zinc-950 border-rose-500' :
                                                            'bg-zinc-900 border-zinc-700 text-zinc-500'
                                                )}>
                                                    {showFeedback && isCorrect ? <CheckCircle2 className="w-6 h-6" /> :
                                                        showFeedback && isSelected && !isCorrect ? <XCircle className="w-6 h-6" /> :
                                                            String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="flex-1">
                                                    <MathDisplay
                                                        content={opt}
                                                        className="prose prose-invert prose-base max-w-none"
                                                    />
                                                </div>
                                            </motion.button>
                                        );
                                    })}

                                    {/* Feedback Block */}
                                    {showFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6 mt-2"
                                        >
                                            <div className={cn(
                                                'p-8 border-4 rounded-none',
                                                selectedAnswer === questions[currentQuestionIndex].correct
                                                    ? 'bg-emerald-950 border-emerald-500 shadow-[12px_12px_0_theme(colors.emerald.500)]'
                                                    : 'bg-rose-950 border-rose-500 shadow-[12px_12px_0_theme(colors.rose.500)]'
                                            )}>
                                                <div className="flex items-center gap-4 mb-6 border-b-4 border-zinc-800 pb-4">
                                                    {selectedAnswer === questions[currentQuestionIndex].correct
                                                        ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                                        : <XCircle className="w-8 h-8 text-rose-400" />
                                                    }
                                                    <span className={cn("text-xl font-black tracking-widest uppercase",
                                                        selectedAnswer === questions[currentQuestionIndex].correct ? "text-emerald-400" : "text-rose-400"
                                                    )}>
                                                        {selectedAnswer === questions[currentQuestionIndex].correct ? 'CORRETO!' : 'INCORRETO!'}
                                                    </span>
                                                </div>
                                                <div className="prose prose-invert prose-base max-w-none text-white font-medium">
                                                    <MathDisplay
                                                        content={questions[currentQuestionIndex].explanation}
                                                        className="prose prose-invert prose-base max-w-none text-white font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNextQuestion}
                                                className="w-full py-8 bg-white border-4 border-white text-zinc-950 hover:bg-zinc-950 hover:text-white hover:border-white font-black text-lg uppercase tracking-widest shadow-[12px_12px_0_rgba(255,255,255,0.5)] hover:shadow-[8px_8px_0_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-3 active:translate-x-2 active:translate-y-2 active:shadow-none rounded-none"
                                            >
                                                {currentQuestionIndex < questions.length - 1 ? 'PRÓXIMA QUESTÃO →' : 'VER RESULTADO'}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            /* ===== RESULTS SCREEN ===== */
                            <motion.div
                                key="results"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-10 py-12 max-w-md mx-auto w-full"
                            >
                                {(() => {
                                    const result = getResultMessage();
                                    const pct = Math.round((score / questions.length) * 100);
                                    return (
                                        <>
                                            <div className={cn(
                                                "w-36 h-36 border-8 flex items-center justify-center bg-zinc-900 transform rotate-6 rounded-none",
                                                pct >= 60
                                                    ? "border-emerald-500 shadow-[16px_16px_0_theme(colors.emerald.500)]"
                                                    : "border-premium-blue shadow-[16px_16px_0_theme(colors.premium-blue)]"
                                            )}>
                                                <span className="text-7xl transform -rotate-6">{result.emoji}</span>
                                            </div>
                                            <div className="text-center bg-zinc-900 border-4 border-white p-10 shadow-[12px_12px_0_rgba(255,255,255,0.2)] w-full rounded-none">
                                                <h3 className="text-4xl font-black text-white uppercase tracking-widest">{result.text}</h3>
                                                <div className="border-4 border-zinc-800 bg-zinc-950 p-4 mx-auto mt-6">
                                                    <p className="text-white font-black tracking-widest uppercase text-lg">VOCÊ ACERTOU {score} DE {questions.length}</p>
                                                    <p className="text-premium-blue font-black text-2xl mt-2">{pct}% DE PRECISÃO</p>
                                                </div>
                                                <p className="text-zinc-500 text-sm font-black uppercase tracking-widest mt-6">{result.sub}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div className="flex flex-col sm:flex-row gap-6 w-full">
                                    <button
                                        onClick={onBack}
                                        className="flex-1 py-6 bg-zinc-950 border-4 border-zinc-700 text-zinc-400 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)] hover:border-white hover:text-white hover:shadow-[8px_8px_0_rgba(255,255,255,0.2)] transition-all active:translate-x-2 active:translate-y-2 active:shadow-none rounded-none"
                                    >
                                        DASHBOARD
                                    </button>
                                    <button
                                        onClick={loadQuiz}
                                        className="flex-1 py-6 bg-zinc-950 border-4 border-premium-blue text-premium-blue font-black uppercase tracking-widest text-sm shadow-[8px_8px_0_theme(colors.premium-blue)] hover:bg-premium-blue hover:text-white transition-all flex items-center justify-center gap-3 active:translate-x-2 active:translate-y-2 active:shadow-none rounded-none"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        NOVAS
                                    </button>
                                </div>

                                {/* Botão para ver trilha personalizada */}
                                {(() => {
                                    const pct = Math.round((score / questions.length) * 100);
                                    return pct < 70 ? (
                                        <button
                                            onClick={() => {
                                                handleQuizCompletion(topic, score, questions.length);
                                                setShowLearningPath(true);
                                            }}
                                            className="w-full py-6 bg-premium-blue border-4 border-white text-white font-black uppercase tracking-widest text-sm shadow-[8px_8px_0_rgba(255,255,255,0.2)] hover:bg-white hover:text-premium-blue transition-all flex items-center justify-center gap-3 mt-2 rounded-none"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            VER TRILHA PERSONALIZADA
                                        </button>
                                    ) : null;
                                })()}

                                {/* Trilha de Aprendizado Personalizada */}
                                {showLearningPath && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full bg-zinc-900 border-4 border-premium-blue p-8 mt-4 shadow-[12px_12px_0_theme(colors.premium-blue)] rounded-none"
                                    >
                                        <div className="flex items-center gap-4 mb-6 border-b-4 border-zinc-800 pb-4">
                                            <Sparkles className="w-6 h-6 text-premium-blue" />
                                            <h4 className="text-white font-black uppercase tracking-widest text-lg">
                                                Sua Trilha de Estudo
                                            </h4>
                                        </div>

                                        <div className="space-y-4">
                                            {generateLearningPath().slice(0, 3).map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 p-4 bg-zinc-950 border-4 border-zinc-800 shadow-[4px_4px_0_rgba(0,0,0,0.5)] rounded-none"
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 flex items-center justify-center font-black text-sm border-4 rounded-none",
                                                        item.priority === 'high' ? "bg-rose-500 text-zinc-950 border-rose-500" :
                                                            item.priority === 'medium' ? "bg-premium-blue text-white border-premium-blue" :
                                                                "bg-zinc-800 text-white border-zinc-700"
                                                    )}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-bold text-base">{item.topic}</p>
                                                        <p className="text-zinc-500 text-sm">{item.reason}</p>
                                                    </div>
                                                    {item.type === 'prerequisite' && (
                                                        <span className="text-[9px] font-black uppercase text-premium-blue border-2 border-premium-blue px-3 py-1">
                                                            PRÉ-REQ
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setShowLearningPath(false)}
                                            className="w-full mt-6 py-3 text-zinc-500 text-sm font-black uppercase tracking-widest hover:text-white border-4 border-zinc-800 hover:border-white transition-all rounded-none"
                                        >
                                            FECHAR
                                        </button>
                                    </motion.div>
                                )}
                                <button
                                    onClick={startQuiz}
                                    className="w-full py-8 bg-emerald-500 border-4 border-white text-zinc-950 hover:bg-zinc-950 hover:text-emerald-500 hover:border-emerald-500 font-black uppercase tracking-widest text-base shadow-[12px_12px_0_theme(colors.emerald.500)] hover:shadow-[8px_8px_0_theme(colors.emerald.500)] transition-all active:translate-x-2 active:translate-y-2 active:shadow-none mt-2 rounded-none"
                                >
                                    TENTAR NOVAMENTE (MESMAS QUESTÕES)
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
