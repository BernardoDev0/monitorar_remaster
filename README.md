# Sistema de Monitoramento de Performance - Documentação Técnica

## 📋 Visão Geral

O **Sistema de Monitoramento de Performance** é uma aplicação web moderna desenvolvida para gerenciar e acompanhar o desempenho de equipes em refinarias. O sistema oferece dashboards executivos, relatórios detalhados, gestão de funcionários e sistema de pontuação baseado em metas.

### 🎯 Objetivos do Sistema

- **Monitoramento em Tempo Real**: Acompanhamento contínuo da performance individual e da equipe
- **Gestão de Metas**: Sistema de metas diárias, semanais e mensais personalizáveis
- **Relatórios Executivos**: Dashboards com visualizações interativas e exportação de dados
- **Automação**: Notificações por email e processamento automático de dados
- **Escalabilidade**: Arquitetura preparada para crescimento e múltiplas refinarias

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|--------|------------|--------|-----------|
| **Frontend** | React | 18.3.1 | Interface do usuário |
| **Linguagem** | TypeScript | 5.8.3 | Tipagem estática |
| **Styling** | Tailwind CSS | 3.4.17 | Estilização |
| **UI Components** | shadcn/ui + Radix UI | Latest | Componentes acessíveis |
| **Backend** | Supabase | 2.56.0 | Backend-as-a-Service |
| **Gráficos** | Recharts | 2.15.4 | Visualizações de dados |
| **Build Tool** | Vite | 5.4.19 | Build e desenvolvimento |
| **Email** | EmailJS | 4.4.1 | Notificações por email |

### Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Dashboard/       # Componentes específicos do dashboard
│   ├── Charts/          # Componentes de gráficos e visualizações
│   └── ui/              # Biblioteca de componentes base
├── services/            # Camada de serviços e lógica de negócio
├── lib/                 # Utilitários, constantes e helpers
├── pages/               # Páginas da aplicação (roteamento)
├── hooks/               # Custom hooks do React
├── integrations/        # Integrações com serviços externos
└── main.tsx            # Ponto de entrada da aplicação
```

## 🚀 Funcionalidades Principais

### 1. Dashboard Executivo
- **Visão Geral**: Métricas consolidadas da equipe
- **Cards de Performance**: Indicadores visuais de progresso
- **Filtros Dinâmicos**: Por funcionário, período e refinaria
- **Tempo Real**: Atualizações automáticas de dados

### 2. Sistema de Pontuação
- **Metas Personalizadas**: Configuração individual por funcionário
- **Ciclos Mensais**: Sistema 26→25 (dia 26 ao 25 do mês seguinte)
- **Semanas**: Divisão em 5 semanas por ciclo mensal
- **Cálculos Automáticos**: Progresso diário, semanal e mensal

### 3. Gestão de Funcionários
- **Autenticação**: Sistema de chaves de acesso
- **Perfis**: Dados pessoais e configurações
- **Metas**: Configuração de objetivos individuais
- **Histórico**: Registro completo de atividades

### 4. Relatórios e Exportação
- **Gráficos Interativos**: Visualizações semanais e mensais
- **Exportação Excel**: Relatórios detalhados
- **Filtros Avançados**: Por período, funcionário e refinaria
- **Comparativos**: Análise de performance entre períodos

### 5. Notificações
- **Email Automático**: Confirmação de registros
- **Alertas**: Notificações de metas e prazos
- **Fila de Processamento**: Sistema assíncrono de emails

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js**: Versão 18+ 
- **npm**: Versão 8+
- **Supabase**: Conta ativa
- **EmailJS**: Conta configurada

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd monitorar_remaster_otimizado

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
```

### Configuração de Variáveis de Ambiente

Crie o arquivo `.env.local` com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

### Configuração do Banco de Dados

```bash
# 1. Instale o Supabase CLI
npm install -g supabase

# 2. Execute as migrações
supabase db reset

# 3. Configure as políticas RLS
supabase db push
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento

```bash
# Servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:8080
```

### Build para Produção

```bash
# Build otimizado
npm run build

# Preview da build
npm run preview
```

### Linting e Qualidade

```bash
# Verificar código
npm run lint

# Corrigir problemas automáticos
npm run lint -- --fix
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `employee`
```sql
- id: number (PK)
- name: string
- real_name: string
- username: string
- access_key: string (único)
- role: string
- weekly_goal: number
- default_refinery: string
- created_at: timestamp
- updated_at: timestamp
```

#### `entry`
```sql
- id: number (PK)
- employee_id: number (FK)
- date: string (ISO)
- refinery: string
- points: number
- observations: text
- created_at: timestamp
- updated_at: timestamp
```

#### `email_queue`
```sql
- id: number (PK)
- employee_name: string
- date: string
- points: number
- refinery: string
- observations: text
- status: string
- created_at: timestamp
```

## 🔧 Serviços e APIs

### EmployeeService
```typescript
// Autenticação
authenticateByAccessKey(accessKey: string): Promise<Employee | null>

// Gestão de funcionários
getEmployeeById(id: number): Promise<Employee | null>
getAllEmployees(): Promise<Employee[]>

// Registros
createEntry(entry: EntryData): Promise<Entry | null>
getEmployeeEntries(employeeId: number): Promise<Entry[]>

// Cálculos
getTodayPoints(employeeId: number): Promise<number>
getWeekPoints(employeeId: number, weekDates: WeekDates): Promise<number>
getMonthPoints(employeeId: number, monthDates: MonthDates): Promise<number>
```

