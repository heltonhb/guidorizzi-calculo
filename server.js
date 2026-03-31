import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Groq } from 'groq-sdk';

import {
    getDynamicFlashcardsPrompt,
    getDynamicQuizPrompt,
    getDynamicSlidesPrompt
} from './src/services/prompts.js';
import { extractJSON } from './src/utils/jsonParser.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
const apiKey = process.env.API_KEY;

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.error('[CONFIG] GROQ_API_KEY não definido no .env');
    process.exit(1);
}

const groq = new Groq({ apiKey: groqApiKey });
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.groq.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: (origin, callback) => {
        if (nodeEnv === 'development') {
            return callback(null, true);
        }
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: Origem ${origin} não permitida`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos em produção
if (nodeEnv === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            } else if (filePath.includes('/assets/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}

const requireApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'] || req.query.apiKey;

    if (nodeEnv === 'development' && !apiKey) {
        return next();
    }

    if (!apiKey) {
        return next();
    }

    if (providedKey && providedKey === apiKey) {
        return next();
    }

    return res.status(401).json({ error: 'API key inválida ou ausente. Use header X-API-Key.' });
};

app.use('/api/', requireApiKey);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Muitas requisições (Rate Limit). Por favor, aguarde 15 minutos e tente novamente.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// HELPER: Busca conteúdo local para usar como contexto RAG
const getLocalContext = (query) => {
    try {
        const contentPath = path.join(__dirname, 'src/data/content.json');
        const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        const queryLower = query.toLowerCase();

        // Mapeamento de sinônimos para tópicos
        const synonyms = {
            'teorema do confronto': 'Teorema do Confronto',
            'teorema do sanduíche': 'Teorema do Confronto',
            'squeeze theorem': 'Teorema do Confronto',
            'squeeze': 'Teorema do Confronto',
            'sandwich': 'Teorema do Confronto',
            'confronto': 'Teorema do Confronto',
            'limite trigonométrico': 'Teorema do Confronto', // O limite trigonométrico usa o teorema do confronto
            'sen x sobre x': 'Teorema do Confronto',
            'sin x over x': 'Teorema do Confronto',
            'limite fundamental': 'Teorema do Confronto'
        };

        // Normalizar a query para verificar sinônimos
        const normalizedQuery = synonyms[queryLower] || query;

        // Encontra o tópico pela chave exata ou sinônimo
        const topicMatch = Object.keys(content).find(t =>
            normalizedQuery.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
            (synonyms[queryLower] && t.toLowerCase() === 'teorema do confronto')
        ) || Object.keys(content).find(t =>
            queryLower.includes(t.toLowerCase()) ||
            content[t].material.toLowerCase().includes(queryLower) ||
            JSON.stringify(content[t].presentation).toLowerCase().includes(queryLower)
        );

        if (topicMatch) {
            const t = content[topicMatch];
            let contextParts = [`TÓPICO: ${topicMatch}\n\nMATERIAL TEÓRICO:\n${t.material}`];

            if (t.presentation && t.presentation.length > 0) {
                const presContent = t.presentation.map(s => `- ${s.title}: ${s.content} (Fórmula: ${s.formula})`).join('\n');
                contextParts.push(`PONTOS CHAVE (SLIDES):\n${presContent}`);
            }

            if (t.exercises && t.exercises.length > 0) {
                const exContent = t.exercises.map(ex => `- ${ex.title} (${ex.difficulty}): ${ex.content}`).join('\n');
                contextParts.push(`EXERCÍCIOS DE EXEMPLO:\n${exContent}`);
            }

            return contextParts.join('\n\n---\n\n');
        } else {
            // Fallback: retorna um resumo de tudo se não achar termo específico
            return Object.keys(content).map(t => `Tópico ${t}: ${content[t].material.substring(0, 200)}...`).join('\n\n');
        }
    } catch (e) {
        console.error('Erro ao ler content.json para contexto RAG:', e);
    }
    return null;
};

const GUIDORIZZI_RULES = `REGRAS ESTRITAS: Você deve basear suas explicações ÚNICA E EXCLUSIVAMENTE no livro "Um Curso de Cálculo" Vol. 1 de Hamilton Guidorizzi.Aplique conceitos APENAS para limites, derivadas e integrais de funções de UMA variável real.NUNCA utilize conceitos de convergência de séries ou sequências numéricas infinitas(ex: O Teorema do Confronto DEVE ser explicado no contexto de Limites de Funções, NÃO para séries). É OBRIGATÓRIO que você referencie explicitamente o capítulo e a seção do livro de onde a informação foi retirada em todas as suas respostas, questões, flashcards e explicações.`;

app.get('/', (req, res) => {
    res.send(`Guidorizzi API Bridge is ACTIVE(Groq / Llama - 3 Mode).Use POST / api / query to interact.`);
});

app.post('/api/query', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Missing query' });
    }

    try {
        console.log(`[Groq] Querying with: "${query.substring(0, 50)}..."`);

        const localContext = getLocalContext(query) || 'Responda como um professor de cálculo no estilo Guidorizzi.';

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Você é um tutor especialista em Cálculo focado na metodologia do livro Guidorizzi.
                ${GUIDORIZZI_RULES}
Use o contexto fornecido para responder à pergunta de forma precisa em formato Markdown com fórmulas em LaTeX envelopadas em $.
Contexto de Conhecimento Guidorizzi:
${localContext} `
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            model: GROQ_MODEL,
        });

        const answer = chatCompletion.choices[0]?.message?.content || '';

        return res.json({
            status: 'success',
            answer: answer,
            source: 'Groq (Llama 3)'
        });
    } catch (error) {
        console.error('❌ [Groq ERROR] Error querying LLM:', error?.message);
        res.status(500).json({
            error: 'Erro ao processar a consulta via Groq Llama 3.',
            details: error?.message
        });
    }
});

