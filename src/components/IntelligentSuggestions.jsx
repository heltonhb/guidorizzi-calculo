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

  // Determinr tag visual baseada em desempenho
  let tag = 'Em Progresso';
  let tagColor = 'bg-blue-500/20 border-blue-500/50 text-blue-300';

  if (score < 50) {
    tag = 'Precisa Reforço';
    tagColor = 'bg-red-500/20 border-red-500/50 text-red-300';
  } else if (score >= 75) {
    tag = 'Pronto para Avançar';
    tagColor = 'bg-green-500/20 border-green-500/50 text-green-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Próximos Passos</h3>
            <p className="text-xs text-zinc-500">Recomendações inteligentes</p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-semibold px-3 py-1 rounded-full border",
          tagColor
        )}>
          {tag}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-sm text-zinc-400">Gerando sugestões...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-100 leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Mini contexto visual */}
      {score > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Desempenho</span>
            <span className="text-xs font-bold text-zinc-200">{score}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-full",
                score < 50 ? "bg-red-500" :
                score < 75 ? "bg-blue-500" :
                "bg-green-500"
              )}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IntelligentSuggestions;
