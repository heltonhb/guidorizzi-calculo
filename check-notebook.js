/**
 * Debug: Verificar estado do Guidorizzi Notebook
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const GUIDORIZZI_NOTEBOOK_ID = 'b7988097-f2a3-4a68-a71d-b2d424d96b9a';

async function checkNotebook() {
    console.log('🔍 Verificando Guidorizzi Notebook...\n');
    
    try {
        const transport = new StdioClientTransport({
            command: "notebooklm-mcp",
        });

        const client = new Client(
            { name: "notebook-check", version: "1.0.0" },
            { capabilities: {} }
        );

        await client.connect(transport);

        // 1. Get notebook details
        console.log('📚 Obtendo detalhes do notebook...');
        const notebook = await client.callTool({
            name: "notebook_get",
            arguments: { notebook_id: GUIDORIZZI_NOTEBOOK_ID }
        });
        
        console.log('Notebook encontrado:', notebook.content?.[0]?.text?.substring(0, 200));
        console.log();

        // 2. Get notebook describe
        console.log('📝 Obtendo descrição do notebook...');
        const describe = await client.callTool({
            name: "notebook_describe",
            arguments: { notebook_id: GUIDORIZZI_NOTEBOOK_ID }
        });
        
        console.log('Descrição:', describe.content?.[0]?.text?.substring(0, 300));
        console.log();

        // 3. Try a test query
        console.log('❓ Testando query...');
        const query = await client.callTool({
            name: "notebook_query",
            arguments: {
                notebook_id: GUIDORIZZI_NOTEBOOK_ID,
                query: "Qual é a função de uma derivada?"
            }
        });
        
        console.log('✅ Query respondida!');
        console.log('Resposta:', query.content?.[0]?.text?.substring(0, 300));

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

checkNotebook();
