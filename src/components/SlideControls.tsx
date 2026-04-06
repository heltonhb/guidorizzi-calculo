// components/SlideControls.jsx
import React, { useRef, memo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Star,
  Download,
  Settings,
  Maximize2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const SlideControls = memo(({
  autoPlay,
  onToggleAutoPlay,
  onNextSlide,
  onPrevSlide,
  isFavorite,
  onToggleFavorite,
  playbackSpeed,
  onSpeedChange,
  onExport,
  onTheaterMode,
  currentSlide,
  totalSlides,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const speedMenuRef = useRef(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-3xl flex-wrap justify-between"
    >
      {/* Slide Counter */}
      <div className="text-xs font-black text-zinc-600 uppercase tracking-widest">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Navegação */}
      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPrevSlide}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-zinc-400 hover:text-white"
        >
          <SkipBack size={16} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleAutoPlay}
          className={cn(
            'p-2 rounded-xl transition-colors font-bold',
            autoPlay
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-white/10 text-zinc-400 hover:text-white'
          )}
        >
          {autoPlay ? <Pause size={16} /> : <Play size={16} />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNextSlide}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-zinc-400 hover:text-white"
        >
          <SkipForward size={16} />
        </motion.button>
      </div>

      {/* Velocidade de Reprodução */}
      {autoPlay && (
        <div className="relative" ref={speedMenuRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-3 py-2 bg-white/10 rounded-xl text-xs font-black border border-white/10 hover:bg-white/20 transition-colors"
          >
            {playbackSpeed}x
          </motion.button>

          {showSpeedMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-12 left-0 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl p-2 z-50"
            >
              {speeds.map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    onSpeedChange(speed);
                    setShowSpeedMenu(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-2 text-xs font-bold text-left rounded-lg transition-colors',
                    playbackSpeed === speed
                      ? 'bg-purple-500 text-white'
                      : 'text-zinc-300 hover:bg-white/10'
                  )}
                >
                  {speed}x
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Espaçador */}
      <div className="flex-1" />

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Favorito */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFavorite}
          className={cn(
            'p-2 rounded-xl transition-colors',
            isFavorite
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-white/10 text-zinc-400 hover:text-yellow-400 border border-white/10'
          )}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Exportar */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onExport}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-zinc-400 hover:text-emerald-400 border border-white/10"
        >
          <Download size={16} />
        </motion.button>

        {/* Teatro */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onTheaterMode}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-zinc-400 hover:text-white border border-white/10"
        >
          <Maximize2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
});

SlideControls.displayName = 'SlideControls';

export default SlideControls;
