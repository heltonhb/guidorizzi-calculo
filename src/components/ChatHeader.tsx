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
      <header className="md:hidden flex items-center justify-between p-4 border-b-4 border-zinc-900 bg-zinc-950">
        <motion.button
          whileTap={{ scale: 0.98, x: 2, y: 2, boxShadow: "0px 0px 0px transparent" }}
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-none bg-zinc-950 border-4 border-white hover:bg-white hover:text-zinc-950 transition-colors shadow-[4px_4px_0_rgba(255,255,255,1)]"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-black tracking-widest uppercase text-white">Guidorizzi IA</h2>
          <p className="text-premium-blue text-[10px] uppercase font-black tracking-widest leading-none mt-1">Terminal.Mode</p>
        </div>
        <div className="w-12" />
      </header>

      {/* Desktop Header - inside main area */}
      <div className="hidden md:flex items-center justify-between mb-8 pb-8 border-b-8 border-zinc-900 mx-4 mt-4">
        <div className="space-y-2 pl-6 border-l-8 border-premium-blue bg-zinc-950/50 py-2">
          <h2 className="text-4xl font-black tracking-widest uppercase text-white mix-blend-difference">Ask Guidorizzi</h2>
          <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
            Terminal Inteligente Ativo
          </p>
        </div>
        <div className="flex items-center gap-6">
          <motion.button
            whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: "0px 0px 0px transparent" }}
            onClick={onBack}
            className="px-8 py-4 h-16 flex items-center justify-center bg-zinc-950 border-4 border-white shadow-[8px_8px_0_rgba(255,255,255,1)] uppercase font-black tracking-widest text-lg hover:bg-white hover:text-zinc-950 transition-colors rounded-none"
          >
            Voltar ✕
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;