// ==========================================
// DYNAMIC GENERATION ENDPOINTS (via Groq JSON-mode)
// ==========================================

// POST Generate Dynamic Flashcards
app.post('/api/generate/flashcards', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        console.log(`[Generate] Flashcards for topic: "${topic}" via Groq`);
        const prompt = getDynamicFlashcardsPrompt(topic);
        const localContext = getLocalContext(topic) || '';

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: `Você é um gerador de flashcards focado no livro de cálculo de Guidorizzi.Retorne EXATAMENTE um objeto JSON encapsulado na raiz com a propriedade "flashcards" cujo valor é um array.Cada item deve ser um objeto com as chaves: "front"(a pergunta) e "back"(a resposta, formatada com LaTeX $...$ se houver fórmulas).IMPORTANTE: Você DEVE usar barra invertida dupla(\\\\) para TODOS os comandos LaTeX para não quebrar o JSON.Exemplo: use \\\\frac ao invés de \\frac, \\\\int ao invés de \\int, \\\\to ao invés de \\to.${GUIDORIZZI_RULES} Baseie - se no seguinte contexto para extrair o material: ${localContext} ` },
                { role: 'user', content: prompt }
            ],
            model: GROQ_MODEL,
            response_format: { type: 'json_object' }
        });

        let rawText = completion.choices[0]?.message?.content;

        // Fix single backslashes in LaTeX commands that Llama 3 might have missed
        // Converts \frac to \\frac, but respects already double-escaped \\frac
        rawText = rawText.replace(/(?<!\\)\\(?![\\n"'])/g, "\\\\");

        const parsed = JSON.parse(rawText);

        if (parsed && parsed.flashcards && Array.isArray(parsed.flashcards)) {
            console.log(`[Generate] ✅ ${parsed.flashcards.length} flashcards generated`);
            return res.json({
                status: 'success',
                flashcards: parsed.flashcards,
                source: 'Groq (Llama 3)'
            });
        }
        res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
    } catch (error) {
        console.error('[Generate] Flashcards error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar flashcards via Groq' });
    }
});

