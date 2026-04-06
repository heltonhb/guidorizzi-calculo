import React from "react";

export const ProgressBar = ({ xp, level, progressToNextLevel, nextLevelXP, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-800/50">
        <span className="text-sm font-bold text-amber-400">Lv.{level}</span>
        <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-2xl font-bold text-zinc-900">
            {level}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Level {level}</h3>
            <p className="text-sm text-zinc-400">Estudante de Cálculo</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-400">{xp} XP</p>
          <p className="text-xs text-zinc-500">{nextLevelXP - xp} para próximo nível</p>
        </div>
      </div>
      
      <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 transition-all duration-700 rounded-full"
          style={{ width: `${progressToNextLevel}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-zinc-300 drop-shadow-md">
            {Math.round(progressToNextLevel)}%
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        <span>Level {level}</span>
        <span>Level {level + 1}</span>
      </div>
    </div>
  );
};