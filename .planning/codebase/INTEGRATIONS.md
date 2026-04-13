# Integrations - Guidorizzi App

## External APIs

### 1. Groq Cloud API
- **Purpose**: Powering the ChatGuidorizzi RAG system and prompt generation.
- **Model**: `llama-3.3-70b-versatile` (via `GROQ_MODEL` env var).
- **Usage**: Invoked via the Express backend bridge to protect API keys.

### 2. Google Generative AI (Gemini)
- **Purpose**: Client-side AI interactions and specialized tasks.
- **Usage**: Configured via `VITE_GOOGLE_API_KEY`.

## Internal Services

### 1. Guidrozzi RAG Service
- **Source**: `src/data/content.json`
- **Logic**: Loads Calculus I content into memory to provide context to LLM queries.
- **Backend Loader**: `server/services/ragService.js`
