# Guidorizzi Cálculo I — Agent Guidelines

## Project Overview

Math learning platform for Cálculo I based on Hamilton Guidorizzi textbook.
AI-powered chat, interactive graphs (mafs), quizzes, flashcards, and slide presentation mode.

## Tech Stack

- **Runtime**: Vite 7, Node.js ≥18, ES Modules (`"type": "module"`)
- **Language**: TypeScript (`.tsx`, `.ts`) + JavaScript (`.jsx`, `.js`)
- **Framework**: React 19 with SWC
- **Styling**: Tailwind CSS v4, Framer Motion
- **Testing**: Vitest + jsdom
- **Math**: KaTeX, react-markdown, remark-math, rehype-katex
- **AI**: Groq SDK, Google GenAI

---

## Build, Lint, and Test Commands

### Development

```bash
npm run dev              # Start Vite dev server
npm run dev:all         # Dev + Express bridge (concurrently)
npm run bridge          # Run Express bridge server (node server.js)
npm run start           # Run production Express server
npm run preview         # Preview production build
```

### Build

```bash
npm run build           # Vite production build
```

### Linting

```bash
npm run lint            # ESLint on all files
```

### Testing

```bash
npm run test            # Run all tests in watch mode
npm run test:run        # Run all tests once
npm run test:coverage   # Run tests with coverage report

# Run a single test file
vitest run src/__tests__/mathPreprocessor.test.js
vitest run src/__tests__/answerValidator.test.js

# Run tests matching a pattern
vitest run --grep "mathPreprocessor"
```

---

## Code Style Guidelines

### Formatting

- **Prettier**: Not configured — rely on ESLint and manual formatting
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Double quotes (`"`)
- **Line width**: Soft 100-char limit

### TypeScript

- **Target**: ES2020, ESNext modules
- Path aliases: None configured (use relative imports)
- Use explicit types for function parameters and return types
- Prefer `.ts`/`.tsx` for new files over `.js`/`.jsx`

### ESLint Rules

- Extends: `js.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`
- `no-unused-vars`: Error (except variables starting with `^[A-Z_]`)
- React hooks rules enabled
- React refresh allowed

### File Naming

| Element          | Convention      | Example                     |
| ---------------- | --------------- | --------------------------- |
| TypeScript       | PascalCase      | `App.tsx`, `useSmartChat.ts`|
| JavaScript       | camelCase       | `mathPreprocessor.js`      |
| React components | PascalCase      | `ChatGuidorizzi.tsx`        |
| Hooks            | camelCase       | `useSmartChat.ts`          |

### Imports

- **Order**: external → relative (`./`, `../`)
- Group: React imports, then services, then components, then utils
- No barrel exports — import from specific modules

### Error Handling

- Use ErrorBoundary for React component trees
- Custom hooks should use `useErrorHandler` for async errors
- API errors: return meaningful HTTP status codes + error messages
- Never silently catch and ignore errors

### React Patterns

- Use functional components with hooks
- Context for global state (`AppContext`, `ThemeContext`)
- Custom hooks for reusable logic (`useSmartChat`, `useLocalStorage`)
- `clsx` + `tailwind-merge` for conditional classes

### Math Content

- KaTeX for inline/display math
- Wrap math in `$$...$$` for display, `$...$` for inline
- Use `remark-math` and `rehype-katex` for markdown processing
- Preprocess user input with `mathPreprocessor.js`

### Security

- **NEVER** commit API keys or secrets (check `.env` files)
- Validate all API inputs (Groq/GenAI calls)
- Sanitize user content before rendering
- Use Helmet middleware for Express

---

## Architecture

### Source Structure (`src/`)

```
├── components/      # React UI components
│   ├── ChatGuidorizzi.tsx     # Main AI chat
│   ├── InteractiveGraph.jsx   # Mafs integration
│   ├── QuizMode.jsx           # Quiz functionality
│   ├── Flashcards.jsx         # Flashcard system
│   ├── PresentationMode.jsx   # Slide presentation
│   └── ...
├── context/          # React contexts
│   ├── AppContext.jsx         # Global app state
│   └── ThemeContext.tsx       # Theme (light/dark)
├── hooks/            # Custom React hooks
│   ├── useSmartChat.ts         # AI chat logic
│   ├── useLocalStorage.ts      # Persistence
│   └── ...
├── services/         # Business logic
│   ├── api.js                # API calls to AI providers
│   ├── prompts.js            # System prompts
│   ├── promptTemplates.js    # Template system
│   ├── answerValidator.js    # Quiz answer validation
│   └── chatContext.js        # Conversation context
├── utils/            # Utilities
│   ├── mathPreprocessor.js   # Math input preprocessing
│   └── jsonParser.js         # JSON handling
├── lib/              # Helper libraries
│   └── notebookConsole.js    # Console output
└── __tests__/        # Test files
    ├── mathPreprocessor.test.js
    ├── answerValidator.test.js
    └── jsonParser.test.js
```

### API Integration

- **Groq**: Primary LLM provider (fast inference)
- **Google GenAI**: Backup/specialized tasks
- All API calls go through `src/services/api.js`
- Prompts in `src/services/prompts.js` and `src/services/promptTemplates.js`

### State Management

- React Context for global state (theme, user preferences)
- Local component state for UI-only state
- `useLocalStorage` hook for persistence

---

## Review Focus

- **Math rendering**: KaTeX expressions must render correctly
- **API errors**: Handle gracefully with user feedback
- **State consistency**: Context updates should not cause unnecessary re-renders
- **Testing**: New features should have corresponding test files
- **Bundle size**: Keep vendor chunks in check (`vendor-react`, `vendor-motion`, `vendor-math`)
- **PWA**: Service worker registers automatically via `vite-plugin-pwa`