import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as EventSourcePkg from "eventsource";

if (!global.EventSource) {
    global.EventSource = EventSourcePkg.default || EventSourcePkg;
}
import {
    getStudioSlidePrompt,
    getStudioAudioPrompt,
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
const notebookId = process.env.GUIDORIZZI_NOTEBOOK_ID;

if (!notebookId) {
    console.error('[CONFIG] GUIDORIZZI_NOTEBOOK_ID não definido no .env');
    process.exit(1);
}

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://notebooklm.google.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: (origin, callback) => {
        if (nodeEnv === 'development') {
            return callback(null, true);
        }
        if (!origin || allowedOrigins.includes(origin)) {
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

let mcpClient = null;

async function initMCP() {
    // Skip MCP initialization in production (no local server available)
    if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ [MCP] Production mode - skipping NotebookLM MCP initialization');
        console.log('💡 [MCP] Using Groq API for AI responses instead');
        return;
    }

    try {
        console.log('Initializing Live NotebookLM Connection (MCP over SSE)...');
        const mcpUrl = new URL(process.env.MCP_SERVER_URL || 'http://127.0.0.1:8000/sse');
        const transport = new SSEClientTransport(mcpUrl);

        mcpClient = new Client(
            { name: "guidorizzi-bridge-sse", version: "1.0.0" },
            { capabilities: {} }
        );

        await mcpClient.connect(transport);
        console.log('Live NotebookLM Connection READY.');
    } catch (error) {
        console.error('Failed to initialize MCP Client over SSE:', error);
        console.warn('Falling back to static content only.');
    }
}

initMCP();

app.get('/', (req, res) => {
    const mode = process.env.NODE_ENV === 'production' ? 'Groq API Mode' : 'Live MCP Mode';
    res.send(`Guidorizzi API Bridge is ACTIVE (${mode}). Use POST /api/query to interact.`);
});

app.post('/api/query', async (req, res) => {
    const { notebookId, query } = req.body;
    const targetNotebookId = notebookId || notebookId;

    if (!query) {
        return res.status(400).json({ error: 'Missing query' });
    }

    try {
        console.log(`[API] Querying with: "${query.substring(0, 50)}..."`);

        // 1. Try Live Query first if MCP is available (with timeout)
        if (mcpClient) {
            try {
                console.log('[MCP] Attempting Live NotebookLM query...');
                console.log('[MCP] Tool: notebook_query | ID:', targetNotebookId);

                // Timeout para MCP call (30 segundos)
                const mcpPromise = mcpClient.callTool({
                    name: "notebook_query",
                    arguments: {
                        notebook_id: targetNotebookId,
                        query: query
                    },
                }, undefined, { timeout: 180000 });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('MCP query timeout')), 180000)  // 3 minutos
                );

                const response = await Promise.race([mcpPromise, timeoutPromise]);

                console.log('[MCP] Raw Response:', JSON.stringify(response)?.substring(0, 200));
                console.log('[MCP] Response Keys:', response ? Object.keys(response) : 'null');
                console.log('[MCP] Has isError?', response?.isError);
                console.log('[MCP] Has content?', !!response?.content);

                // MCP response structure: { content: [{ type: 'text', text: '...' }] }
                if (response && response.content && Array.isArray(response.content)) {
                    const textContent = response.content.find(c => c.type === 'text');
                    if (textContent && textContent.text) {
                        // Parse the JSON response from NotebookLM
                        try {
                            const parsed = JSON.parse(textContent.text);
                            const answer = parsed.answer || parsed.content || JSON.stringify(parsed);
                            console.log('[MCP] ✅ Live response received successfully.');
                            return res.json({
                                status: 'success',
                                answer: answer,
                                source: 'NotebookLM (LIVE AI)'
                            });
                        } catch (parseError) {
                            // If not JSON, use raw text
                            console.log('[MCP] ✅ Live response (raw text).');
                            return res.json({
                                status: 'success',
                                answer: textContent.text,
                                source: 'NotebookLM (LIVE AI)'
                            });
                        }
                    }
                } else {
                    console.warn('[MCP] Response missing content or returned error:', response?.isError);
                    console.warn('[MCP] Full response:', JSON.stringify(response)?.substring(0, 500));
                }
            } catch (mcpError) {
                console.warn('[MCP] Live query failed:', mcpError.message);
                console.error('[MCP] Error details:', mcpError);
            }
        } else {
            console.warn('[MCP] Client not available, using fallback knowledge base.');
        }
        const contentPath = path.join(__dirname, 'src/data/content.json');
        const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

        const isExercises = query.toLowerCase().includes('exercício') || query.toLowerCase().includes('lista');
        const isPresentation = query.toLowerCase().includes('slide') || query.toLowerCase().includes('apresentação');

        // Simple keyword matching for demo topics
        const topicMatch = Object.keys(content).find(t => query.includes(t));

        if (topicMatch) {
            let answer = '';
            if (isExercises) {
                answer = content[topicMatch].exercises.map(ex => `${ex.title} (${ex.difficulty}): ${ex.content}`).join('\n\n');
            } else if (isPresentation) {
                answer = content[topicMatch].presentation.map(s => `${s.title}: ${s.content} [Fórmula: ${s.formula}]`).join('\n\n');
            } else {
                answer = content[topicMatch].material;
            }

            return res.json({
                status: 'success',
                answer: answer,
                source: 'NotebookLM (Static Fallback)'
            });
        }

        // 3. Absolute fallback
        res.json({
            status: 'success',
            answer: `Estou processando sua dúvida sobre "${query}". No momento, o Guidorizzi está indisponível para esta consulta específica, mas tente perguntar sobre Limites, Derivadas ou Funções para ver o conhecimento estruturado!`,
            source: 'NotebookLM Bridge (Fallback)'
        });

    } catch (error) {
        console.error('❌ [API ERROR] Error querying bridge:', error?.message);
        res.status(500).json({
            error: 'Erro ao processar a consulta. O servidor da IA pode estar indisponível.',
            details: error?.message
        });
    }
});

