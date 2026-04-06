import React from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../hooks/useAppContext";
import { ProgressBar } from "./ProgressBar";
import { BadgeDisplay } from "./BadgeDisplay";
import { Trophy, Flame, BookOpen, CheckCircle, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";

const Profile = ({ onBack }) => {
  const {
    xp,
    level,
    progressToNextLevel,
    nextLevelXP,
    unlockedBadges,
    streak,
    quizzesCompleted,
    exercisesSolved,
    flashcardsReviewed,
    BADGES,
    resetProgress,
  } = useAppContext();

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.")) {
      resetProgress();
    }
  };

  const stats = [
    { label: "Quizzes Completos", value: quizzesCompleted, icon: Trophy, color: "text-amber-400", border: "border-amber-500" },
    { label: "Exercícios Resolvidos", value: exercisesSolved, icon: BookOpen, color: "text-emerald-400", border: "border-emerald-500" },
    { label: "Flashcards Revisados", value: flashcardsReviewed, icon: CheckCircle, color: "text-[#00f0ff]", border: "border-[#00f0ff]" },
    { label: "Dias Seguidos", value: streak, icon: Flame, color: "text-orange-400", border: "border-orange-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 pb-20"
    >
      <header className="flex items-center justify-between border-b-2 border-white/20 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-white/20 shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:border-white hover:shadow-[0px_0px_0_transparent] transition-all text-white"
        >
          ←
        </button>
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          Meu Perfil
        </h2>
        <button
          onClick={handleReset}
          className="w-10 h-10 flex items-center justify-center bg-zinc-950 border-2 border-red-500/50 shadow-[2px_2px_0_rgba(255,0,0,0.2)] hover:border-red-500 hover:shadow-[0px_0px_0_transparent] transition-all text-red-400"
          title="Resetar progresso"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Progresso Principal */}
      <ProgressBar
        xp={xp}
        level={level}
        progressToNextLevel={progressToNextLevel}
        nextLevelXP={nextLevelXP}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "p-4 bg-zinc-950 border-2 shadow-[4px_4px_0_rgba(255,255,255,0.1)]",
              stat.border
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {stat.label}
              </span>
            </div>
            <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div className="p-6 bg-zinc-950 border-2 border-white/20 shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Conquistas
          </h3>
          <span className="text-sm text-zinc-400">
            ({unlockedBadges.length}/{BADGES.length})
          </span>
        </div>

        {unlockedBadges.length > 0 ? (
          <BadgeDisplay unlockedBadges={unlockedBadges} BADGES={BADGES} size="lg" showLocked={false} />
        ) : (
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">
            Complete desafios para desbloquear conquistas!
          </p>
        )}
      </div>

      {/* Badges Bloqueados */}
      <div className="p-6 bg-zinc-900/50 border-2 border-white/10">
        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">
          Próximas Conquistas
        </h4>
        <BadgeDisplay unlockedBadges={unlockedBadges} BADGES={BADGES} size="sm" showLocked={true} />
      </div>

      {/* Motivação */}
      <div className="text-center p-4 bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-2 border-amber-500/30">
        <p className="text-zinc-300 text-sm font-medium">
          {level < 5 && "Continue assim! Você está no caminho certo para dominar o Cálculo."}
          {level >= 5 && level < 10 && "Incrível! Seu progresso está impressionante."}
          {level >= 10 && "Você é um verdadeiro Estudante de Cálculo! Continue conquistando!"}
        </p>
      </div>
    </motion.div>
  );
};

export default Profile;