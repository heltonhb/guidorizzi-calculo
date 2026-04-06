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

    // Helper: valida e sanitiza input
    const validateTopic = (topic) => {
        if (typeof topic !== 'string') {
            return { valid: false, error: 'Topic must be a string' };
        }
        const trimmed = topic.trim();
        if (trimmed.length < 2 || trimmed.length > 200) {
            return { valid: false, error: 'Topic must be between 2 and 200 characters' };
        }
        return { valid: true, sanitized: trimmed.replace(/[<>]/g, '') };
    };

    const validateCount = (count, defaultVal, maxVal) => {
        const parsed = parseInt(count, 10);
        if (isNaN(parsed) || parsed < 1) return defaultVal;
        return Math.min(parsed, maxVal);
    };

    // ⚠️ VALIDAÇÃO: Verifica se a questão tem consistência básica
    // (correct index é válido e está dentro do range de options)
    const validateQuestionConsistency = (question) => {
        const { text, options, correct, explanation } = question;
        
        // Validação básica
        if (!text || !options || typeof correct !== 'number') {
            return { valid: false, reason: 'Dados incompletos' };
        }
        
        // Verifica se correct está dentro do range
        if (correct < 0 || correct >= options.length) {
            console.warn(`⚠️ AVISO: Questão tem índice 'correct' inválido: ${correct} (options.length: ${options.length})`);
            return { valid: false, reason: `Índice correto ${correct} está fora do range` };
        }
        
        // Validação de compatibilidade (aviso, não erro)
        const correctAnswer = options[correct];
        if (explanation && correctAnswer) {
            // Verifica se a explicação menciona um número diferente do resultado
            // Exemplo: explicação diz "= 12" mas correct aponta para "20"
            const explanationHasNumber = /[=:]?\s*(\d+(?:\.\d+)?)\s*\./.test(explanation);
            if (explanationHasNumber) {
                const numberInExplanation = explanation.match(/[=:]?\s*(\d+(?:\.\d+)?)\s*\./)?.[1];
                const answerText = correctAnswer.replace(/\$.*?\$/g, '').trim();
                
                if (numberInExplanation && !answerText.includes(numberInExplanation)) {
                    console.warn(`⚠️ ATENÇÃO: Possível inconsistência detectada!`);
                    console.warn(`   Explicação menciona: "${numberInExplanation}"`);
                    console.warn(`   Resposta correta é: "${correctAnswer}"`);
                    console.warn(`   Questão: "${text.substring(0, 60)}..."`);
                }
            }
        }
        
        return { valid: true };
    };

    // POST /api/generate/flashcards
    router.post('/flashcards', async (req, res) => {
        const { topic } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        
        const validation = validateTopic(topic);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        try {
            console.log(`[Generate] Flashcards for topic: "${validation.sanitized}"`);
            const localContext = getLocalContext(validation.sanitized) || '';
            const systemPrompt = `Você é um gerador de flashcards focado no livro de cálculo de Guidorizzi. Retorne EXATAMENTE um objeto JSON com a propriedade "flashcards" cujo valor é um array. Cada item deve ter: "front" (pergunta) e "back" (resposta com LaTeX $...$). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicFlashcardsPrompt(validation.sanitized));

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
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        
        const validation = validateTopic(topic);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const validCount = validateCount(count, 5, 20);

        try {
            console.log(`[Generate] Quiz(${validCount}) for topic: "${validation.sanitized}"`);
            const localContext = getLocalContext(validation.sanitized) || '';
            const systemPrompt = `Você é um gerador de quizzes inspirados nos problemas do livro Guidorizzi. Retorne EXATAMENTE um objeto JSON com "questions" contendo um array. Cada objeto: "text" (enunciado), "options" (4 strings), "correct" (índice 0-3), "explanation" (passo a passo). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicQuizPrompt(validation.sanitized, validCount));

            if (parsed?.questions && Array.isArray(parsed.questions)) {
                const valid = parsed.questions.filter(q => {
                    const consistency = validateQuestionConsistency(q);
                    // ⚠️ Log de questões com problemas potenciais (mas ainda retorna se valid)
                    if (!consistency.valid) {
                        console.warn(`[Generate] Questão rejeitada: ${consistency.reason}`);
                        return false;
                    }
                    return q.text && q.options && Array.isArray(q.options) &&
                        q.options.length >= 2 && typeof q.correct === 'number';
                });
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
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        
        const validation = validateTopic(topic);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        
        const validCount = validateCount(count, 6, 15);

        try {
            console.log(`[Generate] Slides(${validCount}) for topic: "${validation.sanitized}"`);
            const localContext = getLocalContext(validation.sanitized) || '';
            const systemPrompt = `Você é um gerador de slides educacionais de Cálculo baseado no livro Guidorizzi. Retorne EXATAMENTE um objeto JSON com "slides" contendo um array. Cada slide: "title" (string), "subtitle" (string), "blocks" (array de objetos com "type" e "content"). ${LATEX_JSON_INSTRUCTION} ${GUIDORIZZI_RULES} Mantenha legível em tela 9:16 mobile. Contexto: ${localContext}`;

            const parsed = await callGroqJson(systemPrompt, getDynamicSlidesPrompt(validation.sanitized, validCount));

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
