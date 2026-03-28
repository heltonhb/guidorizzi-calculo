import { useContext } from 'react';
import { AppContext } from '../context/createAppContext';

/**
 * Hook para usar o contexto global da app
 * @throws {Error} Se usado fora do AppProvider
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};
