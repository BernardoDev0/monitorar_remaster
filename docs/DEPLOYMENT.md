# Guia de Deploy - Documentação Técnica

## 🚀 Visão Geral

Este guia fornece instruções detalhadas para fazer deploy do Sistema de Monitoramento de Performance em diferentes ambientes e plataformas.

## 📋 Pré-requisitos

### Ferramentas Necessárias

- **Node.js**: Versão 18 ou superior
- **npm**: Versão 8 ou superior
- **Git**: Para controle de versão
- **Conta Supabase**: Para backend
- **Conta EmailJS**: Para notificações por email

### Contas de Serviços

- **Vercel** (recomendado) ou **Netlify**: Para hosting
- **Supabase**: Para banco de dados e autenticação
- **EmailJS**: Para envio de emails

## 🔧 Configuração do Ambiente

### 1. Configuração do Supabase

#### Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Configure:
   - **Name**: `sistema-monitoramento`
   - **Database Password**: Senha forte
   - **Region**: Escolha a região mais próxima

#### Configurar Banco de Dados
```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Inicializar projeto (se necessário)
supabase init

# 4. Executar migrações
supabase db reset
```

#### Executar Migrações
```sql
-- Executar os arquivos em supabase/migrations/
-- 1. 20250827172146_59460e5c-e236-4fec-b119-415dd46b27e2.sql
-- 2. 20250827172321_23e9a23d-65a3-4f33-a4e3-7b50f740f6c1.sql
-- 3. 20250827172406_fc8c1caa-94f5-46f6-a6e0-ccbd9bd6e0a9.sql
-- 4. 20250901163500_create_email_queue.sql
-- 5. 20250901193000_email_queue_policies.sql
```

#### Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS nas tabelas
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo
CREATE POLICY "Enable read access for all users" ON employee FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON entry FOR INSERT WITH CHECK (true);
```

### 2. Configuração do EmailJS

#### Criar Conta
1. Acesse [emailjs.com](https://emailjs.com)
2. Crie uma conta gratuita
3. Configure um serviço de email (Gmail, Outlook, etc.)

#### Configurar Template
```html
<!-- Template de email de confirmação -->
<h2>Confirmação de Registro</h2>
<p>Olá {{employee_name}},</p>
<p>Seu registro foi confirmado:</p>
<ul>
  <li><strong>Data:</strong> {{date}}</li>
  <li><strong>Pontos:</strong> {{points}}</li>
  <li><strong>Refinaria:</strong> {{refinery}}</li>
  <li><strong>Observações:</strong> {{observations}}</li>
</ul>
<p>Obrigado pelo seu trabalho!</p>
```

### 3. Variáveis de Ambiente

#### Arquivo .env.local
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key

# Environment
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

#### Obter Chaves do Supabase
1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_PUBLISHABLE_KEY`

#### Obter Chaves do EmailJS
1. No painel do EmailJS, vá em **Account** → **General**
2. Copie:
   - **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`
3. Em **Email Services**, copie:
   - **Service ID** → `VITE_EMAILJS_SERVICE_ID`
4. Em **Email Templates**, copie:
   - **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`

## 🏗️ Build Local

### Desenvolvimento
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves

# 3. Executar em desenvolvimento
npm run dev

# Acesse: http://localhost:8080
```

### Build de Produção
```bash
# 1. Build otimizado
npm run build

# 2. Preview da build
npm run preview

# 3. Verificar arquivos gerados
ls -la dist/
```

### Verificação de Qualidade
```bash
# Linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit

# Testes (quando implementados)
npm run test
```

## 🌐 Deploy na Vercel (Recomendado)

### Método 1: Deploy via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy inicial
vercel

# 4. Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_EMAILJS_SERVICE_ID
vercel env add VITE_EMAILJS_TEMPLATE_ID
vercel env add VITE_EMAILJS_PUBLIC_KEY

# 5. Deploy para produção
vercel --prod
```

### Método 2: Deploy via GitHub

#### Configurar Repositório
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Configure o domínio personalizado (opcional)

#### Configuração do vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@vite_supabase_publishable_key",
    "VITE_EMAILJS_SERVICE_ID": "@vite_emailjs_service_id",
    "VITE_EMAILJS_TEMPLATE_ID": "@vite_emailjs_template_id",
    "VITE_EMAILJS_PUBLIC_KEY": "@vite_emailjs_public_key"
  }
}
```

### Configurações da Vercel

#### Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

#### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

## 🌐 Deploy na Netlify

### Método 1: Deploy via CLI

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Fazer login
netlify login

# 3. Build do projeto
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist
```

### Método 2: Deploy via GitHub

#### Configurar Repositório
1. Conecte seu repositório GitHub à Netlify
2. Configure as variáveis de ambiente
3. Configure o domínio personalizado

#### Configuração do netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_PUBLISHABLE_KEY = "your-anon-key"
  VITE_EMAILJS_SERVICE_ID = "your-service-id"
  VITE_EMAILJS_TEMPLATE_ID = "your-template-id"
  VITE_EMAILJS_PUBLIC_KEY = "your-public-key"
```

## 🐳 Deploy com Docker

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
      - VITE_EMAILJS_SERVICE_ID=${VITE_EMAILJS_SERVICE_ID}
      - VITE_EMAILJS_TEMPLATE_ID=${VITE_EMAILJS_TEMPLATE_ID}
      - VITE_EMAILJS_PUBLIC_KEY=${VITE_EMAILJS_PUBLIC_KEY}
    restart: unless-stopped
```

