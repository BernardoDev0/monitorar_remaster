/**
 * Utilitários compartilhados para manipulação de números
 * Centraliza todas as funções de formatação e parsing de números do projeto
 */

/**
 * Parse robusto de números no formato brasileiro
 * Unifica a lógica que estava duplicada nos services
 */
export function parseNumberBR(value: any): number {
  if (typeof value === 'number') {
    return isFinite(value) ? value : 0
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return 0
    
    // Extrair o primeiro token numérico da string (ex.: "1.234 pts" -> "1.234")
    const token = trimmed.match(/-?\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d+)?|-?\d+(?:[\.,]\d+)?/)
    const piece = token ? token[0] : trimmed
    
    // Normalização PT-BR: "." milhar e "," decimal
    const normalized = piece
      .replace(/\s+/g, '') // Remove espaços
      .replace(/\.(?=\d{3}(\D|$))/g, '') // Remove pontos de milhar
      .replace(/,(\d{1,})$/, '.$1') // Converte vírgula decimal para ponto
    
    const num = parseFloat(normalized.replace(',', '.'))
    return isNaN(num) ? 0 : num
  }
  
  return 0
}

/**
 * Formata número no padrão brasileiro (1.234,56)
 */
export function formatNumberBR(value: number, decimals: number = 2): string {
  if (!isFinite(value)) return '0'
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata número como moeda brasileira (R$ 1.234,56)
 */
export function formatCurrencyBR(value: number): string {
  if (!isFinite(value)) return 'R$ 0,00'
  
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Formata número como porcentagem (12,34%)
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (!isFinite(value)) return '0%'
  
  return (value).toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata número de pontos com sufixo
 */
export function formatPoints(value: number): string {
  if (!isFinite(value)) return '0 pts'
  
  const formatted = formatNumberBR(value, 0)
  return `${formatted} pts`
}

/**
 * Verifica se um valor é um número válido
 */
export function isValidNumber(value: any): boolean {
  if (typeof value === 'number') {
    return isFinite(value)
  }
  
  if (typeof value === 'string') {
    const parsed = parseNumberBR(value)
    return !isNaN(parsed) && isFinite(parsed)
  }
  
  return false
}

/**
 * Soma segura de números (ignora valores inválidos)
 */
export function safeSum(...values: any[]): number {
  return values.reduce((sum, value) => {
    const num = parseNumberBR(value)
    return sum + (isFinite(num) ? num : 0)
  }, 0)
}

/**
 * Média segura de números (ignora valores inválidos)
 */
export function safeAverage(...values: any[]): number {
  const validNumbers = values
    .map(v => parseNumberBR(v))
    .filter(n => isFinite(n))
  
  if (validNumbers.length === 0) return 0
  
  return validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length
}

/**
 * Arredonda número para N casas decimais
 */
export function roundTo(value: number, decimals: number = 2): number {
  if (!isFinite(value)) return 0
  
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Clamp - limita número entre min e max
 */
export function clamp(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Converte número para string com zeros à esquerda
 */
export function padNumber(value: number, length: number): string {
  return value.toString().padStart(length, '0')
}

/**
 * Calcula porcentagem de um valor em relação ao total
 */
export function calculatePercentage(value: number, total: number): number {
  if (!isFinite(value) || !isFinite(total) || total === 0) return 0
  return (value / total) * 100
}

/**
 * Formata número grande com sufixos (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (!isFinite(value)) return '0'
  
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (abs >= 1e9) {
    return sign + formatNumberBR(abs / 1e9, 1) + 'B'
  }
  if (abs >= 1e6) {
    return sign + formatNumberBR(abs / 1e6, 1) + 'M'
  }
  if (abs >= 1e3) {
    return sign + formatNumberBR(abs / 1e3, 1) + 'K'
  }
  
  return formatNumberBR(value, 0)
}

/**
 * Extrai primeiro valor numérico de uma string
 * Usado para parsing de colunas Excel com texto misto
 */
export function extractFirstNumber(text: string): number {
  if (!text || typeof text !== 'string') return 0
  
  const match = text.match(/-?\d+(?:[\.,]\d+)?/)
  if (!match) return 0
  
  return parseNumberBR(match[0])
}

/**
 * Verifica se um número está dentro de um range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return isFinite(value) && value >= min && value <= max
}

/**
 * Gera número aleatório entre min e max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Converte string de porcentagem para número decimal
 * Ex: "12,5%" -> 0.125
 */
export function parsePercentage(value: string): number {
  if (!value || typeof value !== 'string') return 0
  
  const cleaned = value.replace('%', '').trim()
  const num = parseNumberBR(cleaned)
  return num / 100
}