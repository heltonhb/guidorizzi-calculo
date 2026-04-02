/**
 * mathPreprocessor.js
 * 
 * Pré-processa texto matemático para garantir renderização correta pelo KaTeX.
 * Converte formatos comuns de matemática para sintaxe LaTeX válida.
 * 
 * Regras:
 * - NÃO modifica texto que já contenha delimitadores KaTeX ($, $$, \[, \()
 * - Detecta comandos LaTeX órfãos (sem $) e os envelopa
 * - Preserva barras invertidas duplas (\\) que são sintaxe LaTeX válida
 */

// Comandos LaTeX que indicam fórmula matemática
const LATEX_COMMANDS = [
    '\\lim', '\\liminf', '\\limsup', '\\max', '\\min', '\\sup', '\\inf',
    '\\int', '\\iint', '\\iiint', '\\oint', '\\oiint',
    '\\sum', '\\prod', '\\coprod',
    '\\frac', '\\sqrt', '\\cbrt', '\\nthroot',
    '\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc',
    '\\arcsin', '\\arccos', '\\arctan',
    '\\log', '\\ln', '\\exp',
    '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta',
    '\\theta', '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi',
    '\\pi', '\\rho', '\\sigma', '\\tau', '\\upsilon', '\\phi', '\\chi', '\\psi', '\\omega',
    '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Phi', '\\Psi', '\\Omega',
    '\\to', '\\rightarrow', '\\leftarrow', '\\Rightarrow', '\\Leftarrow', '\\leftrightarrow',
    '\\infty', '\\partial', '\\nabla', '\\pm', '\\mp', '\\times', '\\div',
    '\\leq', '\\geq', '\\neq', '\\approx', '\\equiv', '\\sim', '\\propto',
    '\\forall', '\\exists', '\\in', '\\notin', '\\subset', '\\supset', '\\cup', '\\cap',
    '\\cdot', '\\dots', '\\ldots', '\\cdots', '\\vdots', '\\ddots',
    '\\left', '\\right', '\\mathbf', '\\mathrm', '\\text', '\\mathbb'
];

/**
 * Detecta se uma string contém comandos LaTeX
 */
const hasLatexCommands = (text) => {
    return LATEX_COMMANDS.some(cmd => text.includes(cmd));
};

/**
 * Detecta se uma string contém símbolos matemáticos unicode
 */
const hasMathSymbols = (text) => {
    return /[≤≥≈≠±∫∑∮π∞√∂∇]/.test(text);
};

/**
 * Verifica se o texto já contém delimitadores de math mode KaTeX
 */
const hasKatexDelimiters = (text) => {
    return /\$/.test(text) || text.includes('\\[') || text.includes('\\(');
};

/**
 * Pré-processa o conteúdo antes de renderizar.
 * 
 * Corrigido (v2): 
 * - NÃO colapsa \\\\ em \\ (são delimitadores de quebra de linha LaTeX válidos)
 * - NÃO remove espaços ao redor de $ (pode quebrar contexto)
 * - Trata corretamente linhas mistas (texto + fórmula)
 */
export const preprocessMathContent = (content) => {
    if (!content || typeof content !== 'string') return '';

    let result = content;

    // 1. Se já tem delimitadores KaTeX, limpa apenas artefatos de encoding
    if (hasKatexDelimiters(result)) {
        // Corrige $ excessivos (ex: $$$$ → $$) sem tocar em pares válidos
        result = result.replace(/\${3,}/g, '$$');
        return result;
    }

    // 2. Se tem comandos LaTeX ou símbolos math, faz wrap em $
    if (hasLatexCommands(result) || hasMathSymbols(result)) {
        const lines = result.split('\n');
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            // Se já tem $, mantém como está
            if (trimmed.includes('$')) return line;

            // Se a linha inteira parece ser fórmula (tem comandos LaTeX)
            if (hasLatexCommands(trimmed)) {
                return `$${trimmed}$`;
            }

            // Se tem apenas símbolos math unicode, wrap em $
            if (hasMathSymbols(trimmed) && trimmed.length < 120) {
                return `$${trimmed}$`;
            }

            return line;
        });
        return processedLines.join('\n');
    }

    // 3. Para texto sem LaTeX, retorna original
    return result;
};

/**
 * Versão simples — garante que fórmulas LaTeX órfãs tenham $
 * Usa regex real para detectar comandos LaTeX (não char classes quebradas)
 */
export const simplePreprocess = (content) => {
    if (!content || typeof content !== 'string') return content;

    // Não modificar se já tem sintaxe KaTeX
    if (hasKatexDelimiters(content)) {
        return content;
    }

    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        if (line.includes('$')) return line;

        // Detecta linha que começa com comando LaTeX real
        // No runtime, \lim é um char \ seguido de 'lim'
        if (/^\\(?:lim|int|sum|sin|cos|tan|frac|sqrt|log|ln)(?:\b|[_{(])/.test(line.trim())) {
            return `$${line.trim()}$`;
        }

        return line;
    });

    return processedLines.join('\n');
};

/**
 * Detecta se uma string contém texto matemático
 */
export const isMathText = (text) => {
    if (!text || typeof text !== 'string') return false;

    // Verifica se contém comandos LaTeX (no runtime, \ é literal backslash)
    if (/\\(?:lim|frac|sqrt|int|sum|prod|sin|cos|tan|log)(?:\b|[_{(])/.test(text)) {
        return true;
    }

    // Verifica se contém símbolos matemáticos unicode
    if (hasMathSymbols(text)) return true;

    // Verifica padrão tipo f(x) = ... ou x^2 + ...
    if (/[a-z]\([a-z]\)\s*=/.test(text) || /[a-z]\^[0-9]/.test(text)) {
        return true;
    }

    return false;
};

export default { preprocessMathContent, simplePreprocess, isMathText };