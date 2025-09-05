# Guia do Desenvolvedor - Documentação Técnica

## 👨‍💻 Visão Geral

Este guia é destinado a desenvolvedores que trabalharão no Sistema de Monitoramento de Performance. Ele contém informações técnicas detalhadas sobre arquitetura, padrões de código, e procedimentos de desenvolvimento.

## 🛠️ Ambiente de Desenvolvimento

### Pré-requisitos

#### Ferramentas Obrigatórias
- **Node.js**: Versão 18+ (recomendado: 18.17.0)
- **npm**: Versão 8+ (recomendado: 9.6.7)
- **Git**: Versão 2.30+
- **VS Code**: Editor recomendado
- **Supabase CLI**: Para gerenciamento do banco

#### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Configuração Inicial

#### 1. Clone e Setup
```bash
# Clone o repositório
git clone <repository-url>
cd monitorar_remaster_otimizado

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
```

#### 2. Configuração do Supabase
```bash
# Instale Supabase CLI
npm install -g supabase

# Faça login
supabase login

# Execute migrações
supabase db reset
```

#### 3. Configuração do Editor
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🏗️ Arquitetura e Padrões

### Estrutura de Pastas

```
src/
├── components/          # Componentes React
│   ├── Dashboard/       # Componentes específicos do dashboard
│   ├── Charts/          # Componentes de gráficos
│   └── ui/              # Biblioteca de componentes base
├── services/            # Camada de serviços
├── lib/                 # Utilitários e helpers
├── pages/               # Páginas da aplicação
├── hooks/               # Custom hooks
├── integrations/        # Integrações externas
└── main.tsx            # Ponto de entrada
```

### Padrões de Código

#### Nomenclatura
```typescript
// Arquivos e pastas: PascalCase
components/Dashboard/EmployeeCard.tsx

// Componentes: PascalCase
const EmployeeCard = () => {};

// Funções e variáveis: camelCase
const getEmployeeData = () => {};
const employeeData = {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Interfaces: PascalCase com sufixo
interface EmployeeData {}
interface EmployeeProps {}
```

#### Estrutura de Componentes
```typescript
// 1. Imports externos
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports internos
import { EmployeeService } from '@/services/EmployeeService';
import { Button } from '@/components/ui/button';

// 3. Imports relativos
import './Component.css';

// 4. Interfaces e tipos
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 5. Componente principal
const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // 6. Hooks
  const [state, setState] = useState('');
  
  // 7. Handlers
  const handleClick = () => {
    onAction();
  };
  
  // 8. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};

// 9. Export
export default Component;
```

### Padrões de Serviços

#### Estrutura de Serviço
```typescript
// src/services/ExampleService.ts
import { supabase } from '@/integrations/supabase/client';

export interface ExampleData {
  id: number;
  name: string;
  created_at: string;
}

export class ExampleService {
  // Métodos estáticos para operações CRUD
  static async getAll(): Promise<ExampleData[]> {
    const { data, error } = await supabase
      .from('example_table')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }
  
  static async getById(id: number): Promise<ExampleData | null> {
    const { data, error } = await supabase
      .from('example_table')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }
  
  static async create(data: Omit<ExampleData, 'id' | 'created_at'>): Promise<ExampleData> {
    const { data: result, error } = await supabase
      .from('example_table')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
}
```

## 🎨 Sistema de Design

### Design Tokens

#### Cores
```typescript
// src/lib/design-tokens.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#8b5cf6',
    600: '#7c3aed',
    900: '#581c87',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    900: '#7f1d1d',
  },
} as const;
```

#### Tipografia
```typescript
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
```

#### Espaçamento
```typescript
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;
```

### Componentes Base

#### Estrutura de Componente UI
```typescript
// src/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview da build
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas automáticos

# Banco de dados
npm run db:reset     # Reset do banco
npm run db:push      # Push das migrações
npm run db:generate  # Gerar tipos TypeScript
```

### Workflow de Desenvolvimento

#### 1. Criar Branch
```bash
# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Criar branch para bugfix
git checkout -b bugfix/corrigir-erro
```

#### 2. Desenvolver
```bash
# Instalar dependências (se necessário)
npm install

# Executar em desenvolvimento
npm run dev

# Verificar código
npm run lint
```

#### 3. Testar
```bash
# Executar testes (quando implementados)
npm run test

# Testar build
npm run build
npm run preview
```

#### 4. Commit
```bash
# Adicionar arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade de exportação"

# Push para repositório
git push origin feature/nova-funcionalidade
```

### Padrões de Commit

#### Estrutura da Mensagem
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação de código
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Tarefas de manutenção

#### Exemplos
```bash
feat(dashboard): adiciona gráfico de evolução mensal
fix(auth): corrige erro de login com chaves especiais
docs(api): atualiza documentação do EmployeeService
style(components): ajusta espaçamento dos cards
refactor(services): simplifica lógica de cálculos
test(utils): adiciona testes para date-utils
chore(deps): atualiza dependências do projeto
```

## 🧪 Testes

### Estratégia de Testes

#### Testes Unitários
```typescript
// src/services/__tests__/CalculationsService.test.ts
import { CalculationsService } from '../CalculationsService';

describe('CalculationsService', () => {
  describe('getWeekDates', () => {
    it('should return correct dates for week 1', () => {
      const weekDates = CalculationsService.getWeekDates('1');
      
      expect(weekDates.start).toBe('2024-01-26');
      expect(weekDates.end).toBe('2024-02-01');
    });
    
    it('should throw error for invalid week', () => {
      expect(() => CalculationsService.getWeekDates('6')).toThrow();
    });
  });
  
  describe('calculateProgressPercentage', () => {
    it('should calculate correct percentage', () => {
      const percentage = CalculationsService.calculateProgressPercentage(475, 950);
      expect(percentage).toBe(50);
    });
    
    it('should return 0 for zero goal', () => {
      const percentage = CalculationsService.calculateProgressPercentage(100, 0);
      expect(percentage).toBe(0);
    });
  });
});
```