### Comandos Docker
```bash
# Build da imagem
docker build -t sistema-monitoramento .

# Executar container
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key \
  -e VITE_EMAILJS_SERVICE_ID=your-service-id \
  -e VITE_EMAILJS_TEMPLATE_ID=your-template-id \
  -e VITE_EMAILJS_PUBLIC_KEY=your-public-key \
  sistema-monitoramento

# Com Docker Compose
docker-compose up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_EMAILJS_SERVICE_ID: ${{ secrets.VITE_EMAILJS_SERVICE_ID }}
          VITE_EMAILJS_TEMPLATE_ID: ${{ secrets.VITE_EMAILJS_TEMPLATE_ID }}
          VITE_EMAILJS_PUBLIC_KEY: ${{ secrets.VITE_EMAILJS_PUBLIC_KEY }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Configurar Secrets no GitHub
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Adicione os seguintes secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

## 🔍 Verificação Pós-Deploy

### Checklist de Verificação

#### ✅ Funcionalidades Básicas
- [ ] Página de login carrega corretamente
- [ ] Autenticação funciona com chaves válidas
- [ ] Dashboard carrega dados do funcionário
- [ ] Registro de pontos funciona
- [ ] Gráficos são exibidos corretamente
- [ ] Exportação de dados funciona

#### ✅ Performance
- [ ] Tempo de carregamento < 3 segundos
- [ ] Core Web Vitals dentro dos limites
- [ ] Bundle size otimizado
- [ ] Imagens carregam corretamente

#### ✅ Segurança
- [ ] Variáveis de ambiente não expostas
- [ ] HTTPS habilitado
- [ ] Headers de segurança configurados
- [ ] RLS habilitado no Supabase

#### ✅ Integrações
- [ ] Supabase conectado
- [ ] Emails sendo enviados
- [ ] Dados sendo salvos corretamente
- [ ] Notificações funcionando

### Comandos de Verificação

```bash
# Verificar se o build foi bem-sucedido
curl -I https://your-domain.com

# Verificar variáveis de ambiente
curl https://your-domain.com | grep -o 'VITE_.*'

# Verificar performance
lighthouse https://your-domain.com --output=html --output-path=./lighthouse-report.html
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build
```bash
# Verificar dependências
npm install

# Limpar cache
npm run build -- --force

# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
```

#### 2. Erro de Conexão com Supabase
```typescript
// Verificar configuração
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// Testar conexão
const { data, error } = await supabase.from('employee').select('count');
console.log('Connection test:', { data, error });
```

#### 3. Emails Não Enviando
```typescript
// Verificar configuração EmailJS
console.log('EmailJS Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log('EmailJS Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
console.log('EmailJS Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Testar envio
import emailjs from '@emailjs/browser';
const result = await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  templateParams,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
```

#### 4. Problemas de Roteamento
```nginx
# Configuração nginx para SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

### Logs e Debugging

#### Verificar Logs da Vercel
```bash
# Ver logs de deploy
vercel logs

# Ver logs em tempo real
vercel logs --follow
```

#### Verificar Logs do Supabase
1. Acesse o painel do Supabase
2. Vá em **Logs** → **API**
3. Verifique erros e requisições

#### Debug no Browser
```typescript
// Adicionar logs de debug
if (import.meta.env.DEV) {
  console.log('Environment:', import.meta.env);
  console.log('Supabase client:', supabase);
}
```

## 📊 Monitoramento

### Métricas de Performance

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Bundle Analysis
```bash
# Analisar bundle
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

### Alertas e Notificações

#### Configurar Alertas
1. **Vercel**: Configure alertas no painel
2. **Supabase**: Configure alertas de uso
3. **EmailJS**: Configure alertas de limite

#### Monitoramento de Erros
```typescript
// Implementar error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Enviar para serviço de monitoramento
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Enviar para serviço de monitoramento
});
```

## 🔄 Atualizações e Manutenção

### Processo de Atualização

#### 1. Desenvolvimento
```bash
# Criar branch para atualização
git checkout -b feature/nova-funcionalidade

# Desenvolver e testar
npm run dev

# Commit e push
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

#### 2. Deploy de Staging
```bash
# Merge para develop
git checkout develop
git merge feature/nova-funcionalidade
git push origin develop

# Deploy automático para staging via CI/CD
```

#### 3. Deploy de Produção
```bash
# Merge para main
git checkout main
git merge develop
git push origin main

# Deploy automático para produção via CI/CD
```

### Backup e Recuperação

#### Backup do Banco de Dados
```bash
# Backup via Supabase CLI
supabase db dump --file backup.sql

# Backup via pg_dump
pg_dump $DATABASE_URL > backup.sql
```

#### Backup de Arquivos
```bash
# Backup dos assets
tar -czf assets-backup.tar.gz dist/

# Backup da configuração
cp .env.local .env.local.backup
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com/)

### Ferramentas Úteis
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Análise de performance
- [Bundle Analyzer](https://www.npmjs.com/package/vite-bundle-analyzer) - Análise de bundle
- [Vercel Analytics](https://vercel.com/analytics) - Analytics de performance

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025
