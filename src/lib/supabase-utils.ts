import { supabase } from '@/integrations/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Utilitários compartilhados para operações com Supabase
 * Centraliza padrões comuns de query, error handling e cache
 */

// Tipos base
export interface SupabaseResponse<T> {
  data: T | null
  error: PostgrestError | null
  success: boolean
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export interface DateRangeFilter {
  start?: string
  end?: string
}

export interface EmployeeFilters extends PaginationOptions, DateRangeFilter {
  employeeId?: number
}

/**
 * Wrapper genérico para queries do Supabase com tratamento de erro padronizado
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorContext: string = 'Operação'
): Promise<SupabaseResponse<T>> {
  try {
    const { data, error } = await queryFn()
    
    if (error) {
      console.error(`${errorContext} - Erro:`, error)
      return { data: null, error, success: false }
    }
    
    return { data, error: null, success: true }
  } catch (err) {
    const error = err as PostgrestError
    console.error(`${errorContext} - Erro inesperado:`, error)
    return { data: null, error, success: false }
  }
}

/**
 * Busca todos os funcionários com cache e ordenação
 */
export async function getAllEmployees() {
  return executeQuery(
    () => supabase
      .from('employee')
      .select('*')
      .order('real_name'),
    'Buscar funcionários'
  )
}

/**
 * Busca funcionário por ID
 */
export async function getEmployeeById(id: number) {
  return executeQuery(
    () => supabase
      .from('employee')
      .select('*')
      .eq('id', id)
      .maybeSingle(),
    `Buscar funcionário ID ${id}`
  )
}

/**
 * Busca funcionário por chave de acesso
 */
export async function getEmployeeByAccessKey(accessKey: string) {
  return executeQuery(
    () => supabase
      .from('employee')
      .select('*')
      .eq('access_key', accessKey)
      .maybeSingle(),
    'Autenticação por chave de acesso'
  )
}

/**
 * Busca entradas com filtros flexíveis
 */
export async function getEntries(filters: EmployeeFilters = {}) {
  return executeQuery(
    () => {
      let query = supabase
        .from('entry')
        .select('*')
        .order('date', { ascending: false })
      
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId)
      }
      
      if (filters.start) {
        query = query.gte('date', filters.start)
      }
      
      if (filters.end) {
        query = query.lte('date', filters.end)
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }
      
      return query
    },
    'Buscar entradas'
  )
}

/**
 * Busca entradas de um funcionário específico
 */
export async function getEmployeeEntries(
  employeeId: number,
  options: PaginationOptions & DateRangeFilter = {}
) {
  return getEntries({ ...options, employeeId })
}

/**
 * Cria nova entrada
 */
export async function createEntry(entry: {
  employee_id: number
  date: string
  points: number
  refinery: string
  observations?: string
}) {
  return executeQuery(
    () => supabase
      .from('entry')
      .insert([entry])
      .select()
      .single(),
    'Criar entrada'
  )
}

/**
 * Atualiza entrada existente
 */
export async function updateEntry(
  id: number,
  updates: Partial<{
    date: string
    points: number
    refinery: string
    observations: string
  }>
) {
  return executeQuery(
    () => supabase
      .from('entry')
      .update(updates)
      .eq('id', id)
      .select()
      .single(),
    `Atualizar entrada ID ${id}`
  )
}

/**
 * Deleta entrada
 */
export async function deleteEntry(id: number) {
  return executeQuery(
    () => supabase
      .from('entry')
      .delete()
      .eq('id', id),
    `Deletar entrada ID ${id}`
  )
}

/**
 * Busca entradas por range de datas
 */
export async function getEntriesByDateRange(startDate: string, endDate: string) {
  return getEntries({ start: startDate, end: endDate })
}

/**
 * Conta total de entradas com filtros
 */
export async function countEntries(filters: Omit<EmployeeFilters, 'limit' | 'offset'> = {}) {
  return executeQuery(
    () => {
      let query = supabase
        .from('entry')
        .select('*', { count: 'exact', head: true })
      
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId)
      }
      
      if (filters.start) {
        query = query.gte('date', filters.start)
      }
      
      if (filters.end) {
        query = query.lte('date', filters.end)
      }
      
      return query
    },
    'Contar entradas'
  )
}

