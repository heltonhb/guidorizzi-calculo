# Testing Strategy - Guidorizzi App

## Core Frameworks
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **DOM Simulation**: jsdom

## Coverage Thresholds
The project maintains a high coverage standard (build fails if not met):
- **Lines**: 60%
- **Functions**: 60%
- **Branches**: 50%
- **Statements**: 60%

## Execution Commands
- `npm run test`: Run Vitest in watch mode.
- `npm run test:run`: Run all tests once.
- `npm run test:coverage`: Generate code coverage reports.

## Test Structure
Tests are located in `src/__tests__/` and following the Triple-A pattern (Arrange, Act, Assert).
Mocking is used for API services (`src/services/api.js`) and AI engines.
