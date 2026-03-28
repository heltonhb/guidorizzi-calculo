// hooks/useSlideState.js
import { useState, useEffect } from 'react';

/**
 * Hook centralizado para gerenciar estado de slides
 * Responsabilidades:
 * - Carregar slides do template
 * - Gerenciar índice atual
 * - Controlar reprodução automática
 * - Persistir favoritos
 */
export const useSlideState = (topic, initialSlides = []) => {
  const [slides, setSlides] = useState(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const storageKey = `slides_favorites_${topic}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e);
    }
  }, [topic]);

  // Persistir favoritos
  useEffect(() => {
    const storageKey = `slides_favorites_${topic}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Erro ao salvar favoritos:', e);
    }
  }, [favorites, topic]);

  // Auto-play: avança slide automaticamente
  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev < slides.length - 1) {
          return prev + 1;
        } else {
          // Pausar ao atingir final
          setAutoPlay(false);
          return prev;
        }
      });
    }, (5000 / playbackSpeed)); // 5 segundos por slide, ajustável

    return () => clearInterval(interval);
  }, [autoPlay, playbackSpeed, slides.length]);

  const toggleFavorite = (slideIndex) => {
    setFavorites(prev =>
      prev.includes(slideIndex)
        ? prev.filter(i => i !== slideIndex)
        : [...prev, slideIndex]
    );
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  return {
    slides,
    setSlides,
    currentSlide,
    setCurrentSlide,
    favorites,
    toggleFavorite,
    autoPlay,
    setAutoPlay,
    playbackSpeed,
    setPlaybackSpeed,
    nextSlide,
    prevSlide,
    goToSlide,
    isDrawing,
    setIsDrawing,
  };
};
