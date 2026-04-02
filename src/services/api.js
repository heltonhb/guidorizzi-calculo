// URL da API - usa variável de ambiente em produção
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

/**
 * Configurações de timeout e retry
 */
const config = {
    timeout: 60000, // 60 segundos para requisições normais
    timeoutQuery: 180000, // 180 segundos para queries (processamento MCP)
    maxRetries: 2,
    retryDelay: 1000, // ms
};

/**
 * Sanitizar erro para evitar circular references
 * Extrai apenas a mensagem de texto do erro
 */
const sanitizeError = (error) => {
    // Se for string, retorna direto
    if (typeof error === 'string') return error;

    // Se for Error, extrai mensagem
    if (error instanceof Error) {
        return error.message || String(error);
    }

    // Se tem propriedade message, usa
    if (error?.message) return String(error.message);

    // Fallback: tenta converter para string
    try {
        return String(error)?.substring(0, 200) || 'Erro desconhecido';
    } catch {
        return 'Erro desconhecido';
    }
};

/**
 * Tratamento centralizado de erros de API com proteção contra circular references
 */
const handleApiError = (error, endpoint) => {
    const message = sanitizeError(error);
    console.error(`❌ API Error [${endpoint}]:`, message);
    throw new Error(`Falha ao conectar com ${endpoint}: ${message}`);
};

/**
 * Wrapper para timeout de requisições com retry
 */
const fetchWithTimeout = (url, options = {}, timeout = config.timeout, retryCount = 0) => {
    const apiKey = import.meta.env?.VITE_API_KEY;

    options.headers = {
        ...(options.headers || {}),
        ...(apiKey ? { 'X-API-Key': apiKey } : {})
    };

    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Requisição expirou')), timeout)
        ),
    ]).catch(error => {
        // Retry em caso de timeout ou erro de conexão
        if (retryCount < config.maxRetries && error.message.includes('expirou')) {
            const delayMs = config.retryDelay * Math.pow(2, retryCount); // Exponential backoff
            console.warn(`⏳ Tentativa ${retryCount + 1} falhou, aguardando ${delayMs}ms antes de retry...`);
            return new Promise(resolve => setTimeout(resolve, delayMs))
                .then(() => fetchWithTimeout(url, options, timeout, retryCount + 1));
        }
        throw error;
    });
};

export const queryNotebook = async (query) => {
    try {
        if (!query) {
            throw new Error('query é obrigatória');
        }

        const response = await fetchWithTimeout(`${API_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        }, config.timeoutQuery); // Use timeout maior para queries

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `Erro HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'queryNotebook');
    }
};


// Studio functions removed — endpoints não existem no backend atual.

/**
 * Gera flashcards dinâmicos via notebook_query
 * Retorna { flashcards: [{ front, back }], source }
 */
export const generateFlashcards = async (topic) => {
    try {
        if (!topic) throw new Error('Topic é obrigatório');

        const response = await fetchWithTimeout(`${API_URL}/generate/flashcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic }),
        }, config.timeoutQuery);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `Erro HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'generateFlashcards');
    }
};

/**
 * Gera questões de quiz dinâmicas via notebook_query
 * Retorna { questions: [{ text, options, correct, explanation }], source }
 */
export const generateQuizQuestions = async (topic, count = 5) => {
    try {
        if (!topic) throw new Error('Topic é obrigatório');

        const response = await fetchWithTimeout(`${API_URL}/generate/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, count }),
        }, config.timeoutQuery);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `Erro HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'generateQuizQuestions');
    }
};

/**
 * Gera slides dinâmicos 9:16 via notebook_query
 * Retorna { slides: [{ title, subtitle, blocks: [{ type, content }] }], source }
 */
export const generateSlides = async (topic, count = 6) => {
    try {
        if (!topic) throw new Error('Topic é obrigatório');

        const response = await fetchWithTimeout(`${API_URL}/generate/slides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, count }),
        }, config.timeoutQuery);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `Erro HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleApiError(error, 'generateSlides');
    }
};
