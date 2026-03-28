import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryNotebook } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useToast } from './Toast';

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
                const response = await queryNotebook(notebookId, `Gere um material de estudo detalhado sobre ${topic} baseado no Guidorizzi. Use markdown.`);
                const result = response.answer || response.content || 'Nenhum conteúdo retornado.';
                setContent(result);
                setCache(result);
            } catch (error) {
                console.error('Fetch error:', error);
                setContent('Erro ao conectar com o NotebookLM. Verifique se o servidor bridge está rodando.');
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
            <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Floating Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="fixed bottom-8 left-8 w-14 h-14 z-[90] flex items-center justify-center bg-zinc-950/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl text-zinc-400 hover:text-white"
            >
                <ChevronLeft className="w-7 h-7" />
            </motion.button>
            <header className="flex items-center justify-between">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6 text-zinc-400" />
                </motion.button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold tracking-tight">{topic}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-emerald-500/70 text-[9px] uppercase font-black tracking-widest">IA sob demanda</p>
                    </div>
                </div>
                <div className="w-12" />
            </header>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex-1 flex flex-col items-center justify-center gap-8 py-20"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-24 h-24 border-2 border-dashed border-purple-500/40 rounded-full"
                            ></motion.div>
                            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-500 animate-spin" />
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-xl font-bold text-white tracking-tight">Analisando Guidorizzi</h3>
                            <p className="text-zinc-500 font-medium max-w-[200px] leading-relaxed mx-auto italic">
                                O NotebookLM está sintetizando o conteúdo agora...
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
                        <div className="relative p-12 rounded-[56px] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>

                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-black uppercase tracking-[0.2em] mb-12 shadow-inner border border-purple-500/20">
                                <Sparkles className="w-4 h-4" />
                                Inteligência Guidorizzi
                            </div>

                            <div className="prose prose-invert prose-purple max-w-none prose-p:text-zinc-300 prose-p:leading-[1.8] prose-p:text-lg prose-p:font-medium prose-headings:text-white prose-headings:tracking-tight prose-strong:text-white prose-strong:font-bold prose-code:text-emerald-400 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-3xl">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>

                            <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-10">
                                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Conteúdo Verificado
                                </div>
                                <div className="text-[10px] font-medium text-zinc-600 italic">
                                    Fonte: Guidorizzi Vol. 1-4
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-4 p-6 rounded-[32px] bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm"
                        >
                            <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                            <p className="text-blue-400/70 text-sm font-medium leading-relaxed">
                                Este resumo foi otimizado para leitura rápida mas mantém todo o rigor matemático do Guidorizzi.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudyMaterial;
