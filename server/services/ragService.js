import fs from 'fs';
import path from 'path';

/**
 * Serviço RAG — busca de contexto local no content.json
 * Carrega dados uma vez e fornece busca por tópico.
 */

// Mapeamento de sinônimos para tópicos
const SYNONYMS = {
    'teorema do confronto': 'Teorema do Confronto',
    'teorema do sanduíche': 'Teorema do Confronto',
    'squeeze theorem': 'Teorema do Confronto',
    'squeeze': 'Teorema do Confronto',
    'sandwich': 'Teorema do Confronto',
    'confronto': 'Teorema do Confronto',
    'limite trigonométrico': 'Teorema do Confronto',
    'sen x sobre x': 'Teorema do Confronto',
    'sin x over x': 'Teorema do Confronto',
    'limite fundamental': 'Teorema do Confronto',
};

let localContent = {};

/**
 * Carrega o content.json uma vez. Deve ser chamado no startup.
 */
export const loadContent = (rootDir) => {
    try {
        const contentPath = path.join(rootDir, 'src/data/content.json');
        localContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        console.log(`[RAG] Loaded ${Object.keys(localContent).length} topics from content.json`);
        return localContent;
    } catch (e) {
        console.error('[RAG] Falha ao carregar content.json:', e.message);
        return {};
    }
};

/**
 * Busca contexto local relevante para uma query.
 * Retorna string formatada para injeção no prompt, ou null.
 */
export const getLocalContext = (query) => {
    try {
        const queryLower = query.toLowerCase();
        const normalizedQuery = SYNONYMS[queryLower] || query;

        // 1. Busca por chave exata ou sinônimo
        const topicMatch = Object.keys(localContent).find(t =>
            normalizedQuery.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
            (SYNONYMS[queryLower] && t.toLowerCase() === 'teorema do confronto')
        ) || Object.keys(localContent).find(t =>
            queryLower.includes(t.toLowerCase()) ||
            localContent[t].material?.toLowerCase().includes(queryLower) ||
            JSON.stringify(localContent[t].presentation || []).toLowerCase().includes(queryLower)
        );

        if (topicMatch) {
            const t = localContent[topicMatch];
            const parts = [`TÓPICO: ${topicMatch}\n\nMATERIAL TEÓRICO:\n${t.material}`];

            if (t.presentation?.length > 0) {
                const presContent = t.presentation.map(s => `- ${s.title}: ${s.content} (Fórmula: ${s.formula})`).join('\n');
                parts.push(`PONTOS CHAVE (SLIDES):\n${presContent}`);
            }

            if (t.exercises?.length > 0) {
                const exContent = t.exercises.map(ex => `- ${ex.title} (${ex.difficulty}): ${ex.content}`).join('\n');
                parts.push(`EXERCÍCIOS DE EXEMPLO:\n${exContent}`);
            }

            return parts.join('\n\n---\n\n');
        }

        // Fallback: resumo de todos os tópicos
        return Object.keys(localContent)
            .map(t => `Tópico ${t}: ${localContent[t].material?.substring(0, 200)}...`)
            .join('\n\n');
    } catch (e) {
        console.error('[RAG] Erro ao buscar contexto:', e);
    }
    return null;
};

/**
 * Sanitiza LaTeX em JSON gerado pela IA.
 * Corrige barras invertidas simples em comandos LaTeX conhecidos.
 */
export const sanitizeLatexJson = (rawText) => {
    if (!rawText) return rawText;
    
    try {
        // Primeiro tenta parsar para verificar se é válido
        JSON.parse(rawText);
        // Se já é válido, retorna como está
        return rawText;
    } catch (e) {
        // Se não é válido, tenta corrigir escapes de aspas
        // Substitui \" por " (aspasescapadasvsaspas reais)
        let fixed = rawText.replace(/\\"/g, '"');
        
        // Corrige barras invertidas isoladas antes de comandos conhecidos
        const latexCommands = ['frac', 'lim', 'sqrt', 'int', 'sum', 'prod', 'sin', 'cos', 'tan', 'log', 'alpha', 'beta', 'gamma', 'delta', 'theta', 'lambda', 'pi', 'infty', 'to', 'from', 'left', 'right'];
        
        latexCommands.forEach(cmd => {
            // Substitui \cmd por \\cmd (exceto se já tem \\
            const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
            fixed = fixed.replace(regex, `\\\\${cmd}`);
        });
        
        return fixed;
    }
};
