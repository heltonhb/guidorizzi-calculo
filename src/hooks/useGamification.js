import { useState, useEffect, useCallback } from "react";

const XP_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 23000, 30000, 40000, 55000, 75000, 100000
];

const BADGES = [
  { id: "primeira_integral", name: "Primeira Integral", description: "Resolva sua primeira integral", icon: "∫", xpRequired: 50 },
  { id: "derivadas_inicio", name: "Começando com Derivadas", description: "Resolva 5 exercícios de derivadas", icon: "∂", xpRequired: 100 },
  { id: "quiz_master", name: "Quiz Master", description: "Complete 10 quizzes com nota > 80%", icon: "🏆", xpRequired: 200 },
  { id: "streak_7", name: "Consistência", description: "Estude 7 dias seguidos", icon: "🔥", xpRequired: 150 },
  { id: "flashcard_pro", name: "Flashcard Pro", description: "Revise 100 flashcards", icon: "📇", xpRequired: 300 },
  { id: "matematica_pura", name: "Matemática Pura", description: "Resolva 50 exercícios", icon: "📐", xpRequired: 500 },
  { id: "mestre_calculo", name: "Mestre do Cálculo", description: "Atinga 1000 XP", icon: "⭐", xpRequired: 1000 },
  { id: "saga_infinita", name: "Saga Infinita", description: "Complete todos os capítulos", icon: "∞", xpRequired: 5000 },
];

const REWARDS = {
  quiz_complete: 20,
  quiz_perfect: 50,
  exercise_correct: 10,
  flashcard_review: 5,
  streak_day: 15,
};

export const useGamification = () => {
  const [xp, setXP] = useState(() => {
    const saved = localStorage.getItem("gamification_xp");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    const saved = localStorage.getItem("gamification_badges");
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("gamification_streak");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastActiveDate, setLastActiveDate] = useState(() => {
    const saved = localStorage.getItem("gamification_last_date");
    return saved || null;
  });

  const [quizzesCompleted, setQuizzesCompleted] = useState(() => {
    const saved = localStorage.getItem("gamification_quizzes");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [exercisesSolved, setExercisesSolved] = useState(() => {
    const saved = localStorage.getItem("gamification_exercises");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [flashcardsReviewed, setFlashcardsReviewed] = useState(() => {
    const saved = localStorage.getItem("gamification_flashcards");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persistência
  useEffect(() => {
    localStorage.setItem("gamification_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("gamification_badges", JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  useEffect(() => {
    localStorage.setItem("gamification_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    if (lastActiveDate) {
      localStorage.setItem("gamification_last_date", lastActiveDate);
    }
  }, [lastActiveDate]);

  useEffect(() => {
    localStorage.setItem("gamification_quizzes", quizzesCompleted.toString());
  }, [quizzesCompleted]);

  useEffect(() => {
    localStorage.setItem("gamification_exercises", exercisesSolved.toString());
  }, [exercisesSolved]);

  useEffect(() => {
    localStorage.setItem("gamification_flashcards", flashcardsReviewed.toString());
  }, [flashcardsReviewed]);

  // Calcular level
  const getLevel = useCallback(() => {
    let level = 0;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
      if (xp >= XP_THRESHOLDS[i]) {
        level = i;
      }
    }
    return level;
  }, [xp]);

  // Progresso para próximo level
  const getProgressToNextLevel = useCallback(() => {
    const currentLevel = getLevel();
    const currentThreshold = XP_THRESHOLDS[currentLevel] || 0;
    const nextThreshold = XP_THRESHOLDS[currentLevel + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
    
    if (xp >= nextThreshold) return 100;
    
    const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [xp, getLevel]);

  // Adicionar XP
  const addXP = useCallback((amount, reason = "") => {
    setXP(prev => prev + amount);
    
    // Checar badges após ganhar XP
    const checkBadges = () => {
      const newBadges = [...unlockedBadges];
      let hasNew = false;
      
      BADGES.forEach(badge => {
        if (!newBadges.includes(badge.id)) {
          if (badge.xpRequired <= xp + amount || 
              (badge.id === "matematica_pura" && exercisesSolved + 1 >= 50) ||
              (badge.id === "flashcard_pro" && flashcardsReviewed + 1 >= 100) ||
              (badge.id === "quiz_master" && quizzesCompleted + 1 >= 10)) {
            newBadges.push(badge.id);
            hasNew = true;
          }
        }
      });
      
      if (hasNew) {
        setUnlockedBadges(newBadges);
        return newBadges.filter(b => !unlockedBadges.includes(b));
      }
      return [];
    };
    
    return checkBadges();
  }, [xp, exercisesSolved, flashcardsReviewed, quizzesCompleted, unlockedBadges]);

  // Atualizar streak
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastActiveDate === today) {
      return; // Já ativo hoje
    }
    
    if (lastActiveDate === yesterday) {
      setStreak(prev => prev + 1);
      addXP(REWARDS.streak_day, "Dia seguido");
    } else {
      setStreak(1); // Reiniciar streak
    }
    
    setLastActiveDate(today);
  }, [lastActiveDate, addXP]);

  // Eventos de gamificação
  const onQuizComplete = useCallback((score) => {
    const xpGain = score >= 80 ? REWARDS.quiz_perfect : REWARDS.quiz_complete;
    const newBadges = addXP(xpGain, "Quiz completo");
    setQuizzesCompleted(prev => prev + 1);
    return { xpGain, newBadges };
  }, [addXP]);

  const onExerciseCorrect = useCallback(() => {
    const newBadges = addXP(REWARDS.exercise_correct, "Exercício correto");
    setExercisesSolved(prev => prev + 1);
    return { xpGain: REWARDS.exercise_correct, newBadges };
  }, [addXP]);

  const onFlashcardReview = useCallback(() => {
    const newBadges = addXP(REWARDS.flashcard_review, "Flashcard revisado");
    setFlashcardsReviewed(prev => prev + 1);
    return { xpGain: REWARDS.flashcard_review, newBadges };
  }, [addXP]);

  // Reset (para testes)
  const resetProgress = useCallback(() => {
    setXP(0);
    setUnlockedBadges([]);
    setStreak(0);
    setQuizzesCompleted(0);
    setExercisesSolved(0);
    setFlashcardsReviewed(0);
  }, []);

  return {
    xp,
    level: getLevel(),
    progressToNextLevel: getProgressToNextLevel(),
    nextLevelXP: XP_THRESHOLDS[getLevel() + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1],
    unlockedBadges,
    streak,
    quizzesCompleted,
    exercisesSolved,
    flashcardsReviewed,
    BADGES,
    onQuizComplete,
    onExerciseCorrect,
    onFlashcardReview,
    updateStreak,
    resetProgress,
  };
};