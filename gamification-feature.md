# Gamificação - Sistema de XP e Badges

## Goal
Adicionar sistema de pontos/XP, badges e progresso para aumentar engajamento do aluno.

## Tasks

- [ ] Task 1: Criar hook `useGamification.ts` com estado de XP, level e badges → Verificar: Arquivo existe em src/hooks/useGamification.ts
- [ ] Task 2: Adicionar campos XP/level no AppContext (userProgress, addXP, checkBadges) → Verificar: AppContext exporta novas funções
- [ ] Task 3: Criar componente `ProgressBar.tsx` para exibir XP atual e level → Verificar: Componente renderiza no Dashboard
- [ ] Task 4: Criar componente `BadgeDisplay.tsx` para mostrar badges conquistados → Verificar: Badges aparecem no perfil
- [ ] Task 5: Adicionar lógica de rewards nos serviços (quiz completo = +XP, exercício correto = +XP) → Verificar: Verificar no answerValidator.js
- [ ] Task 6: Persistir progresso no localStorage via useLocalStorage → Verificar: Dados sobrevivem refresh

## Done When
- [ ] Usuário ganha XP ao completar quizzes e exercícios
- [ ] Level up a cada 100 XP (ou threshold configurável)
- [ ] Badges aparecem ao atingir conquistas específicas
- [ ] Interface mostra progresso no header/perfil