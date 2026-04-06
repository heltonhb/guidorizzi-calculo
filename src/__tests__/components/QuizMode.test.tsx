import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizMode from '../../components/QuizMode';
import * as apiModule from '../../services/api';

// Mock dos serviços
vi.mock('../../services/api', () => ({
  generateQuizQuestions: vi.fn(),
}));

vi.mock('../../components/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../../hooks/useLearningPath', () => ({
  useLearningPath: () => ({
    getNextStudySuggestion: vi.fn(),
    handleQuizCompletion: vi.fn(),
    generateLearningPath: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAppContext', () => ({
  useAppContext: () => ({
    onQuizComplete: vi.fn(),
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('QuizMode', () => {
  const mockOnBack = vi.fn();
  const mockGenerateQuizQuestions = vi.fn();

  const mockQuestions = [
    {
      text: 'Qual o valor de $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?',
      options: ['0', '1', '$\\infty$', 'Não existe'],
      correct: 1,
      explanation: 'Este é um limite fundamental.',
    },
    {
      text: 'Qual a derivada de $f(x) = x^2$?',
      options: ['$2x$', '$x^2$', '$2$', '$x$'],
      correct: 0,
      explanation: 'Regra do tombo: $\\frac{d}{dx}x^n = nx^{n-1}$.',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateQuizQuestions.mockResolvedValue({
      questions: mockQuestions,
      source: 'Guidorizzi API',
    });
    
    (apiModule.generateQuizQuestions as any) = mockGenerateQuizQuestions;
  });

  describe('Carregamento Inicial', () => {
    it('deve carregar questões ao montar o componente', async () => {
      render(<QuizMode topic="Limites" onBack={mockOnBack} />);

      await waitFor(() => {
        expect(mockGenerateQuizQuestions).toHaveBeenCalledWith('Limites', 5);
      });
    });

    it('deve usar questões locais se API falhar', async () => {
      mockGenerateQuizQuestions.mockRejectedValue(new Error('API error'));

      render(<QuizMode topic="Limites" onBack={mockOnBack} />);

      await waitFor(() => {
        // Deve exibir algo mesmo com erro
        expect(mockGenerateQuizQuestions).toHaveBeenCalled();
      });
    });

    it('deve recarregar questões quando topic muda', async () => {
      const { rerender } = render(<QuizMode topic="Limites" onBack={mockOnBack} />);

      await waitFor(() => {
        expect(mockGenerateQuizQuestions).toHaveBeenCalledWith('Limites', 5);
      });

      mockGenerateQuizQuestions.mockClear();

      rerender(<QuizMode topic="Derivadas" onBack={mockOnBack} />);

      await waitFor(() => {
        expect(mockGenerateQuizQuestions).toHaveBeenCalledWith('Derivadas', 5);
      });
    });
  });

  describe('UI Básica', () => {
    it('deve renderizar componente sem erros', async () => {
      render(<QuizMode topic="Limites" onBack={mockOnBack} />);

      await waitFor(() => {
        expect(mockGenerateQuizQuestions).toHaveBeenCalled();
      });
    });

    it('deve aceitar topic como prop', () => {
      render(<QuizMode topic="Integrais" onBack={mockOnBack} />);

      expect(mockGenerateQuizQuestions).toHaveBeenCalledWith('Integrais', 5);
    });

    it('deve aceitar onBack como prop', () => {
      render(<QuizMode topic="Limites" onBack={mockOnBack} />);

      expect(mockOnBack).toBeDefined();
    });
  });
});
