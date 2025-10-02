/**
 * Constantes centralizadas do projeto
 * Elimina duplicações e centraliza configurações
 */

// ============================================================================
// CONFIGURAÇÕES DE FUNCIONÁRIOS
// ============================================================================

/**
 * Mapeamento de cores para funcionários
 * Centraliza todas as definições de cores que estavam duplicadas
 */
export const EMPLOYEE_COLORS = {
  'Rodrigo': '#8b5cf6',
  'Maurício': '#f59e0b', 
  'Matheus': '#10b981',
  'Wesley': '#ef4444'
} as const;

/**
 * Cores para gráficos (com transparência)
 */
export const EMPLOYEE_CHART_COLORS = {
  'Rodrigo': {
    borderColor: 'rgba(139, 92, 246, 1)',
    backgroundColor: 'rgba(139, 92, 246, 0.8)'
  },
  'Maurício': {
    borderColor: 'rgba(245, 158, 11, 1)',
    backgroundColor: 'rgba(245, 158, 11, 0.8)'
  },
  'Matheus': {
    borderColor: 'rgba(16, 185, 129, 1)',
    backgroundColor: 'rgba(16, 185, 129, 0.8)'
  },
  'Wesley': {
    borderColor: 'rgba(239, 68, 68, 1)',
    backgroundColor: 'rgba(239, 68, 68, 0.8)'
  }
} as const;

/**
 * Nomes dos funcionários (para iteração)
 */
export const EMPLOYEE_NAMES = Object.keys(EMPLOYEE_COLORS) as Array<keyof typeof EMPLOYEE_COLORS>;

// ============================================================================
// CONFIGURAÇÕES DE METAS
// ============================================================================

/**
 * Metas mensais por funcionário
 */
export const MONTHLY_GOALS = {
  'Matheus': 10500,
  'Rodrigo': 9500,
  'Maurício': 9500,
  'Wesley': 9500
} as const;

/**
 * Metas semanais por funcionário
 */
export const WEEKLY_GOALS = {
  'Matheus': 2675, // 5 * 535
  'Rodrigo': 2375, // 5 * 475
  'Maurício': 2375,
  'Wesley': 2375
} as const;

/**
 * Metas diárias por funcionário
 */
export const DAILY_GOALS = {
  'Matheus': 535, // 2675 / 5 dias
  'Rodrigo': 475, // 2375 / 5 dias
  'Maurício': 475,
  'Wesley': 475
} as const;

/**
 * Meta total da equipe (excluindo freelancers)
 */
export const TEAM_MONTHLY_GOAL = 29500;

// ============================================================================
// CONFIGURAÇÕES DE VALORES
// ============================================================================

/**
 * Valor por ponto em reais
 */
export const POINT_VALUE = 3.25;

// ============================================================================
// CONFIGURAÇÕES DE CICLOS
// ============================================================================

/**
 * Dias do ciclo mensal da empresa
 */
export const CYCLE_DAYS = {
  START: 26,
  END: 25
} as const;

/**
 * Número de semanas por ciclo
 */
export const WEEKS_PER_CYCLE = 5;

/**
 * Número de meses para exibir nos gráficos
 */
export const MONTHS_TO_DISPLAY = 7;


// ============================================================================
// CONFIGURAÇÕES DE UI
// ============================================================================


/**
 * Configurações de status de funcionários
 */
export const EMPLOYEE_STATUS_CONFIG = {
  'above': {
    badge: 'Acima da Meta',
    variant: 'default' as const,
    color: 'text-dashboard-success',
    badgeClass: 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/25'
  },
  'on-track': {
    badge: 'No Caminho',
    variant: 'secondary' as const,
    color: 'text-dashboard-warning',
    badgeClass: 'bg-yellow-500/15 text-yellow-100 border border-yellow-500/25'
  },
  'below': {
    badge: 'Abaixo da Meta',
    variant: 'destructive' as const,
    color: 'text-dashboard-danger',
    badgeClass: 'bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-100'
  }
} as const;

// ============================================================================
// CONFIGURAÇÕES DE FORMATAÇÃO
// ============================================================================

/**
 * Configurações de formatação de números
 */
export const NUMBER_FORMAT = {
  LOCALE: 'pt-BR',
  DECIMALS: 2,
  CURRENCY: 'BRL'
} as const;

/**
 * Configurações de formatação de datas
 */
export const DATE_FORMAT = {
  LOCALE: 'pt-BR',
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm:ss',
  MONTH_YEAR: 'MM/yyyy'
} as const;

// ============================================================================
// CONFIGURAÇÕES DE ARQUIVOS
// ============================================================================

/**
 * Configurações de exportação
 */
export const EXPORT_CONFIG = {
  MAX_RECORDS: 1000,
  ZIP_FILENAME_PREFIX: 'registros_funcionarios_',
  EXCEL_SHEET_NAME: 'Registros'
} as const;

