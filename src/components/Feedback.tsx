/**
 * Feedback component for rating AI responses.
 */

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedbackProps {
  onFeedback: (isPositive: boolean) => void;
  disabled?: boolean;
}

/**
 * Thumbs up/down buttons for user feedback on AI responses.
 */
const Feedback: React.FC<FeedbackProps> = ({ onFeedback, disabled = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mt-2"
    >
      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mr-2">
        Útil?
      </span>
      <button
        onClick={() => onFeedback(true)}
        disabled={disabled}
        className="p-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-50"
        aria-label="Feedback positivo"
        title="Esta resposta foi útil"
      >
        <ThumbsUp className="w-4 h-4 text-zinc-400 hover:text-green-500" />
      </button>
      <button
        onClick={() => onFeedback(false)}
        disabled={disabled}
        className="p-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-50"
        aria-label="Feedback negativo"
        title="Esta resposta não foi útil"
      >
        <ThumbsDown className="w-4 h-4 text-zinc-400 hover:text-red-500" />
      </button>
    </motion.div>
  );
};

export default Feedback;