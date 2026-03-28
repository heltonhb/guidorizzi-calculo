import { useCallback } from 'react';
import { useAppContext } from './useAppContext';

/**
 * Hook customizado para tratamento de erros com notificação
 * @returns {Object} { handleError, handleAsyncError }
 */
export const useErrorHandler = () => {
  const { addError } = useAppContext();

  const handleError = useCallback((error, context = '') => {
    const message = error instanceof Error ? error.message : String(error);
    const fullMessage = context ? `${context}: ${message}` : message;
    
    console.error('❌', fullMessage, error);
    addError(fullMessage);
    
    return error;
  }, [addError]);

  const handleAsyncError = useCallback(async (asyncFn, context = '', fallback = null) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return fallback;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};
