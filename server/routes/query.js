import { Router } from 'express';
import { getLocalContext } from '../services/ragService.js';
import { GUIDORIZZI_RULES } from '../constants.js';

/**
 * Cria o router de consulta livre (chat).
 * @param {import('groq-sdk').Groq} groq - cliente Groq
 * @param {string} model - ID do modelo
 */
export const createQueryRouter = (groq, model) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Missing query' });

        try {
            console.log(`[Groq] Querying: "${query.substring(0, 50)}..."`);
            const localContext = getLocalContext(query) || 'Responda como um professor de cálculo no estilo Guidorizzi.';

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `Você é um tutor especialista em Cálculo focado na metodologia do livro Guidorizzi.
${GUIDORIZZI_RULES}
Use o contexto fornecido para responder de forma precisa em Markdown com fórmulas LaTeX em $.
Contexto de Conhecimento Guidorizzi:
${localContext}`
                    },
                    { role: 'user', content: query }
                ],
                model,
            });

            const answer = completion.choices[0]?.message?.content || '';
            return res.json({ status: 'success', answer, source: 'Groq (Llama 3)' });
        } catch (error) {
            console.error('❌ [Groq ERROR]:', error?.message);
            res.status(500).json({
                error: 'Erro ao processar a consulta via Groq Llama 3.',
                details: error?.message
            });
        }
    });

    return router;
};
