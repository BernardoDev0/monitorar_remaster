# API Reference - Documentação Técnica

## 📚 Visão Geral

Esta documentação descreve todas as APIs, serviços e interfaces do Sistema de Monitoramento de Performance. O sistema utiliza **Supabase** como backend e **TypeScript** para tipagem estática.

## 🔧 Configuração Base

### Cliente Supabase

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

### Tipos de Dados

```typescript
// src/integrations/supabase/types.ts
export interface Database {
  public: {
    Tables: {
      employee: {
        Row: {
          id: number;
          name: string | null;
          real_name: string | null;
          username: string | null;
          access_key: string;
          role: string | null;
          weekly_goal: number | null;
          default_refinery: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      entry: {
        Row: {
          id: number;
          employee_id: number;
          date: string;
          refinery: string;
          points: number;
          observations: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      // ... outras tabelas
    };
  };
}
```

## 👥 EmployeeService

### Interface Principal

```typescript
// src/services/EmployeeService.ts
export interface Employee {
  id: number;
  name: string;
  real_name: string;
  username: string;
  access_key: string;
  role: string;
  weekly_goal: number;
  default_refinery: string;
  created_at?: string;
  updated_at?: string;
}

export interface Entry {
  id: number;
  employee_id: number;
  date: string;
  refinery: string;
  points: number;
  observations: string;
  created_at?: string;
  updated_at?: string;
}
```

### Métodos de Autenticação

#### `authenticateByAccessKey(accessKey: string): Promise<Employee | null>`

Autentica um funcionário usando sua chave de acesso.

**Parâmetros:**
- `accessKey` (string): Chave de acesso única do funcionário

**Retorno:**
- `Promise<Employee | null>`: Dados do funcionário ou null se não encontrado

**Exemplo:**
```typescript
const employee = await EmployeeService.authenticateByAccessKey('ABC123');
if (employee) {
  console.log(`Bem-vindo, ${employee.real_name}!`);
}
```

**Erros Possíveis:**
- `Error`: Falha na conexão com o banco de dados
- `null`: Chave de acesso inválida

### Métodos de CRUD

#### `getEmployeeById(id: number): Promise<Employee | null>`

Busca um funcionário pelo ID.

**Parâmetros:**
- `id` (number): ID único do funcionário

**Retorno:**
- `Promise<Employee | null>`: Dados do funcionário ou null se não encontrado

**Exemplo:**
```typescript
const employee = await EmployeeService.getEmployeeById(1);
if (employee) {
  console.log(`Funcionário: ${employee.real_name}`);
}
```

#### `getAllEmployees(): Promise<Employee[]>`

Busca todos os funcionários cadastrados.

**Retorno:**
- `Promise<Employee[]>`: Array com todos os funcionários

**Exemplo:**
```typescript
const employees = await EmployeeService.getAllEmployees();
console.log(`Total de funcionários: ${employees.length}`);
```

### Métodos de Registros

#### `createEntry(entry: EntryData): Promise<Entry | null>`

Cria um novo registro de pontos para um funcionário.

**Parâmetros:**
```typescript
interface EntryData {
  employee_id: number;
  date: string; // ISO string
  refinery: string;
  points: number;
  observations: string;
}
```

**Retorno:**
- `Promise<Entry | null>`: Registro criado ou null em caso de erro

**Exemplo:**
```typescript
const newEntry = await EmployeeService.createEntry({
  employee_id: 1,
  date: new Date().toISOString(),
  refinery: 'RPBC',
  points: 500,
  observations: 'Trabalho realizado com sucesso'
});

if (newEntry) {
  console.log('Registro criado com sucesso!');
}
```

**Funcionalidades Adicionais:**
- Dispara email de confirmação automaticamente
- Adiciona registro à fila de emails
- Valida dados antes de salvar

#### `getEmployeeEntries(employeeId: number, options?: EntryOptions): Promise<Entry[]>`

Busca registros de um funcionário com filtros opcionais.

