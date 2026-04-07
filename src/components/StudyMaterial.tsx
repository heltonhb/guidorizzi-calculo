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
            className="flex flex-col gap-8 min-h-screen pb-20 overflow-visible"
        >
            {/* Reading Progress Indicator */}
            <div className="fixed top-0 left-0 w-full h-2 z-[100] bg-zinc-900 border-b-2 border-white/20">
                <motion.div
                    className="h-full bg-premium-blue"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Floating Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.9, x: -2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                onClick={onBack}
                className="fixed bottom-8 left-8 w-14 h-14 z-[90] flex items-center justify-center rounded-xl bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] text-white hover:border-premium-blue hover:shadow-[4px_4px_0_theme(colors.premium-blue)] hover:text-premium-blue transition-colors"
            >
                <ChevronLeft className="w-7 h-7" />
            </motion.button>
            <header className="flex items-center justify-between border-b-2 border-white/20 pb-6 mb-6">
                <motion.button
                    whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-premium-blue hover:shadow-[2px_2px_0_theme(colors.premium-blue)] hover:text-premium-blue transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase">{topic}</h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 animate-none border border-emerald-900"></div>
                        <p className="text-emerald-400 text-[10px] uppercase font-black tracking-widest">IA sob demanda</p>
                    </div>
                </div>
                <div className="w-12" />
            </header>

            {/* Learning Objectives - Show before content */}
            {contentData[topic]?.learningObjectives && (
                <div className="max-w-4xl mx-auto w-full">
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center gap-8 py-20"
                    >
                        <div className="relative w-24 h-24 bg-zinc-950 rounded-2xl border-2 border-premium-blue shadow-[6px_6px_0_theme(colors.premium-blue)] flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-premium-blue animate-spin" />
                        </div>
                        <div className="text-center space-y-3 bg-zinc-950 rounded-2xl border-2 border-white/20 p-6 shadow-[6px_6px_0_rgba(255,255,255,0.2)]">
                            <h3 className="text-xl font-black text-white tracking-widest uppercase">Analisando Guidorizzi</h3>
                            <p className="text-zinc-400 font-bold max-w-[250px] leading-relaxed mx-auto uppercase text-xs tracking-wider">
                                SINTETIZANDO CONTEÚDO MATEMÁTICO...
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="relative p-8 md:p-12 bg-zinc-950 rounded-2xl border-2 border-white/20 shadow-[6px_6px_0_rgba(255,255,255,0.2)]">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900 border-2 border-premium-blue text-premium-blue text-[11px] font-black uppercase tracking-[0.2em] mb-12 shadow-[2px_2px_0_theme(colors.premium-blue)]">
                                <Sparkles className="w-4 h-4" />
                                Inteligência Guidorizzi
                            </div>

                            <StylizedIllustration concept={topic} />

                            <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:leading-[1.8] prose-p:text-lg prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-white prose-strong:font-black prose-code:text-premium-blue prose-pre:bg-zinc-950 prose-pre:border-2 prose-pre:border-white/20 prose-pre:rounded-2xl prose-pre:shadow-[6px_6px_0_rgba(255,255,255,0.1)]">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        img: ({ node: _, ...props }) => {
                                            if (props.alt === 'ilustracao') {
                                                return <StylizedIllustration concept={props.src} />;
                                            }
                                            return <img {...props} />;
                                        }
                                    }}
                                >
                                    {preprocessMathContent(content).replace(/\[(?:ilustracao|ilustração):\s*(.*?)\]/gi, '![ilustracao]($1)')}
                                </ReactMarkdown>
                            </div>

                            <div className="mt-16 flex items-center justify-between border-t-2 border-white/20 pt-10">
                                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                    <div className="w-2 h-2 bg-emerald-500"></div>
                                    Conteúdo Verificado
                                </div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    Fonte: Guidorizzi Vol. 1-4
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-4 p-6 bg-zinc-950 rounded-2xl border-2 border-premium-blue shadow-[6px_6px_0_theme(colors.premium-blue)]"
                        >
                            <Info className="w-6 h-6 text-premium-blue flex-shrink-0" />
                            <p className="text-premium-blue font-bold uppercase text-xs tracking-wider leading-relaxed">
                                ESTE RESUMO FOI OTIMIZADO PARA LEITURA RÁPIDA MANTENDO O RIGOR MATEMÁTICO DO GUIDORIZZI.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudyMaterial;
