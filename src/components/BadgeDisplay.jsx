import React from "react";

export const BadgeDisplay = ({ unlockedBadges, BADGES, size = "md", showLocked = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  const containerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.map((badge) => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        
        if (!showLocked && !isUnlocked) return null;

        return (
          <div
            key={badge.id}
            className={`relative group ${isUnlocked ? "cursor-pointer" : "opacity-40"}`}
          >
            <div
              className={`
                ${containerClass}
                rounded-full flex items-center justify-center
                ${isUnlocked 
                  ? "bg-gradient-to-br from-amber-500/20 to-yellow-400/20 border-2 border-amber-500/50" 
                  : "bg-zinc-800 border-2 border-zinc-700"}
                transition-all duration-300 hover:scale-110
              `}
            >
              <span className={isUnlocked ? "filter drop-shadow-lg" : "grayscale"}>
                {badge.icon}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              <p className="font-semibold text-amber-400">{badge.name}</p>
              <p className="text-zinc-400">{badge.description}</p>
              {!isUnlocked && (
                <p className="text-zinc-500 mt-1">{badge.xpRequired} XP necessários</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const BadgeNotification = ({ newBadges, onClose }) => {
  if (!newBadges || newBadges.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-amber-600 to-yellow-500 rounded-xl p-4 shadow-2xl border-2 border-amber-400">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <h4 className="font-bold text-zinc-900">Nova Conquista!</h4>
            <p className="text-sm text-zinc-800">
              {newBadges.length === 1 
                ? newBadges[0].name 
                : `${newBadges.length} novos badges`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="ml-2 text-zinc-700 hover:text-zinc-900"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};