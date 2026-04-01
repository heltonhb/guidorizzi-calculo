/**
 * mathPreprocessor.js
 * 
 * Pré-processa texto matemático para garantir renderização correta pelo KaTeX
 * Converte formatos comuns de matemática para sintaxe LaTeX válida
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
 * Detecta se uma string contém símbolos matemáticos
 */
const hasMathSymbols = (text) => {
    return /[=+\-*/<>≤≥≈≠±∫∑∮π∞√∂∇]/.test(text);
};

/**
 * Pré-processa o conteúdo antes de renderizar
 * Versão melhorada que trata mais casos de LaTeX
 */
export const preprocessMathContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    let result = content;
    
    // 1. Se já tem blocos KaTeX ($ ou $$), apenas limpa sintaxe inválida
    if (result.includes('$') || result.includes('\\[') || result.includes('\\(')) {
        // Remove barras invertidas duplicadas
        result = result.replace(/\\\\+/g, '\\');
        
        // Limpa sequências inválidas de $ 
        result = result.replace(/(\$+)\1+/g, '$$'); // $$$$ -> $$
        
        // Garante que $$ não tenha espaços extras
        result = result.replace(/\$\s+/g, '$');
        result = result.replace(/\s+\$/g, '$');
        
        return result;
    }
    
    // 2. Se tem comandos LaTeX, faz wrap em $
    if (hasLatexCommands(result) || hasMathSymbols(result)) {
        const lines = result.split('\n');
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;
            
            // Se já tem $, mantém como está
            if (trimmed.includes('$')) return line;
            
            // Se tem comandos LaTeX ou símbolos matemáticos, wrap em $
            if (hasLatexCommands(trimmed) || hasMathSymbols(trimmed)) {
                // Se parece ser uma fórmula em bloco (linha curta)
                if (trimmed.length < 80 && /[=+\-*/]/.test(trimmed)) {
                    return `$${trimmed}$`;
                }
                // Para fórmulas em linha
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
 * Versão simples - só garante que fórmulas conhecidas tenham $
 */
export const simplePreprocess = (content) => {
    if (!content || typeof content !== 'string') return content;
    
    // Não modificar se já tem sintaxe KaTeX
    if (content.includes('$$') || content.includes('\\[')) {
        return content;
    }
    
    // Para blocos que parecem matemática pura (curtos, com variáveis)
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        // Se já tem $, mantém
        if (line.includes('$')) return line;
        
        // Se tem comandos LaTeX mas não $, tenta wrap se for fórmula completa
        if (/^[\s\\lim\int\sum\sin\cos\tan\dx\dy]+[\w(){}\[\]]/.test(line.trim())) {
            return `$${line.trim()}$`;
        }
        
        return line;
    });
    
    return processedLines.join('\n');
};

/**
 * Detecta se uma string contém texto matemático
 */
const isMathText = (text) => {
    // Verifica se contém comandos LaTeX
    const hasLatexCommand = /\\(lim|frac|sqrt|int|sum|prod|sin|cos|tan|log)/.test(text);
    if (hasLatexCommand) return true;
    
    // Verifica se contém símbolos matemáticos
    const hasMathSymbols = /[=+\-*/<>≤≥≈≠±∫∑π∞√]/.test(text);
    // Verifica se contém variáveis tipo x, f(x), etc
    const hasMathPattern = /[a-z]\s*[=+\-*/]\s*[a-z0-9]/.test(text);
    
    return hasMathSymbols && hasMathPattern;
};

export default { preprocessMathContent, simplePreprocess, isMathText };