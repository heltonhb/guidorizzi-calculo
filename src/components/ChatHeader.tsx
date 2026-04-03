import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack }) => {
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b-4 border-white/20 bg-zinc-950">
        <motion.button
          whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 hover:bg-white hover:text-zinc-950 transition-colors shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-black tracking-tighter uppercase text-white">Guidorizzi IA</h2>
          <p className="text-signal text-[10px] uppercase font-black tracking-widest leading-none mt-1">Chat Inteligente</p>
        </div>
        <div className="w-12" />
      </header>

      {/* Desktop Header - inside main area */}
      <div className="hidden md:flex items-center justify-between mb-6 pb-6 border-b-4 border-white/20">
        <div className="space-y-1 pl-4 border-l-4 border-[#00f0ff]">
          <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Ask Guidorizzi</h2>
          <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Contexto Inteligente</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
            onClick={onBack}
            className="px-4 py-2 h-12 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)] uppercase font-black tracking-widest text-xs hover:bg-white hover:text-zinc-950 transition-colors"
          >
            Voltar ✕
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;