// GET Studio Artifacts
app.get('/api/studio', async (req, res) => {
    try {
        if (!mcpClient) {
            console.warn('[Studio] MCP Client not initialized, returning mock data');
            return res.json({
                status: 'ready',
                artifacts: [],
                message: 'Studio (mock mode - MCP not available)'
            });
        }

        console.log('[Studio] Fetching Studio Artifacts...');

        try {
            const response = await mcpClient.callTool({
                name: "notebook_query",
                arguments: {
                    notebook_id: notebookId,
                    query: "What recent Studio artifacts or generated content is available?"
                },
            }, undefined, { timeout: 180000 });

            if (response && response.content) {
                const textContent = response.content.find(c => c.type === 'text');
                const data = textContent ? textContent.text : '[]';

                return res.json({
                    status: 'ready',
                    artifacts: JSON.parse(data),
                    source: 'NotebookLM Live'
                });
            }
        } catch (mcpError) {
            console.warn('[Studio] MCP query failed, returning mock data:', mcpError.message);
            return res.json({
                status: 'ready',
                artifacts: [],
                message: 'Studio (fallback mode)',
                error_note: mcpError.message
            });
        }

        res.json({
            status: 'ready',
            artifacts: [],
            message: 'Studio (fallback mode)'
        });
    } catch (error) {
        console.error('[Studio] Unexpected error:', error);
        res.status(200).json({
            status: 'ready',
            artifacts: [],
            message: 'Studio (fallback mode)',
            error: 'MCP unavailable'
        });
    }
});

// POST Create Slide Deck
app.post('/api/studio/create-slides', async (req, res) => {
    const { topic } = req.body;
    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client not initialized' });
        }

        console.log(`Triggering Slide Generation for: ${topic}`);
        const response = await mcpClient.callTool({
            name: "slide_deck_create",
            arguments: {
                notebook_id: notebookId,
                format: "detailed_deck",
                focus_prompt: getStudioSlidePrompt(topic),
                confirm: true
            },
        }, undefined, { timeout: 180000 });

        res.json({ status: 'success', message: 'Generation started', response });
    } catch (error) {
        console.error('Slide creation error:', error);
        res.status(500).json({ error: error.message || 'Internal Bridge Error' });
    }
});

// POST Create Audio Overview
app.post('/api/studio/audio', async (req, res) => {
    const { topic } = req.body;
    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client not initialized' });
        }

        console.log(`Triggering Audio Overview for topic: ${topic}`);
        const response = await mcpClient.callTool({
            name: "audio_overview_create",
            arguments: {
                notebook_id: notebookId,
                format: "deep_dive",
                length: "default",
                focus_prompt: getStudioAudioPrompt(topic),
                confirm: true
            },
        }, undefined, { timeout: 180000 });

        res.json({ status: 'success', message: 'Audio generation started', response });
    } catch (error) {
        console.error('Audio creation error:', error);
        res.status(500).json({ error: error.message || 'Internal Bridge Error' });
    }
});

