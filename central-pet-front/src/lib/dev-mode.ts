/**
 * Utilitário para detectar ambiente de desenvolvimento
 * Usado para mostrar/ocultar ferramentas de debug (ex: mock user selector)
 */

/**
 * Verifica se a aplicação está rodando em modo desenvolvimento
 * @returns true se em desenvolvimento, false caso contrário
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

export function shouldDisplayMockUsers() {
  return isDevelopment() && import.meta.env.VITE_AUTH_STRATEGY == 'mock';
}

/**
 * Verifica se a aplicação está rodando em modo produção
 * @returns true se em produção, false caso contrário
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Retorna o modo atual da aplicação
 * @returns 'development' | 'production'
 */
export function getMode(): 'development' | 'production' {
  const mode = import.meta.env.MODE;

  if (mode === 'development' || mode === 'production') {
    return mode;
  }

  // Em modos desconhecidos, assume produção silenciosamente
  return 'production';
}
