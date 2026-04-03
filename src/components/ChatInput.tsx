import React from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend, loading, suggestions, onSuggestionClick }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Suggestions */}
      {suggestions.length > 0 && (
        <div className="md:hidden overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
          <div className="flex gap-4 w-max">
            {suggestions.slice(0, 5).map((sug, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSuggestionClick(sug)}
                className="flex-shrink-0 px-5 py-3 bg-zinc-950 border-2 border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-zinc-950 hover:border-white transition-all shadow-[2px_2px_0_rgba(255,255,255,0.2)] whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 inline mr-2" />
                {typeof sug === 'string' ? (sug.length > 35 ? sug.substring(0, 35) + '...' : sug) : sug}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tire sua dúvida de Cálculo..."
          className="flex-1 bg-zinc-950 border-4 border-white/20 px-6 py-5 focus:outline-none focus:border-[#00f0ff] text-white placeholder:text-zinc-500 font-bold tracking-wide transition-colors rounded-none"
        />
        <motion.button
          whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px #00f0ff" }}
          whileTap={{ scale: 0.95, x: 0, y: 0, boxShadow: "0px 0px 0px transparent" }}
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="w-16 h-auto bg-[#00f0ff] border-2 border-[#00f0ff] flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all text-zinc-950"
        >
          <Send className="w-6 h-6 ml-1" />
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs">
        <Zap className="w-4 h-4 text-[#00f0ff]" />
        <span className="text-zinc-500 font-black uppercase tracking-widest">Guidorizzi 4 volumes</span>
      </div>
    </div>
  );
};

export default ChatInput;