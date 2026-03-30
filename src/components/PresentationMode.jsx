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
        <div className="py-6 px-4 my-4 bg-zinc-950 border-4 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.1)] flex items-center justify-center text-center">
          <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
    case 'highlight':
      return (
        <div className="py-4 px-5 my-4 bg-zinc-900 border-2 border-signal shadow-[4px_4px_0_theme(colors.signal)]">
          <div className="prose prose-invert prose-sm max-w-none text-white font-bold leading-relaxed">
            <ReactMarkdown {...mdProps} />
          </div>
        </div>
      );
    case 'graph':
      return (
        <div className="py-2 px-1 my-4 h-[250px] w-full relative border-4 border-white/10 bg-zinc-950 shadow-[4px_4px_0_rgba(255,255,255,0.05)]">
          <InteractiveGraph equation={block.equation || "x^2"} />
        </div>
      );
    case 'example':
      return (
        <div className="py-4 px-5 my-4 bg-zinc-900 border-2 border-emerald-500 shadow-[4px_4px_0_theme(colors.emerald.500)]">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 border-b-2 border-emerald-500/30 pb-2">Exemplo Prático</p>
          <div className="prose prose-invert prose-sm max-w-none text-white leading-relaxed">
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
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <div className="w-24 h-24 bg-zinc-950 border-4 border-[#00f0ff] shadow-[8px_8px_0_#00f0ff] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin" />
      </div>
      <div className="text-center space-y-4 border-2 border-white/10 p-6 bg-zinc-900">
        <span className="text-white font-black uppercase tracking-widest text-xs block text-center bg-[#00f0ff] text-zinc-950 px-3 py-1 border-2 border-zinc-950 inline-block">
          Modo Aula • Guidorizzi
        </span>
        <p className="text-zinc-400 font-bold text-xs max-w-[250px] text-center uppercase tracking-widest">
          Consultando fontes e gerando slides sobre "{topic}"...
        </p>
      </div>
    </div>
  );

  // Error / Empty
  if (slides.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center">
      <div className="w-24 h-24 bg-zinc-950 border-4 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-white/50" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b-4 border-[#00f0ff] pb-2 inline-block">Aula: "{topic}"</h2>
        <p className="text-zinc-400 font-bold text-sm max-w-[280px]">
          {error || 'Não foi possível gerar os slides dinâmicos.'}
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
        <motion.button
          whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #00f0ff" }}
          whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
          onClick={() => loadSlides(slideCount)}
          className="w-full py-4 bg-[#00f0ff] border-2 border-[#00f0ff] text-zinc-950 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          TENTAR NOVAMENTE
        </motion.button>
        <motion.button
          whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
          onClick={handleCreateInStudio}
          disabled={isGeneratingStudio}
          className="w-full py-4 bg-zinc-950 border-2 border-white/20 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isGeneratingStudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          GERAR NO STUDIO (DESKTOP)
        </motion.button>
      </div>
      <button onClick={onBack} className="mt-8 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest border-b-2 border-zinc-700 hover:border-white pb-1">
        VOLTAR AO DASHBOARD
      </button>
    </div>
  );

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  // Gradient palette - Cores Vibrantes Brutalistas
  const gradients = [
    'from-[#00f0ff]/30 to-[#ff5500]/30',
    'from-[#ff5500]/30 to-[#ccff00]/30',
    'from-[#ccff00]/30 to-[#00f0ff]/30',
    'from-[#00f0ff]/30 to-[#ccff00]/30',
    'from-[#ff5500]/30 to-[#00f0ff]/30',
  ];
  const gradient = gradients[currentSlide % gradients.length];

  return (
    <div
      className="flex flex-col items-center gap-6 pb-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-zinc-950 border-b-4 border-white/20 pb-4 mb-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:bg-white hover:text-zinc-950 shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div className="text-center flex-1 px-4">
          <h2 className="text-lg font-black text-[#00f0ff] uppercase tracking-tighter truncate">{topic}</h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
            Slide {currentSlide + 1} de {slides.length}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={slideCount}
            onChange={(e) => {
              const newCount = Number(e.target.value);
              setSlideCount(newCount);
              loadSlides(newCount);
            }}
            className="appearance-none h-12 px-4 bg-zinc-950 border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-all outline-none cursor-pointer text-center"
            title="Quantidade de Slides"
          >
            <option value={3} className="bg-zinc-900 text-white">3 Slides</option>
            <option value={6} className="bg-zinc-900 text-white">6 Slides</option>
            <option value={10} className="bg-zinc-900 text-white">10 Slides</option>
            <option value={15} className="bg-zinc-900 text-signal">15 (Lento)</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCreateInStudio}
            disabled={isGeneratingStudio}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-emerald-500 shadow-[2px_2px_0_theme(colors.emerald.500)] text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
            title="Gerar no NotebookLM Studio"
          >
            {isGeneratingStudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => loadSlides(slideCount)}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-[#00f0ff] shadow-[2px_2px_0_#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-zinc-950 transition-colors"
            title="Novo conteúdo"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full px-2">
        <div className="h-3 border-2 border-white/20 bg-zinc-900">
          <motion.div
            className="h-full bg-[#00f0ff] border-r-2 border-white/20"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
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
              "relative border-8 border-white overflow-hidden",
              "bg-zinc-950 shadow-[16px_16px_0_#00f0ff]",
            )}
            style={{ aspectRatio: '9/16' }}
          >
            <div className="relative z-10 flex flex-col h-full p-8 pt-10">
              {/* LIVE indicator */}
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-4 border-white/10">
                <div className="px-3 py-1 bg-zinc-900 border-2 border-white/20 text-[10px] font-black text-white uppercase tracking-widest shadow-[2px_2px_0_rgba(255,255,255,0.1)]">
                  {currentSlide + 1}/{slides.length}
                </div>
                {source.includes('LIVE') && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-zinc-900 border-2 border-emerald-500 px-3 py-1 shadow-[2px_2px_0_theme(colors.emerald.500)]">
                    <div className="w-2 h-2 bg-emerald-500 border border-zinc-950" />
                    Tempo Real
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-white leading-none tracking-tighter uppercase mb-4">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="text-xs text-[#00f0ff] font-black mb-6 uppercase tracking-widest bg-zinc-900 p-3 border-l-4 border-[#00f0ff]">
                  {slide.subtitle}
                </p>
              )}

              <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar scroll-smooth">
                {slide.blocks?.map((block, i) => (
                  <SlideBlock key={i} block={block} />
                ))}
                {(!slide.blocks || slide.blocks.length === 0) && (
                  <SlideBlock block={{ type: 'text', content: slide.content || '' }} />
                )}
              </div>

              <div className="flex justify-center gap-2 mt-8 pt-6 border-t-4 border-white/10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "h-3 transition-all border-2",
                      i === currentSlide ? "bg-[#00f0ff] border-zinc-950 w-12" : "bg-zinc-900 border-white/20 w-4 hover:border-white"
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={cn(
            "w-16 h-16 border-2 flex items-center justify-center transition-all",
            currentSlide === 0 ? "border-white/10 text-zinc-700 bg-zinc-950" : "border-white/30 text-white hover:bg-white hover:text-zinc-950 bg-zinc-900 shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
          )}
        >
          <ChevronLeft className="w-8 h-8" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setAutoPlay(!autoPlay)}
          className={cn(
            "flex-1 h-16 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border-2",
            autoPlay ? "bg-[#00f0ff] text-zinc-950 border-[#00f0ff] shadow-[4px_4px_0_#00f0ff]" : "bg-zinc-900 border-white/30 text-white hover:border-white shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
          )}
        >
          {autoPlay ? <Pause className="w-5 h-5 fill-zinc-950" /> : <Play className="w-5 h-5 fill-current text-white" />}
          {autoPlay ? 'PAUSAR APRESENTAÇÃO' : 'INICIAR APRESENTAÇÃO'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={cn(
            "w-16 h-16 border-2 flex items-center justify-center transition-all",
            currentSlide === slides.length - 1 ? "border-white/10 text-zinc-700 bg-zinc-950" : "border-white/30 text-white hover:bg-white hover:text-zinc-950 bg-zinc-900 shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
          )}
        >
          <ChevronRight className="w-8 h-8" />
        </motion.button>
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
