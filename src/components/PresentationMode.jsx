import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Sparkles, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { generateSlides } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useToast } from './Toast';
import InteractiveGraph from './InteractiveGraph';
import StylizedIllustration from './StylizedIllustration';
import { preprocessMathContent } from '../utils/mathPreprocessor';

/* ─── Chromatic Palette System ─── */
const ACCENT_PALETTE = [
  { name: 'signal', hex: '#ff5500', shadow: '#ff5500', text: 'text-[#ff5500]', bg: 'bg-[#ff5500]', border: 'border-[#ff5500]', glow: '0 0 30px rgba(255,85,0,0.3)' },
  { name: 'cyber', hex: '#00f0ff', shadow: '#00f0ff', text: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]', border: 'border-[#00f0ff]', glow: '0 0 30px rgba(0,240,255,0.3)' },
  { name: 'lime', hex: '#ccff00', shadow: '#ccff00', text: 'text-[#ccff00]', bg: 'bg-[#ccff00]', border: 'border-[#ccff00]', glow: '0 0 30px rgba(204,255,0,0.3)' },
  { name: 'pink', hex: '#ff0080', shadow: '#ff0080', text: 'text-[#ff0080]', bg: 'bg-[#ff0080]', border: 'border-[#ff0080]', glow: '0 0 30px rgba(255,0,128,0.3)' },
  { name: 'orange', hex: '#ff4400', shadow: '#ff4400', text: 'text-[#ff4400]', bg: 'bg-[#ff4400]', border: 'border-[#ff4400]', glow: '0 0 30px rgba(255,68,0,0.3)' },
];

const getAccent = (index) => ACCENT_PALETTE[index % ACCENT_PALETTE.length];

/* ─── Animated Block Wrapper ─── */
const AnimatedBlock = ({ children, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.08 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

/**
 * Block type renderer for structured vertical slides
 */
const SlideBlock = ({ block, index, accent }) => {
  const { type, content } = block;
  const processedContent = preprocessMathContent(content || '');

  const mdProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    children: processedContent,
  };

  switch (type) {
    case 'formula':
      return (
        <AnimatedBlock index={index}>
          <div
            className="py-6 px-5 my-4 bg-zinc-950 border-4 shadow-[6px_6px_0] flex items-center justify-center text-center"
            style={{ borderColor: accent.hex, boxShadow: `6px 6px 0 ${accent.hex}` }}
          >
            <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed">
              <ReactMarkdown {...mdProps} />
            </div>
          </div>
        </AnimatedBlock>
      );
    case 'highlight':
      return (
        <AnimatedBlock index={index}>
          <div
            className="py-4 px-5 my-4 bg-zinc-900 border-l-[6px] shadow-[4px_4px_0]"
            style={{ borderColor: accent.hex, boxShadow: `4px 4px 0 ${accent.hex}` }}
          >
            <div className="prose prose-invert prose-sm max-w-none text-white font-bold leading-relaxed">
              <ReactMarkdown {...mdProps} />
            </div>
          </div>
        </AnimatedBlock>
      );
    case 'graph':
      return (
        <AnimatedBlock index={index}>
          <div className="py-2 px-1 my-4 h-[250px] w-full relative border-4 border-white/10 bg-zinc-950 shadow-[4px_4px_0_rgba(255,255,255,0.05)]">
            <InteractiveGraph equation={block.equation || "x^2"} />
          </div>
        </AnimatedBlock>
      );
    case 'example':
      return (
        <AnimatedBlock index={index}>
          <div className="py-4 px-5 my-4 bg-zinc-900 border-2 border-emerald-500 shadow-[4px_4px_0_theme(colors.emerald.500)]">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 border-b-2 border-emerald-500/30 pb-2">Exemplo Prático</p>
            <div className="prose prose-invert prose-sm max-w-none text-white leading-relaxed">
              <ReactMarkdown {...mdProps} />
            </div>
          </div>
        </AnimatedBlock>
      );
    case 'warning':
      return (
        <AnimatedBlock index={index}>
          <div className="py-4 px-5 my-4 bg-red-950/50 border-4 border-red-500 shadow-[4px_4px_0_theme(colors.red.600)]">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 border-b-2 border-red-500/30 pb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span> Erro Comum
            </p>
            <div className="prose prose-invert prose-sm max-w-none text-red-200 leading-relaxed">
              <ReactMarkdown {...mdProps} />
            </div>
          </div>
        </AnimatedBlock>
      );
    case 'illustration':
      return (
        <AnimatedBlock index={index}>
          <div className="py-2 px-1 my-4 w-full relative">
            <StylizedIllustration concept={block.concept || 'calculo'} />
          </div>
        </AnimatedBlock>
      );
    default: // 'text'
      return (
        <AnimatedBlock index={index}>
          <div className="py-2">
            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
              <ReactMarkdown {...mdProps} />
            </div>
          </div>
        </AnimatedBlock>
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
  const [slideCount, setSlideCount] = useState(6);
  const toast = useToast();

  const accent = useMemo(() => getAccent(currentSlide), [currentSlide]);

  const loadSlides = useCallback(async (count = slideCount) => {
    setLoading(true);
    setError(null);
    setCurrentSlide(0);
    setAutoPlay(false);

    try {
      const data = await generateSlides(topic, count);
      if (data?.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setSource(data.source || 'Guidorizzi API');
        toast.success(`${data.slides.length} slides verticais gerados!`);
      } else {
        throw new Error('API não retornou conteúdo. Tente novamente.');
      }
    } catch (err) {
      console.error('Error loading slides:', err);
      setError(err.message || 'Falha na conexão com a API');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, [topic, slideCount, toast]);

  useEffect(() => {
    loadSlides(slideCount);
  }, [topic, slideCount, loadSlides]);

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

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(s => s + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1);
  };

  // ──────── Loading ────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <motion.div
        animate={{ rotate: [0, 0, 360], scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-28 h-28 bg-zinc-950 border-4 border-[#ff5500] shadow-[8px_8px_0_#ff5500] flex items-center justify-center"
      >
        <Loader2 className="w-14 h-14 text-[#ff5500] animate-spin" />
      </motion.div>
      <div className="text-center space-y-4 border-2 border-white/10 p-6 bg-zinc-900">
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white font-black uppercase tracking-[0.2em] text-xs block text-center bg-[#ff5500] text-zinc-950 px-4 py-2 border-2 border-zinc-950 inline-block"
        >
          Modo Aula • Guidorizzi
        </motion.span>
        <p className="text-zinc-400 font-bold text-xs max-w-[250px] text-center uppercase tracking-[0.15em]">
          Consultando fontes e gerando slides sobre &ldquo;{topic}&rdquo;...
        </p>
      </div>
    </div>
  );

  // ──────── Error / Empty ────────
  if (slides.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8 text-center">
      <div className="w-24 h-24 bg-zinc-950 border-4 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-white/50" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-b-4 border-[#ff5500] pb-2 inline-block">Aula: &ldquo;{topic}&rdquo;</h2>
        <p className="text-zinc-400 font-bold text-sm max-w-[280px]">
          {error || 'Não foi possível gerar os slides dinâmicos.'}
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
        <motion.button
          whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0px 0px #ff5500" }}
          whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
          onClick={() => loadSlides(slideCount)}
          className="w-full py-4 bg-[#ff5500] border-2 border-[#ff5500] text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          TENTAR NOVAMENTE
        </motion.button>
        <motion.button
          whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
          onClick={onBack}
          className="w-full py-4 bg-zinc-950 border-2 border-white/20 text-white font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 transition-all"
        >
          VOLTAR AO DASHBOARD
        </motion.button>
      </div>
    </div>
  );

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6 pb-8">
      {/* ─── Header ─── */}
      <header className="w-full flex items-center justify-between bg-zinc-950 border-b-4 pb-4 mb-2 transition-colors duration-500" style={{ borderColor: accent.hex }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 text-white hover:bg-white hover:text-zinc-950 shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div className="text-center flex-1 px-4">
          <motion.h2
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-black uppercase tracking-tighter truncate transition-colors duration-500"
            style={{ color: accent.hex }}
          >
            {topic}
          </motion.h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">
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
            className="appearance-none h-12 px-4 bg-zinc-950 border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.2)] transition-all outline-none cursor-pointer text-center"
            title="Quantidade de Slides"
          >
            <option value={3} className="bg-zinc-900 text-white">3 Slides</option>
            <option value={6} className="bg-zinc-900 text-white">6 Slides</option>
            <option value={10} className="bg-zinc-900 text-white">10 Slides</option>
            <option value={15} className="bg-zinc-900 text-signal">15 (Lento)</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => loadSlides(slideCount)}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 shadow-[2px_2px_0] transition-colors duration-500"
            style={{ borderColor: accent.hex, boxShadow: `2px 2px 0 ${accent.hex}`, color: accent.hex }}
            title="Novo conteúdo"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* ─── Progress Bar ─── */}
      <div className="w-full px-2">
        <div className="h-2 border-2 border-white/20 bg-zinc-900 overflow-hidden">
          <motion.div
            className="h-full transition-colors duration-500"
            style={{ backgroundColor: accent.hex, boxShadow: accent.glow }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      {/* ─── Slide Card ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 80, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -80, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full relative"
        >
          <div
            className="relative border-[6px] border-white overflow-hidden bg-zinc-950 transition-shadow duration-500"
            style={{
              aspectRatio: '9/16',
              boxShadow: `12px 12px 0 ${accent.hex}, ${accent.glow}`,
            }}
          >
            {/* Diagonal accent stripe */}
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${accent.hex} 0%, transparent 60%)`,
              }}
            />

            {/* Scan-line texture overlay */}
            <div className="absolute inset-0 pointer-events-none slide-scanlines opacity-[0.03]" />

            <div className="relative z-10 flex flex-col h-full p-6 pt-8 sm:p-8 sm:pt-10">
              {/* Slide badge + LIVE indicator */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-white/10">
                <motion.div
                  key={`badge-${currentSlide}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-4 py-2 border-2 text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-500"
                  style={{ borderColor: accent.hex, color: accent.hex, backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  {currentSlide + 1}/{slides.length}
                </motion.div>
                {source.includes('LIVE') && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-zinc-900 border-2 border-emerald-500 px-3 py-1 shadow-[2px_2px_0_theme(colors.emerald.500)]">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2 h-2 bg-emerald-500 border border-zinc-950"
                    />
                    Tempo Real
                  </div>
                )}
              </div>

              {/* ─── DRAMATIC TITLE ─── */}
              <motion.h2
                key={`slide-title-${currentSlide}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black text-white leading-[0.9] tracking-[-0.04em] uppercase mb-3"
              >
                {slide.title}
              </motion.h2>

              {slide.subtitle && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6 overflow-hidden"
                >
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] p-3 border-l-[6px] bg-zinc-900/80"
                    style={{ borderColor: accent.hex, color: accent.hex }}
                  >
                    {slide.subtitle}
                  </p>
                </motion.div>
              )}

              {/* ─── Content Blocks (staggered) ─── */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar scroll-smooth">
                {slide.blocks?.map((block, i) => (
                  <SlideBlock key={i} block={block} index={i} accent={accent} />
                ))}
                {(!slide.blocks || slide.blocks.length === 0) && (
                  <SlideBlock block={{ type: 'text', content: slide.content || '' }} index={0} accent={accent} />
                )}
              </div>

              {/* ─── Dots Navigation ─── */}
              <div className="flex justify-center gap-2 mt-6 pt-5 border-t-4 border-white/10">
                {slides.map((_, i) => {
                  const dotAccent = getAccent(i);
                  return (
                    <motion.button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "h-3 transition-all duration-300 border-2",
                        i === currentSlide
                          ? "w-10"
                          : "w-3 bg-zinc-800 border-zinc-600 hover:border-white"
                      )}
                      style={i === currentSlide ? { backgroundColor: dotAccent.hex, borderColor: dotAccent.hex } : {}}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ─── Navigation Controls ─── */}
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
          className="flex-1 h-16 font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 transition-all duration-500 border-2"
          style={autoPlay
            ? { backgroundColor: accent.hex, color: '#09090b', borderColor: accent.hex, boxShadow: `4px 4px 0 ${accent.hex}` }
            : { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', boxShadow: '4px 4px 0 rgba(255,255,255,0.2)' }
          }
        >
          {autoPlay ? <Pause className="w-5 h-5 fill-zinc-950" /> : <Play className="w-5 h-5 fill-current text-white" />}
          {autoPlay ? 'PAUSAR' : 'APRESENTAR'}
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
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
          .slide-scanlines {
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            );
          }
        `}} />
    </div>
  );
};

export default PresentationMode;
