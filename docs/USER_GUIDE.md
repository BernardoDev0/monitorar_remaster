# Guia do Usuário - Sistema de Monitoramento de Performance

## 📖 Introdução

Bem-vindo ao **Sistema de Monitoramento de Performance**! Este guia irá ajudá-lo a utilizar todas as funcionalidades do sistema de forma eficiente e produtiva.

### 🎯 O que é o Sistema?

O Sistema de Monitoramento de Performance é uma plataforma web desenvolvida para:
- Acompanhar o desempenho individual e da equipe
- Registrar pontos de produtividade
- Visualizar métricas através de gráficos interativos
- Gerar relatórios executivos
- Gerenciar metas e objetivos
### 👥 Para Quem é Destinado?

- **Funcionários**: Para registrar pontos e acompanhar seu desempenho
- **Supervisores**: Para monitorar a equipe e gerar relatórios
- **Gestores**: Para análise executiva e tomada de decisões

## 🚀 Primeiros Passos

### 1. Acesso ao Sistema

#### URL de Acesso
- **Produção**: `https://seu-dominio.com`
- **Desenvolvimento**: `http://localhost:8080`

#### Requisitos do Navegador
- **Chrome**: Versão 90+
- **Firefox**: Versão 88+
- **Safari**: Versão 14+
- **Edge**: Versão 90+

### 2. Login no Sistema

#### Tela de Login
1. Acesse a URL do sistema
2. Digite sua **Chave de Acesso** no campo correspondente
3. Clique em **"Entrar"**

![Tela de Login](images/login-screen.png)

#### Chave de Acesso
- Sua chave de acesso é única e pessoal
- Forneça apenas para pessoas autorizadas
- Em caso de perda, entre em contato com o administrador

#### Primeiro Acesso
1. Faça login com sua chave de acesso
2. Verifique se seus dados estão corretos
3. Configure sua refinaria padrão (se necessário)

## 🏠 Dashboard do Funcionário

### Visão Geral

O dashboard é sua página principal, onde você pode:
- Visualizar suas métricas de performance
- Registrar novos pontos
- Acompanhar seu progresso
- Acessar seu histórico

### 📊 Cards de Métricas

#### Card "Pontos Hoje"
- **O que mostra**: Total de pontos registrados hoje
- **Meta diária**: Objetivo a ser atingido no dia
- **Barra de progresso**: Visualização do progresso em relação à meta
- **Porcentagem**: Progresso atual em %

#### Card "Pontos Semana X"
- **O que mostra**: Total de pontos da semana selecionada
- **Meta semanal**: Objetivo a ser atingido na semana
- **Seletor de semana**: Escolha entre Semana 1, 2, 3, 4 ou 5
- **Barra de progresso**: Visualização do progresso semanal

#### Card "Pontos Mensais"
- **O que mostra**: Total de pontos do ciclo mensal atual
- **Meta mensal**: Objetivo a ser atingido no mês
- **Ciclo 26→25**: Sistema de contagem mensal (dia 26 ao 25 do mês seguinte)
- **Barra de progresso**: Visualização do progresso mensal

### 🎯 Sistema de Metas

#### Metas Personalizadas
- **Funcionário E89P**: 535 pontos/dia, 2675 pontos/semana, 10500 pontos/mês
- **Outros funcionários**: 475 pontos/dia, 2375 pontos/semana, 9500 pontos/mês

#### Status de Performance
- **🔴 Em Risco**: < 50% da meta
- **🟡 No Prazo**: 50% - 99% da meta
- **🟢 Top Performer**: ≥ 100% da meta

## 📝 Registro de Pontos

### Como Registrar Pontos

#### Aba "Registrar Pontos"
1. Acesse a aba **"Registrar Pontos"** no dashboard
2. Preencha os campos obrigatórios:
   - **Refinaria**: Selecione a refinaria onde trabalhou
   - **Pontos**: Digite a quantidade de pontos (apenas números)
   - **Observações**: Descreva as atividades realizadas
3. Clique em **"Registrar"**

#### Campos do Formulário

