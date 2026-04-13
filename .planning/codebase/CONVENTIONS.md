# Coding Conventions - Guidorizzi App

## General Standards
- **Indentation**: 2 spaces.
- **Semicolons**: Required.
- **Quotes**: Double quotes (`"`) for strings and JSX attributes.
- **Imports**: Relative paths only (no path aliases).
- **Environment**: ESM strictly (`"type": "module"`).

## Naming Conventions
- **React Components**: PascalCase (e.g., `ChatGuidorizzi.tsx`).
- **TypeScript Files**: PascalCase (e.g., `App.tsx`).
- **JavaScript Files**: camelCase (e.g., `mathPreprocessor.js`).
- **Hooks**: `use` prefix (e.g., `useSmartChat.ts`).
- **Tests**: `*.test.js` or `*.test.ts` in `src/__tests__/`.

## Component Patterns
- Functional components with Hooks.
- Framer Motion for animations.
- Tailwind CSS v4 for styling (Utility-first).

## Math Handling
- Always use the `mathPreprocessor.js` utility before rendering math strings in KaTeX.
- Display math: `$$ ... $$`, Inline math: `$ ... $`.
