# 🔧 Debug - Problemas com NotebookLM

## 📊 Status Atual

✅ **Console instalado**: NotebookLM commands funcionando  
✅ **Chat capturando**: Todas as mensagens sendo armazenadas  
✅ **Context enviando**: Dados do aluno sendo incluídos nos prompts  
❌ **RespostasNotebookLM**: Retornando fallback em vez de resposta real  

---

## 🚨 O Problema

Quando você faz uma pergunta:

```
Query: "faça um resumo sobre funções trigonométricas"

❌ Response: "Estou processando sua dúvida... No momento, o Guidorizzi está indisponível..."
```

Isso significa: **O MCP não está retornando respostas válidas**.

---

## 🔍 Passos para Debugar

### 1️⃣ Verificar se MCP está conectado

DevTools Console:
```javascript
// Ver último erro capturado
const responses = JSON.parse(localStorage.notebookResponses || '[]');
const last = responses[responses.length - 1];
console.log('Última resposta:', last);
console.log('Tem erro?', last.isError);
console.log('Mensagem:', last.error);
```

### 2️⃣ Testar API bridge direto

Terminal:
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Qual é a derivada de x²?", "notebookId":"b7988097-f2a3-4a68-a71d-b2d424d96b9a"}'
```

**Expected response:**
```json
{
  "status": "success",
  "answer": "A derivada de x² é 2x...",
  "source": "NotebookLM (LIVE AI)"
}
```

Se retornar fallback, o MCP não está configurado.

### 3️⃣ Verificar logs do servidor

```bash
# Ver output do server.js
tail -100 /tmp/dev.log | grep -E "(MCP|query|error|Live)"
```

Procure por:
- `[MCP] ✅ Live response received` → Funciona!
- `[MCP] Live query failed` → Falha (vai pro fallback)
- `MCP Client not available` → MCP não inicializou

---

## 🛠️ Possíveis Causas

### A. MCP não inicializou
```javascript
// DevTools Console:
window.NotebookLM
// Se undefined, console não instalou
```

**Solução:**
```javascript
location.reload()  // Recarrega página
```

### B. MCP conectou mas ferramenta não existe
O MCP pode estar reportando que `notebook_query` não existe.

**Solução:**
```bash
# Listar ferramentas disponíveis
# Rodar no terminal onde MCP está rodando:
notebooklm-mcp --list-tools
```

### C. Timeout muito curto
MCP responde lentamente, requisição expira antes.

**Status atual:** 30000ms (30 segundos)

Se ver muitos timeouts, aumentar em `server.js`:
```javascript
// Linha ~75:
const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('MCP query timeout')), 60000)  // 1 minuto
);
```

### D. Notebook ID incorreto
Se o Notebook ID do Guidorizzi estiver errado, MCP não encontra nada.

**Verificar em `server.js`:**
```javascript
const GUIDORIZZI_NOTEBOOK_ID = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';
```

---

## ✅ Checklist de Verificação

- [ ] `NotebookLM.help()` mostra menu no console?
- [ ] `localStorage.notebookResponses` tem dados?
- [ ] Curl test retorna JSON válido (não fallback)?
- [ ] DevTools mostra `[MCP] ✅ Live response` ou `[MCP] Live query failed`?
- [ ] MCP process está rodando (ver banner FastMCP 3.1.0)?
- [ ] Port 3001 (API Bridge) está ouvindo?

---

## 🚀 Solução Rápida (Teste Agora)

### Terminal 1: Verificar MCP
```bash
ps aux | grep notebooklm
# Deve mostrar: notebooklm-mcp
```

### Terminal 2: Testar Query
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"O que é limite?"}' \
  -w "\nStatus: %{http_code}\n"
```

### DevTools Console: Ver Response
```javascript
const all = JSON.parse(localStorage.notebookResponses || '[]');
all.forEach((r, i) => {
  console.log(`[${i}] Source: ${r.metadata?.context?.performance || 'N/A'} | Error: ${r.isError}`);
});
```

---

## 📋 Próximos Passos

1. **Execute as verificações acima**
2. **Copie a saída de cada comando**
3. **Me envie os resultados**
4. **Com isso identifico exatamente o problema**

---

## 📞 Se Tudo Falhar

**Opção A: Usar apenas fallback estático**
- Sistema funciona totalmente sem MCP
- Respostas vem do `content.json`
- Editar em: `src/data/content.json`

**Opção B: Resetar e reiniciar**
```bash
pkill -9 -f "notebooklm\|node\|npm"
npm run start
```

---

## 🎯 Resumo

| Componente | Status | Evidência |
|-----------|--------|-----------|
| Console | ✅ OK | "NotebookLM console ready!" |
| Capture | ✅ OK | Logs mostram resposta capturada |
| Context | ✅ OK | Template com dados do aluno |
| MCP Bridge | ❓ INCERTO | Retornando fallback não resolvido |
| NotebookLM | ❓ INCERTO | Precisa testar, curl |

**Próximo:** Siga o checklist acima e me avise os resultados! 🔍
