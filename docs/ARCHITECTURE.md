# Arquitetura do Sistema - Documentação Técnica

## 🏗️ Visão Geral da Arquitetura

O Sistema de Monitoramento de Performance segue uma arquitetura moderna baseada em **Single Page Application (SPA)** com separação clara de responsabilidades e padrões de design bem definidos.

### Princípios Arquiteturais

- **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
- **Componentização**: Componentes reutilizáveis e modulares
- **Type Safety**: TypeScript em toda a aplicação
- **Performance**: Otimizações para carregamento rápido
- **Escalabilidade**: Estrutura preparada para crescimento

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
├─────────────────────────────────────────────────────────────┤
│  React Components (UI)                                      │
│  ├── Pages (Rotas)                                          │
│  ├── Components (Reutilizáveis)                             │
│  ├── Charts (Visualizações)                                 │
│  └── UI Library (shadcn/ui)                                 │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE LÓGICA                         │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                  │
│  ├── EmployeeService                                        │
│  ├── CalculationsService                                    │
│  ├── DataService                                            │
│  └── ExportService                                          │
├─────────────────────────────────────────────────────────────┤
│                    CAMADA DE DADOS                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase (Backend-as-a-Service)                            │
│  ├── PostgreSQL Database                                    │
│  ├── Real-time Subscriptions                                │
│  ├── Authentication                                         │
│  └── Storage                                                │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Estrutura de Componentes

### Hierarquia de Componentes

```
App
├── ErrorBoundary
├── QueryClientProvider
├── TooltipProvider
├── BrowserRouter
│   ├── Routes
│   │   ├── Login (Rota Pública)
│   │   ├── Dashboard (Rota Pública)
│   │   └── Admin Routes (Rota Protegida)
│   │       ├── SidebarProvider
│   │       │   ├── AppSidebar
│   │       │   └── Main Content
│   │       │       ├── Index (Dashboard Executivo)
│   │       │       ├── Graficos
│   │       │       ├── Registros
│   │       │       └── PointRegistration
│   │       └── NotFound
└── Toaster (Notificações)
```

### Componentes por Categoria

#### 1. Páginas (Pages)
```typescript
// src/pages/
├── Dashboard.tsx      // Dashboard do funcionário
├── Index.tsx          // Dashboard executivo
├── Graficos.tsx       // Página de gráficos
├── Registros.tsx      // Gestão de registros
├── Login.tsx          // Autenticação
├── PointRegistration.tsx // Registro de pontos
└── NotFound.tsx       // Página 404
```

#### 2. Componentes de Dashboard
```typescript
// src/components/Dashboard/
├── EmployeeCard.tsx           // Card de funcionário
├── EmployeeDashboard.tsx      // Dashboard principal
├── ExcelDashboard.tsx         // Dashboard de Excel
├── Header.tsx                 // Cabeçalho
├── HistoryTab.tsx             // Aba de histórico
├── LoadingState.tsx           // Estados de carregamento
├── MetricCard.tsx             // Card de métricas
├── MonthlyEvolutionTab.tsx    // Evolução mensal
├── NavigationTabs.tsx         // Navegação por abas
└── ProgressSection.tsx        // Seção de progresso
```

#### 3. Componentes de Gráficos
```typescript
// src/components/Charts/
├── ChartContainer.tsx         // Container de gráficos
├── ChartTypeSelector.tsx      // Seletor de tipo
├── EmployeeControls.tsx       // Controles de funcionário
├── ExecutivePanel.tsx         // Painel executivo
├── MonthlyChart.tsx           // Gráfico mensal
├── TeamChart.tsx              // Gráfico da equipe
└── WeeklyChart.tsx            // Gráfico semanal
```

#### 4. Biblioteca UI
```typescript
// src/components/ui/
├── button.tsx                 // Botões
├── card.tsx                   // Cards
├── input.tsx                  // Inputs
├── select.tsx                 // Seletores
├── table.tsx                  // Tabelas
├── tabs.tsx                   // Abas
├── toast.tsx                  // Notificações
└── ... (50+ componentes)
```

## 🔧 Camada de Serviços

### EmployeeService
**Responsabilidade**: Gestão de funcionários e autenticação

```typescript
class EmployeeService {
  // Autenticação
  static async authenticateByAccessKey(accessKey: string): Promise<Employee | null>
  
  // CRUD de funcionários
  static async getEmployeeById(id: number): Promise<Employee | null>
  static async getAllEmployees(): Promise<Employee[]>
  
  // Gestão de registros
  static async createEntry(entry: EntryData): Promise<Entry | null>
  static async getEmployeeEntries(employeeId: number): Promise<Entry[]>
  
  // Cálculos de pontos
  static async getTodayPoints(employeeId: number): Promise<number>
  static async getWeekPoints(employeeId: number, weekDates: WeekDates): Promise<number>
  static async getMonthPoints(employeeId: number, monthDates: MonthDates): Promise<number>
}
```