**Parâmetros:**
```typescript
interface EntryOptions {
  limit?: number;
  offset?: number;
  start?: string; // Data início (ISO)
  end?: string;   // Data fim (ISO)
}
```

**Retorno:**
- `Promise<Entry[]>`: Array de registros

**Exemplo:**
```typescript
// Buscar últimos 10 registros
const entries = await EmployeeService.getEmployeeEntries(1, { limit: 10 });

// Buscar registros de um período
const periodEntries = await EmployeeService.getEmployeeEntries(1, {
  start: '2024-01-01',
  end: '2024-01-31'
});
```

### Métodos de Cálculos

#### `getTodayPoints(employeeId: number): Promise<number>`

Calcula pontos acumulados no dia atual.

**Parâmetros:**
- `employeeId` (number): ID do funcionário

**Retorno:**
- `Promise<number>`: Total de pontos do dia

**Exemplo:**
```typescript
const todayPoints = await EmployeeService.getTodayPoints(1);
console.log(`Pontos hoje: ${todayPoints}`);
```

#### `getWeekPoints(employeeId: number, weekDates: WeekDates): Promise<number>`

Calcula pontos acumulados em uma semana específica.

**Parâmetros:**
- `employeeId` (number): ID do funcionário
- `weekDates` (WeekDates): Datas de início e fim da semana

**Retorno:**
- `Promise<number>`: Total de pontos da semana

**Exemplo:**
```typescript
const weekDates = CalculationsService.getWeekDates('1');
const weekPoints = await EmployeeService.getWeekPoints(1, weekDates);
console.log(`Pontos da semana: ${weekPoints}`);
```

#### `getMonthPoints(employeeId: number, monthDates: MonthDates): Promise<number>`

Calcula pontos acumulados em um mês específico.

**Parâmetros:**
- `employeeId` (number): ID do funcionário
- `monthDates` (MonthDates): Datas de início e fim do mês

**Retorno:**
- `Promise<number>`: Total de pontos do mês

**Exemplo:**
```typescript
const monthDates = CalculationsService.getMonthCycleDates();
const monthPoints = await EmployeeService.getMonthPoints(1, monthDates);
console.log(`Pontos do mês: ${monthPoints}`);
```

## 🧮 CalculationsService

### Interfaces

```typescript
export interface WeekDates {
  start: string; // ISO date
  end: string;   // ISO date
}

export interface MonthCycleDates {
  start: string; // ISO date
  end: string;   // ISO date
}

export type EmployeeStatus = 'at-risk' | 'on-track' | 'top-performer';
```

### Métodos de Cálculo de Datas

#### `getWeekDates(weekStr: string): WeekDates`

Calcula as datas de início e fim de uma semana específica baseado no ciclo 26→25.

**Parâmetros:**
- `weekStr` (string): Número da semana ('1', '2', '3', '4', '5')

**Retorno:**
- `WeekDates`: Objeto com datas de início e fim

**Exemplo:**
```typescript
const week1 = CalculationsService.getWeekDates('1');
console.log(`Semana 1: ${week1.start} a ${week1.end}`);
```

**Lógica:**
- Semana 1: Dias 26-31 do mês anterior + dias 1-1 do mês atual
- Semana 2: Dias 2-8 do mês atual
- Semana 3: Dias 9-15 do mês atual
- Semana 4: Dias 16-22 do mês atual
- Semana 5: Dias 23-25 do mês atual

#### `getMonthCycleDates(month?: number, year?: number): MonthCycleDates`

Calcula as datas de um ciclo mensal (26→25).

**Parâmetros:**
- `month` (number, opcional): Mês de término (1-12)
- `year` (number, opcional): Ano

**Retorno:**
- `MonthCycleDates`: Objeto com datas de início e fim do ciclo

**Exemplo:**
```typescript
// Ciclo atual
const currentCycle = CalculationsService.getMonthCycleDates();

// Ciclo específico (Janeiro 2024: 26/Dez/2023 a 25/Jan/2024)
const januaryCycle = CalculationsService.getMonthCycleDates(1, 2024);
```