// POST Generate Dynamic Quiz Questions
app.post('/api/generate/quiz', async (req, res) => {
    const { topic, count = 5 } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        console.log(`[Generate] Quiz(${count} questions) for topic: "${topic}" via Groq`);
        const prompt = getDynamicQuizPrompt(topic, count);
        const localContext = getLocalContext(topic) || '';

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: `Você é um gerador de quizzes inspirados nos problemas do livro Guidorizzi.Retorne EXATAMENTE um objeto JSON com a propriedade "questions" contendo um array de questões.Cada objeto do array deve ter: "text"(o enunciado), "options"(array de 4 strings de respostas usando $...$ para equações), "correct"(um inteiro com o índice 0 - 3 da resposta correta), "explanation"(explicação do raciocínio passo a passo no estilo Guidorizzi).IMPORTANTE: Você DEVE usar barra invertida dupla(\\\\) para TODOS os comandos LaTeX dentro do JSON.Exemplo: obrigatório usar \\\\frac ao invés de \\frac, \\\\lim ao invés de \\lim, \\\\infty ao invés de \\infty, \\\\to ao invés de \\to.${GUIDORIZZI_RULES} Restrição estrita de saída APENAS para JSON.Contexto de base: ${localContext} ` },
                { role: 'user', content: prompt }
            ],
            model: GROQ_MODEL,
            response_format: { type: 'json_object' }
        });

        let rawText = completion.choices[0]?.message?.content;

        // Fix single backslashes in LaTeX commands that Llama 3 might have missed
        rawText = rawText.replace(/(?<!\\)\\(?![\\n"'])/g, "\\\\");

        const parsed = JSON.parse(rawText);

        if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
            const validQuestions = parsed.questions.filter(q =>
                q.text && q.options && Array.isArray(q.options) &&
                q.options.length >= 2 && typeof q.correct === 'number'
            );
            if (validQuestions.length > 0) {
                console.log(`[Generate] ✅ ${validQuestions.length} quiz questions generated`);
                return res.json({
                    status: 'success',
                    questions: validQuestions,
                    source: 'Groq (Llama 3)'
                });
            }
        }
        res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
    } catch (error) {
        console.error('[Generate] Quiz error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar quiz via Groq' });
    }
});

// POST Generate Dynamic Slides
app.post('/api/generate/slides', async (req, res) => {
    const { topic, count = 6 } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        console.log(`[Generate] Slides(${count}) for topic: "${topic}" via Groq`);
        const prompt = getDynamicSlidesPrompt(topic, count);
        const localContext = getLocalContext(topic) || '';

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: `Você é um gerador de slides educacionais de Cálculo baseado no livro Guidorizzi.Retorne EXATAMENTE um objeto JSON raiz com a chave "slides" contendo um array de slides.Cada slide é um objeto contendo: "title"(string), "subtitle"(string), "blocks"(array de objetos onde cada block tem "type": "text" e "content": string com texto mesclado com notação LaTeX).IMPORTANTE: Você DEVE usar barra invertida dupla(\\\\) para TODOS os comandos LaTeX no JSON.Exemplo: use \\\\frac ao invés de \\frac, \\\\lim ao invés de \\lim, \\\\infty ao invés de \\infty, \\\\to ao invés de \\to.${GUIDORIZZI_RULES} Mantenha as explicações formais mas legíveis em uma tela 9: 16 de celular.Use o conteúdo como guia: ${localContext} ` },
                { role: 'user', content: prompt }
            ],
            model: GROQ_MODEL,
            response_format: { type: 'json_object' }
        });

        let rawText = completion.choices[0]?.message?.content;

        // Fix single backslashes in LaTeX commands that Llama 3 might have missed
        rawText = rawText.replace(/(?<!\\)\\(?![\\n"'])/g, "\\\\");

        const parsed = JSON.parse(rawText);

        if (parsed && parsed.slides && Array.isArray(parsed.slides)) {
            console.log(`[Generate] ✅ ${parsed.slides.length} slides generated`);
            return res.json({
                status: 'success',
                slides: parsed.slides,
                source: 'Groq (Llama 3)'
            });
        }
        res.status(500).json({ error: 'Formato inválido retornado pelo Groq' });
    } catch (error) {
        console.error('[Generate] Slides error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar slides via Groq' });
    }
});

if (nodeEnv === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.get(/.*/, (req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Guidorizzi API Bridge running at http://localhost:${port}`);
});
