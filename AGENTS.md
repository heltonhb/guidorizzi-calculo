# Guidorizzi Cálculo I — Agent Guidelines

Math learning platform for Cálculo I based on Hamilton Guidorizzi textbook.
AI-powered chat, interactive graphs (mafs), quizzes, flashcards, and slide presentation mode.

## Tech Stack

- **Runtime**: Vite 7, Node.js ≥18, ES Modules (`"type": "module"`)
- **Language**: TypeScript (`.tsx`, `.ts`) + JavaScript (`.jsx`, `.js`)
- **Framework**: React 19 with SWC
- **Styling**: Tailwind CSS v4, Framer Motion
- **Testing**: Vitest + jsdom
- **Math**: KaTeX, react-markdown, remark-math, rehype-katex
- **AI**: Groq SDK (backend), Google GenAI (frontend)

## Developer Commands

```bash
# Development
npm run dev              # Vite client (localhost:5173)
npm run bridge           # Express backend (localhost:3001)
npm run dev:all          # Both concurrently (use this)

# Build & Quality
npm run build            # Production build
npm run lint             # ESLint
npm run lint --fix       # Auto-fix lint issues

# Testing
npm run test             # Watch mode
npm run test:run         # Run once
npm run test:coverage    # Coverage report

# Single test file or pattern
vitest run src/__tests__/mathPreprocessor.test.js
vitest run --grep "pattern"
```

## Required Setup

1. Copy `.env.example` to `.env` and add keys:
   - `GROQ_API_KEY` (backend, in server.js) — get from https://console.groq.com
   - `VITE_GROQ_API_KEY` (frontend build)
   - `VITE_GOOGLE_API_KEY` (frontend build)

2. **Critical**: Backend expects `GROQ_API_KEY` (not `VITE_GROQ_API_KEY`) in server.js line 25. Frontend uses `VITE_GROQ_API_KEY`.

## Code Style

- **Prettier**: Not configured — ESLint only
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Double quotes (`"`)
- **Path aliases**: None — use relative imports

### ESLint Rules

- `no-unused-vars`: Error, but **exempts** variables starting with `^[A-Z_]` AND `motion`, `AnimatePresence`
- React hooks rules enabled
- React refresh allowed

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| TypeScript | PascalCase | `App.tsx`, `useSmartChat.ts` |
| JavaScript | camelCase | `mathPreprocessor.js` |
| React components | PascalCase | `ChatGuidorizzi.tsx` |

## Architecture

```
src/
├── components/      # React UI (ChatGuidorizzi, QuizMode, Flashcards, PresentationMode, InteractiveGraph)
├── context/         # AppContext.jsx, ThemeContext.tsx
├── hooks/           # useSmartChat.ts, useLocalStorage.js, useErrorHandler.js
├── services/         # api.js, prompts.js, promptTemplates.js, answerValidator.js, chatContext.js
├── utils/           # mathPreprocessor.js, jsonParser.js
├── data/            # content.json (RAG content)
└── __tests__/       # Test files

server/
├── routes/          # query.js, generate.js
├── services/        # ragService.js
└── middleware/      # auth.js
```

### API Integration

- **Frontend → Backend**: `src/services/api.js` calls `/api/query` and `/api/generate/*`
- **Backend**: Express server (server.js) on port 3001
- **Groq**: Primary LLM (configured in server.js)
- **GenAI**: Available in frontend services

## Math Content

- KaTeX for inline/display math
- Display: `$$...$$`, inline: `$...$`
- Preprocess user input with `mathPreprocessor.js` before rendering

## Testing

- Coverage thresholds (build fails if not met):
  - Lines: 60%, Functions: 60%, Branches: 50%, Statements: 60%
- Test pattern: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`
- Excluded from coverage: `node_modules/`, `src/__tests__/`, `omniroute/**`

## Bundle Optimization

Vendor chunks are split automatically:
- `vendor-react`: react, react-dom
- `vendor-motion`: framer-motion
- `vendor-math`: katex, react-markdown, remark-math, rehype-katex
- `vendor-ai`: groq-sdk, @google/genai

## Common Issues

- **Port 3001 in use**: `lsof -ti:3001 | xargs kill -9`
- **Missing API keys**: Check `.env` exists AND `GROQ_API_KEY` is set for backend
- **Build fails on coverage**: Increase coverage or adjust thresholds in `vitest.config.ts`