#### `getCurrentWeek(): number`

Retorna a semana atual baseada no ciclo 26→25.

**Retorno:**
- `number`: Número da semana atual (1-5)

**Exemplo:**
```typescript
const currentWeek = CalculationsService.getCurrentWeek();
console.log(`Semana atual: ${currentWeek}`);
```

### Métodos de Metas

#### `getDailyGoal(employee: Employee): number`

Calcula a meta diária baseada no funcionário.

**Parâmetros:**
- `employee` (Employee): Dados do funcionário

**Retorno:**
- `number`: Meta diária em pontos

**Lógica:**
- Funcionário 'E89P': 535 pontos/dia
- Outros funcionários: 475 pontos/dia

**Exemplo:**
```typescript
const dailyGoal = CalculationsService.getDailyGoal(employee);
console.log(`Meta diária: ${dailyGoal} pontos`);
```

#### `getWeeklyGoal(employee: Employee): number`

Calcula a meta semanal baseada no funcionário.

**Parâmetros:**
- `employee` (Employee): Dados do funcionário

**Retorno:**
- `number`: Meta semanal em pontos

**Lógica:**
- Funcionário 'E89P': 2675 pontos/semana (5 × 535)
- Outros funcionários: 2375 pontos/semana (5 × 475)

#### `getMonthlyGoal(employee: Employee): number`

Calcula a meta mensal baseada no funcionário.

**Parâmetros:**
- `employee` (Employee): Dados do funcionário

**Retorno:**
- `number`: Meta mensal em pontos

**Lógica:**
- Funcionário 'E89P': 10500 pontos/mês
- Outros funcionários: 9500 pontos/mês

### Métodos de Análise

#### `calculateProgressPercentage(current: number, goal: number): number`

Calcula a porcentagem de progresso em relação à meta.

**Parâmetros:**
- `current` (number): Valor atual
- `goal` (number): Meta a ser atingida

**Retorno:**
- `number`: Porcentagem (0-100) com 1 casa decimal

**Exemplo:**
```typescript
const progress = CalculationsService.calculateProgressPercentage(475, 950);
console.log(`Progresso: ${progress}%`); // 50.0%
```

#### `getEmployeeStatus(progressPercentage: number): EmployeeStatus`

Determina o status do funcionário baseado no progresso.

**Parâmetros:**
- `progressPercentage` (number): Porcentagem de progresso

**Retorno:**
- `EmployeeStatus`: Status do funcionário

**Lógica:**
- `'at-risk'`: < 50%
- `'on-track'`: 50% - 99%
- `'top-performer'`: ≥ 100%

**Exemplo:**
```typescript
const status = CalculationsService.getEmployeeStatus(75);
console.log(`Status: ${status}`); // 'on-track'
```

### Métodos Utilitários

#### `getMonthNamePT(month1to12: number): string`

Retorna o nome do mês em português.

**Parâmetros:**
- `month1to12` (number): Número do mês (1-12)

**Retorno:**
- `string`: Nome do mês em português

**Exemplo:**
```typescript
const monthName = CalculationsService.getMonthNamePT(1);
console.log(monthName); // 'Janeiro'
```

#### `formatTimestampBR(dateStr: string): { date: string; time: string }`

Formata timestamp para formato brasileiro.

**Parâmetros:**
- `dateStr` (string): Data em formato ISO

**Retorno:**
- `{ date: string; time: string }`: Data e hora formatadas

**Exemplo:**
```typescript
const formatted = CalculationsService.formatTimestampBR('2024-01-15T14:30:00Z');
console.log(formatted); // { date: '15/01/2024', time: '14:30' }
```

## 📊 DataService

### Métodos de Processamento

#### `processExcelFile(file: File): Promise<ProcessedData>`

Processa arquivo Excel e extrai dados estruturados.

**Parâmetros:**
- `file` (File): Arquivo Excel (.xlsx)

