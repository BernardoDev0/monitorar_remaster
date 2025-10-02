/**
 * Utilitários compartilhados do projeto
 * Centraliza funções comuns que estavam duplicadas
 */

import { EMPLOYEE_COLORS, EMPLOYEE_CHART_COLORS, EMPLOYEE_NAMES, NUMBER_FORMAT, DATE_FORMAT } from './constants';

// ============================================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================================

/**
 * Formata número no padrão brasileiro
 * Substitui formatações duplicadas em vários componentes
 */
export function formatNumber(value: number, decimals: number = NUMBER_FORMAT.DECIMALS): string {
  if (!isFinite(value)) return '0';
  
  return new Intl.NumberFormat(NUMBER_FORMAT.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formata número com separadores de milhares
 */
export function formatNumberWithSeparators(value: number): string {
  return value.toLocaleString(NUMBER_FORMAT.LOCALE);
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(NUMBER_FORMAT.LOCALE, {
    style: 'currency',
    currency: NUMBER_FORMAT.CURRENCY
  }).format(value);
}

/**
 * Formata data no padrão brasileiro
 */
export function formatDateBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(DATE_FORMAT.LOCALE);
}

/**
 * Formata data e hora no padrão brasileiro
 */
export function formatDateTimeBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(DATE_FORMAT.LOCALE);
}

// ============================================================================
// UTILITÁRIOS DE FUNCIONÁRIOS
// ============================================================================

/**
 * Obtém cor de um funcionário
 * Centraliza a lógica que estava duplicada em 6 arquivos
 */
export function getEmployeeColor(employeeName: string): string {
  return EMPLOYEE_COLORS[employeeName as keyof typeof EMPLOYEE_COLORS] || '#6b7280';
}

/**
 * Obtém cores para gráficos de um funcionário
 */
export function getEmployeeChartColors(employeeName: string) {
  return EMPLOYEE_CHART_COLORS[employeeName as keyof typeof EMPLOYEE_CHART_COLORS] || {
    borderColor: 'rgba(107, 114, 128, 1)',
    backgroundColor: 'rgba(107, 114, 128, 0.8)'
  };
}

/**
 * Gera iniciais de um nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}


// ============================================================================
// UTILITÁRIOS DE CÁLCULO
// ============================================================================

/**
 * Calcula porcentagem de progresso
 */
export function calculateProgressPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.round((current / goal) * 100 * 10) / 10;
}

/**
 * Determina status baseado na porcentagem de progresso
 */
export function getEmployeeStatus(progressPercentage: number): 'at-risk' | 'on-track' | 'top-performer' {
  if (progressPercentage < 50) return 'at-risk';
  if (progressPercentage < 100) return 'on-track';
  return 'top-performer';
}

/**
 * Calcula total de pontos de um array de entradas
 */
export function calculateTotalPoints(entries: Array<{ points?: number }>): number {
  return entries.reduce((sum, entry) => sum + (entry.points || 0), 0);
}

// ============================================================================
// UTILITÁRIOS DE LOGGING
// ============================================================================

/**
 * Logger centralizado para eliminar console.log duplicados
 */
export class Logger {
  private static context: string = 'App';

  static setContext(context: string) {
    this.context = context;
  }

  static error(message: string, error?: any, additionalInfo?: any) {
    console.error(`[${this.context}] ${message}`, error || '');
    if (additionalInfo) {
      console.error('Informações adicionais:', additionalInfo);
    }
  }

  static warn(message: string, data?: any) {
    console.warn(`[${this.context}] ${message}`, data || '');
  }

  static info(message: string, data?: any) {
    console.log(`[${this.context}] ${message}`, data || '');
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.context}] DEBUG: ${message}`, data || '');
    }
  }
}


// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se um valor é um número válido
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Valida se uma string não está vazia
 */
export function isValidString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida se uma data é válida
 */
export function isValidDate(value: any): boolean {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}