### CalculationsService
```typescript
// Cálculos de datas
getWeekDates(weekStr: string): WeekDates
getMonthCycleDates(month?: number, year?: number): MonthCycleDates
getCurrentWeek(): number

// Metas
getDailyGoal(employee: Employee): number
getWeeklyGoal(employee: Employee): number
getMonthlyGoal(employee: Employee): number

// Progresso
calculateProgressPercentage(current: number, goal: number): number
getEmployeeStatus(progressPercentage: number): Status
```

### DataService
```typescript
// Processamento de dados
processExcelFile(file: File): Promise<ProcessedData>
exportToExcel(data: ExportData): Promise<Blob>
generateReport(employeeId: number, period: Period): Promise<Report>
```

## 🎨 Sistema de Design

### Cores e Temas

```css
/* Cores principais */
--dashboard-primary: #3b82f6
--dashboard-secondary: #8b5cf6
--dashboard-success: #10b981
--dashboard-warning: #f59e0b
--dashboard-danger: #ef4444

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-card: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)
```

### Componentes UI

O sistema utiliza a biblioteca **shadcn/ui** com componentes baseados em **Radix UI**:

- **Acessibilidade**: Componentes totalmente acessíveis
- **Customização**: Temas e estilos personalizáveis
- **Responsividade**: Design mobile-first
- **Consistência**: Padrões visuais unificados

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Telas grandes */
```

### Adaptações por Dispositivo

- **Mobile**: Layout em coluna única, navegação simplificada
- **Tablet**: Grid adaptativo, controles otimizados
- **Desktop**: Layout completo, funcionalidades avançadas

## 🔒 Segurança

### Autenticação
- **Chaves de Acesso**: Sistema de autenticação por chave única
- **Sessões**: Gerenciamento de sessão no localStorage
- **Validação**: Verificação de dados em todas as operações

### Autorização
- **RLS (Row Level Security)**: Políticas de segurança no Supabase
- **Validação de Entrada**: Sanitização de dados do usuário
- **Rate Limiting**: Proteção contra abuso de APIs

### Dados Sensíveis
- **Criptografia**: Dados sensíveis criptografados
- **Backup**: Rotinas automáticas de backup
- **Auditoria**: Log de todas as operações críticas

## 🚀 Deploy e Produção

### Vercel (Recomendado)

```bash
# 1. Instale a CLI da Vercel
npm install -g vercel

# 2. Configure o projeto
vercel

# 3. Configure as variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# ... outras variáveis

# 4. Deploy
vercel --prod
```

### Netlify

```bash
# 1. Build do projeto
npm run build

# 2. Upload da pasta dist/
# 3. Configure as variáveis de ambiente no painel
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📈 Monitoramento e Analytics

### Métricas de Performance
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: Análise do tamanho dos assets
- **Loading Times**: Tempos de carregamento das páginas

### Logs e Debugging
- **Console Logs**: Logs estruturados para debugging
- **Error Tracking**: Captura de erros em produção
- **User Analytics**: Comportamento do usuário (opcional)

## 🧪 Testes

### Estratégia de Testes

```bash
# Testes unitários (futuro)
npm run test

# Testes de integração (futuro)
npm run test:integration

# Testes E2E (futuro)
npm run test:e2e
```

### Cobertura de Testes
- **Componentes**: Testes de renderização e interação
- **Serviços**: Testes de lógica de negócio
- **Integrações**: Testes de APIs externas

## 🔄 CI/CD

### GitHub Actions (Exemplo)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
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
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 📚 Documentação Adicional

### Guias Específicos

- [Guia do Usuário](./docs/USER_GUIDE.md) - Manual completo para usuários finais
- [Guia do Desenvolvedor](./docs/DEVELOPER_GUIDE.md) - Documentação técnica detalhada
- [API Reference](./docs/API_REFERENCE.md) - Documentação completa das APIs
- [Deployment Guide](./docs/DEPLOYMENT.md) - Guia de deploy e configuração

### Arquivos de Configuração

- [package.json](./package.json) - Dependências e scripts
- [vite.config.ts](./vite.config.ts) - Configuração do Vite
- [tailwind.config.ts](./tailwind.config.ts) - Configuração do Tailwind
- [tsconfig.json](./tsconfig.json) - Configuração do TypeScript

## 🤝 Contribuição

### Processo de Contribuição

1. **Fork** do repositório
2. **Criar branch** para a feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abrir Pull Request**

### Padrões de Código

- **ESLint**: Configuração rigorosa de linting
- **Prettier**: Formatação automática de código
- **TypeScript**: Tipagem estática obrigatória
- **Conventional Commits**: Padrão de mensagens de commit

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

## 📞 Suporte e Contato

### Canais de Suporte

- **Issues**: [GitHub Issues](link-para-issues) para bugs e feature requests
- **Documentação**: [Wiki do Projeto](link-para-wiki) para guias detalhados
- **Email**: suporte@empresa.com para suporte técnico

### Equipe de Desenvolvimento

- **Tech Lead**: [Nome] - [email]
- **Frontend**: [Nome] - [email]
- **Backend**: [Nome] - [email]
- **DevOps**: [Nome] - [email]

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

**Versão da Documentação**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025