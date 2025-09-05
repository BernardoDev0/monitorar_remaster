import { useToast } from '@/hooks/use-toast';

/**
 * Utilitários centralizados para tratamento de erros
 * Elimina duplicação de console.error e toast de erro
 */

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
  logToConsole?: boolean;
  context?: string;
}

/**
 * Manipula erros de forma padronizada
 */
export function handleError(
  error: any, 
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = false,
    toastTitle = "Erro",
    toastDescription,
    logToConsole = true,
    context = "Operação"
  } = options;

  // Log no console
  if (logToConsole) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${context} - Erro:`, errorMessage, error);
  }

  // Toast de erro (apenas se showToast for true e estivermos em um componente React)
  if (showToast && typeof window !== 'undefined') {
    // Note: O toast precisa ser chamado dentro de um componente React
    // Esta função será usada principalmente para logging
  }
}

/**
 * Hook para tratamento de erros com toast
 */
export function useErrorHandler() {
  const { toast } = useToast();

  const handleErrorWithToast = (
    error: any,
    options: Omit<ErrorHandlerOptions, 'showToast'> & {
      toastTitle?: string;
      toastDescription?: string;
    } = {}
  ) => {
    const {
      toastTitle = "Erro",
      toastDescription,
      logToConsole = true,
      context = "Operação"
    } = options;

    // Log no console
    if (logToConsole) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${context} - Erro:`, errorMessage, error);
    }

    // Toast de erro
    const description = toastDescription || 
      (error instanceof Error ? error.message : 'Ocorreu um erro inesperado');
    
    toast({
      title: toastTitle,
      description,
      variant: "destructive"
    });
  };

  return { handleError: handleErrorWithToast };
}

/**
 * Mensagens de erro padronizadas
 */
export const ERROR_MESSAGES = {
  // Operações de dados
  FETCH_EMPLOYEES: 'Erro ao buscar funcionários',
  FETCH_ENTRIES: 'Erro ao buscar entradas',
  FETCH_DATA: 'Erro ao carregar dados',
  
  // Cálculos
  CALCULATE_POINTS_DAY: 'Erro ao calcular pontos do dia',
  CALCULATE_POINTS_WEEK: 'Erro ao calcular pontos da semana',
  CALCULATE_POINTS_MONTH: 'Erro ao calcular pontos mensais',
  
  // Operações CRUD
  CREATE_ENTRY: 'Erro ao criar entrada',
  UPDATE_ENTRY: 'Erro ao atualizar entrada',
  DELETE_ENTRY: 'Erro ao excluir entrada',
  
  // Exportação
  EXPORT_DATA: 'Erro ao exportar dados',
  
  // Carregamento
  LOAD_HISTORY: 'Erro ao carregar histórico',
  LOAD_MONTHLY_DATA: 'Erro ao carregar dados mensais',
  LOAD_CHART_DATA: 'Erro ao buscar dados dos gráficos',
  
  // Estatísticas
  CALCULATE_STATS: 'Erro ao calcular estatísticas',
  
  // Processamento
  PROCESS_FILE: 'Erro ao processar arquivo',
  PROCESS_EXCEL: 'Erro ao processar Excel',
  
  // Parsing
  PARSE_USER_DATA: 'Erro ao parsear dados do usuário',
  
  // Genérico
  GENERIC: 'Ocorreu um erro inesperado'
} as const;

/**
 * Função utilitária para logging padronizado
 */
export function logError(
  context: string,
  error: any,
  additionalInfo?: any
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context} - Erro:`, errorMessage);
  
  if (additionalInfo) {
    console.error('Informações adicionais:', additionalInfo);
  }
  
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Wrapper para operações assíncronas com tratamento de erro
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, { ...options, context });
    return null;
  }
}

/**
 * Tipos de erro comuns
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

/**
 * Utilitário para criar mensagens de erro consistentes
 */
export function createErrorMessage(
  operation: string,
  details?: string
): string {
  return details ? `${operation}: ${details}` : operation;
}

/**
 * Verifica se um erro é de um tipo específico
 */
export function isErrorType(error: any, type: string): boolean {
  return error instanceof Error && error.name === type;
}

/**
 * Extrai mensagem de erro de diferentes tipos de erro
 */
export function extractErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }
  
  return 'Erro desconhecido';
}