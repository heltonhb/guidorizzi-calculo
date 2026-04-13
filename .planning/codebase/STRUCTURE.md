# Project Structure - Guidorizzi App

## Root Directory
- `server.js`: Main Express entry point and bridge configuration.
- `package.json`: Dependency map and build scripts.
- `vitest.config.ts`: Testing environment configuration.

## Source Directory (`src/`)
- `components/`: React UI components grouped by feature (Chat, Quiz, etc.).
- `context/`: React context providers for global state and theming.
- `hooks/`: Custom React hooks (e.g., `useSmartChat`, `useErrorHandler`).
- `services/`: API client logic, LLM prompt definitions, and validation logic.
- `utils/`: Common helpers like the `mathPreprocessor.js`.
- `data/`: The primary knowledge base (`content.json`).
- `__tests__/`: Unit and integration tests.

## Backend Directory (`server/`)
- `routes/`: Express API endpoints (Query, Generate).
- `services/`: Backend-specific logic (RAG service).
- `middleware/`: Authentication and request validation.

## Assets
- `public/`: Static assets (Logos, Icons).
- `src/assets/`: Stylesheets and design tokens.