##### Refinaria
- **RPBC**: Refinaria de Paulínia
- **REVAP**: Refinaria de São José dos Campos
- **REPAR**: Refinaria do Paraná
- **REFAP**: Refinaria Alberto Pasqualini
- **REMAN**: Refinaria de Manaus
- **REDUC**: Refinaria Duque de Caxias
- **REGAP**: Refinaria Gabriel Passos
- **REPLAN**: Refinaria de Landulpho Alves
- **RNEST**: Refinaria Nestor Câmara

##### Pontos
- Digite apenas números inteiros
- Valores negativos não são permitidos
- Máximo recomendado: 1000 pontos por registro

##### Observações
- Descreva as atividades realizadas
- Seja específico e objetivo
- Mínimo: 10 caracteres
- Máximo: 500 caracteres

### Confirmação de Registro

#### Email de Confirmação
Após registrar pontos, você receberá um email com:
- Nome do funcionário
- Data e hora do registro
- Quantidade de pontos
- Refinaria
- Observações registradas

#### Feedback Visual
- **Sucesso**: Mensagem verde de confirmação
- **Erro**: Mensagem vermelha com detalhes do problema
- **Carregamento**: Indicador de progresso durante o salvamento

## 📈 Acompanhamento de Evolução

### Aba "Evolução Mensal"

#### Gráfico de Evolução
- **Eixo X**: Semanas do mês (1, 2, 3, 4, 5)
- **Eixo Y**: Pontos acumulados
- **Linha azul**: Seus pontos reais
- **Linha laranja**: Meta semanal
- **Barras**: Pontos por semana

#### Interpretação do Gráfico
- **Acima da meta**: Performance excelente
- **Na meta**: Performance adequada
- **Abaixo da meta**: Necessita melhoria

#### Controles do Gráfico
- **Zoom**: Clique e arraste para ampliar
- **Tooltip**: Passe o mouse para ver detalhes
- **Legenda**: Clique para mostrar/ocultar linhas

### Comparativo Mensal

#### Seleção de Período
1. Use o seletor de mês/ano
2. Compare diferentes períodos
3. Analise tendências de crescimento

#### Métricas Comparativas
- **Crescimento**: Variação percentual entre períodos
- **Consistência**: Regularidade no atingimento de metas
- **Picos**: Períodos de maior performance

## 📋 Histórico de Registros

### Aba "Histórico"

#### Lista de Registros
- **Data**: Data e hora do registro
- **Refinaria**: Local onde trabalhou
- **Pontos**: Quantidade registrada
- **Observações**: Descrição das atividades
- **Status**: Confirmação do registro

#### Filtros Disponíveis
- **Por data**: Selecione período específico
- **Por refinaria**: Filtre por local de trabalho
- **Por pontos**: Filtre por faixa de pontos

#### Paginação
- **10 registros por página** (padrão)
- **Navegação**: Use as setas para navegar
- **Busca rápida**: Digite para filtrar em tempo real

#### Exportação
- **Excel**: Baixe relatório em formato .xlsx
- **PDF**: Gere relatório em formato .pdf
- **CSV**: Exporte dados para análise

## 📊 Dashboard Executivo (Administradores)

### Visão Geral da Equipe

#### Métricas Consolidadas
- **Total de funcionários**: Número de usuários ativos
- **Pontos totais do dia**: Soma de todos os registros
- **Meta da equipe**: Objetivo coletivo
- **Taxa de cumprimento**: Porcentagem de metas atingidas

#### Top Performers
- **Ranking semanal**: Top 5 funcionários da semana
- **Ranking mensal**: Top 5 funcionários do mês
- **Crescimento**: Funcionários com maior evolução

### Gráficos Executivos

#### Gráfico de Equipe
- **Barras**: Pontos por funcionário
- **Cores**: Status de performance (verde/amarelo/vermelho)
- **Tooltip**: Detalhes ao passar o mouse

#### Gráfico de Tendências
- **Linha temporal**: Evolução da equipe ao longo do tempo
- **Comparativo**: Períodos anteriores
- **Projeções**: Estimativas baseadas em tendências

