/**
 * IntelligentSuggestions.jsx
 * 
 * Componente que mostra sugestões de próximos passos
 * baseado em análise de dúvidas e desempenho
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const IntelligentSuggestions = ({
  suggestions = [],
  isLoading = false,
  chatContext = {},
  onSuggestionClick = null
}) => {
  if (suggestions.length === 0 && !isLoading) return null;

  const { performance = { score: 0 } } = chatContext;
  const score = performance.score || 0;

  // Determinr tag visual baseada em desempenho - Cores Vibrantes
  let tag = 'Em Progresso';
  let tagColor = 'bg-zinc-950 border-[#00f0ff] text-[#00f0ff] shadow-[2px_2px_0_#00f0ff]';

  if (score < 50) {
    tag = 'Precisa Reforço';
    tagColor = 'bg-zinc-950 border-[#ff5500] text-[#ff5500] shadow-[2px_2px_0_#ff5500]';
  } else if (score >= 75) {
    tag = 'Pronto para Avançar';
    tagColor = 'bg-zinc-950 border-[#ccff00] text-[#ccff00] shadow-[2px_2px_0_#ccff00]';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-4 px-6 pb-6 border-4 border-[#00f0ff] bg-zinc-950 shadow-[8px_8px_0_#00f0ff]"
    >
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00f0ff] border-2 border-zinc-950 shadow-[2px_2px_0_rgba(255,255,255,0.2)] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Próximos Passos</h3>
            <p className="text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mt-1">Recomendações</p>
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 self-start",
          tagColor
        )}>
          {tag}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-4 py-8 border-2 border-dashed border-white/20 bg-zinc-900">
          <Loader2 className="w-6 h-6 text-[#00f0ff] animate-spin" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Calculando...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <div className="space-y-4 pt-2">
            {suggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #00f0ff" }}
                whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="block w-full text-left p-4 border-2 border-white/20 bg-zinc-950 hover:border-[#00f0ff] hover:bg-zinc-900 transition-all group cursor-pointer shadow-[2px_2px_0_rgba(255,255,255,0.1)] relative"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-[#00f0ff] transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Mini contexto visual */}
      {/* Mini contexto visual */}
      {score > 0 && (
        <div className="pt-6 mt-2 border-t-4 border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Desempenho Atual</span>
            <span className="text-sm font-black text-white">{score}%</span>
          </div>
          <div className="w-full h-4 bg-zinc-900 border-2 border-white/20 rounded-none overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-none border-r-2 border-zinc-950",
                score < 50 ? "bg-[#ff5500]" :
                  score < 75 ? "bg-[#00f0ff]" :
                    "bg-[#ccff00]"
              )}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IntelligentSuggestions;
