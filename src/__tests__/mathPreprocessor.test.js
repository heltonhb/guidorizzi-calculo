import { describe, it, expect } from 'vitest';
import { preprocessMathContent, simplePreprocess, isMathText } from '../utils/mathPreprocessor';

describe('preprocessMathContent', () => {
    it('retorna string vazia para input inválido', () => {
        expect(preprocessMathContent(null)).toBe('');
        expect(preprocessMathContent(undefined)).toBe('');
        expect(preprocessMathContent('')).toBe('');
        expect(preprocessMathContent(42)).toBe('');
    });

    it('preserva texto que já contém delimitadores $', () => {
        const input = 'A derivada é $f\'(x) = 2x$';
        expect(preprocessMathContent(input)).toBe(input);
    });

    it('preserva texto com $$ (bloco math)', () => {
        const input = '$$\\frac{d}{dx}x^n = nx^{n-1}$$';
        expect(preprocessMathContent(input)).toBe(input);
    });

    it('NÃO colapsa barras duplas válidas \\\\', () => {
        const input = '$a \\\\ b$';
        // Não deve modificar — \\\\ é quebra de linha em LaTeX
        expect(preprocessMathContent(input)).toBe(input);
    });

    it('corrige $$$ excessivos para $$', () => {
        const input = '$$$$\\frac{1}{2}$$$$';
        const result = preprocessMathContent(input);
        // $$$$ deve ser reduzido a $$
        expect(result).not.toContain('$$$$');
    });

    it('envelopa comandos LaTeX órfãos em $', () => {
        const input = '\\frac{1}{2}';
        expect(preprocessMathContent(input)).toBe('$\\frac{1}{2}$');
    });

    it('envelopa múltiplas linhas independentemente', () => {
        const input = '\\sin(x)\n\\cos(x)';
        const result = preprocessMathContent(input);
        expect(result).toBe('$\\sin(x)$\n$\\cos(x)$');
    });

    it('não envelopa texto puro sem math', () => {
        const input = 'Este é um parágrafo normal sem fórmulas.';
        expect(preprocessMathContent(input)).toBe(input);
    });

    it('preserva linhas vazias', () => {
        const input = '\\lim_{x \\to 0}\n\n\\sin(x)';
        const result = preprocessMathContent(input);
        expect(result).toContain('\n\n');
    });

    it('envelopa símbolos math unicode', () => {
        const input = 'x ≤ ∞';
        expect(preprocessMathContent(input)).toBe('$x ≤ ∞$');
    });
});

describe('simplePreprocess', () => {
    it('retorna input inválido sem modificar', () => {
        expect(simplePreprocess(null)).toBe(null);
        expect(simplePreprocess(undefined)).toBe(undefined);
    });

    it('não modifica texto com $ existente', () => {
        const input = 'Resultado: $x^2$';
        expect(simplePreprocess(input)).toBe(input);
    });

    it('envelopa linhas que começam com comandos LaTeX', () => {
        // Em runtime: \\lim -> string com \lim
        const input = '\\lim_{x \\to 0} f(x)';
        const result = simplePreprocess(input);
        // Deve adicionar $ ao redor
        expect(result.startsWith('$')).toBe(true);
        expect(result.endsWith('$')).toBe(true);
    });

    it('não modifica linhas de texto puro', () => {
        const input = 'Capítulo 3: Limites';
        expect(simplePreprocess(input)).toBe(input);
    });

    it('não modifica texto com $$ existente', () => {
        const input = '$$\\int_0^1 x dx$$';
        expect(simplePreprocess(input)).toBe(input);
    });
});

describe('isMathText', () => {
    it('retorna false para input inválido', () => {
        expect(isMathText(null)).toBe(false);
        expect(isMathText(undefined)).toBe(false);
        expect(isMathText('')).toBe(false);
    });

    it('detecta comandos LaTeX', () => {
        expect(isMathText('\\frac{1}{2}')).toBe(true);
        expect(isMathText('\\lim_{x \\to 0}')).toBe(true);
        expect(isMathText('\\int_0^1 x dx')).toBe(true);
        expect(isMathText('\\sin(x) + \\cos(x)')).toBe(true);
        expect(isMathText('\\sqrt{4}')).toBe(true);
    });

    it('detecta símbolos math unicode', () => {
        expect(isMathText('x ≤ 5 e π ≈ 3.14')).toBe(true);
        expect(isMathText('∫ f(x) dx')).toBe(true);
    });

    it('detecta padrões tipo f(x) = ...', () => {
        expect(isMathText('f(x) = x^2')).toBe(true);
    });

    it('detecta expoentes x^n', () => {
        expect(isMathText('x^2 + y^3')).toBe(true);
    });

    it('rejeita texto normal', () => {
        expect(isMathText('Capítulo 1: Funções')).toBe(false);
        expect(isMathText('O aluno está estudando cálculo')).toBe(false);
    });
});
