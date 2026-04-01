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
  return import.meta.env.MODE as 'development' | 'production';
}
