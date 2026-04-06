import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveGraph from '../../components/InteractiveGraph';

// Mock do Mafs
vi.mock('mafs', () => ({
  Mafs: ({ children, ...props }: any) => (
    <div data-testid="mafs-canvas" {...props}>
      {children}
    </div>
  ),
  Coordinates: {
    Cartesian: () => <div data-testid="coordinates-cartesian" />,
  },
  Plot: {
    OfX: (props: any) => <div data-testid="plot-of-x" {...props} />,
  },
  MovablePoint: ({ point, onMove, ...props }: any) => (
    <div
      data-testid="movable-point"
      {...props}
      onClick={() => onMove([point[0] + 1, point[1] + 1])}
      role="button"
      tabIndex={0}
    >
      Point at {point[0]}, {point[1]}
    </div>
  ),
  Theme: {
    beige: 'beige',
    dark: 'dark',
  },
}));

describe('InteractiveGraph', () => {
  describe('Renderização', () => {
    it('deve renderizar o canvas do Mafs', () => {
      render(<InteractiveGraph />);

      expect(screen.getByTestId('mafs-canvas')).toBeInTheDocument();
    });

    it('deve renderizar coordenadas cartesianas', () => {
      render(<InteractiveGraph />);

      expect(screen.getByTestId('coordinates-cartesian')).toBeInTheDocument();
    });

    it('deve renderizar o gráfico da função', () => {
      render(<InteractiveGraph />);

      expect(screen.getByTestId('plot-of-x')).toBeInTheDocument();
    });

    it('deve renderizar um ponto móvel', () => {
      render(<InteractiveGraph />);

      expect(screen.getByTestId('movable-point')).toBeInTheDocument();
    });

    it('deve exibir a equação padrão', () => {
      render(<InteractiveGraph />);

      expect(screen.getByText(/f\(x\) = x\^2/)).toBeInTheDocument();
    });

    it('deve exibir mensagem de interação', () => {
      render(<InteractiveGraph />);

      expect(screen.getByText(/Arraste o ponto/)).toBeInTheDocument();
    });
  });

  describe('Props Customizadas', () => {
    it('deve aceitar equação customizada', () => {
      render(<InteractiveGraph equation="sin(x)" />);

      expect(screen.getByText(/sin\(x\)/)).toBeInTheDocument();
    });

    it('deve aceitar range customizado', () => {
      render(<InteractiveGraph range={[-10, 10]} />);

      expect(screen.getByTestId('mafs-canvas')).toBeInTheDocument();
    });

    it('deve renderizar x^3', () => {
      render(<InteractiveGraph equation="x^3" />);

      expect(screen.getByText(/x\^3/)).toBeInTheDocument();
    });

    it('deve renderizar cos(x)', () => {
      render(<InteractiveGraph equation="cos(x)" />);

      expect(screen.getByText(/cos\(x\)/)).toBeInTheDocument();
    });

    it('deve renderizar exp(x)', () => {
      render(<InteractiveGraph equation="exp(x)" />);

      expect(screen.getByText(/exp\(x\)/)).toBeInTheDocument();
    });
  });

  describe('Interatividade', () => {
    it('deve renderizar ponto interativo', () => {
      render(<InteractiveGraph />);

      const point = screen.getByTestId('movable-point');
      expect(point).toBeInTheDocument();
    });

    it('deve permitir clique no ponto', () => {
      render(<InteractiveGraph />);

      const point = screen.getByTestId('movable-point');
      fireEvent.click(point);

      expect(screen.getByTestId('movable-point')).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve atualizar quando equação muda', () => {
      const { rerender } = render(<InteractiveGraph equation="x^2" />);

      expect(screen.getByText(/x\^2/)).toBeInTheDocument();

      rerender(<InteractiveGraph equation="x^3" />);

      expect(screen.getByText(/x\^3/)).toBeInTheDocument();
    });

    it('deve renderizar com diferentes ranges', () => {
      const { rerender } = render(<InteractiveGraph range={[-5, 5]} />);

      expect(screen.getByTestId('mafs-canvas')).toBeInTheDocument();

      rerender(<InteractiveGraph range={[-10, 10]} />);

      expect(screen.getByTestId('mafs-canvas')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter ponto com role button', () => {
      render(<InteractiveGraph />);

      expect(screen.getByTestId('movable-point')).toHaveAttribute('role', 'button');
    });

    it('deve ter equação visível', () => {
      render(<InteractiveGraph equation="sin(x)" />);

      const equation = screen.getByText(/f\(x\) = sin\(x\)/);
      expect(equation).toBeVisible();
    });
  });
});
