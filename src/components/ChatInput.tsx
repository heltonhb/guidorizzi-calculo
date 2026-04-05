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
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="mt-auto border-t-4 border-zinc-800 bg-[#050505] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {/* Suggestions as raw commands */}
      {suggestions.length > 0 && (
        <div className="md:hidden flex overflow-x-auto custom-scrollbar border-b-2 border-zinc-800">
          {suggestions.slice(0, 4).map((sug, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(sug)}
              className="flex-shrink-0 px-5 py-3 bg-transparent border-r-2 border-zinc-800 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 hover:bg-[#00f0ff] hover:text-black transition-colors whitespace-nowrap"
            >
              &gt; {typeof sug === 'string' ? (sug.length > 35 ? sug.substring(0, 35) + '...' : sug) : sug}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row bg-[#080808]">
        {/* Terminal Prefix Indicator */}
        <div className="hidden sm:flex items-center justify-center px-4 bg-[#00f0ff] text-black">
          <Terminal className="w-6 h-6 stroke-[3px]" />
        </div>

        {/* Input Area */}
        <div className="flex-1 flex items-center relative">
          <span className="absolute left-4 sm:left-6 text-[#00f0ff] font-mono font-black text-xl select-none animate-pulse">_</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AWAITING CALC QUERY..."
            className="w-full bg-transparent border-none px-4 sm:px-6 pl-10 sm:pl-12 py-5 sm:py-6 focus:outline-none text-[#00f0ff] placeholder:text-zinc-700 font-mono text-sm sm:text-base tracking-widest uppercase rounded-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="px-8 py-4 sm:py-0 bg-white border-t-2 sm:border-t-0 sm:border-l-4 border-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-900 disabled:text-zinc-600 transition-colors text-black font-mono font-black tracking-widest hover:bg-[#00f0ff] uppercase"
        >
          EXECUTE
        </button>
      </div>

      {/* Footer Meta */}
      <div className="border-t-2 border-zinc-800 bg-[#020202] py-2 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <Zap className="w-3 h-3 text-[#FF5500]" />
          <span className="text-[#FF5500] font-black uppercase tracking-widest">Guidorizzi Subsystem</span>
        </div>
        <span className="text-zinc-600 font-mono text-[10px] uppercase font-black tracking-widest hidden sm:inline-block">ENG. TERMINAL v1.0</span>
      </div>
    </div>
  );
};

export default ChatInput;