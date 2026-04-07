import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryNotebook } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useToast } from './Toast';
import { preprocessMathContent } from '../utils/mathPreprocessor';
import LearningObjectives from './LearningObjectives';
import StylizedIllustration from './StylizedIllustration';
import contentData from '../data/content.json';

const StudyMaterial = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [readingProgress, setReadingProgress] = useState(0);
    const toast = useToast();

    // Cache: chave por tópico
    const cacheKey = `studyMaterial_${topic}`;
    const getCached = () => {
        try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // Expirar após 24h
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
            return parsed.content;
        } catch { return null; }
    };
    const setCache = (text) => {
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ content: text, timestamp: Date.now() }));
        } catch { /* ignore quota errors */ }
    };

    useEffect(() => {
        const handleScroll = () => {
            const element = document.documentElement;
            const scrollTotal = element.scrollHeight - element.clientHeight;
            const scrollCurrent = element.scrollTop;
            if (scrollTotal > 0) {
                setReadingProgress((scrollCurrent / scrollTotal) * 100);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchMaterial = async () => {
            // Tentar cache primeiro
            const cached = getCached();
            if (cached) {
                setContent(cached);
                setLoading(false);
                // Refresh em background (silencioso)
                try {
                    const notebookId = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';
                    const response = await queryNotebook(notebookId, `Gere um material de estudo detalhado sobre ${topic} baseado no Guidorizzi. Use markdown.`);
                    const freshContent = response.answer || response.content;
                    if (freshContent && freshContent !== cached) {
                        setContent(freshContent);
                        setCache(freshContent);
                    }
                } catch { /* background refresh failed, cached content is fine */ }
                return;
            }

            setLoading(true);
            try {
                const notebookId = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';
                const response = await queryNotebook(notebookId, `Gere um material de estudo detalhado sobre ${topic} baseado no Guidorizzi. Use markdown. Ocasionalmente, quando apropriado para representar visualmente um conceito vital, insira a tag exata [ilustracao:conceito] (ex: [ilustracao:limite]) em uma linha isolada.`);
                const result = response.answer || response.content || 'Nenhum conteúdo retornado.';
                setContent(result);
                setCache(result);
            } catch (error) {
                console.error('Fetch error:', error);
                setContent('Erro ao conectar com a API. Verifique se o servidor está rodando.');
                toast.error('Falha ao carregar material. Servidor pode estar offline.');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [topic]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen bg-zinc-950 pb-32 overflow-hidden"
        >
            {/* Reading Progress Indicator */}
            <div className="fixed top-0 left-0 w-full h-3 z-[100] bg-zinc-950 border-b-4 border-zinc-800">
                <motion.div
                    className="h-full bg-premium-blue"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Giant Back Action Block */}
            <motion.button
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.95, x: -4, y: 4, boxShadow: "0px 0px 0px transparent" }}
                onClick={onBack}
                className="fixed bottom-8 sm:bottom-12 left-4 sm:left-12 z-[90] flex items-center justify-center gap-4 py-4 px-8 rounded-2xl bg-zinc-900 border-4 border-premium-blue text-white shadow-[8px_8px_0_theme(colors.premium-blue)] hover:bg-premium-blue hover:text-white transition-colors uppercase font-black tracking-widest"
            >
                <ChevronLeft className="w-8 h-8" />
                <span className="hidden sm:block">Retornar</span>
            </motion.button>

            {/* Typographic Brutalist Header */}
            <header className="relative w-full pt-32 pb-16 px-4 sm:px-12">
                <div className="absolute top-0 right-0 w-[80vw] h-full bg-premium-blue/5 blur-[120px] rounded-full pointer-events-none" />

                <h2 className="text-[15vw] sm:text-[10vw] leading-[0.8] font-black tracking-tighter text-white uppercase break-words mix-blend-difference drop-shadow-2xl">
                    {topic}
                </h2>

                <div className="mt-12 flex items-center justify-start gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border-4 border-emerald-500 rounded-xl shadow-[6px_6px_0_theme(colors.emerald.500)]">
                        <div className="w-3 h-3 bg-emerald-500 animate-pulse"></div>
                        <p className="text-emerald-400 text-sm uppercase font-black tracking-widest">Guidorizzi AI Core</p>
                    </div>
                    <div className="px-6 py-3 border-4 border-zinc-700 bg-zinc-950 rounded-xl text-zinc-400 font-bold uppercase tracking-widest text-sm shadow-[6px_6px_0_rgba(255,255,255,0.05)]">
                        Modo Aula
                    </div>
                </div>
            </header>

            <main className="relative z-20 px-4 sm:px-12 flex-1 w-full max-w-7xl mx-auto">
                {/* Learning Objectives - Show before content */}
                {contentData[topic]?.learningObjectives && (
                    <div className="mb-16 -ml-4 sm:-ml-12 border-l-[12px] border-premium-blue pl-4 sm:pl-12">
                        <LearningObjectives
                            objectives={contentData[topic].learningObjectives}
                            topic={topic}
                            showInitially={true}
                        />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="w-full flex flex-col items-start justify-center gap-12 py-32"
                        >
                            <div className="relative w-32 h-32 bg-zinc-900 rounded-full border-8 border-t-premium-blue border-r-premium-blue border-b-zinc-800 border-l-zinc-800 animate-spin flex items-center justify-center shadow-[0_0_40px_theme(colors.premium-blue)]">
                                <Loader2 className="w-12 h-12 text-premium-blue animate-spin" style={{ animationDirection: 'reverse' }} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Ingestão de Dados</h3>
                                <p className="text-premium-blue font-bold text-2xl tracking-widest uppercase">
                                    Sintetizando Conhecimento Matemático...
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full space-y-16"
                        >
                            <div className="relative bg-zinc-900 border-4 border-zinc-800 rounded-3xl p-8 sm:p-16 shadow-[16px_16px_0_rgba(0,0,0,0.5)]">

                                {/* Deep Accent Anchor */}
                                <div className="absolute -top-8 -left-8 w-24 h-24 bg-premium-blue rounded-2xl border-4 border-zinc-950 flex items-center justify-center shadow-[8px_8px_0_rgba(255,255,255,0.1)] z-30">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>

                                <StylizedIllustration concept={topic} />

                                <div className="mt-8 prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:text-xl sm:prose-p:text-2xl prose-p:leading-[1.8] prose-p:font-medium prose-headings:text-white prose-headings:text-3xl sm:prose-headings:text-5xl prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:mt-16 prose-headings:mb-8 prose-strong:text-white prose-strong:font-black prose-code:text-premium-blue prose-pre:bg-zinc-950 prose-pre:border-4 prose-pre:border-zinc-800 prose-pre:rounded-2xl prose-pre:shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            img: ({ node: _, ...props }) => {
                                                if (props.alt === 'ilustracao') {
                                                    return <StylizedIllustration concept={props.src} />;
                                                }
                                                return <img {...props} className="border-4 border-zinc-800 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.5)]" />;
                                            }
                                        }}
                                    >
                                        {preprocessMathContent(content).replace(/\[(?:ilustracao|ilustração):\s*(.*?)\]/gi, '![ilustracao]($1)')}
                                    </ReactMarkdown>
                                </div>

                                <div className="mt-24 w-full border-t-8 border-premium-blue pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 px-6 py-3 bg-zinc-950 border-4 border-emerald-500 rounded-xl shadow-[4px_4px_0_theme(colors.emerald.500)]">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">Acurácia Matemática</span>
                                    </div>
                                    <div className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em]">
                                        Fonte Primária: Guidorizzi Vol. 1-4
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="ml-auto w-full sm:w-[80%] bg-zinc-950 border-4 border-premium-blue rounded-3xl p-8 sm:p-10 shadow-[12px_12px_0_theme(colors.premium-blue)] flex gap-8 items-start relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 text-premium-blue/10 pointer-events-none">
                                    <Info className="w-32 h-32" />
                                </div>
                                <Info className="w-10 h-10 text-premium-blue flex-shrink-0 relative z-10" />
                                <p className="text-white font-black uppercase text-lg sm:text-xl tracking-widest leading-relaxed relative z-10">
                                    SÍNTESE OTIMIZADA PARA ABSORÇÃO ACELERADA. O RIGOR TEÓRICO FOI MANTIDO SOB PROTOCOLOS DE ALTA PERFORMANCE.
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </motion.div>
    );
};

export default StudyMaterial;
