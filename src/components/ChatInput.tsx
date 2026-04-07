import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col z-50 relative w-full pt-4">
      {/* Suggestions block */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
          {suggestions.slice(0, 3).map((sug, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(sug)}
              className="flex-shrink-0 px-4 py-2 bg-black border-2 border-[#f97316] text-xs font-mono font-black uppercase tracking-widest text-[#f97316] hover:bg-[#f97316] hover:text-black transition-colors shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              &gt; {typeof sug === 'string' ? (sug.length > 30 ? sug.substring(0, 30) + '...' : sug) : sug}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Input Area */}
        <div className="w-full relative border-4 border-[#f97316] bg-black p-2 sm:p-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex items-center">
          {/* Subtle cut corner effect using pseudo-elements could go here, but a strict border performs the task cleanly */}
          <span className="ml-2 text-[#f97316] font-mono font-black text-2xl select-none animate-pulse">█</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AWAITING CALC QUERY..."
            className="w-full bg-transparent border-none px-4 py-4 sm:py-6 focus:outline-none text-white placeholder:text-zinc-600 font-mono text-base sm:text-xl font-bold tracking-widest rounded-none"
            spellCheck={false}
          />
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between w-full h-16">
          {/* Left Icon */}
          <div className="flex flex-col items-center justify-center opacity-70">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={1} />
            <span className="text-white text-[8px] font-black tracking-widest uppercase mt-1">GUIDORIZZI SUBSYSTEM</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="h-full px-8 sm:px-16 bg-black border-4 border-[#f97316] text-white hover:bg-white hover:border-white hover:text-black text-2xl font-black tracking-widest uppercase shadow-[6px_6px_0_#f97316] transition-all disabled:opacity-50 disabled:border-zinc-700 disabled:text-zinc-500 disabled:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            EXECUTE
          </button>

          {/* Right Icon */}
          <div className="flex items-center justify-center opacity-70">
            <Bot className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;