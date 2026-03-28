// hooks/useSlideAnnotations.js
import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook para gerenciar anotações pessoais em slides
 * Persiste em localStorage com chave: annotations_{topic}_{slideIndex}
 */
export const useSlideAnnotations = (topic, slideIndex) => {
  const { handleError } = useErrorHandler();
  const [annotations, setAnnotations] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Gerar chave de armazenamento
  const getStorageKey = useCallback(() => `annotations_${topic}_slide_${slideIndex}`, [topic, slideIndex]);

  // Carregar anotações ao mudar de slide
  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      setAnnotations(saved || '');
      setHasChanges(false);
    } catch (e) {
      handleError(e, `Carregar anotações (${topic}, slide ${slideIndex})`);
      setAnnotations('');
    }
  }, [topic, slideIndex, getStorageKey, handleError]);

  // Autosave a cada 2 segundos após mudanças
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, annotations);
        setLastSaved(new Date());
        setHasChanges(false);
      } catch (e) {
        handleError(e, 'Autosave de anotações');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [annotations, hasChanges, getStorageKey, handleError]);

  const saveAnnotations = useCallback(() => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, annotations);
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (e) {
      handleError(e, 'Salvar anotações');
    }
  }, [annotations, getStorageKey, handleError]);

  const updateAnnotations = useCallback((text) => {
    setAnnotations(text);
    setHasChanges(true);
  }, []);

  const clearAnnotations = useCallback(() => {
    if (window.confirm('Tem certeza que quer limpar as anotações deste slide?')) {
      try {
        const storageKey = getStorageKey();
        setAnnotations('');
        localStorage.removeItem(storageKey);
        setHasChanges(false);
        setLastSaved(new Date());
      } catch (e) {
        handleError(e, 'Limpar anotações');
      }
    }
  }, [getStorageKey, handleError]);

  return {
    annotations,
    updateAnnotations,
    saveAnnotations,
    clearAnnotations,
    hasChanges,
    lastSaved,
  };
};
