import { useState, ReactNode } from 'react';
import { BookOpen, ListTodo, Zap, MessageCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useAppContext } from '../hooks/useAppContext';

interface DashboardProps {
  onNavigate: (view: string, topic?: string) => void;
}

interface MenuItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
  variants: Variants;
}

const DashboardBrutalistPremium = ({ onNavigate }: DashboardProps) => {
  const [search, setSearch] = useState('');
  const { xp, level, progressToNextLevel, nextLevelXP } = useAppContext();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 350, damping: 30 }
    }
  };

  const nextLevelXPRemaining = nextLevelXP - (nextLevelXP * progressToNextLevel / 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col bg-[#333333] max-w-md mx-auto relative pb-20"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #444 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Header */}
      <header className="p-4 pt-8">
        <motion.div
          variants={itemVariants}
          className="bg-[#f89e13] text-black font-bold text-3xl text-center py-4 border-4 border-black rounded-lg shadow-precision uppercase tracking-wider"
        >
          Cálculo Precision
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-6 flex-grow">
        {/* User Stats Section */}
        <motion.section variants={itemVariants} className="flex items-center justify-between gap-4">
          {/* Level Badge - Circular with partial border */}
          <div className="relative w-32 h-32 rounded-full border-[6px] border-black bg-[#1a1a1a] shadow-precision flex flex-col items-center justify-center p-2 z-10">
            {/* Partial neon-orange border using clip-path */}
            <div
              className="absolute inset-0 rounded-full border-8 border-[#ff8b22]"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 50%, 50% 50%, 50% 0)'
              }}
            />
            <span className="text-[#ff8b22] text-sm relative z-20 font-bold">Level</span>
            <span className="text-[#ff8b22] text-5xl font-bold leading-none relative z-20">{level}</span>
            <span className="text-[#ff8b22] text-[10px] text-center mt-1 relative z-20 leading-tight font-bold">
              Estudante de<br />Cálculo
            </span>
          </div>

          {/* XP Info */}
          <div className="flex-grow space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[#ff8b22] text-3xl font-bold">{xp}</span>
              <span className="text-[#ff8b22] text-sm font-bold">XP</span>
            </div>
            <div className="text-gray-300 text-sm font-bold">
              {Math.max(0, Math.round(nextLevelXPRemaining))} para próximo nível
            </div>
            {/* Progress Bar */}
            <div className="relative h-8 border-4 border-black rounded-lg bg-[#1a1a1a] flex items-center overflow-hidden shadow-precision-sm">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#92d000] to-[#ff8b22] border-r-4 border-black transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
              <span className="relative z-10 text-[#92d000] font-bold text-right w-full pr-2">
                {progressToNextLevel}%
              </span>
            </div>
          </div>
        </motion.section>

        {/* Search Bar */}
        <motion.section variants={itemVariants} className="relative">
          <div className="flex items-center bg-[#888888] border-4 border-black rounded-lg shadow-precision">
            <svg
              className="w-6 h-6 text-black ml-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O QUE VAMOS ESTUDAR HOJE?"
              className="block w-full p-4 pl-4 text-black font-bold uppercase bg-transparent border-0 focus:outline-none placeholder-black text-lg"
            />
          </div>
        </motion.section>

        {/* Menu Items */}
        <nav className="space-y-4">
          <MenuItem
            variants={itemVariants}
            title="Estude Conceitos"
            description="Material Didático Completo"
            color="#92d000"
            icon={<BookOpen className="w-8 h-8" />}
            onClick={() => onNavigate('study')}
          />
          <MenuItem
            variants={itemVariants}
            title="Exercícios"
            description="Pratique Resolvendo Problemas"
            color="#00d2da"
            icon={<ListTodo className="w-8 h-8" />}
            onClick={() => onNavigate('quiz')}
          />
          <MenuItem
            variants={itemVariants}
            title="Flashcards AI"
            description="Reforce Conceitos Fundamentais"
            color="#ff8b22"
            icon={<Zap className="w-8 h-8" />}
            onClick={() => onNavigate('flashcards')}
          />
          <MenuItem
            variants={itemVariants}
            title="Chat Guidorizzi"
            description="Converse com IA Especializada"
            color="#00d084"
            icon={<MessageCircle className="w-8 h-8" />}
            onClick={() => onNavigate('chat')}
          />
        </nav>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 w-full max-w-md bg-gray-400 border-t-4 border-black flex justify-around items-center p-4 z-50">
        <button className="text-black hover:text-white transition-colors border-b-4 border-black pb-1 px-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button className="text-black hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button className="text-black hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <button className="text-black hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </footer>
    </motion.div>
  );
};

const MenuItem = ({
  title,
  description,
  color,
  icon,
  onClick,
  variants
}: MenuItemProps) => {
  return (
    <motion.button
      variants={variants}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="block w-full bg-[#1a1a1a] border-4 rounded-xl p-4 shadow-[6px_6px_0_black] flex items-center gap-4 relative overflow-hidden group text-left"
      style={{ borderColor: color }}
    >
      {/* Background overlay on active */}
      <div
        className="absolute inset-0 opacity-0 group-active:opacity-20 transition-opacity"
        style={{ backgroundColor: color }}
      />

      {/* Icon Box */}
      <div
        className="flex-shrink-0 bg-black p-2 rounded-lg border-2 flex items-center justify-center"
        style={{
          borderColor: color,
          color: color
        }}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </h2>
        <p className="text-white text-sm uppercase font-bold">{description}</p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute inset-0 border-b-4 pointer-events-none rounded-xl rounded-b-none translate-y-[calc(100%-4px)]"
        style={{ borderColor: color }}
      />
    </motion.button>
  );
};

export default DashboardBrutalistPremium;
