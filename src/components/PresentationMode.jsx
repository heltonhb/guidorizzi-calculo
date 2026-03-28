import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Sparkles, Play, Pause, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { generateSlides, createStudioSlides } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useToast } from './Toast';
import InteractiveGraph from './InteractiveGraph';

/**
 * Block type renderer for structured vertical slides
 */
const SlideBlock = ({ block }) => {
  const { type, content } = block;

  const mdProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    children: content || '',
  };

  switch (type) {
    case 'formula':
      return (
        <div className="py-6 px-4 my-4 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-center">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
    case 'highlight':
      return (
        <div className="py-4 px-5 my-3 rounded-[20px] bg-amber-500/10 border border-amber-500/20">
          <div className="prose prose-invert prose-sm max-w-none text-amber-200/90 font-medium">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
    case 'graph':
      return (
        <div className="py-2 px-1 my-4 h-[250px] w-full relative">
          <InteractiveGraph equation={block.equation || "x^2"} />
        </div>
      );
    case 'example':
      return (
        <div className="py-4 px-5 my-3 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-2 text-center">Exemplo Prático</p>
          <div className="prose prose-invert prose-sm max-w-none text-emerald-200/90">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
    default: // 'text'
      return (
        <div className="py-2">
          <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
  }
};

const PresentationMode = ({ topic, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [source, setSource] = useState('');
  const [error, setError] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isGeneratingStudio, setIsGeneratingStudio] = useState(false);
  const [slideCount, setSlideCount] = useState(6);
  const toast = useToast();

  useEffect(() => {
    loadSlides(slideCount);
  }, [topic]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev < slides.length - 1) return prev + 1;
        setAutoPlay(false);
        return prev;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slides.length, currentSlide]);

  // Swipe support
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  const loadSlides = async (count = slideCount) => {
    setLoading(true);
    setError(null);
    setCurrentSlide(0);
    setAutoPlay(false);

    try {
      const data = await generateSlides(topic, count);
      if (data?.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setSource(data.source || 'NotebookLM');
        toast.success(`${data.slides.length} slides verticais gerados!`);
      } else {
        throw new Error('NotebookLM não retornou conteúdo. Tente novamente.');
      }
    } catch (err) {
      console.error('Error loading slides:', err);
      setError(err.message || 'Falha na conexão com NotebookLM');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInStudio = async () => {
    setIsGeneratingStudio(true);
    try {
      await createStudioSlides(topic);
      toast.success('Geração de deck oficial iniciada no NotebookLM Studio!');
    } catch (err) {
      toast.error('Erro ao solicitar deck no Studio: ' + err.message);
    } finally {
      setIsGeneratingStudio(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(s => s + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1);
  };

  // Loading
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="w-20 h-20 rounded-[28px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <span className="text-zinc-400 font-black uppercase tracking-widest text-[10px] block text-center">
          Modo Aula • Guidorizzi
        </span>
        <p className="text-zinc-600 text-xs max-w-[200px] text-center">
          Consultando fontes e gerando slides sobre "{topic}"...
        </p>
      </div>
    </div>
  );

  // Error / Empty
  if (slides.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center">
      <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-zinc-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white">Aula: "{topic}"</h2>
        <p className="text-zinc-500 text-sm max-w-[280px]">
          {error || 'Não foi possível gerar os slides dinâmicos.'}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => loadSlides(slideCount)}
          className="w-full py-6 rounded-[32px] bg-rose-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          Tentar Novamente
        </button>
        <button
          onClick={handleCreateInStudio}
          disabled={isGeneratingStudio}
          className="w-full py-4 rounded-[28px] bg-white/5 border border-white/10 text-zinc-300 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
        >
          {isGeneratingStudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Gerar no Studio (Desktop)
        </button>
      </div>
      <button onClick={onBack} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
        Voltar ao Dashboard
      </button>
    </div>
  );

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  // Gradient palette
  const gradients = [
    'from-purple-600/30 to-indigo-600/30',
    'from-rose-600/30 to-orange-600/30',
    'from-emerald-600/30 to-teal-600/30',
    'from-blue-600/30 to-cyan-600/30',
    'from-amber-600/30 to-yellow-600/30',
  ];
  const gradient = gradients[currentSlide % gradients.length];

  return (
    <div
      className="flex flex-col items-center gap-6 pb-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="w-full flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-sm font-black text-rose-400 uppercase tracking-tighter">{topic}</h2>
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">
            Slide {currentSlide + 1} de {slides.length}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={slideCount}
            onChange={(e) => {
              const newCount = Number(e.target.value);
              setSlideCount(newCount);
              loadSlides(newCount);
            }}
            className="appearance-none h-10 px-3 bg-white/5 rounded-2xl border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all outline-none cursor-pointer text-center"
            title="Quantidade de Slides"
          >
            <option value={3} className="bg-zinc-900 text-white">3 Slides</option>
            <option value={6} className="bg-zinc-900 text-white">6 Slides</option>
            <option value={10} className="bg-zinc-900 text-white">10 Slides</option>
            <option value={15} className="bg-zinc-900 text-rose-400">15 (Lento)</option>
          </select>
          <button
            onClick={handleCreateInStudio}
            disabled={isGeneratingStudio}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-zinc-500 hover:text-emerald-400 transition-colors"
            title="Gerar no NotebookLM Studio"
          >
            {isGeneratingStudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          </button>
          <button
            onClick={() => loadSlides(slideCount)}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-zinc-500 hover:text-rose-400 transition-colors"
            title="Novo conteúdo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          />
        </div>
      </div>

      {/* Slide Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full relative"
        >
          <div
            className={cn(
              "relative rounded-[48px] border border-white/10 overflow-hidden",
              "bg-gradient-to-br shadow-2xl", gradient,
            )}
            style={{ aspectRatio: '9/16' }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl" />

            <div className="relative z-10 flex flex-col h-full p-8 pt-12">
              {/* LIVE indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black text-white/50 uppercase tracking-widest">
                  {currentSlide + 1}/{slides.length}
                </div>
                {source.includes('LIVE') && (
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse outline outline-emerald-500/30" />
                    Geração em Tempo Real
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-2">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="text-[11px] text-zinc-500 font-bold mb-6 border-b border-white/5 pb-5 uppercase tracking-wide">
                  {slide.subtitle}
                </p>
              )}

              <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar scroll-smooth">
                {slide.blocks?.map((block, i) => (
                  <SlideBlock key={i} block={block} />
                ))}
                {(!slide.blocks || slide.blocks.length === 0) && (
                  <SlideBlock block={{ type: 'text', content: slide.content || '' }} />
                )}
              </div>

              <div className="flex justify-center gap-1.5 mt-8 pt-4 border-t border-white/5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === currentSlide ? "bg-rose-500 w-8" : "bg-white/10 w-2 hover:bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={cn(
            "w-14 h-14 rounded-3xl border flex items-center justify-center transition-all",
            currentSlide === 0 ? "border-white/5 text-zinc-800" : "border-white/10 text-zinc-400 hover:text-white bg-white/5"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={cn(
            "flex-1 h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border",
            autoPlay ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
          )}
        >
          {autoPlay ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-current text-zinc-500" />}
          {autoPlay ? 'Pausar' : 'Apresentar'}
        </button>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={cn(
            "w-14 h-14 rounded-3xl border flex items-center justify-center transition-all",
            currentSlide === slides.length - 1 ? "border-white/5 text-zinc-800" : "border-white/10 text-zinc-400 hover:text-white bg-white/5"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}} />
    </div>
  );
};

export default PresentationMode;
