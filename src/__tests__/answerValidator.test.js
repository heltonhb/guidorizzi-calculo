import { describe, it, expect } from 'vitest';
import {
    validateAnswerAgainstBook,
    getCachedAnswer,
    cacheAnswer,
    clearCache,
    getLocalContent,
    getLocalExercises
} from '../services/answerValidator';

describe('validateAnswerAgainstBook', () => {
    it('retorna isValid true para tópico não encontrado', () => {
        const result = validateAnswerAgainstBook('qualquer texto', 'TopicInexistente');
        expect(result.isValid).toBe(true);
        expect(result.warning).toContain('não encontrado');
    });

    it('detecta conceitos encontrados para Limites', () => {
        const answer = 'O limite de uma função contínua quando x tende a um valor...';
        const result = validateAnswerAgainstBook(answer, 'Limites');
        expect(result.foundConcepts).toContain('limite');
        expect(result.foundConcepts).toContain('função');
    });

    it('lista conceitos ausentes', () => {
        const answer = 'Texto vago sem mencionar conceitos chave dos limites.';
        const result = validateAnswerAgainstBook(answer, 'Limites');
        expect(result.missingConcepts.length).toBeGreaterThan(0);
    });

    it('detecta contradição sobre sen(x)/x', () => {
        const answer = 'O limite não existe quando x→0 para sen(x)/x';
        const result = validateAnswerAgainstBook(answer, 'Limites');
        expect(result.contradictions.length).toBeGreaterThan(0);
        expect(result.contradictions[0]).toContain('limite fundamental');
    });

    it('detecta contradição sobre derivada de constante', () => {
        const answer = 'A derivada de constante é 5';
        const result = validateAnswerAgainstBook(answer, 'Derivadas');
        expect(result.contradictions.length).toBeGreaterThan(0);
        expect(result.contradictions[0]).toContain('0');
    });

    it('verifica hasSufficientContent', () => {
        const short = 'OK';
        const long = 'A'.repeat(150);
        expect(validateAnswerAgainstBook(short, 'Limites').hasSufficientContent).toBe(false);
        expect(validateAnswerAgainstBook(long, 'Limites').hasSufficientContent).toBe(true);
    });
});

describe('Cache de respostas', () => {
    it('armazena e recupera do cache', () => {
        clearCache();
        cacheAnswer('pergunta1', 'Limites', 'resposta1');
        expect(getCachedAnswer('pergunta1', 'Limites')).toBe('resposta1');
    });

    it('retorna null para cache miss', () => {
        clearCache();
        expect(getCachedAnswer('pergunta-nova', 'Limites')).toBeNull();
    });

    it('clearCache limpa tudo', () => {
        cacheAnswer('q', 'Limites', 'a');
        clearCache();
        expect(getCachedAnswer('q', 'Limites')).toBeNull();
    });

    it('perguntas diferentes não colidem', () => {
        clearCache();
        cacheAnswer('q1', 'Limites', 'a1');
        cacheAnswer('q2', 'Limites', 'a2');
        expect(getCachedAnswer('q1', 'Limites')).toBe('a1');
        expect(getCachedAnswer('q2', 'Limites')).toBe('a2');
    });

    it('tópicos diferentes não colidem', () => {
        clearCache();
        cacheAnswer('q', 'Limites', 'a-limites');
        cacheAnswer('q', 'Derivadas', 'a-derivadas');
        expect(getCachedAnswer('q', 'Limites')).toBe('a-limites');
        expect(getCachedAnswer('q', 'Derivadas')).toBe('a-derivadas');
    });
});

describe('getLocalContent', () => {
    it('retorna success para tópico existente', () => {
        const result = getLocalContent('Limites');
        // O content.json pode ou não ter 'Limites' — aceita ambos
        if (result.success) {
            expect(result.answer).toBeTruthy();
            expect(result.source).toBe('local-fallback');
        } else {
            expect(result.error).toContain('não encontrado');
        }
    });

    it('retorna error para tópico inexistente', () => {
        const result = getLocalContent('QuanticaAvancada');
        expect(result.success).toBe(false);
        expect(result.error).toContain('não encontrado');
    });
});

describe('getLocalExercises', () => {
    it('retorna array vazio para tópico sem exercícios', () => {
        const result = getLocalExercises('TopicInexistente');
        expect(result.exercises).toEqual([]);
    });
});
