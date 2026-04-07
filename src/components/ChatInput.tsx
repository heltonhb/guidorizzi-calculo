import React from 'react';
import { Terminal, Zap } from 'lucide-react';

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
    if (e.key === 'Enter' && input.trim() && !loading) {
      onSend();
    }
  };

  return (
    <div className="mt-auto border-t-[12px] border-zinc-900 bg-zinc-950 flex flex-col z-50 relative shadow-[0_-16px_32px_rgba(0,0,0,0.8)]">
      {/* Suggestions block as raw terminal output */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap overflow-x-auto custom-scrollbar border-b-4 border-zinc-900 bg-zinc-950">
          <div className="px-6 py-4 bg-zinc-900 text-zinc-500 font-mono text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center">
            SYS.SUGGESTIONS //
          </div>
          {suggestions.slice(0, 4).map((sug, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(sug)}
              className="flex-shrink-0 px-6 py-4 bg-zinc-950 border-r-4 border-zinc-900 text-xs font-mono font-black uppercase tracking-widest text-zinc-400 hover:bg-white hover:text-zinc-950 transition-colors whitespace-nowrap"
            >
              &gt; {typeof sug === 'string' ? (sug.length > 40 ? sug.substring(0, 40) + '...' : sug) : sug}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row bg-zinc-950">
        {/* Terminal Prefix Indicator */}
        <div className="hidden sm:flex items-center justify-center px-8 bg-zinc-900 border-r-4 border-zinc-900 text-white">
          <Terminal className="w-8 h-8 stroke-2 text-premium-blue" />
        </div>

        {/* Input Area */}
        <div className="flex-1 flex items-center relative py-2 sm:py-0">
          <span className="absolute left-4 sm:left-8 text-emerald-500 font-mono font-black text-2xl select-none animate-pulse">$&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AWAITING CALC QUERY..."
            className="w-full bg-zinc-950 border-none px-4 sm:px-8 pl-12 sm:pl-20 py-6 sm:py-10 focus:outline-none text-white placeholder:text-zinc-700 font-mono text-base sm:text-xl font-bold tracking-widest uppercase rounded-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="px-12 py-6 sm:py-0 bg-premium-blue border-l-4 border-zinc-950 flex flex-col items-center justify-center disabled:opacity-50 disabled:bg-zinc-900 disabled:text-zinc-600 transition-colors text-white font-mono font-black tracking-widest hover:bg-white hover:text-zinc-950 uppercase group"
        >
          <span className="text-xl">EXECUTE</span>
          <span className="text-[10px] text-zinc-950/50 group-hover:text-zinc-500 mt-1">CTRL+ENTER</span>
        </button>
      </div>

      {/* Footer Meta */}
      <div className="border-t-4 border-zinc-900 bg-zinc-950 py-3 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 text-xs font-mono">
          <Zap className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-500 font-black uppercase tracking-widest">Guidorizzi Neural Subsystem // ACTIVE</span>
        </div>
        <span className="text-zinc-600 font-mono text-xs uppercase font-black tracking-widest hidden sm:inline-block">CALC_V2.0_ENG_TERMINAL</span>
      </div>
    </div>
  );
};

export default ChatInput;