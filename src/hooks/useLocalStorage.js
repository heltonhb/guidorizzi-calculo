import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook customizado para gerenciar localStorage com segurança
 * @param {string} key - Chave de armazenamento
 * @param {*} initialValue - Valor inicial
 * @returns {[*, Function]} - [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const { handleError } = useErrorHandler();
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      handleError(error, `localStorage.getItem(${key})`);
      return initialValue;
    }
  });

  // Sincronizar localStorage quando valor mudar
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      handleError(error, `localStorage.setItem(${key})`);
    }
  }, [key, storedValue, handleError]);

  // Função para update
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      handleError(error, `localStorage.setValue(${key})`);
    }
  }, [storedValue, key, handleError]);

  // Função para limpar
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      handleError(error, `localStorage.removeItem(${key})`);
    }
  }, [key, initialValue, handleError]);

  return [storedValue, setValue, removeValue];
};
