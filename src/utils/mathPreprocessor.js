/**
 * mathPreprocessor.js
 * 
 * Pré-processa texto matemático para garantir renderização correta pelo KaTeX
 * Converte formatos comuns de matemática para sintaxe LaTeX válida
 */

/**
 * Pré-processa o conteúdo antes de renderizar
 * Versão simplificada que preserva o que já está correto
 */
export const preprocessMathContent = (content) => {
    if (!content) return '';
    
    // Se já tem blocos KaTeX ($ ou $$), apenas limpa sintaxe inválida
    if (content.includes('$') || content.includes('\\[')) {
        // Remove barras invertidas duplicadas que causam problemas
        let result = content;
        
        // Limpa sequências inválidas de $ (mantém $ e $$)
        result = result.replace(/\$([^\$]*)\$\$/g, '$$$1$$'); // $$ -> $$$$
        
        return result;
    }
    
    // Para conteúdo sem $, verifica se tem comandos LaTeX
    const hasLatex = /\\(lim|frac|sqrt|int|sum|prod|sin|cos|tan|log|alpha|beta|gamma|delta|theta)/.test(content);
    
    if (hasLatex) {
        // Wrap em $ se parece com matemática
        const lines = content.split('\n');
        const processedLines = lines.map(line => {
            // Se tem muitos comandos LaTeX, wrap em $$
            const latexCount = (line.match(/\\(lim|frac|sqrt|int|sum|prod|sin|cos|tan|log)/g) || []).length;
            const hasEquals = line.includes('=');
            
            if (latexCount >= 2 || (hasEquals && latexCount >= 1)) {
                return `$${line.trim()}$`;
            }
            return line;
        });
        return processedLines.join('\n');
    }
    
    return content;
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