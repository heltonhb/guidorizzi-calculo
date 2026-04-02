import { describe, it, expect } from 'vitest';
import { extractJSON } from '../utils/jsonParser';

describe('extractJSON', () => {
    it('retorna null para input não-string', () => {
        expect(extractJSON(null)).toBeNull();
        expect(extractJSON(undefined)).toBeNull();
        expect(extractJSON(42)).toBeNull();
    });

    it('faz parse de JSON direto', () => {
        const json = '{"flashcards": [{"front": "Q", "back": "A"}]}';
        const result = extractJSON(json);
        expect(result).toEqual({ flashcards: [{ front: 'Q', back: 'A' }] });
    });

    it('extrai JSON de code block markdown', () => {
        const text = 'Aqui está:\n```json\n{"questions": [1, 2]}\n```\nFim.';
        const result = extractJSON(text);
        expect(result).toEqual({ questions: [1, 2] });
    });

    it('extrai JSON de code block sem especificação de linguagem', () => {
        const text = '```\n{"key": "value"}\n```';
        const result = extractJSON(text);
        expect(result).toEqual({ key: 'value' });
    });

    it('extrai JSON embutido em texto (objeto)', () => {
        const text = 'Resultado: {"slides": []} e mais texto';
        const result = extractJSON(text);
        expect(result).toEqual({ slides: [] });
    });

    it('extrai JSON embutido em texto (array)', () => {
        const text = 'Lista: [1, 2, 3] gerada';
        const result = extractJSON(text);
        expect(result).toEqual([1, 2, 3]);
    });

    it('retorna null para texto sem JSON', () => {
        expect(extractJSON('texto sem json nenhum')).toBeNull();
    });

    it('retorna null para JSON malformado', () => {
        expect(extractJSON('{"broken": ')).toBeNull();
    });
});
