import React, { useMemo, memo } from 'react';

/**
 * Wrapper para memoizar componentes com props change detection
 */
export const withMemo = (Component, displayName = '') => {
  const Memoized = memo(Component);
  Memoized.displayName = displayName || Component.displayName || Component.name || 'Component';
  return Memoized;
};

/**
 * Hook para memoizar computações custosas com dependências
 * Sempre passe um array literal para dependencies
 */
export const useExpensiveComputation = (computeFn, deps = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => computeFn(), deps);
};
