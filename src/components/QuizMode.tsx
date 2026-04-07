import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, CheckCircle2, XCircle, Trophy, RefreshCw, Zap, Lightbulb, BrainCircuit, Sparkles } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 bg-[#2a2a2a]"
            style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.8) 2px, transparent 2px)', backgroundSize: '40px 40px' }}
        >
            <div className="relative w-28 h-28 bg-black border-8 border-[#22d3ee] shadow-[12px_12px_0_#22d3ee] flex items-center justify-center transform -rotate-6">
                <BrainCircuit className="w-12 h-12 text-[#22d3ee] animate-pulse" />
            </div>
            <div className="text-center bg-black border-4 border-white p-8 shadow-[8px_8px_0_black] transform rotate-2 max-w-md">
                <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-3">
                    Forjando Questões
                </h3>
                <p className="text-[#f97316] font-bold uppercase text-sm tracking-widest">
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
            className="flex flex-col min-h-screen relative overflow-hidden"
            style={{
                backgroundColor: '#2a2a2a',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.8) 2px, transparent 2px)',
                backgroundSize: '40px 40px',
                backgroundPosition: 'top center'
            }}
        >
            {/* Header (Neo-Brutalist transparent override) */}
            <header className="flex items-center justify-between p-4 z-50">
                <button
                    onClick={quizStarted && !showResults ? () => setQuizStarted(false) : onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-black border-4 border-white text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={3} /> VOLTAR
                </button>
                <div className="flex-1 text-center hidden sm:block">
                    {/* Optional centered top text for quizzes */}
                </div>
                <button
                    onClick={loadQuiz}
                    className="flex flex-col items-center justify-center bg-black border-4 border-white p-2 text-white hover:bg-white hover:text-black shadow-[4px_4px_0_black] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                    title="Gerar novas questões"
                >
                    <RefreshCw className="w-5 h-5" strokeWidth={3} />
                </button>
            </header>

            <div className="flex-1 w-full px-4 pb-20 pt-4 relative z-40 flex flex-col">
                {!quizStarted ? (
                    /* ===== PRE-QUIZ SCREEN (MATCH IMAGE) ===== */
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center justify-center flex-1 w-full max-w-sm mx-auto"
                    >
                        {/* Top Banner - Lime */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-[#a3e635] text-black border-4 border-black px-4 py-3 shadow-[6px_6px_0_black] transform"
                        >
                            <p className="text-center font-black text-[15px] sm:text-lg uppercase tracking-tight leading-tight">
                                {questions.length} QUESTÕES GERADAS SOBRE "{topic}"!
                            </p>
                        </motion.div>

                        {/* Lightning Icon with Cyan Border */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative mt-8 mb-4"
                        >
                            <div className="w-32 h-32 bg-black border-[6px] border-[#22d3ee] shadow-[10px_10px_0_#22d3ee] flex items-center justify-center translate-x-[-5px] translate-y-[-5px]">
                                <Zap className="w-20 h-20 text-[#22d3ee]" fill="currentColor" strokeWidth={1} />
                            </div>
                        </motion.div>

                        {/* Main Title Section - Black with Shadow */}
                        <div className="w-full bg-black border-4 border-black px-6 py-8 shadow-[10px_10px_0_black] text-center mt-6">
                            <h3 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                                {topic}
                            </h3>
                            <p className="text-white/90 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-2 leading-tight max-w-[200px] mx-auto">
                                {questions.length} QUESTÕES DE MÚLTIPLA ESCOLHA BASEADAS NO GUIDORIZZI
                            </p>
                        </div>

                        {/* Difficulty Stats - 3 colored boxes */}
                        <div className="flex justify-between gap-3 w-full mt-8">
                            {[
                                { label: 'FÁCEIS', count: 2, border: 'border-[#a3e635]', shadow: 'shadow-[6px_6px_0_#a3e635]' },
                                { label: 'MÉDIAS', count: 2, border: 'border-[#f97316]', shadow: 'shadow-[6px_6px_0_#f97316]' },
                                { label: 'DIFÍCEIS', count: 1, border: 'border-[#ef4444]', shadow: 'shadow-[6px_6px_0_#ef4444]' },
                            ].map(d => (
                                <motion.div
                                    key={d.label}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className={cn(
                                        "flex-1 py-3 px-1 border-4 text-center bg-black transition-all",
                                        d.border,
                                        d.shadow
                                    )}
                                >
                                    <p className="text-2xl font-black text-white leading-none">
                                        {d.count} <span className="text-[9px] sm:text-[10px] tracking-widest uppercase block mt-2 leading-none">{d.label}</span>
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Start Button - Cyan */}
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 2, boxShadow: "0px 0px 0px transparent" }}
                            onClick={startQuiz}
                            className="w-full py-5 mt-10 bg-[#22d3ee] border-4 border-black text-black hover:bg-white font-black uppercase tracking-tight text-2xl sm:text-3xl shadow-[8px_8px_0_black] transition-all flex items-center justify-center gap-2 active:translate-x-2 active:translate-y-2 active:shadow-none"
                        >
                            <span>INICIAR DESAFIO</span>
                            <Zap className="w-8 h-8" fill="currentColor" strokeWidth={1} />
                        </motion.button>

                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-6 flex-1 w-full max-w-2xl mx-auto">
                        {/* Progress Tracker Grid-styled */}
                        {!showResults && (
                            <div className="flex justify-center gap-2 bg-black border-4 border-white p-2 shadow-[6px_6px_0_black] w-fit mx-auto mb-4">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-4 border-2 transition-all",
                                            i === currentQuestionIndex ? "bg-[#22d3ee] border-black w-8" :
                                                i < currentQuestionIndex ? "bg-[#10b981] border-black w-4" : "bg-transparent border-zinc-700 w-4"
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
                                    className="space-y-6 w-full"
                                >
                                    {/* Question Block */}
                                    <div className="p-8 bg-black border-4 border-white shadow-[8px_8px_0_black] min-h-[160px] flex items-center justify-center text-center">
                                        <div className="prose prose-invert prose-xl max-w-none w-full">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    p: ({ children }) => <p className="text-white font-black leading-tight text-xl sm:text-2xl tracking-tight">{children}</p>,
                                                    strong: ({ children }) => <strong className="text-[#a3e635]">{children}</strong>,
                                                }}
                                            >
                                                {preprocessMathContent(questions[currentQuestionIndex].text)}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Hint System */}
                                    {!showFeedback && currentHintLevel > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-black border-4 border-[#22d3ee] shadow-[6px_6px_0_#22d3ee]"
                                        >
                                            <div className="flex items-center gap-3 mb-3 border-b-2 border-zinc-800 pb-2">
                                                <Lightbulb className="w-5 h-5 text-[#22d3ee]" strokeWidth={3} />
                                                <span className="text-[#22d3ee] text-sm font-black uppercase tracking-widest">
                                                    Dica {currentHintLevel}/3
                                                </span>
                                            </div>
                                            <p className="text-white text-base font-bold uppercase tracking-wide">
                                                {getHint(questions[currentQuestionIndex], currentHintLevel)}
                                            </p>
                                        </motion.div>
                                    )}

                                    {!showFeedback && currentHintLevel < 3 && (
                                        <button
                                            onClick={handleShowHint}
                                            className="w-full py-4 bg-black border-4 border-zinc-800 text-zinc-400 hover:border-[#22d3ee] hover:text-[#22d3ee] hover:shadow-[6px_6px_0_#22d3ee] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                        >
                                            <Lightbulb className="w-5 h-5" strokeWidth={3} />
                                            Preciso de uma dica ({currentHintLevel}/3)
                                        </button>
                                    )}

                                    {/* Options */}
                                    <div className="grid gap-4">
                                        {questions[currentQuestionIndex].options.map((opt, i) => {
                                            const isCorrect = i === questions[currentQuestionIndex].correct;
                                            const isSelected = selectedAnswer === i;

                                            // Neo-Brutalist Default Styles
                                            let optionStyle = 'bg-[#2a2a2a] border-white text-white';
                                            let shadowStyle = 'shadow-[6px_6px_0_black]';
                                            let iconStyle = 'bg-black border-white text-white';

                                            if (showFeedback) {
                                                if (isCorrect) {
                                                    optionStyle = 'bg-black border-[#10b981] text-[#10b981]'; // Emerald
                                                    shadowStyle = 'shadow-[6px_6px_0_#10b981]';
                                                    iconStyle = 'bg-[#10b981] border-[#10b981] text-black';
                                                } else if (isSelected && !isCorrect) {
                                                    optionStyle = 'bg-black border-[#ef4444] text-[#ef4444]'; // Rose
                                                    shadowStyle = 'shadow-[6px_6px_0_#ef4444]';
                                                    iconStyle = 'bg-[#ef4444] border-[#ef4444] text-black';
                                                } else {
                                                    optionStyle = 'bg-black border-zinc-700 text-zinc-500 opacity-50';
                                                    shadowStyle = 'shadow-[6px_6px_0_transparent] translate-x-1 translate-y-1';
                                                    iconStyle = 'bg-black border-zinc-700 text-zinc-700';
                                                }
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswer(i)}
                                                    disabled={showFeedback}
                                                    className={cn(
                                                        `w-full p-4 sm:p-6 border-4 text-left flex items-center gap-4 transition-all uppercase font-bold tracking-wide hover:bg-white hover:text-black`,
                                                        optionStyle,
                                                        shadowStyle,
                                                        (!showFeedback) ? "hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none" : ""
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'flex-shrink-0 w-10 h-10 flex items-center justify-center text-sm font-black border-4',
                                                        iconStyle,
                                                        (!showFeedback) ? "group-hover:bg-black group-hover:text-white" : ""
                                                    )}>
                                                        {showFeedback && isCorrect ? <CheckCircle2 className="w-6 h-6" strokeWidth={3} /> :
                                                            showFeedback && isSelected && !isCorrect ? <XCircle className="w-6 h-6" strokeWidth={3} /> :
                                                                String.fromCharCode(65 + i)}
                                                    </div>
                                                    <div className="flex-1 prose prose-invert prose-base max-w-none prose-p:font-black prose-p:text-inherit">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                        >
                                                            {preprocessMathContent(opt)}
                                                        </ReactMarkdown>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {/* Feedback Block */}
                                        {showFeedback && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6 mt-4"
                                            >
                                                <div className={cn(
                                                    'p-6 sm:p-8 border-4 bg-black',
                                                    selectedAnswer === questions[currentQuestionIndex].correct
                                                        ? 'border-[#10b981] shadow-[8px_8px_0_#10b981]'
                                                        : 'border-[#ef4444] shadow-[8px_8px_0_#ef4444]'
                                                )}>
                                                    <div className="flex items-center gap-4 mb-4 border-b-4 border-zinc-800 pb-4">
                                                        {selectedAnswer === questions[currentQuestionIndex].correct
                                                            ? <CheckCircle2 className="w-8 h-8 text-[#10b981]" strokeWidth={3} />
                                                            : <XCircle className="w-8 h-8 text-[#ef4444]" strokeWidth={3} />
                                                        }
                                                        <span className={cn("text-2xl font-black tracking-widest uppercase",
                                                            selectedAnswer === questions[currentQuestionIndex].correct ? "text-[#10b981]" : "text-[#ef4444]"
                                                        )}>
                                                            {selectedAnswer === questions[currentQuestionIndex].correct ? 'CORRETO!' : 'INCORRETO!'}
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-invert prose-base max-w-none">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={{
                                                                p: ({ children }) => <p className="text-white font-bold uppercase tracking-wide">{children}</p>,
                                                                strong: ({ children }) => <strong className="text-white font-black">{children}</strong>,
                                                            }}
                                                        >
                                                            {preprocessMathContent(questions[currentQuestionIndex].explanation)}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleNextQuestion}
                                                    className="w-full py-6 bg-white border-4 border-white text-black hover:bg-black hover:text-white font-black text-xl uppercase tracking-widest shadow-[8px_8px_0_black] transition-all flex items-center justify-center gap-3 active:translate-x-2 active:translate-y-2 active:shadow-none"
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
                                    className="flex-1 flex flex-col items-center justify-center gap-8 py-8 max-w-lg mx-auto w-full"
                                >
                                    {(() => {
                                        const result = getResultMessage();
                                        const pct = Math.round((score / questions.length) * 100);
                                        return (
                                            <>
                                                <div className={cn(
                                                    "w-40 h-40 border-8 flex items-center justify-center bg-black transform -rotate-3",
                                                    pct >= 60
                                                        ? "border-[#a3e635] shadow-[12px_12px_0_#a3e635]"
                                                        : "border-[#22d3ee] shadow-[12px_12px_0_#22d3ee]"
                                                )}>
                                                    <span className="text-7xl transform rotate-3">{result.emoji}</span>
                                                </div>
                                                <div className="text-center bg-black border-4 border-white p-8 shadow-[10px_10px_0_black] w-full transform rotate-1 mt-4">
                                                    <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">{result.text}</h3>
                                                    <div className="border-4 border-white bg-[#2a2a2a] p-4 mx-auto mt-6 shadow-[inset_4px_4px_0_black]">
                                                        <p className="text-white font-black tracking-widest uppercase text-sm">ACERTOS:</p>
                                                        <p className="text-white font-black text-[40px] leading-none my-2">{score} / {questions.length}</p>
                                                        <div className="w-full bg-black border-2 border-white h-4 mt-2">
                                                            <div className="h-full bg-[#a3e635]" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[#22d3ee] text-xs font-black uppercase tracking-widest mt-6">{result.sub}</p>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    {/* Layout for actions */}
                                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                        <button
                                            onClick={onBack}
                                            className="col-span-1 py-5 bg-[#2a2a2a] border-4 border-white text-white font-black uppercase tracking-widest text-sm shadow-[6px_6px_0_black] hover:bg-white hover:text-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center"
                                        >
                                            MENU
                                        </button>
                                        <button
                                            onClick={loadQuiz}
                                            className="col-span-1 py-5 bg-[#22d3ee] border-4 border-black text-black font-black uppercase tracking-widest text-sm shadow-[6px_6px_0_black] hover:bg-white transition-all flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1 active:shadow-none"
                                        >
                                            <RefreshCw className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                                            NOVAS
                                        </button>

                                        {/* Trilha Personalizada */}
                                        {(() => {
                                            const pct = Math.round((score / questions.length) * 100);
                                            return pct < 70 ? (
                                                <button
                                                    onClick={() => {
                                                        handleQuizCompletion(topic, score, questions.length);
                                                        setShowLearningPath(true);
                                                    }}
                                                    className="col-span-2 py-5 bg-[#f97316] border-4 border-black text-black font-black uppercase tracking-widest text-sm shadow-[6px_6px_0_black] hover:bg-white transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none"
                                                >
                                                    <Sparkles className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                                                    TRILHA PERSONALIZADA
                                                </button>
                                            ) : null;
                                        })()}

                                        <button
                                            onClick={startQuiz}
                                            className="col-span-2 py-5 bg-[#a3e635] border-4 border-black text-black font-black uppercase tracking-widest text-base shadow-[6px_6px_0_black] hover:bg-white transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none"
                                        >
                                            TENTAR ESTAS NOVAMENTE
                                        </button>
                                    </div>

                                    {/* Trilha de Aprendizado Overley */}
                                    {showLearningPath && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full bg-[#2a2a2a] border-4 border-[#f97316] p-6 shadow-[8px_8px_0_#f97316] mt-4"
                                        >
                                            <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                                                <Sparkles className="w-6 h-6 text-[#f97316]" strokeWidth={3} />
                                                <h4 className="text-white font-black uppercase tracking-widest text-lg">
                                                    Sua Trilha de Estudo
                                                </h4>
                                            </div>

                                            <div className="space-y-4">
                                                {generateLearningPath().slice(0, 3).map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 bg-black border-4 border-white shadow-[4px_4px_0_black]"
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 flex flex-shrink-0 items-center justify-center font-black text-sm border-4",
                                                            item.priority === 'high' ? "bg-[#ef4444] text-black border-[#ef4444]" :
                                                                item.priority === 'medium' ? "bg-[#22d3ee] text-black border-[#22d3ee]" :
                                                                    "bg-zinc-800 text-white border-zinc-700"
                                                        )}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-black text-sm uppercase">{item.topic}</p>
                                                            <p className="text-zinc-400 font-bold text-xs uppercase mt-1">{item.reason}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setShowLearningPath(false)}
                                                className="w-full mt-6 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black border-4 border-white transition-all shadow-[4px_4px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none"
                                            >
                                                FECHAR TRILHA
                                            </button>
                                        </motion.div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Minimal Bot/G logo absolutely positioned in background for Start Screen context */}
            {!quizStarted && (
                <div className="absolute bottom-4 right-4 z-50 pointer-events-none opacity-50 border-4 border-white rounded-full bg-black p-2 shadow-[4px_4px_0_black]">
                    <span className="font-black text-white px-2">G.</span>
                </div>
            )}
        </motion.div>
    );
};

export default QuizMode;
