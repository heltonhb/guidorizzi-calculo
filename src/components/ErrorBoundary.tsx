import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Error Boundary - componente genérico para capturar erros em React
 * Renderiza UI amigável quando algo dá errado
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorObj: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(_) {
    return { hasError: true };
  }

  componentDidCatch(err, errorInfo) {
    // Log do erro para debugging
    console.error('🚨 Error Boundary Caught:', err, errorInfo);

    this.setState(prevState => ({
      errorObj: err,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Enviar para analytics/logging em produção
    const isDev = import.meta.env.DEV;
    if (!isDev) {
      // Exemplo: logErrorToService(err, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      errorObj: null,
      errorInfo: null,
    });

    // Reload page se houver muitos erros
    if (this.state.errorCount > 3) {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen bg-gradient-to-br from-red-950 to-red-900 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 backdrop-blur-sm mb-6">
              <h1 className="text-xl font-bold text-red-100 mb-3">Ops, algo deu errado!</h1>

              <p className="text-sm text-red-200 mb-4">
                Encontramos um erro inesperado na aplicação. Tente recarregar a página ou voltar para a página inicial.
              </p>

              {/* Error Details (Development) */}
              {import.meta.env.DEV && this.state.errorObj && (
                <details className="mt-4 cursor-pointer">
                  <summary className="text-xs text-red-300 font-mono hover:text-red-200">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 text-xs bg-black/30 rounded p-3 overflow-auto max-h-32 text-red-300 font-mono border border-red-500/10">
                    {this.state.errorObj.toString()}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Error Count */}
              {this.state.errorCount > 1 && (
                <p className="mt-4 text-xs text-red-400">
                  ⚠️ Erro #{this.state.errorCount}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleReset}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 font-semibold py-3 rounded-lg transition-all"
              >
                🔄 Tentar Novamente
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Início
              </motion.button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-red-400 mt-6">
              Se o problema persistir, reporte em feedback@guidorizzi.app
            </p>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
