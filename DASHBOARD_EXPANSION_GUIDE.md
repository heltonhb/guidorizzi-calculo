# Guia de Expansão — Aplicar Estilos Brutalist aos Outros Dashboards

## 📌 Visão Geral

O dashboard padrão foi atualizado com o novo design brutalist. Para manter consistência visual, você pode aplicar as mesmas mudanças aos outros dois dashboards:

- `DashboardBrutalistPremium.tsx`
- `DashboardBrutalistExperimental.tsx`

---

## 🔧 Checklist de Aplicação

### 1. **Wrapper Principal com `circuit-bg`**

```tsx
// ANTES
return (
  <motion.div>
    {/* conteúdo */}
  </motion.div>
);

// DEPOIS  
return (
  <div className="circuit-bg rounded-2xl p-8 -mx-4 sm:mx-0">
    <motion.div>
      {/* conteúdo */}
    </motion.div>
  </div>
);
```

### 2. **Titles com `header-clip`**

```tsx
// ANTES
<div className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 text-black px-6 py-4 font-black text-2xl rounded-xl shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
  Título
</div>

// DEPOIS
<div className="header-clip bg-[#FF9F1C] text-[#1A1A1A] px-6 py-4 font-black text-2xl tracking-widest uppercase brutal-shadow">
  Título
</div>
```

### 3. **Cards com `brutal-shadow`**

```tsx
// ANTES
className="bg-zinc-950 border-2 rounded-lg shadow-[4px_4px_0_rgba(255,255,255,0.2)]"

// DEPOIS
className="bg-[#333333] border-4 brutal-shadow"
```

### 4. **Atualizações de Cores**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Backgrounds | `zinc-950`, `zinc-900` | `#1A1A1A`, `#333333` |
| Borders | `white/20` | Brand colors |
| Text Accent | `orange-400` | `#FF9F1C` |
| Secondary | `zinc-400` | `#00E5FF` |
| Highlights | `yellow-300` | `#CCFF00` |
| Shadows | `shadow-[...]` | `brutal-shadow` |

### 5. **Cores das Bordas por Card Type**

Use esta mapeamento consistente:

```javascript
const colorMap = {
  cyan: {
    border: "border-[#00E5FF]",
    text: "text-[#00E5FF]",
    bg: "bg-cyan-950/30",
    shadow: "brutal-shadow",
  },
  orange: {
    border: "border-[#FF9F1C]",
    text: "text-[#FF9F1C]",
    bg: "bg-orange-950/30",
    shadow: "brutal-shadow",
  },
  lime: {
    border: "border-[#CCFF00]",
    text: "text-[#CCFF00]",
    bg: "bg-lime-950/30",
    shadow: "brutal-shadow",
  },
  cyan_alt: {
    border: "border-[#00E5FF]",
    text: "text-[#00E5FF]",
    bg: "bg-cyan-950/30",
    shadow: "brutal-shadow",
  }
};
```

---

## 🎯 Prioridade de Aplicação

### Recomendado
1. ✅ **Dashboard.tsx** ← Feito
2. ⏳ **DashboardBrutalistPremium.tsx** ← Próximo
3. ⏳ **DashboardBrutalistExperimental.tsx** ← Por último

### Por que?
- Dashboard padrão é mais visível
- Premium é a segunda opção popular
- Experimental é para usuários avançados

---

## 📋 Scripts de Busca e Substituição

Se preferir usar busca/substituição para acelerar:

### Encontrar todos os `shadow-[...]` specificos
```regex
shadow-\[[\w\-\.\(\,\)]+\]
```
**Substituir por:** `brutal-shadow` ou `brutal-shadow-sm`

### Encontrar todos os `bg-zinc-950` e `bg-zinc-900`
```regex
bg-(zinc-950|zinc-900)
```
**Substituir por:** `bg-[#1A1A1A]` ou `bg-[#333333]`

### Encontrar todos os `rounded-` (se quiser remover arredondamentos)
```regex
\srounded-[\w\-]+
```
**Substituir por:** (espaço vazio) para estilo mais angular

---

## 🧪 Testing Checklist

Após aplicar mudanças a cada dashboard:

- [ ] Visual
  - [ ] Title com header-clip renderiza corretamente
  - [ ] Circuit-bg padrão visível
  - [ ] Shadows brutais aparecem corretamente
  
- [ ] Interactivo
  - [ ] Hover effects funcionam
  - [ ] Cards são clicáveis
  - [ ] Search funciona (se aplicável)
  
- [ ] Responsive
  - [ ] Mobile view se adapta bem
  - [ ] Padding/margins apropriados
  - [ ] Text não overflow

- [ ] Acessibilidade
  - [ ] Focus rings visíveis
  - [ ] Contraste de cor suficiente
  - [ ] Keyboard navigation funciona

---

## 🎨 Novas Classes CSS Disponíveis

Todas essas classes estão agora disponíveis globalmente em `index.css`:

```css
.circuit-bg { /* Padrão de grid com circuitos */ }
.brutal-shadow { /* 6px black shadow */ }
.brutal-shadow-sm { /* 4px black shadow */ }
.header-clip { /* Clip path angular */ }
.btn-extruded { /* 3D button effect */ }
```

---

## 💡 Dicas Adicionais

1. **Manter Animações** — As transições Framer Motion devem continuar funcionando
2. **Testar com DevTools** — Use inspector para verificar classes aplicadas
3. **Versão Anterior** — Commits anteriores podem ser consultados se algo quebrar
4. **Consistência** — Manter mesmo spacing, timing, e hover behaviors

---

## 📞 Referência Rápida

Se tiver dúvidas, consulte:
- `src/components/Dashboard.tsx` — Implementação de referência
- `src/index.css` — Definições das classes
- `DASHBOARD_BRUTALIST_UPDATE.md` — Documentação completa

---

**Última atualização:** 8 de abril de 2026
