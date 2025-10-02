import { format, parseISO, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Utilitários compartilhados para manipulação de datas
 * Centraliza todas as funções de formatação e parsing de datas do projeto
 */

// Formatos de data comuns
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  BR: 'dd/MM/yyyy',
  BR_WITH_TIME: 'dd/MM/yyyy HH:mm:ss',
  MONTH_YEAR: 'MM/yyyy',
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd'
} as const

/**
 * Converte número Excel para Date JavaScript
 * Excel armazena datas como número de dias desde 1899-12-30
 */
export function excelDateToJS(excelDate: number): Date | null {
  if (typeof excelDate !== 'number' || !isFinite(excelDate)) {
    return null
  }
  
  const excelEpoch = new Date(Date.UTC(1899, 11, 30))
  const millis = excelDate * 24 * 60 * 60 * 1000
  return new Date(excelEpoch.getTime() + millis)
}

/**
 * Parse robusto de datas - aceita múltiplos formatos
 * Unifica a lógica de parsing que estava duplicada nos services
 */
export function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null
  
  // Se já é uma Date válida
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue
  }
  
  // Se é número (Excel date)
  if (typeof dateValue === 'number') {
    return excelDateToJS(dateValue)
  }
  
  const dateStr = String(dateValue).trim()
  if (!dateStr) return null
  
  // Tentar diferentes formatos
  const patterns = [
    // ISO formats
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
    // Brazilian formats
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
    // Month/Year format
    /^(\d{1,2})[\/\-](\d{4})$/,
    // Year/Month format
    /^(\d{4})[\/\-](\d{1,2})$/
  ]
  
  // Formato ISO (YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss)
  const isoMatch = dateStr.match(patterns[0])
  if (isoMatch) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = isoMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                         parseInt(hour), parseInt(minute), parseInt(second))
    return isNaN(date.getTime()) ? null : date
  }
  
  // Formato brasileiro (DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss)
  const brMatch = dateStr.match(patterns[1])
  if (brMatch) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = brMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                         parseInt(hour), parseInt(minute), parseInt(second))
    return isNaN(date.getTime()) ? null : date
  }
  
  // Formato MM/YYYY
  const monthYearMatch = dateStr.match(patterns[2])
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return isNaN(date.getTime()) ? null : date
  }
  
  // Formato YYYY/MM
  const yearMonthMatch = dateStr.match(patterns[3])
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return isNaN(date.getTime()) ? null : date
  }
  
  // Tentar parse nativo como fallback
  try {
    const nativeDate = new Date(dateStr)
    return isNaN(nativeDate.getTime()) ? null : nativeDate
  } catch {
    return null
  }
}

/**
 * Formata data para exibição no formato brasileiro
 */
export function formatDateBR(date: Date | string | null): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return ''
    
    return format(dateObj, DATE_FORMATS.BR, { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Formata data para API (formato ISO)
 */
export function formatDateISO(date: Date | string | null): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return ''
    
    return format(dateObj, DATE_FORMATS.ISO)
  } catch {
    return ''
  }
}

/**
 * Formata data com horário no formato brasileiro
 */
export function formatDateTimeBR(date: Date | string | null): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return ''
    
    return format(dateObj, DATE_FORMATS.BR_WITH_TIME, { locale: ptBR })
  } catch {
    return ''
  }
}

/**
 * Formata mês/ano (MM/yyyy)
 */
export function formatMonthYear(date: Date | string | null): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return ''
    
    return format(dateObj, DATE_FORMATS.MONTH_YEAR)
  } catch {
    return ''
  }
}

/**
 * Verifica se uma data é válida
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  
  if (date instanceof Date) {
    return !isNaN(date.getTime())
  }
  
  const parsed = parseDate(date)
  return parsed !== null
}

/**
 * Obtém o primeiro dia do mês
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Obtém o último dia do mês
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se duas datas são do mesmo dia
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * Verifica se duas datas são do mesmo mês
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth()
}

/**
 * Gera chave única para mês/ano (formato MM/YYYY)
 * Usado para indexação consistente nos services
 */
export function generateMonthKey(date: Date): string {
  return formatMonthYear(date)
}

/**
 * Parse de data específico para Excel (compatibilidade com ExcelProcessorService)
 */
export function parseExcelDate(value: any): Date | null {
  // Reutiliza a lógica do parseDate mas com foco em formatos Excel
  return parseDate(value)
}