**Retorno:**
- `Promise<ProcessedData>`: Dados processados

**Exemplo:**
```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const processedData = await DataService.processExcelFile(file);
    console.log('Dados processados:', processedData);
  }
};
```

#### `exportToExcel(data: ExportData): Promise<Blob>`

Exporta dados para arquivo Excel.

**Parâmetros:**
- `data` (ExportData): Dados a serem exportados

**Retorno:**
- `Promise<Blob>`: Arquivo Excel como Blob

**Exemplo:**
```typescript
const exportData = async () => {
  const data = await getEmployeeData();
  const excelBlob = await DataService.exportToExcel(data);
  
  // Download do arquivo
  const url = URL.createObjectURL(excelBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio.xlsx';
  a.click();
};
```

### Métodos de Relatórios

#### `generateReport(employeeId: number, period: Period): Promise<Report>`

Gera relatório detalhado de um funcionário.

**Parâmetros:**
```typescript
interface Period {
  start: string; // ISO date
  end: string;   // ISO date
}
```

**Retorno:**
- `Promise<Report>`: Relatório estruturado

**Exemplo:**
```typescript
const report = await DataService.generateReport(1, {
  start: '2024-01-01',
  end: '2024-01-31'
});
console.log('Relatório gerado:', report);
```

## 📤 ExportService

### Métodos de Exportação

#### `exportEmployeeData(employeeId: number): Promise<Blob>`

Exporta dados de um funcionário para Excel.

**Parâmetros:**
- `employeeId` (number): ID do funcionário

**Retorno:**
- `Promise<Blob>`: Arquivo Excel

**Exemplo:**
```typescript
const downloadEmployeeData = async (employeeId: number) => {
  const blob = await ExportService.exportEmployeeData(employeeId);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `funcionario_${employeeId}.xlsx`;
  a.click();
};
```

#### `exportTeamReport(period: Period): Promise<Blob>`

Exporta relatório da equipe para Excel.

**Parâmetros:**
- `period` (Period): Período do relatório

**Retorno:**
- `Promise<Blob>`: Arquivo Excel

**Exemplo:**
```typescript
const downloadTeamReport = async () => {
  const period = {
    start: '2024-01-01',
    end: '2024-01-31'
  };
  
  const blob = await ExportService.exportTeamReport(period);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_equipe.xlsx';
  a.click();
};
```

## 🔧 Utilitários (lib/)

### date-utils.ts

```typescript
// Formatação de datas
export const formatDateISO = (date: Date): string;
export const formatDateBR = (dateStr: string): string;
export const generateMonthKey = (date: Date): string;

// Exemplos
const isoDate = formatDateISO(new Date()); // '2024-01-15'
const brDate = formatDateBR('2024-01-15'); // '15/01/2024'
const monthKey = generateMonthKey(new Date()); // '01/2024'
```

### number-utils.ts

```typescript
// Formatação de números
export const formatNumber = (num: number): string;
export const formatCurrency = (amount: number): string;
export const formatPercentage = (value: number): string;

// Exemplos
const formatted = formatNumber(1234.56); // '1.234,56'
const currency = formatCurrency(1234.56); // 'R$ 1.234,56'
const percentage = formatPercentage(0.75); // '75%'
```

### supabase-utils.ts

```typescript
// Utilitários do Supabase
export const getAllEmployees = (): Promise<ApiResult<Employee[]>>;
export const getEmployeeById = (id: number): Promise<ApiResult<Employee>>;
export const createEntry = (entry: EntryData): Promise<ApiResult<Entry>>;
export const addToEmailQueue = (data: EmailData): Promise<ApiResult<void>>;

// Exemplos
const result = await getAllEmployees();
if (result.success) {
  console.log('Funcionários:', result.data);
} else {
  console.error('Erro:', result.error);
}
```

## 📧 Sistema de Email

### EmailQueueWorker

