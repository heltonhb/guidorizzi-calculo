/**
 * mathPreprocessor.js
 * 
 * Pré-processa texto matemático para garantir renderização correta pelo KaTeX
 * Converte formatos comuns de matemática para sintaxe LaTeX válida
 */

// Lista de comandos LaTeX comuns que devem ser envoltos em $
const latexCommands = [
    'lim', 'frac', 'sqrt', 'int', 'sum', 'prod', 'sin', 'cos', 'tan',
    'log', 'ln', 'exp', 'arctan', 'arcsin', 'arccos', 'sen', 'tg',
    'infty', 'partial', 'nabla', 'alpha', 'beta', 'gamma', 'delta',
    'theta', 'lambda', 'mu', 'sigma', 'phi', 'omega', 'pi', 'epsilon',
    'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'to', 'infty',
    'cdot', 'times', 'div', 'pm', 'neq', 'leq', 'geq', 'approx',
    'infty', 'forall', 'exists', 'in', 'subset', 'cup', 'cap'
];

/**
 * Detecta se uma string contém texto matemático
 */
const isMathText = (text) => {
    // Verifica se contém comandos LaTeX
    const hasLatexCommand = latexCommands.some(cmd => 
        new RegExp(`\\\\${cmd}\\b`, 'i').test(text)
    );
    if (hasLatexCommand) return true;
    
    // Verifica se contém símbolos matemáticos
    const hasMathSymbols = /[=+\-*/<>≤≥≈≠±∫∑π∞√]/.test(text);
    // Verifica se contém variáveis tipo x, f(x), etc
    const hasMathPattern = /[a-z]\s*[=+\-*/]\s*[a-z0-9]/.test(text);
    
    return hasMathSymbols && hasMathPattern;
};

/**
 * Wrap commands LaTeX em $...$ se não estiverem
 */
const wrapLatexCommands = (text) => {
    // Se já tem $ ou $$, não modifica
    if (text.includes('$')) {
        // Limpar $ duplicados ou mal posicionados
        return text.replace(/(\$+)/g, '$');
    }
    
    // Verificar se o texto inteiro parece ser matemática
    if (isMathText(text) && text.length < 200) {
        return `$${text}$`;
    }
    
    return text;
};

/**
 * Converte expressões comuns para LaTeX
 */
const convertCommonMathExpressions = (text) => {
    let result = text;
    
    // Substituições comuns
    const replacements = [
        // Limites
        [/\blim\s*([a-z])\s*->\s*([a-z0-9])/gi, '$\\lim_{$1 \\to $2}$'],
        [/\blimite\s+([a-z])\s*->\s*([a-z0-9])/gi, '$\\lim_{$1 \\to $2}$'],
        
        // Derivadas
        [/d\/dx/g, '\\frac{d}{dx}'],
        [/dy\/dx/g, '\\frac{dy}{dx}'],
        [/\bderivada\b/gi, '\\frac{d}{dx}'],
        
        // Integrais
        [/\bintegral\b/gi, '\\int'],
        [/\bint\b/gi, '\\int'],
        
        // Frações comuns
        [/\b(\w+)\s*\/\s*(\w+)\b/g, '$\\frac{$1}{$2}$'],
        
        // Potências e raízes
        [/\bsqrt\(([^)]+)\)/gi, '\\sqrt{$1}'],
        [/\braiz\s+de\s+(\w+)/gi, '\\sqrt{$1}'],
        
        // Funções comuns
        [/sen\(x\)/gi, '\\sin(x)'],
        [/cos\(x\)/gi, '\\cos(x)'],
        [/tan\(x\)/gi, '\\tan(x)'],
        
        // Somas e produtos
        [/\bsoma\s+de/gi, '\\sum'],
        [/\bproduto\s+de/gi, '\\prod'],
        
        // Símbolos comuns
        [/infinity/gi, '\\infty'],
        [/->/g, '\\to '],
        [/=>/g, '\\Rightarrow '],
    ];
    
    replacements.forEach(([pattern, replacement]) => {
        result = result.replace(pattern, replacement);
    });
    
    return result;
};

/**
 * Processa um parágrafo completo
 */
const processParagraph = (text) => {
    // Primeiro converte expressões comuns
    let processed = convertCommonMathExpressions(text);
    
    // Depois verifica se precisa wrap de comandos LaTeX
    // Mas só em blocos que parecem ser matemática pura
    const lines = processed.split('\n');
    const processedLines = lines.map(line => {
        // Se a linha tem muitos comandos LaTeX,.wrap
        const latexCount = (line.match(/\\frac|\\sqrt|\\int|\\sum|\\lim|\\sin|\\cos|\\tan|\\log/g) || []).length;
        if (latexCount >= 2 && !line.includes('$')) {
            return wrapLatexCommands(line);
        }
        return line;
    });
    
    return processedLines.join('\n');
};

/**
 * Pré-processa o conteúdo antes de renderizar
 */
export const preprocessMathContent = (content) => {
    if (!content) return '';
    
    // Dividir em blocos (parágrafos)
    const blocks = content.split(/\n\n+/);
    
    const processedBlocks = blocks.map(block => {
        // Se o bloco é muito curto e tem padrão matemático, processa
        if (block.length < 300 && isMathText(block)) {
            return processParagraph(block);
        }
        
        // Para blocos maiores, verifica cada linha
        const lines = block.split('\n');
        const processedLines = lines.map(line => {
            // Se a linha tem comandos LaTeX mas não tem $, adiciona
            const hasLatex = /\\(lim|frac|sqrt|int|sum|prod|sin|cos|tan|log)/.test(line);
            const hasMathVars = /\b[fghijklmnpqrstuvwxyz]\s*[=\(\)]/.test(line);
            
            if (hasLatex && hasMathVars && !line.includes('$')) {
                // Tenta wrap apenas a parte matemática
                return wrapLatexCommands(line);
            }
            
            return line;
        });
        
        return processedLines.join('\n');
    });
    
    return processedBlocks.join('\n\n');
};

/**
 * Versão simples - só garante que fórmulas conhecidas tenham $
 */
export const simplePreprocess = (content) => {
    if (!content) return content;
    
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

export default { preprocessMathContent, simplePreprocess, isMathText };