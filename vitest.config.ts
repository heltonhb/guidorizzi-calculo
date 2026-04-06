import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente de teste
    environment: 'jsdom',
    
    // Padrões de inclusão e exclusão
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules/', 'dist/', 'omniroute/**', '.next/**'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // Limites de cobertura mínima (fail se não atingir)
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60,
      
      // Arquivos a excluir da cobertura
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.d.ts',
        '**/index.ts',
        'omniroute/**',
      ],
    },
  },
});