```typescript
// src/services/EmailQueueWorker.ts
export class EmailQueueWorker {
  static async processQueue(): Promise<void>;
  static async sendConfirmationEmail(data: EmailData): Promise<boolean>;
}

// Exemplo de uso
const emailData = {
  employee_name: 'João Silva',
  date: '2024-01-15',
  points: 500,
  refinery: 'RPBC',
  observations: 'Trabalho realizado'
};

const sent = await EmailQueueWorker.sendConfirmationEmail(emailData);
if (sent) {
  console.log('Email enviado com sucesso!');
}
```

### Configuração EmailJS

```typescript
// Variáveis de ambiente necessárias
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## 🚨 Tratamento de Erros

### Estrutura de Erro Padrão

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

### Exemplos de Tratamento

```typescript
// Tratamento de erro em serviço
try {
  const employee = await EmployeeService.getEmployeeById(1);
  if (!employee) {
    throw new Error('Funcionário não encontrado');
  }
} catch (error) {
  console.error('Erro ao buscar funcionário:', error);
  toast.error('Erro ao carregar dados do funcionário');
}

// Tratamento de erro em API
const result = await createEntry(entryData);
if (!result.success) {
  console.error('Erro na API:', result.error);
  toast.error(result.error?.message || 'Erro desconhecido');
}
```

## 🔒 Segurança e Validação

### Validação de Dados

```typescript
// Validação de entrada
const validateEntry = (entry: EntryData): boolean => {
  if (!entry.employee_id || entry.employee_id <= 0) return false;
  if (!entry.date || isNaN(Date.parse(entry.date))) return false;
  if (!entry.refinery || entry.refinery.trim() === '') return false;
  if (!entry.points || entry.points < 0) return false;
  return true;
};

// Sanitização de dados
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Políticas RLS (Row Level Security)

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can view own entries" ON entry
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can insert own entries" ON entry
  FOR INSERT WITH CHECK (employee_id = auth.uid());
```

## 📊 Métricas e Monitoramento

### Logging de Operações

```typescript
// Estrutura de log
interface OperationLog {
  timestamp: string;
  operation: string;
  userId?: number;
  success: boolean;
  duration: number;
  metadata?: any;
}

// Exemplo de uso
const logOperation = (operation: string, success: boolean, duration: number) => {
  const log: OperationLog = {
    timestamp: new Date().toISOString(),
    operation,
    success,
    duration,
    userId: currentUser?.id
  };
  
  console.log('Operation Log:', log);
};
```

### Métricas de Performance

```typescript
// Medição de performance
const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    logOperation(operation, true, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logOperation(operation, false, duration);
    throw error;
  }
};
```

## 🧪 Testes de API

### Exemplos de Testes

```typescript
// Teste unitário
describe('EmployeeService', () => {
  it('should authenticate user with valid access key', async () => {
    const employee = await EmployeeService.authenticateByAccessKey('VALID_KEY');
    expect(employee).toBeDefined();
    expect(employee?.access_key).toBe('VALID_KEY');
  });
  
  it('should return null for invalid access key', async () => {
    const employee = await EmployeeService.authenticateByAccessKey('INVALID_KEY');
    expect(employee).toBeNull();
  });
});

// Teste de integração
describe('Entry Creation', () => {
  it('should create entry and send email', async () => {
    const entryData = {
      employee_id: 1,
      date: new Date().toISOString(),
      refinery: 'RPBC',
      points: 500,
      observations: 'Test entry'
    };
    
    const entry = await EmployeeService.createEntry(entryData);
    expect(entry).toBeDefined();
    expect(entry?.points).toBe(500);
  });
});
```

## 📚 Recursos Adicionais

### Documentação do Supabase

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

### Bibliotecas Utilizadas

- [React Query](https://tanstack.com/query/latest) - Gerenciamento de estado e cache
- [Recharts](https://recharts.org/) - Gráficos e visualizações
- [XLSX](https://sheetjs.com/) - Processamento de arquivos Excel
- [EmailJS](https://www.emailjs.com/) - Envio de emails

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025
