import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './createAppContext';

export const AppProvider = ({ children }) => {
  const [currentTopic, setCurrentTopic] = useState('');
  const [view, setView] = useState('dashboard');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Slides globais (persistem entre navegações)
  const [cachedSlides, setCachedSlides] = useState({});
  
  // Estado de favoritos global - inicializar do localStorage
  const [globalFavorites, setGlobalFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('app_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Erro ao carregar favoritos globais:', e);
      return {};
    }
  });

  // Persistir favoritos
  useEffect(() => {
    try {
      localStorage.setItem('app_favorites', JSON.stringify(globalFavorites));
    } catch (e) {
      console.warn('Erro ao salvar favoritos globais:', e);
    }
  }, [globalFavorites]);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const addError = useCallback((error, duration = 5000) => {
    const id = Date.now();
    const errorObj = {
      id,
      message: typeof error === 'string' ? error : error?.message || 'Erro desconhecido',
      timestamp: new Date(),
    };
    
    setErrors(prev => [...prev, errorObj]);
    
    // Auto-remover depois de duration ms
    if (duration > 0) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }
    
    return id;
  }, [removeError]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const navigateTo = useCallback((newView, topic = '') => {
    if (topic) setCurrentTopic(topic);
    setView(newView);
  }, []);

  const cacheSlides = useCallback((topic, slides) => {
    setCachedSlides(prev => ({
      ...prev,
      [topic]: slides
    }));
  }, []);

  const getSlidesFromCache = useCallback((topic) => {
    return cachedSlides[topic] || null;
  }, [cachedSlides]);

  const updateFavorites = useCallback((topic, slideIndex, isFavorite) => {
    setGlobalFavorites(prev => {
      const key = `${topic}_${slideIndex}`;
      if (isFavorite) {
        return { ...prev, [key]: true };
      } else {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }
    });
  }, []);

  const isFavorited = useCallback((topic, slideIndex) => {
    return globalFavorites[`${topic}_${slideIndex}`] === true;
  }, [globalFavorites]);

  const value = {
    currentTopic,
    setCurrentTopic,
    view,
    setView,
    navigateTo,
    errors,
    addError,
    removeError,
    clearErrors,
    loading,
    setLoading,
    cachedSlides,
    cacheSlides,
    getSlidesFromCache,
    globalFavorites,
    updateFavorites,
    isFavorited,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
