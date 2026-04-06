// components/SlideSidebar.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

const SlideSidebar = memo(({
  slides,
  currentSlide,
  onSelectSlide,
  favorites,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-32 flex-shrink-0 flex flex-col gap-3 overflow-y-auto bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-3 border border-white/10"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/5 -mx-3 px-3 py-2 border-b border-white/10">
        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
          Slides ({slides.length})
        </p>
      </div>

      {/* Lista de thumbnails */}
      <div className="space-y-2">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentSlide;
          const isFavorite = favorites.includes(idx);

          return (
            <motion.button
              key={idx}
              onClick={() => onSelectSlide(idx)}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative rounded-2xl overflow-hidden transition-all text-left group',
                isCurrent
                  ? 'ring-2 ring-purple-500 bg-purple-500/10'
                  : 'hover:bg-white/5 bg-white/5'
              )}
            >
              {/* Thumbnail Content */}
              <div className="p-3 border border-white/10 rounded-2xl">
                <p className="text-xs font-black text-white truncate mb-1">
                  {idx + 1}
                </p>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                  {slide.title}
                </p>
              </div>

              {/* Favorite Star */}
              <motion.div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(idx);
                }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'absolute top-1 right-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                  isFavorite
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-zinc-600 opacity-0 group-hover:opacity-100'
                )}
              >
                <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.div>

              {/* Current Indicator */}
              {isCurrent && (
                <motion.div
                  layoutId="current-slide"
                  className="absolute inset-0 border-2 border-purple-500 rounded-2xl pointer-events-none"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
          ⭐ {favorites.length} Favoritos
        </p>
      </div>
    </motion.div>
  );
});

SlideSidebar.displayName = 'SlideSidebar';

export default SlideSidebar;