### Relatórios Executivos

#### Relatório Semanal
- **Resumo executivo**: Principais métricas
- **Análise de performance**: Pontos fortes e fracos
- **Recomendações**: Sugestões de melhorias

#### Relatório Mensal
- **Dashboard completo**: Todas as métricas do mês
- **Análise comparativa**: Comparação com meses anteriores
- **Projeções**: Estimativas para o próximo mês

## 📤 Exportação de Dados

### Tipos de Exportação

#### Relatório Individual
1. Acesse a aba **"Histórico"**
2. Clique em **"Exportar"**
3. Selecione o formato desejado
4. Baixe o arquivo

#### Relatório da Equipe (Administradores)
1. Acesse o **Dashboard Executivo**
2. Clique em **"Exportar Relatório"**
3. Selecione o período
4. Escolha o formato
5. Baixe o arquivo

### Formatos Disponíveis

#### Excel (.xlsx)
- **Planilhas múltiplas**: Dados organizados por abas
- **Gráficos incluídos**: Visualizações incorporadas
- **Formatação**: Cores e estilos aplicados

#### PDF
- **Layout profissional**: Formatação para impressão
- **Gráficos vetoriais**: Qualidade superior
- **Marca d'água**: Identificação do sistema

#### CSV
- **Dados brutos**: Para análise em outras ferramentas
- **Compatibilidade**: Excel, Google Sheets, etc.
- **Leve**: Arquivo pequeno e rápido

## 🔧 Configurações e Preferências

### Perfil do Usuário

#### Dados Pessoais
- **Nome**: Nome completo
- **Nome de usuário**: Identificador único
- **Refinaria padrão**: Local de trabalho principal
- **Função**: Cargo na empresa

#### Configurações de Notificação
- **Email**: Receber confirmações por email
- **Desktop**: Notificações no navegador
- **Frequência**: Periodicidade das notificações

### Preferências de Interface

#### Tema
- **Claro**: Tema padrão
- **Escuro**: Tema escuro (futuro)
- **Automático**: Baseado no sistema

#### Idioma
- **Português**: Idioma padrão
- **Inglês**: Inglês (futuro)
- **Espanhol**: Espanhol (futuro)

## 🆘 Solução de Problemas

### Problemas Comuns

#### Não Consigo Fazer Login
**Possíveis causas:**
- Chave de acesso incorreta
- Problemas de conexão
- Conta desativada

**Soluções:**
1. Verifique se digitou a chave corretamente
2. Teste sua conexão com a internet
3. Entre em contato com o administrador

#### Erro ao Registrar Pontos
**Possíveis causas:**
- Campos obrigatórios não preenchidos
- Valores inválidos
- Problemas de conexão

**Soluções:**
1. Verifique se todos os campos estão preenchidos
2. Digite apenas números no campo "Pontos"
3. Verifique sua conexão com a internet

#### Gráficos Não Carregam
**Possíveis causas:**
- Problemas de conexão
- Dados insuficientes
- Problemas no navegador

**Soluções:**
1. Atualize a página (F5)
2. Limpe o cache do navegador
3. Tente em outro navegador

#### Email de Confirmação Não Chega
**Possíveis causas:**
- Email na caixa de spam
- Endereço de email incorreto
- Problemas no serviço de email

**Soluções:**
1. Verifique a caixa de spam
2. Confirme seu endereço de email
3. Entre em contato com o suporte

### Dicas de Performance

#### Navegador
- **Use Chrome ou Firefox**: Melhor compatibilidade
- **Mantenha atualizado**: Versões mais recentes
- **Limpe o cache**: Regularmente

#### Conexão
- **Wi-Fi estável**: Evite conexões instáveis
- **Velocidade adequada**: Mínimo 5 Mbps
- **Sem proxy**: Use conexão direta

#### Dispositivo
- **RAM suficiente**: Mínimo 4GB
- **Processador atual**: Evite dispositivos muito antigos
- **Tela adequada**: Resolução mínima 1024x768

## 📞 Suporte e Contato

### Canais de Suporte