### CalculationsService
**Responsabilidade**: Lógica de cálculos e datas

```typescript
class CalculationsService {
  // Cálculos de datas (ciclo 26→25)
  static getWeekDates(weekStr: string): WeekDates
  static getMonthCycleDates(month?: number, year?: number): MonthCycleDates
  static getCurrentWeek(): number
  
  // Metas e objetivos
  static getDailyGoal(employee: Employee): number
  static getWeeklyGoal(employee: Employee): number
  static getMonthlyGoal(employee: Employee): number
  
  // Análise de performance
  static calculateProgressPercentage(current: number, goal: number): number
  static getEmployeeStatus(progressPercentage: number): Status
}
```

### DataService
**Responsabilidade**: Processamento e exportação de dados

```typescript
class DataService {
  // Processamento de Excel
  static async processExcelFile(file: File): Promise<ProcessedData>
  static async exportToExcel(data: ExportData): Promise<Blob>
  
  // Geração de relatórios
  static async generateReport(employeeId: number, period: Period): Promise<Report>
  static async getTeamMetrics(period: Period): Promise<TeamMetrics>
}
```

### ExportService
**Responsabilidade**: Exportação e formatação de dados

```typescript
class ExportService {
  // Exportação para Excel
  static async exportEmployeeData(employeeId: number): Promise<Blob>
  static async exportTeamReport(period: Period): Promise<Blob>
  
  // Formatação de dados
  static formatDataForExport(data: any[]): FormattedData
  static generateExcelTemplate(data: FormattedData): Workbook
}
```

## 🗄️ Estrutura do Banco de Dados

### Modelo de Dados

```sql
-- Tabela de funcionários
CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  real_name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  access_key VARCHAR(255) UNIQUE,
  role VARCHAR(100),
  weekly_goal INTEGER,
  default_refinery VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de registros
CREATE TABLE entry (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employee(id),
  date TIMESTAMP NOT NULL,
  refinery VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  observations TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fila de emails
CREATE TABLE email_queue (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255),
  date TIMESTAMP,
  points INTEGER,
  refinery VARCHAR(50),
  observations TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relacionamentos

```
employee (1) ──── (N) entry
employee (1) ──── (N) email_queue
```

### Índices de Performance

```sql
-- Índices para otimização
CREATE INDEX idx_entry_employee_date ON entry(employee_id, date);
CREATE INDEX idx_entry_date ON entry(date);
CREATE INDEX idx_employee_access_key ON employee(access_key);
CREATE INDEX idx_email_queue_status ON email_queue(status);
```

## 🔄 Fluxo de Dados

### 1. Autenticação
```
Usuário → Login → EmployeeService.authenticateByAccessKey() → Supabase → Employee
```

### 2. Registro de Pontos
```
Usuário → Form → EmployeeService.createEntry() → Supabase → EmailQueue → EmailJS
```

### 3. Cálculo de Métricas
```
Dashboard → EmployeeService.getTodayPoints() → Supabase → CalculationsService → UI
```

### 4. Exportação de Dados
```
Usuário → Export → DataService.exportToExcel() → JSZip → Download
```

## 🎨 Sistema de Design

### Design Tokens

```typescript
// Cores
const colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#64748b'
};

// Tipografia
const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  }
};

// Espaçamento
const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
};
```

### Componentes Base

#### Button
```typescript
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}
```

#### Card
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'elevated'
}
```

## 🔒 Segurança

### Autenticação
- **Chaves de Acesso**: Sistema de autenticação por chave única
- **Validação**: Verificação de dados em todas as operações
- **Sessões**: Gerenciamento seguro de sessões

### Autorização
- **RLS (Row Level Security)**: Políticas de segurança no Supabase
- **Validação de Entrada**: Sanitização de dados do usuário
- **Rate Limiting**: Proteção contra abuso

### Dados Sensíveis
- **Criptografia**: Dados sensíveis criptografados
- **Backup**: Rotinas automáticas de backup
- **Auditoria**: Log de operações críticas

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Adaptações por Dispositivo

#### Mobile (< 768px)
- Layout em coluna única
- Navegação simplificada
- Componentes otimizados para touch

#### Tablet (768px - 1024px)
- Grid adaptativo
- Controles otimizados
- Navegação híbrida

#### Desktop (> 1024px)
- Layout completo
- Funcionalidades avançadas
- Múltiplas colunas

