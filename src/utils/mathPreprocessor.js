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
 * - Trata fórmulas no meio de frases (não só linhas inteiras)
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
    '\\left', '\\right', '\\mathbf', '\\mathrm', '\\text', '\\mathbb',
    '\\dx', '\\dy', '\\dt', '\\du', '\\dv', '\\df', '\\dg',
    '\\sen', '\\tg', '\\arcsen', '\\arctg', // Comandos em português
    '\\ra', '\\la', '\\lla', '\\rra', // Setas curtas
    '\\par', '\\nabla', // Derivada parcial
];

// Regex mais abrangente para detectar comandos LaTeX em qualquer posição
const LATEX_COMMAND_PATTERN = /\\(?:lim|liminf|limsup|max|min|sup|inf|int|iint|iiint|oint|oiint|sum|prod|coprod|frac|sqrt|cbrt|nthroot|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|log|ln|exp|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|infinity|partial|nabla|pm|mp|times|div|leq|geq|neq|approx|equiv|sim|propto|forall|exists|in|notin|subset|supset|cup|cap|cdot|ldots|ccdots|vdots|ddots|left|right|text|mathbf|mathrm|mathbb|sen|tg|arcsen|arctg|ra|la|lla|rra|par|dx|dy|dt|du|dv|df|dg)(?:\b|[_{])/i;

/**
 * Detecta se uma string contém comandos LaTeX
 */
const hasLatexCommands = (text) => {
    return LATEX_COMMAND_PATTERN.test(text);
};

/**
 * Detecta símbolos matemáticos unicode
 */
const hasMathSymbols = (text) => {
    return /[≤≥≈≠±∫∑∮π∞√∂∇λμΣΩ]/.test(text);
};

/**
 * Verifica se o texto já contém delimitadores de math mode KaTeX
 */
const hasKatexDelimiters = (text) => {
    return /\$/.test(text) || text.includes('\\[') || text.includes('\\(');
};

/**
 * Converte barras invertidas duplas (\\\\) para simples (\)
 */
const fixDoubleBackslashes = (text) => {
    const parts = text.split(/(\$[^$]*\$)/);
    return parts.map(part => {
        if (part.startsWith('$') && part.endsWith('$')) {
            return part;
        }
        return part.replace(/\\\\/g, '\\');
    }).join('');
};

/**
 * Wrap de fórmulas detectadas que não têm delimitadores
 * Versão melhorada para detectar expressões completas
 */
const wrapInlineMath = (text) => {
    // Se já tem $, não modifica
    if (hasKatexDelimiters(text)) {
        return text;
    }

    // Se tem comandos LaTeX ou símbolos math, faz wrap correto
    if (hasLatexCommands(text) || hasMathSymbols(text)) {
        // Processa linha por linha para preservar quebras de linha
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
            if (line.includes('$')) {
                return line; // Já tem delimitadores, não modifica
            }

            // Padrão 1: Comandos LaTeX com braces: \frac{1}{2}, \sqrt{x}, etc
            // Detecta uma sequência de braces após o comando
            line = line.replace(/(\\(?:lim|liminf|limsup|int|iint|oint|sum|prod|frac|sqrt|cbrt|sin|cos|tan|cot|sec|csc|log|ln|arcsin|arccos|arctan)\s*(?:\{[^}]*\}|\[[^\]]*\]|_\{[^}]*\}|\^\{[^}]*\})+)/g, (match) => {
                if (match.includes('$')) return match;
                return `$${match}$`;
            });

            // Padrão 2: Funções trigonométricas/logarítmicas com parênteses: \sin(x), \cos(x), etc
            // Captura função inteira com seus argumentos
            line = line.replace(/(\\(?:sin|cos|tan|cot|sec|csc|log|ln|exp|arcsin|arccos|arctan|sen|tg|arcsen|arctg)\s*\([^)]*\))/g, (match) => {
                if (match.includes('$')) return match;
                return `$${match}$`;
            });

            // Padrão 3: Expressões simples com símbolos matemáticos (não só o símbolo)
            // Se contém símbolos math, envelopa TODA a linha
            if (hasMathSymbols(line) && !line.includes('$')) {
                return `$${line}$`;
            }

            return line;
        });

        return processedLines.join('\n');
    }

    return text;
};

/**
 * Pré-processa o conteúdo antes de renderizar.
 */
export const preprocessMathContent = (content) => {
    if (!content || typeof content !== 'string') return '';

    let result = content;

    // 0. Corrige barras invertidas duplas (\\\\) para simples (\)
    result = fixDoubleBackslashes(result);

    // 0.5 Helper para converter delimitadores padrão do modelo para padrão remark-math ($, $$)
    result = result.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    result = result.replace(/\\\(/g, '$$').replace(/\\\)/g, '$$');

    // 1. Se já tem delimitadores KaTeX, limpa apenas artefatos
    if (hasKatexDelimiters(result)) {
        result = result.replace(/\${3,}/g, '$$$$');
        return result;
    }

    // 2. Se tem comandos LaTeX ou símbolos math, tenta wrap inline
    if (hasLatexCommands(result) || hasMathSymbols(result)) {
        return wrapInlineMath(result);
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