#### Testes de Integração
```typescript
// src/services/__tests__/EmployeeService.integration.test.ts
import { EmployeeService } from '../EmployeeService';
import { supabase } from '@/integrations/supabase/client';

describe('EmployeeService Integration', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await supabase.from('entry').delete().neq('id', 0);
  });
  
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
    
    // Verificar se email foi adicionado à fila
    const { data: emailQueue } = await supabase
      .from('email_queue')
      .select('*')
      .eq('employee_name', 'Test Employee');
    
    expect(emailQueue).toHaveLength(1);
  });
});
```

#### Testes de Componentes
```typescript
// src/components/__tests__/EmployeeCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EmployeeCard } from '../Dashboard/EmployeeCard';

const mockEmployee = {
  id: 1,
  name: 'João Silva',
  real_name: 'João Silva',
  username: 'JSILVA',
  access_key: 'ABC123',
  role: 'Operador',
  weekly_goal: 2375,
  default_refinery: 'RPBC'
};

describe('EmployeeCard', () => {
  it('should render employee information', () => {
    render(<EmployeeCard employee={mockEmployee} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('JSILVA')).toBeInTheDocument();
    expect(screen.getByText('RPBC')).toBeInTheDocument();
  });
  
  it('should display progress bar', () => {
    render(<EmployeeCard employee={mockEmployee} progress={75} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });
});
```

### Configuração de Testes

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Setup Tests
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills para Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));
```

## 🔍 Debugging

### Ferramentas de Debug

#### React Developer Tools
```typescript
// Instalar extensão do Chrome
// https://chrome.google.com/webstore/detail/react-developer-tools

// Debug de componentes
const MyComponent = () => {
  const [state, setState] = useState('');
  
  // Debug no console
  console.log('Component state:', state);
  
  // Debug com breakpoint
  debugger;
  
  return <div>{state}</div>;
};
```

#### Redux DevTools (se usando Redux)
```typescript
// Configuração do Redux DevTools
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
```

#### Network Debugging
```typescript
// Interceptar requisições
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch request:', args);
  const response = await originalFetch(...args);
  console.log('Fetch response:', response);
  return response;
};
```

### Logging

#### Estrutura de Logs
```typescript
// src/lib/logger.ts
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: {
    userId?: number;
    action?: string;
    metadata?: any;
  };
}

class Logger {
  private static formatMessage(level: string, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      context,
    };
  }
  
  static info(message: string, context?: any) {
    const log = this.formatMessage('info', message, context);
    console.log('ℹ️', log);
  }
  
  static warn(message: string, context?: any) {
    const log = this.formatMessage('warn', message, context);
    console.warn('⚠️', log);
  }
  
  static error(message: string, context?: any) {
    const log = this.formatMessage('error', message, context);
    console.error('❌', log);
  }
  
  static debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatMessage('debug', message, context);
      console.debug('🐛', log);
    }
  }
}

export { Logger };
```

#### Uso do Logger
```typescript
// Em serviços
import { Logger } from '@/lib/logger';

export class EmployeeService {
  static async getEmployeeById(id: number) {
    Logger.info('Fetching employee', { employeeId: id });
    
    try {
      const result = await getEmployeeById(id);
      Logger.info('Employee fetched successfully', { employeeId: id });
      return result;
    } catch (error) {
      Logger.error('Failed to fetch employee', { employeeId: id, error });
      throw error;
    }
  }
}
```

## 📦 Gerenciamento de Dependências

### Estrutura do package.json

```json
{
  "name": "sistema-monitoramento",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.56.0",
    "@tanstack/react-query": "^5.83.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "typescript": "^5.8.3",
    "vite": "^5.4.19",
    "eslint": "^9.32.0"
  }
}
```

### Atualização de Dependências

#### Verificar Atualizações
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Atualizar dependência específica
npm install package-name@latest
```

#### Auditoria de Segurança
```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Forçar correção
npm audit fix --force
```

## 🚀 Performance

### Otimizações Implementadas

#### Code Splitting
```typescript
// Lazy loading de componentes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Graficos = lazy(() => import('./pages/Graficos'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/graficos" element={<Graficos />} />
    </Routes>
  </Suspense>
);
```

#### Memoização
```typescript
// Memoização de componentes
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);
  
  return <div>{/* render */}</div>;
});
```

#### Otimização de Imagens
```typescript
// Lazy loading de imagens
const LazyImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img
      src={loaded ? src : placeholder}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
};
```

### Análise de Performance

#### Bundle Analyzer
```bash
# Instalar bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Analisar bundle
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

#### Lighthouse
```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Analisar performance
lighthouse https://your-domain.com --output=html --output-path=./lighthouse-report.html
```

## 🔒 Segurança

### Boas Práticas

#### Validação de Dados
```typescript
// Validação com Zod
import { z } from 'zod';

const EmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().min(18).max(100),
});

const validateEmployee = (data: unknown) => {
  try {
    return EmployeeSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid employee data');
  }
};
```

#### Sanitização
```typescript
// Sanitização de entrada
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};
```

#### Headers de Segurança
```typescript
// Configuração de headers
const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Ferramentas Úteis
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com/)
- [Supabase Studio](https://supabase.com/dashboard)

### Comunidade
- [React Community](https://react.dev/community)
- [TypeScript Community](https://www.typescriptlang.org/community)
- [Supabase Discord](https://discord.supabase.com/)

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025