// POST Create Quiz
app.post('/api/studio/quiz', async (req, res) => {
    const { topic } = req.body;
    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client not initialized' });
        }

        console.log(`Triggering Quiz Generation for topic: ${topic}`);
        const response = await mcpClient.callTool({
            name: "quiz_create",
            arguments: {
                notebook_id: notebookId,
                question_count: 5,
                difficulty: "medium",
                confirm: true
            },
        }, undefined, { timeout: 180000 });

        res.json({ status: 'success', message: 'Quiz generation started', response });
    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ error: error.message || 'Internal Bridge Error' });
    }
});

// POST Create Flashcards
app.post('/api/studio/flashcards', async (req, res) => {
    const { topic } = req.body;
    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client not initialized' });
        }

        console.log(`Triggering Flashcards Generation for topic: ${topic}`);
        const response = await mcpClient.callTool({
            name: "flashcards_create",
            arguments: {
                notebook_id: notebookId,
                difficulty: "medium",
                confirm: true
            },
        }, undefined, { timeout: 180000 });

        res.json({ status: 'success', message: 'Flashcards generation started', response });
    } catch (error) {
        console.error('Flashcards creation error:', error);
        res.status(500).json({ error: error.message || 'Internal Bridge Error' });
    }
});

// ==========================================
// DYNAMIC GENERATION ENDPOINTS (via notebook_query)
// ==========================================

// POST Generate Dynamic Flashcards
app.post('/api/generate/flashcards', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client não inicializado. Verifique a conexão com o NotebookLM.' });
        }

        console.log(`[Generate] Flashcards for topic: "${topic}"`);

        const prompt = getDynamicFlashcardsPrompt(topic);

        const mcpPromise = mcpClient.callTool({
            name: "notebook_query",
            arguments: {
                notebook_id: notebookId,
                query: prompt
            },
        }, undefined, { timeout: 180000 });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao gerar flashcards')), 180000)
        );

        const response = await Promise.race([mcpPromise, timeoutPromise]);

        if (response && response.content && Array.isArray(response.content)) {
            const textContent = response.content.find(c => c.type === 'text');
            if (textContent && textContent.text) {
                // Try to parse nested JSON from MCP response
                let rawText = textContent.text;
                try {
                    const outerParsed = JSON.parse(rawText);
                    rawText = outerParsed.answer || outerParsed.content || outerParsed.text || rawText;
                } catch (e) { /* use rawText as-is */ }

                const parsed = extractJSON(rawText);

                if (parsed && parsed.flashcards && Array.isArray(parsed.flashcards)) {
                    console.log(`[Generate] ✅ ${parsed.flashcards.length} flashcards generated`);
                    return res.json({
                        status: 'success',
                        flashcards: parsed.flashcards,
                        source: 'NotebookLM (LIVE AI)'
                    });
                }

                // Fallback: try to build flashcards from raw text
                console.warn('[Generate] Could not parse JSON, attempting text extraction...');
                const lines = rawText.split('\n').filter(l => l.trim());
                const flashcards = [];
                for (let i = 0; i < lines.length - 1; i += 2) {
                    const front = lines[i].replace(/^\d+[\.\)]\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                    const back = lines[i + 1].replace(/^[-–]\s*/, '').trim();
                    if (front && back) {
                        flashcards.push({ front, back });
                    }
                }

                if (flashcards.length > 0) {
                    return res.json({
                        status: 'success',
                        flashcards,
                        source: 'NotebookLM (parsed from text)'
                    });
                }

                // Last resort: return raw text as single card
                return res.json({
                    status: 'success',
                    flashcards: [{ front: `Resumo: ${topic}`, back: rawText.substring(0, 500) }],
                    source: 'NotebookLM (raw fallback)'
                });
            }
        }

        res.status(500).json({ error: 'Resposta vazia do NotebookLM' });
    } catch (error) {
        console.error('[Generate] Flashcards error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar flashcards' });
    }
});

