import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-black border-b-[8px] border-[#f97316] w-full relative z-20 mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="w-12 h-12 flex items-center justify-center bg-transparent border-none text-white hover:text-[#f97316] transition-colors active:scale-95"
      >
        <ChevronLeft className="w-8 h-8" strokeWidth={2} />
      </button>
      <div className="flex-1 text-center pr-12">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white pb-1">GUIDORIZZI IA</h2>
        <p className="text-[#f97316] text-[11px] sm:text-xs uppercase font-extrabold tracking-widest leading-none">CHAT INTELIGENTE</p>
      </div>
    </header>
  );
};

export default ChatHeader;