#### Suporte Técnico
- **Email**: suporte@empresa.com
- **Telefone**: (11) 99999-9999
- **Horário**: Segunda a sexta, 8h às 18h

#### Suporte de Usuário
- **Email**: usuario@empresa.com
- **Chat**: Disponível no sistema
- **FAQ**: Perguntas frequentes

### Escalação de Problemas

#### Nível 1 - Suporte Básico
- Problemas de login
- Dúvidas sobre funcionalidades
- Orientação de uso

#### Nível 2 - Suporte Técnico
- Problemas de performance
- Erros do sistema
- Configurações avançadas

#### Nível 3 - Desenvolvimento
- Bugs críticos
- Melhorias solicitadas
- Integrações especiais

## 📚 Recursos Adicionais

### Treinamentos

#### Treinamento Básico
- **Duração**: 2 horas
- **Conteúdo**: Funcionalidades básicas
- **Modalidade**: Online ou presencial

#### Treinamento Avançado
- **Duração**: 4 horas
- **Conteúdo**: Recursos avançados
- **Modalidade**: Presencial

#### Treinamento para Administradores
- **Duração**: 6 horas
- **Conteúdo**: Gestão completa do sistema
- **Modalidade**: Presencial

### Documentação Técnica

#### Para Desenvolvedores
- **API Reference**: Documentação completa das APIs
- **Arquitetura**: Estrutura técnica do sistema
- **Deploy**: Guia de implantação

#### Para Administradores
- **Configuração**: Setup do sistema
- **Manutenção**: Procedimentos de manutenção
- **Backup**: Estratégias de backup

### Atualizações

#### Notas de Versão
- **Versão 1.0.0**: Lançamento inicial
- **Próximas versões**: Novas funcionalidades
- **Roadmap**: Planejamento futuro

#### Comunicação de Mudanças
- **Email**: Notificações por email
- **Sistema**: Avisos no dashboard
- **Newsletter**: Boletim mensal

## 🎯 Dicas de Uso Eficiente

### Boas Práticas

#### Registro de Pontos
- **Registre diariamente**: Não acumule registros
- **Seja específico**: Descreva bem as atividades
- **Use a refinaria correta**: Para relatórios precisos

#### Acompanhamento de Metas
- **Verifique regularmente**: Acompanhe seu progresso
- **Planeje sua semana**: Organize-se para atingir metas
- **Analise tendências**: Use os gráficos para melhorar

#### Uso do Sistema
- **Mantenha-se logado**: Evite perda de dados
- **Salve frequentemente**: Não perca informações
- **Use filtros**: Encontre informações rapidamente

### Produtividade

#### Atalhos de Teclado
- **Ctrl + S**: Salvar (quando aplicável)
- **Ctrl + R**: Atualizar página
- **Tab**: Navegar entre campos
- **Enter**: Confirmar formulários

#### Navegação Rápida
- **Bookmarks**: Salve páginas importantes
- **Abas**: Use múltiplas abas para comparar dados
- **Histórico**: Use o histórico do navegador

## 🔒 Segurança e Privacidade

### Proteção de Dados

#### Sua Responsabilidade
- **Mantenha sua chave segura**: Não compartilhe
- **Faça logout**: Sempre que terminar
- **Use dispositivos seguros**: Evite computadores públicos

#### Dados Coletados
- **Registros de trabalho**: Pontos e observações
- **Dados de uso**: Para melhorar o sistema
- **Informações de contato**: Para suporte

#### Política de Privacidade
- **Dados pessoais**: Protegidos conforme LGPD
- **Compartilhamento**: Apenas com autorização
- **Retenção**: Conforme política da empresa

### Backup e Recuperação

#### Backup Automático
- **Dados salvos**: Automaticamente no servidor
- **Frequência**: A cada operação
- **Retenção**: Conforme política da empresa

#### Recuperação de Dados
- **Em caso de perda**: Entre em contato com suporte
- **Tempo de recuperação**: Até 24 horas
- **Procedimentos**: Documentados e testados

---

**Versão do Guia**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025

**Para mais informações, entre em contato com o suporte técnico.**
