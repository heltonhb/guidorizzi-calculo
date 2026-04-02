/**
 * Middleware de autenticação por API key.
 */
export const createAuthMiddleware = (apiKey, nodeEnv) => {
    return (req, res, next) => {
        const providedKey = req.headers['x-api-key'] || req.query.apiKey;

        // Em desenvolvimento sem API_KEY definida, permite sem auth
        if (nodeEnv === 'development' && !apiKey) {
            return next();
        }

        // Em produção, API_KEY é obrigatória
        if (!apiKey && nodeEnv === 'production') {
            console.error('[SECURITY] API_KEY não definida em produção!');
            return res.status(500).json({ error: 'Configuração de segurança ausente no servidor.' });
        }

        if (apiKey && providedKey && providedKey === apiKey) {
            return next();
        }

        return res.status(401).json({ error: 'API key inválida ou ausente. Use header X-API-Key.' });
    };
};
