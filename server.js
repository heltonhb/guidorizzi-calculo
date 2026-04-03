import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { Groq } from 'groq-sdk';
import 'dotenv/config';

import { createAuthMiddleware } from './server/middleware/auth.js';
import { loadContent } from './server/services/ragService.js';
import { createQueryRouter } from './server/routes/query.js';
import { createGenerateRouter } from './server/routes/generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ───────────────────────────────────────────
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
const apiKey = process.env.API_KEY;

// ─── Groq Client ──────────────────────────────────────
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.error('[CONFIG] GROQ_API_KEY não definido no .env');
    process.exit(1);
}
const groq = new Groq({ apiKey: groqApiKey });
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ─── RAG: carregar conteúdo local ─────────────────────
loadContent(__dirname);

// ─── Express App ──────────────────────────────────────
const app = express();

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
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));

app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }
    if (nodeEnv === 'production') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        if (nodeEnv === 'development') return callback(null, true);
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

// ─── Middleware ────────────────────────────────────────
app.use('/api/', createAuthMiddleware(apiKey, nodeEnv));

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Muitas requisições (Rate Limit). Aguarde 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
}));

// ─── Routes ───────────────────────────────────────────
app.get('/', (_req, res) => {
    res.send('Guidorizzi API Bridge is ACTIVE (Groq/Llama-3). Use POST /api/query to interact.');
});

app.use('/api/query', createQueryRouter(groq, GROQ_MODEL));
app.use('/api/generate', createGenerateRouter(groq, GROQ_MODEL));

// SPA fallback em produção
if (nodeEnv === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.get(/.*/, (req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ─── Start ────────────────────────────────────────────
app.listen(port, () => {
    console.log(`Guidorizzi API Bridge running at http://localhost:${port}`);
});