## ⚡ Performance

### Otimizações Implementadas

#### 1. Bundle Optimization
```typescript
// Code splitting por rota
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Graficos = lazy(() => import('./pages/Graficos'));

// Tree shaking automático
import { Button } from '@/components/ui/button'; // ✅
import * as UI from '@/components/ui'; // ❌
```

#### 2. Caching Strategy
```typescript
// React Query para cache de dados
const { data, isLoading } = useQuery({
  queryKey: ['employee', employeeId],
  queryFn: () => EmployeeService.getEmployeeById(employeeId),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000 // 10 minutos
});
```

#### 3. Image Optimization
```typescript
// Lazy loading de imagens
<img 
  src={imageSrc} 
  loading="lazy" 
  alt="Description"
  className="w-full h-auto"
/>
```

### Métricas de Performance

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Bundle Size
- **Initial Bundle**: ~200KB gzipped
- **Vendor Bundle**: ~150KB gzipped
- **Total Bundle**: ~350KB gzipped

## 🧪 Testes

### Estratégia de Testes

#### 1. Testes Unitários
```typescript
// Exemplo de teste unitário
describe('CalculationsService', () => {
  it('should calculate correct week dates', () => {
    const weekDates = CalculationsService.getWeekDates('1');
    expect(weekDates.start).toBe('2024-01-26');
    expect(weekDates.end).toBe('2024-02-01');
  });
});
```

#### 2. Testes de Integração
```typescript
// Exemplo de teste de integração
describe('EmployeeService Integration', () => {
  it('should create entry and send email', async () => {
    const entry = await EmployeeService.createEntry(mockEntry);
    expect(entry).toBeDefined();
    // Verificar se email foi adicionado à fila
  });
});
```

#### 3. Testes E2E
```typescript
// Exemplo de teste E2E
describe('Dashboard Flow', () => {
  it('should complete full registration flow', () => {
    cy.visit('/login');
    cy.get('[data-testid="access-key"]').type('TEST123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: vercel --token ${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 📊 Monitoramento

### Métricas de Aplicação

#### 1. Performance Metrics
- **Page Load Time**: Tempo de carregamento das páginas
- **API Response Time**: Tempo de resposta das APIs
- **Error Rate**: Taxa de erros da aplicação

#### 2. Business Metrics
- **User Engagement**: Tempo de sessão e páginas visitadas
- **Feature Usage**: Uso de funcionalidades específicas
- **Conversion Rate**: Taxa de conversão de ações

#### 3. Technical Metrics
- **Bundle Size**: Tamanho dos assets
- **Memory Usage**: Uso de memória da aplicação
- **Network Requests**: Número e tamanho das requisições

### Logging Strategy

```typescript
// Estrutura de logs
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: {
    userId?: number;
    action?: string;
    metadata?: any;
  };
}

// Exemplo de uso
logger.info('User logged in', {
  userId: user.id,
  action: 'login',
  metadata: { accessKey: '***' }
});
```

## 🚀 Escalabilidade

### Preparação para Crescimento

#### 1. Horizontal Scaling
- **CDN**: Distribuição de assets estáticos
- **Load Balancing**: Balanceamento de carga
- **Database Sharding**: Particionamento de dados

#### 2. Vertical Scaling
- **Caching**: Redis para cache de dados
- **Database Optimization**: Otimização de queries
- **Asset Optimization**: Compressão e minificação

#### 3. Microservices (Futuro)
- **API Gateway**: Centralização de APIs
- **Service Discovery**: Descoberta de serviços
- **Event-Driven Architecture**: Arquitetura baseada em eventos

## 📚 Padrões e Convenções

### Nomenclatura

#### Arquivos e Pastas
```
components/          // PascalCase para componentes
├── Dashboard/       // PascalCase para pastas
│   ├── EmployeeCard.tsx  // PascalCase para arquivos
│   └── index.ts     // camelCase para arquivos utilitários
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const employeeData = getEmployeeById(id);
const calculateProgress = (current: number, goal: number) => {};

// PascalCase para classes e interfaces
class EmployeeService {}
interface EmployeeData {}
```

#### Constantes
```typescript
// UPPER_SNAKE_CASE para constantes
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
```

### Estrutura de Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug na autenticação
docs: atualiza documentação
style: ajusta formatação do código
refactor: refatora serviço de cálculos
test: adiciona testes para componente
chore: atualiza dependências
```

### Estrutura de Imports

```typescript
// 1. Imports externos
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos (absolutos)
import { EmployeeService } from '@/services/EmployeeService';
import { Button } from '@/components/ui/button';

// 3. Imports relativos
import './Component.css';
import { helperFunction } from './utils';
```

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025
