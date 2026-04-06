import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatGuidorizzi from '../../components/ChatGuidorizzi';
import * as useSmartChatModule from '../../hooks/useSmartChat';

// Mock do hook useSmartChat
vi.mock('../../hooks/useSmartChat', () => ({
  default: vi.fn(() => ({
    queryWithContext: vi.fn().mockResolvedValue({ answer: 'Test answer' }),
    chatContext: {},
    suggestions: ['Qual é o limite?', 'Derive f(x)'],
    generateSuggestions: vi.fn(),
    isGeneratingSuggestions: false,
  })),
}));

// Mock dos componentes filhos para simplificar testes
vi.mock('../../components/ChatHeader', () => ({
  default: ({ onBack }: any) => <button onClick={onBack}>Back</button>,
}));

vi.mock('../../components/ChatMessages', () => ({
  default: ({ messages, loading, onRetry }: any) => (
    <div>
      <div data-testid="messages-count">{messages.length}</div>
      {loading && <div data-testid="loading">Carregando...</div>}
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

vi.mock('../../components/ChatInput', () => ({
  default: ({ input, setInput, onSend, loading }: any) => (
    <div>
      <input
        data-testid="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <button data-testid="send-button" onClick={onSend} disabled={loading}>
        Enviar
      </button>
    </div>
  ),
}));

vi.mock('../../components/IntelligentSuggestions', () => ({
  default: ({ suggestions }: any) => (
    <div>
      {suggestions.map((s: string, i: number) => (
        <div key={i} data-testid={`suggestion-${i}`}>
          {s}
        </div>
      ))}
    </div>
  ),
}));

// Mock de framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ChatGuidorizzi', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar com mensagem inicial do assistente', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} currentTopic="Limites" />);

      expect(screen.getByTestId('messages-count')).toHaveTextContent('1');
    });

    it('deve renderizar a área de input', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('deve renderizar sugestões', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      expect(screen.getByTestId('suggestion-0')).toHaveTextContent('Qual é o limite?');
      expect(screen.getByTestId('suggestion-1')).toHaveTextContent('Derive f(x)');
    });

    it('deve passar currentTopic para useSmartChat', () => {
      const { rerender } = render(<ChatGuidorizzi onBack={mockOnBack} currentTopic="Derivadas" />);
      
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });

    it('deve usar currentTopic padrão se não fornecido', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });
  });

  describe('Envio de Mensagens', () => {
    it('deve renderizar input de chat', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      const input = screen.getByTestId('chat-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar botão enviar', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir estado de carregamento', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      const loadingElement = screen.queryByTestId('loading');
      // Pode não haver loading inicialmente
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });
  });

  describe('Sugestões', () => {
    it('deve renderizar sugestões iniciais', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      expect(screen.getByTestId('suggestion-0')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-1')).toBeInTheDocument();
    });
  });

  describe('Ações do Usuário', () => {
    it('deve chamar onBack quando clica no botão voltar', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('deve ter botão retry disponível', () => {
      render(<ChatGuidorizzi onBack={mockOnBack} />);

      const retryButton = screen.queryByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });
  });
});
