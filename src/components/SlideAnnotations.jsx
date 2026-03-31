// components/SlideAnnotations.jsx
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { preprocessMathContent } from '../utils/mathPreprocessor';

const SlideAnnotations = memo(({
  annotations,
  onUpdate,
  onClear,
  hasChanges,
  lastSaved
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
          📝 Minhas Anotações
        </h3>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
              <Check size={12} /> Salvo
            </span>
          )}
          {hasChanges && (
            <span className="text-[10px] text-yellow-500 animate-pulse">
              Salvando...
            </span>
          )}
        </div>
      </div>

      {/* Textarea para edição */}
      <textarea
        value={annotations}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Adicione suas notas aqui...&#10;Suporta Markdown e LaTeX: $x^2 + y = 0$"
        className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500 focus:bg-white/10 resize-none font-mono text-sm placeholder-zinc-600 min-h-[200px] transition-all"
      />

      {/* Preview de anotações */}
      {annotations && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest font-black">
            Prévia
          </p>
          <div className="prose prose-sm prose-invert max-w-none text-zinc-300">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {preprocessMathContent(annotations)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      {annotations && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <Trash2 size={16} />
          Limpar Anotações
        </motion.button>
      )}
    </motion.div>
  );
});

SlideAnnotations.displayName = 'SlideAnnotations';

export default SlideAnnotations;
