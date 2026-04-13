# Technical Concerns - Guidorizzi App

## Performance
- **Math Rendering**: Heavy use of KaTeX and Mafs on a single page can impact TBT (Total Blocking Time). Lazy loading is implemented in `App.tsx` to mitigate this.
- **RAG Latency**: The manual RAG search through `content.json` happens on the main thread of the bridge. As the data grows, this may need to migrate to a vector database (e.g., Neon Postgres + pgvector).

## AI Reliability
- **Hallucinations**: While RAG provides context, the LLM (Llama 3) may still hallucinate complex Calculus proofs. The `answerValidator.js` is critical here.
- **Rate Limiting**: Groq API has strict rate limits. The `express-rate-limit` middleware is configured but may need adjustment for high-traffic scenarios.

## Infrastructure
- **Env Dependency**: The project is heavily dependent on correctly configured `.env` keys. Build-time validation for `VITE_` keys is required.
- **State Persistence**: Currently relies on LocalStorage via `useLocalStorage.js`. No cloud-based user sync is present in the current version.

## Security
- **API Visibility**: Frontend `VITE_GROQ_API_KEY` exists in some builds; best practice is to route ALL AI calls through the bridge to hide the key.