/**
 * Soma pontos por funcionário em um período
 */
export async function sumPointsByEmployee(
  employeeId: number,
  startDate?: string,
  endDate?: string
) {
  return executeQuery(
    () => {
      let query = supabase
        .from('entry')
        .select('points')
        .eq('employee_id', employeeId)
      
      if (startDate) {
        query = query.gte('date', startDate)
      }
      
      if (endDate) {
        query = query.lte('date', endDate)
      }
      
      return query
    },
    `Somar pontos funcionário ID ${employeeId}`
  )
}

/**
 * Busca estatísticas agregadas por funcionário
 */
export async function getEmployeeStats(employeeId: number, dateRange?: DateRangeFilter) {
  const entriesResult = await getEmployeeEntries(employeeId, dateRange)
  
  if (!entriesResult.success || !entriesResult.data) {
    return { data: null, error: entriesResult.error, success: false }
  }
  
  const entries = entriesResult.data as any[]
  const totalPoints = entries.reduce((sum, entry) => sum + (entry.points || 0), 0)
  const totalEntries = entries.length
  const averagePoints = totalEntries > 0 ? totalPoints / totalEntries : 0
  
  return {
    data: {
      totalPoints,
      totalEntries,
      averagePoints,
      entries
    },
    error: null,
    success: true
  }
}

/**
 * Utilitário para batch operations
 */
export async function batchInsertEntries(entries: Array<{
  employee_id: number
  date: string
  points: number
  refinery: string
  observations?: string
}>) {
  return executeQuery(
    () => supabase
      .from('entry')
      .insert(entries)
      .select(),
    'Inserção em lote'
  )
}

/**
 * Mapeamento de funcionários para emails (mesmo da Edge Function)
 */
function getRecipientEmail(employeeName: string): string | null {
  const map: Record<string, string> = {
    'Rodrigo': 'rodrigo@monitorarconsultoria.com.br',
    'Maurício': 'carlos.mauricio.prestserv@petrobras.com.br',
    'Matheus': 'Matheus.e.lima.prestserv@petrobras.com.br',
    'Wesley': 'Wesley_fgc@hotmail.com'
  };
  return map[employeeName] || null;
}

/**
 * Utilitário para operações de email queue
 */
export async function addToEmailQueue(payload: {
  employee_name: string
  date: string
  points: number
  refinery: string
  observations?: string
}) {
  const recipientEmail = getRecipientEmail(payload.employee_name);
  
  if (!recipientEmail) {
    return {
      data: null,
      error: { message: `Email não encontrado para o funcionário: ${payload.employee_name}` } as any,
      success: false
    };
  }

  return executeQuery(
    () => supabase
      .from('email_queue')
      .insert([{
        recipient_email: recipientEmail,
        recipient_name: payload.employee_name,
        employee_name: payload.employee_name,
        date: payload.date,
        points: payload.points,
        refinery: payload.refinery,
        observations: payload.observations || '',
        status: 'pending',
        created_at: new Date().toISOString()
      }]),
    'Adicionar à fila de email'
  )
}

/**
 * Marca email como processado
 */
export async function markEmailAsProcessed(id: string) {
  return executeQuery(
    () => supabase
      .from('email_queue')
      .update({ status: 'sent' })
      .eq('id', id),
    `Marcar email ${id} como enviado`
  )
}

/**
 * Marca email como falhado
 */
export async function markEmailAsFailed(id: string, errorMessage: string) {
  return executeQuery(
    () => supabase
      .from('email_queue')
      .update({ 
        status: 'failed', 
        error: errorMessage 
      })
      .eq('id', id),
    `Marcar email ${id} como falhado`
  )
}

/**
 * Cache simples em memória para queries frequentes
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutos
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const queryCache = new SimpleCache()

/**
 * Wrapper com cache para queries de funcionários
 */
export async function getCachedEmployees() {
  const cacheKey = 'all_employees'
  const cached = queryCache.get(cacheKey)
  
  if (cached) {
    return { data: cached, error: null, success: true }
  }
  
  const result = await getAllEmployees()
  
  if (result.success && result.data) {
    queryCache.set(cacheKey, result.data)
  }
  
  return result
}