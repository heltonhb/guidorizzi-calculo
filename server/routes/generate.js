import { Router } from 'express';
import {
    getDynamicFlashcardsPrompt,
    getDynamicQuizPrompt,
    getDynamicSlidesPrompt
} from '../../src/services/prompts.js';
import { getLocalContext, sanitizeLatexJson } from '../services/ragService.js';
import { GUIDORIZZI_RULES, LATEX_JSON_INSTRUCTION } from '../constants.js';

/**
 * Cria o router de geração dinâmica (flashcards, quiz, slides).
 * @param {import('groq-sdk').Groq} groq - cliente Groq
 * @param {string} model - ID do modelo
 */
export const createGenerateRouter = (groq, model) => {
    const router = Router();

    // Helper: chama Groq com JSON mode e sanitiza LaTeX
    const callGroqJson = async (systemPrompt, userPrompt) => {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model,
                response_format: { type: 'json_object' },
            });
            const raw = completion.choices[0]?.message?.content;
            
            // Tentar sanitizar e parsear
            const sanitized = sanitizeLatexJson(raw);
            return JSON.parse(sanitized);
        } catch (parseError) {
            console.error('[callGroqJson] Erro ao parsear JSON:', parseError.message);
            // Tentar uma abordagem mais agressiva de reparo
            const repaired = repairJson(raw);
            if (repaired) {
                return JSON.parse(repaired);
            }
            throw new Error(`Falha ao processar resposta da IA: ${parseError.message}`);
        }
    };
    
    // Tentativa de reparo de JSON quebrado
    const repairJson = (raw) => {
        if (!raw) return null;
        try {
            // Remove caracteres de controle problemáticos
            let fixed = raw.replace(/[\x00-\x1F\x7F]/g, '');
            
            // Tenta encontrar JSON válido dentro da resposta
            const jsonMatch = fixed.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return jsonMatch[0];
            }
            
            return null;
        } catch (e) {
            return null;
        }
    };

    // POST /api/generate/flashcards
    router.post('/flashcards', async (req, res) => {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic é obrigatório' });

        try {
            console.log(`[Generate] Flashcards for topic: "${topic}"`);
            const localContext = getLocalContext(topic) || '';
            const systemPrompt = `Você é um gerador de flashcards focado no livro de cálculo de Guidorizzi. Retorne EXATAMENTE um objeto JSON com a propriedade "flashcards" cujo valor é um array. Cada item deve ter: "front" (pergunta) e "back" (resposta com LaTeX $...$). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicFlashcardsPrompt(topic));

            if (parsed?.flashcards && Array.isArray(parsed.flashcards)) {
                console.log(`[Generate] ✅ ${parsed.flashcards.length} flashcards generated`);
                return res.json({ status: 'success', flashcards: parsed.flashcards, source: 'Groq (Llama 3)' });
            }
            res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
        } catch (error) {
            console.error('[Generate] Flashcards error:', error.message);
            res.status(500).json({ error: error.message || 'Erro ao gerar flashcards' });
        }
    });

    // POST /api/generate/quiz
    router.post('/quiz', async (req, res) => {
        const { topic, count = 5 } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic é obrigatório' });

        try {
            console.log(`[Generate] Quiz(${count}) for topic: "${topic}"`);
            const localContext = getLocalContext(topic) || '';
            const systemPrompt = `Você é um gerador de quizzes inspirados nos problemas do livro Guidorizzi. Retorne EXATAMENTE um objeto JSON com "questions" contendo um array. Cada objeto: "text" (enunciado), "options" (4 strings), "correct" (índice 0-3), "explanation" (passo a passo). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicQuizPrompt(topic, count));

            if (parsed?.questions && Array.isArray(parsed.questions)) {
                const valid = parsed.questions.filter(q =>
                    q.text && q.options && Array.isArray(q.options) &&
                    q.options.length >= 2 && typeof q.correct === 'number'
                );
                if (valid.length > 0) {
                    console.log(`[Generate] ✅ ${valid.length} quiz questions generated`);
                    return res.json({ status: 'success', questions: valid, source: 'Groq (Llama 3)' });
                }
            }
            res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
        } catch (error) {
            console.error('[Generate] Quiz error:', error.message);
            res.status(500).json({ error: error.message || 'Erro ao gerar quiz' });
        }
    });

    // POST /api/generate/slides
    router.post('/slides', async (req, res) => {
        const { topic, count = 6 } = req.body;
        if (!topic) return res.status(400).json({ error: 'Topic é obrigatório' });

        try {
            console.log(`[Generate] Slides(${count}) for topic: "${topic}"`);
            const localContext = getLocalContext(topic) || '';
            const systemPrompt = `Você é um gerador de slides educacionais de Cálculo baseado no livro Guidorizzi. Retorne EXATAMENTE um objeto JSON com "slides" contendo um array. Cada slide: "title" (string), "subtitle" (string), "blocks" (array de objetos com "type" e "content"). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Mantenha legível em tela 9:16 mobile. Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicSlidesPrompt(topic, count));

            if (parsed?.slides && Array.isArray(parsed.slides)) {
                console.log(`[Generate] ✅ ${parsed.slides.length} slides generated`);
                return res.json({ status: 'success', slides: parsed.slides, source: 'Groq (Llama 3)' });
            }
            res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
        } catch (error) {
            console.error('[Generate] Slides error:', error.message);
            res.status(500).json({ error: error.message || 'Erro ao gerar slides' });
        }
    });

    return router;
};
