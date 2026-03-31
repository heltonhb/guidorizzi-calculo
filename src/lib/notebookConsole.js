/**
 * consoleUtils.js
 * 
 * Utilitários para visualizar dados no console do navegador
 * Use no DevTools para inspecionar respostas da API
 */

const STORAGE_KEY = 'guidori_responses';

/**
 * Formatar e exibir resposta no console
 */
export const logResponse = (response) => {
  const timestamp = new Date().toLocaleTimeString();
  
  console.group(`%c📊 Guidorizzi Response [${timestamp}]`, 'color: #4f46e5; font-weight: bold; font-size: 12px;');
  
  if (response.type) {
    console.log('%cType:', 'color: #0ea5e9; font-weight: bold;', response.type);
  }
  
  if (response.query) {
    console.log('%cQuery:', 'color: #0ea5e9; font-weight: bold;');
    console.log(response.query);
  }
  
  if (response.content) {
    console.log('%cContent:', 'color: #0ea5e9; font-weight: bold;');
    console.log(response.content);
  }
  
  if (response.answer) {
    console.log('%cAnswer:', 'color: #0ea5e9; font-weight: bold;');
    console.log(response.answer);
  }
  
  if (response.suggestions) {
    console.log('%cSuggestions:', 'color: #0ea5e9; font-weight: bold;');
    console.table(response.suggestions);
  }
  
  if (response.metadata) {
    console.log('%cMetadata:', 'color: #0ea5e9; font-weight: bold;');
    console.table(response.metadata);
  }
  
  if (response.isError) {
    console.error('%c❌ Error:', 'color: #ef4444; font-weight: bold;', response.error);
  }
  
  console.groupEnd();
};

/**
 * Visualizar todas as respostas capturadas
 */
export const showAllResponses = () => {
  try {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    console.clear();
    
    console.group('%c📚 All Guidorizzi Responses', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
    console.log(`Total: ${responses.length} responses`);
    console.table(responses.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString(),
      type: r.type,
      query: r.query?.substring(0, 50) + '...' || '(none)',
      status: r.isError ? '❌ Error' : '✅ Success'
    })));
    console.groupEnd();
    
    return responses;
  } catch (e) {
    console.error('Erro ao recuperar respostas:', e);
  }
};

/**
 * Exportar dados como JSON
 */
export const exportData = () => {
  try {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const dataStr = JSON.stringify(responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guidorizzi-export-${Date.now()}.json`;
    link.click();
    console.log('✅ Data exported to:', link.download);
  } catch (e) {
    console.error('Erro ao exportar:', e);
  }
};

/**
 * Ver estatísticas
 */
export const showStatistics = () => {
  try {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const errors = responses.filter(r => r.isError).length;
    const chats = responses.filter(r => r.type === 'chat').length;
    const studios = responses.filter(r => r.type === 'studio').length;
    
    console.group('%c📈 Guidorizzi Statistics', 'color: #06b6d4; font-weight: bold; font-size: 12px;');
    console.table({
      'Total Responses': responses.length,
      'Chat Queries': chats,
      'Studio Requests': studios,
      'Errors': errors,
      'Success Rate': ((responses.length - errors) / responses.length * 100).toFixed(1) + '%'
    });
    console.groupEnd();
  } catch (e) {
    console.error('Erro:', e);
  }
};

/**
 * Limpar dados
 */
export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('✅ Guidorizzi data cleared');
};

/**
 * Instalar comandos globais no console
 */
export const installConsoleCommands = () => {
  window.Guidorizzi = {
    showAll: showAllResponses,
    export: exportData,
    stats: showStatistics,
    clear: clearData,
    help: () => {
      console.log(`
%c📊 Guidorizzi Console Commands
%c
Use in DevTools console:
  - Guidorizzi.showAll()   → Ver todas as respostas
  - Guidorizzi.stats()     → Ver estatísticas
  - Guidorizzi.export()    → Exportar como JSON
  - Guidorizzi.clear()     → Limpar dados
  - Guidorizzi.help()      → Ver este menu
      `, 'color: #8b5cf6; font-weight: bold; font-size: 12px;', 'color: #6b7280; font-size: 11px;');
    }
  };
  console.log('%cGuidorizzi console ready! Type Guidorizzi.help() for commands', 'color: #10b981; font-weight: bold;');
};

export default {
  logResponse,
  showAllResponses,
  exportData,
  showStatistics,
  clearData,
  installConsoleCommands
};
