import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, Sparkles, CheckCircle2, XCircle, Trophy, RefreshCw, Zap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizQuestions } from '../services/api';
import { useToast } from './Toast';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessMathContent } from '../utils/mathPreprocessor';
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
        setCurrentHintLevel(0); // Reset hints após resposta
        if (index === questions[currentQuestionIndex].correct) {
            setScore(s => s + 1);
        }
    };

    // Sistema de hints progressivos
    const getHint = (question, hintLevel) => {
        const questionText = question.text.toLowerCase();
        
        // Hints genéricos baseados no conteúdo da questão
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
            'l\'hôpital': [
                'Dica: A regra só se aplica a formas 0/0 ou ∞/∞.',
                'Pense: Derive o numerador e denominador separadamente.',
                'Atenção: Verifique se as hipóteses da regra são satisfeitas antes de aplicar.'
            ],
            'teorema do confronto': [
                'Dica: O teorema "comprime" a função entre duas outras de limite conhecido.',
                'Pense: Procure funções que limitam a função dada superior e inferiormente.',
                'Atenção: As funções que limitam devem tender ao mesmo limite.'
            ],
            'default': [
                'Dica: Releia o enunciado com atenção e identifique os dados importantes.',
                'Pense: Que conceitos do Guidorizzi são necessários para resolver?',
                'Atenção: Verifique se a resposta faz sentido no contexto do problema.'
            ]
        };

        // Identificar o tópico da questão
        let relevantHints = hintsByTopic['default'];
        for (const [key, hints] of Object.entries(hintsByTopic)) {
            if (questionText.includes(key)) {
                relevantHints = hints;
                break;
            }
        }

        // Retorn o hint do nível apropriado (0-indexed, então hintLevel - 1)
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
            // Gamification: adicionar XP ao completar quiz
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="relative w-24 h-24 bg-zinc-950 border-2 border-[#00f0ff] shadow-[8px_8px_0_#00f0ff] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#00f0ff] animate-spin" />
            </div>
            <div className="text-center space-y-3 bg-zinc-950 border-2 border-white/20 p-6 shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                <span className="text-xl font-black text-white tracking-widest uppercase block">
                    Gerando Questões com IA
                </span>
                <p className="text-zinc-400 font-bold max-w-[250px] leading-relaxed mx-auto uppercase text-xs tracking-wider">
                    CONSULTANDO O GUIDORIZZI SOBRE "{topic}"...
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
            <header className="flex items-center justify-between border-b-2 border-white/20 pb-4 mb-8">
                <motion.button
                    whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                    onClick={quizStarted && !showResults ? () => setQuizStarted(false) : onBack}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-[#00f0ff] hover:shadow-[2px_2px_0_#00f0ff] hover:text-[#00f0ff] transition-colors text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                        {quizStarted ? `Quiz: ${topic}` : 'Desafio Guidorizzi'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mt-1">
                        <span className="border-2 border-white/10 bg-zinc-900 px-2 py-0.5 inline-block">
                            {quizStarted && !showResults
                                ? `Questão ${currentQuestionIndex + 1} / ${questions.length}`
                                : `${questions.length} Questões • ${source}`
                            }
                        </span>
                    </p>
                </div>
                <button
                    onClick={loadQuiz}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-orange-500 hover:shadow-[2px_2px_0_theme(colors.orange.500)] hover:text-orange-500 transition-colors text-zinc-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    title="Gerar novas questões"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </header>

            {!quizStarted ? (
                /* Pre-quiz screen */
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-8 py-8"
                >
                    <div className="w-28 h-28 bg-zinc-950 border-4 border-[#00f0ff] shadow-[8px_8px_0_#00f0ff] flex items-center justify-center">
                        <Zap className="w-12 h-12 text-[#00f0ff]" fill="currentColor" />
                    </div>

                    <div className="text-center space-y-3 bg-zinc-950 border-2 border-white/20 p-6 shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{topic}</h3>
                        <p className="text-zinc-400 font-bold text-xs uppercase tracking-wider max-w-[280px] mx-auto">
                            {questions.length} questões de múltipla escolha baseadas no Guidorizzi
                        </p>
                        {source.includes('LIVE') && (
                            <div className="flex items-center gap-2 justify-center text-[9px] font-black uppercase tracking-widest text-orange-500 border-t-2 border-white/10 pt-3 mt-3">
                                <div className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 bg-orange-500 border border-orange-200"></span>
                                </div>
                                GERADO POR IA
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                        {[
                            { label: 'Fáceis', count: 2, color: 'text-emerald-400', border: 'border-emerald-500' },
                            { label: 'Médias', count: 2, color: 'text-amber-400', border: 'border-amber-500' },
                            { label: 'Difíceis', count: 1, color: 'text-signal', border: 'border-signal' },
                        ].map(d => (
                            <div key={d.label} className={cn("p-4 bg-zinc-950 border-2 shadow-[2px_2px_0_rgba(255,255,255,0.1)] text-center", d.border)}>
                                <p className={cn("text-2xl font-black", d.color)}>{d.count}</p>
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">{d.label}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startQuiz}
                        className="w-full max-w-sm py-5 bg-[#00f0ff] border-2 border-[#00f0ff] text-zinc-950 hover:bg-zinc-950 hover:text-[#00f0ff] font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_#00f0ff] hover:shadow-[0px_0px_0_transparent] transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 mt-4"
                    >
                        <Sparkles className="w-5 h-5" />
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
                                        "h-3 transition-all border-2",
                                        i === currentQuestionIndex ? "bg-[#00f0ff] border-[#00f0ff] w-8 shadow-[2px_2px_0_#00f0ff]" :
                                            i < currentQuestionIndex ? "bg-[#00f0ff]/20 border-[#00f0ff]/40 w-3" : "bg-transparent border-white/20 w-3"
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
                                <div className="p-8 bg-zinc-950 border-2 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.2)] min-h-[160px] flex items-center justify-center text-center">
                                    <div className="prose prose-invert prose-lg prose-headings:font-black prose-headings:uppercase prose-p:font-bold max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {preprocessMathContent(questions[currentQuestionIndex].text)}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {/* Hint System - antes das opções */}
                                {!showFeedback && currentHintLevel > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-amber-950/30 border-2 border-amber-500/50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-amber-400" />
                                            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">
                                                Dica {currentHintLevel}/3
                                            </span>
                                        </div>
                                        <p className="text-amber-200 text-sm font-medium">
                                            {getHint(questions[currentQuestionIndex], currentHintLevel)}
                                        </p>
                                    </motion.div>
                                )}

                                {!showFeedback && currentHintLevel < 3 && (
                                    <button
                                        onClick={handleShowHint}
                                        className="w-full py-3 bg-zinc-900 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-950/30 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Lightbulb className="w-4 h-4" />
                                        Preciso de uma dica ({currentHintLevel}/3)
                                    </button>
                                )}

                                <div className="grid gap-4">
                                    {questions[currentQuestionIndex].options.map((opt, i) => {
                                        const isCorrect = i === questions[currentQuestionIndex].correct;
                                        const isSelected = selectedAnswer === i;
                                        let optionStyle = 'bg-zinc-950 border-white/20 text-zinc-300';
                                        let shadowStyle = 'shadow-[4px_4px_0_rgba(255,255,255,0.1)]';

                                        if (showFeedback) {
                                            if (isCorrect) {
                                                optionStyle = 'bg-emerald-950 border-emerald-500 text-emerald-50';
                                                shadowStyle = 'shadow-[4px_4px_0_theme(colors.emerald.500)]';
                                            }
                                            else if (isSelected && !isCorrect) {
                                                optionStyle = 'bg-rose-950 border-signal text-rose-50';
                                                shadowStyle = 'shadow-[4px_4px_0_theme(colors.signal)]';
                                            }
                                            else {
                                                optionStyle = 'bg-zinc-900 border-white/5 text-zinc-600 opacity-50';
                                                shadowStyle = 'shadow-none';
                                            }
                                        }
                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={!showFeedback ? { x: -2, y: -2, boxShadow: "4px 4px 0px 0px rgba(255,255,255,0.4)" } : {}}
                                                whileTap={!showFeedback ? { x: 2, y: 2, boxShadow: "0px 0px 0px transparent" } : {}}
                                                onClick={() => handleAnswer(i)}
                                                disabled={showFeedback}
                                                className={cn(
                                                    `w-full p-6 border-2 text-left flex items-center gap-4 transition-all uppercase font-bold tracking-wide`,
                                                    optionStyle,
                                                    shadowStyle
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-8 h-8 flex items-center justify-center text-xs font-black transition-colors border-2',
                                                    showFeedback && isCorrect ? 'bg-emerald-500 text-zinc-950 border-emerald-500' :
                                                        showFeedback && isSelected && !isCorrect ? 'bg-signal text-zinc-950 border-signal' :
                                                            'bg-zinc-900 border-zinc-700 text-zinc-500 group-hover:bg-white group-hover:text-zinc-950 group-hover:border-white'
                                                )}>
                                                    {showFeedback && isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                                                        showFeedback && isSelected && !isCorrect ? <XCircle className="w-5 h-5" /> :
                                                            String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="flex-1">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {preprocessMathContent(opt)}
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
                                                'p-6 border-2 shadow-[4px_4px_0_rgba(255,255,255,0.1)]',
                                                selectedAnswer === questions[currentQuestionIndex].correct
                                                    ? 'bg-emerald-950 border-emerald-500'
                                                    : 'bg-rose-950 border-signal'
                                            )}>
                                                <div className="flex items-center gap-3 mb-4 border-b-2 border-white/10 pb-3">
                                                    {selectedAnswer === questions[currentQuestionIndex].correct
                                                        ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                        : <XCircle className="w-6 h-6 text-signal" />
                                                    }
                                                    <span className={cn("font-black tracking-widest uppercase",
                                                        selectedAnswer === questions[currentQuestionIndex].correct ? "text-emerald-400" : "text-signal"
                                                    )}>
                                                        {selectedAnswer === questions[currentQuestionIndex].correct ? 'CORRETO!' : 'INCORRETO!'}
                                                    </span>
                                                </div>
                                                <div className="prose prose-invert prose-sm max-w-none text-white font-medium">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {preprocessMathContent(questions[currentQuestionIndex].explanation)}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleNextQuestion}
                                                className="w-full py-5 bg-white border-2 border-white text-zinc-950 hover:bg-zinc-950 hover:text-white font-black text-sm uppercase tracking-widest shadow-[4px_4px_0_rgba(255,255,255,0.5)] hover:shadow-[0px_0px_0_transparent] transition-all flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1"
                                            >
                                                {currentQuestionIndex < questions.length - 1 ? 'PRÓXIMA QUESTÃO →' : 'VER RESULTADO'}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center gap-8 py-12 max-w-md mx-auto w-full"
                            >
                                {(() => {
                                    const result = getResultMessage();
                                    const pct = Math.round((score / questions.length) * 100);
                                    return (
                                        <>
                                            <div className={cn(
                                                "w-32 h-32 border-4 shadow-[8px_8px_0_rgba(255,255,255,0.1)] flex items-center justify-center mb-4 bg-zinc-950",
                                                pct >= 60 ? "border-emerald-500" : "border-amber-500"
                                            )}>
                                                <span className="text-6xl">{result.emoji}</span>
                                            </div>
                                            <div className="text-center space-y-4 bg-zinc-950 border-2 border-white/20 p-8 shadow-[4px_4px_0_rgba(255,255,255,0.2)] w-full">
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{result.text}</h3>
                                                <div className="border-2 border-white/10 bg-zinc-900 p-3 mx-auto">
                                                    <p className="text-white font-black tracking-widest uppercase">VOCÊ ACERTOU {score} DE {questions.length}</p>
                                                    <p className="text-[#00f0ff] font-bold text-lg">{pct}% DE PRECISÃO</p>
                                                </div>
                                                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">{result.sub}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <button
                                        onClick={onBack}
                                        className="flex-1 py-4 bg-zinc-950 border-2 border-white/20 text-white font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_rgba(255,255,255,0.2)] hover:border-white hover:shadow-[0px_0px_0_transparent] transition-all active:translate-x-1 active:translate-y-1"
                                    >
                                        DASHBOARD
                                    </button>
                                <button
                                    onClick={loadQuiz}
                                    className="flex-1 py-4 bg-zinc-950 border-2 border-[#00f0ff] text-[#00f0ff] font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_#00f0ff] hover:bg-[#00f0ff] hover:text-zinc-950 hover:shadow-[0px_0px_0_transparent] transition-all flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1"
                                >
                                    <RefreshCw className="w-4 h-4" />
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
                                        className="w-full py-4 bg-amber-500 border-2 border-amber-500 text-zinc-950 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px-0_theme(colors.amber.500)] hover:bg-zinc-950 hover:text-amber-500 transition-all flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        VER TRILHA PERSONALIZADA
                                    </button>
                                ) : null;
                            })()}
                            
                            {/* Trilha de Aprendizado Personalizada */}
                            {showLearningPath && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full bg-zinc-900 border-2 border-amber-500 p-6 mt-4"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h4 className="text-white font-black uppercase tracking-wider">
                                            Sua Trilha de Estudo
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {generateLearningPath().slice(0, 3).map((item, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center gap-3 p-3 bg-zinc-950 border border-white/10"
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 flex items-center justify-center font-black text-xs",
                                                    item.priority === 'high' ? "bg-signal text-zinc-950" :
                                                    item.priority === 'medium' ? "bg-amber-500 text-zinc-950" :
                                                    "bg-zinc-700 text-white"
                                                )}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-sm">{item.topic}</p>
                                                    <p className="text-zinc-500 text-xs">{item.reason}</p>
                                                </div>
                                                {item.type === 'prerequisite' && (
                                                    <span className="text-[8px] font-black uppercase text-orange-400 border border-orange-400 px-2 py-1">
                                                        PRÉ-REQ
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowLearningPath(false)}
                                        className="w-full mt-4 py-2 text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white"
                                    >
                                        FECHAR
                                    </button>
                                </motion.div>
                            )}
                                <button
                                    onClick={startQuiz}
                                    className="w-full py-5 bg-emerald-500 border-2 border-emerald-500 text-zinc-950 hover:bg-zinc-950 hover:text-emerald-500 font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0_theme(colors.emerald.500)] hover:shadow-[0px_0px_0_transparent] transition-all active:translate-x-1 active:translate-y-1 mt-2"
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