// POST Generate Dynamic Quiz Questions
app.post('/api/generate/quiz', async (req, res) => {
    const { topic, count = 5 } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client não inicializado. Verifique a conexão com o NotebookLM.' });
        }

        console.log(`[Generate] Quiz (${count} questions) for topic: "${topic}"`);

        const prompt = getDynamicQuizPrompt(topic, count);

        const mcpPromise = mcpClient.callTool({
            name: "notebook_query",
            arguments: {
                notebook_id: notebookId,
                query: prompt
            },
        }, undefined, { timeout: 180000 });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao gerar quiz')), 180000)
        );

        const response = await Promise.race([mcpPromise, timeoutPromise]);

        if (response && response.content && Array.isArray(response.content)) {
            const textContent = response.content.find(c => c.type === 'text');
            if (textContent && textContent.text) {
                let rawText = textContent.text;
                // Unwrap potential nested JSON from MCP response
                try {
                    const outerParsed = JSON.parse(rawText);
                    rawText = outerParsed.answer || outerParsed.content || outerParsed.text || rawText;
                } catch (e) { /* use rawText as-is */ }

                const parsed = extractJSON(rawText);

                if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
                    // Validate structure
                    const validQuestions = parsed.questions.filter(q =>
                        q.text && q.options && Array.isArray(q.options) &&
                        q.options.length >= 2 && typeof q.correct === 'number'
                    );

                    if (validQuestions.length > 0) {
                        console.log(`[Generate] ✅ ${validQuestions.length} quiz questions generated`);
                        return res.json({
                            status: 'success',
                            questions: validQuestions,
                            source: 'NotebookLM (LIVE AI)'
                        });
                    }
                }

                console.warn('[Generate] Could not parse quiz JSON from response');
                return res.status(500).json({
                    error: 'Não foi possível extrair questões da resposta da IA. Tente novamente.',
                    raw_preview: rawText.substring(0, 200)
                });
            }
        }

        res.status(500).json({ error: 'Resposta vazia do NotebookLM' });
    } catch (error) {
        console.error('[Generate] Quiz error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar quiz' });
    }
});
// POST Generate Dynamic Slides (9:16 vertical format)
app.post('/api/generate/slides', async (req, res) => {
    const { topic, count = 6 } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic é obrigatório' });
    }

    try {
        if (!mcpClient) {
            return res.status(503).json({ error: 'MCP Client não inicializado. Verifique a conexão com o NotebookLM.' });
        }

        console.log(`[Generate] Slides (${count}) for topic: "${topic}"`);

        const prompt = getDynamicSlidesPrompt(topic, count);

        const mcpPromise = mcpClient.callTool({
            name: "notebook_query",
            arguments: {
                notebook_id: notebookId,
                query: prompt
            },
        }, undefined, { timeout: 180000 });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao gerar slides')), 180000)
        );

        const response = await Promise.race([mcpPromise, timeoutPromise]);

        if (response && response.content && Array.isArray(response.content)) {
            const textContent = response.content.find(c => c.type === 'text');
            if (textContent && textContent.text) {
                let rawText = textContent.text;
                try {
                    const outerParsed = JSON.parse(rawText);
                    rawText = outerParsed.answer || outerParsed.content || outerParsed.text || rawText;
                } catch (e) { /* use rawText as-is */ }

                console.log('[Generate] Raw response received (first 100 chars):', rawText.substring(0, 100));

                const parsed = extractJSON(rawText);

                if (parsed && parsed.slides && Array.isArray(parsed.slides)) {
                    // Validate and normalize slides
                    const validSlides = parsed.slides.filter(s => s.title).map(s => ({
                        title: s.title,
                        subtitle: s.subtitle || '',
                        blocks: Array.isArray(s.blocks) ? s.blocks : [{ type: 'text', content: s.content || '' }]
                    }));

                    if (validSlides.length > 0) {
                        console.log(`[Generate] ✅ ${validSlides.length} slides generated`);
                        return res.json({
                            status: 'success',
                            slides: validSlides,
                            source: 'NotebookLM (LIVE AI)'
                        });
                    }
                }

                // Fallback: parse from markdown-style text
                console.warn('[Generate] Could not parse slides JSON, trying text fallback...');
                const slideBlocks = rawText.split(/(?=# )/g).filter(s => s.trim().length > 10);
                if (slideBlocks.length > 0) {
                    const fallbackSlides = slideBlocks.map(block => {
                        const lines = block.split('\n');
                        const title = lines[0].replace(/^#+\s*/, '').trim();
                        const content = lines.slice(1).join('\n').trim();
                        return {
                            title,
                            subtitle: '',
                            blocks: [{ type: 'text', content }]
                        };
                    });
                    return res.json({
                        status: 'success',
                        slides: fallbackSlides,
                        source: 'NotebookLM (parsed from text)'
                    });
                }

                return res.status(500).json({ error: 'Não foi possível extrair slides da resposta.' });
            }
        }

        res.status(500).json({ error: 'Resposta vazia do NotebookLM' });
    } catch (error) {
        console.error('[Generate] Slides error:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar slides' });
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
