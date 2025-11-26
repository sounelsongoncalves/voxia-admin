# 🚀 GUIA DE INSTALAÇÃO - VOXIA FLEET MANAGEMENT (WHITE-LABEL)

**Versão:** 1.0  
**Data:** 2023-11-23  
**Tipo:** Instalação White-Label para Cliente Final

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar a instalação, certifique-se de ter:

- [ ] Conta Supabase criada (https://supabase.com)
- [ ] Node.js 18+ instalado
- [ ] npm ou yarn instalado
- [ ] Chave API do Google Maps (para funcionalidade de mapas)
- [ ] Acesso ao código-fonte do Voxia Admin Dashboard

---

## 🗄️ PASSO 1: CONFIGURAR SUPABASE

### 1.1 Criar Novo Projeto Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Preencha os dados:
   - **Project Name:** `[Nome da sua empresa]-fleet`
   - **Database Password:** Crie uma senha forte e **guarde-a**
   - **Region:** Escolha a região mais próxima dos seus usuários
4. Clique em "Create new project" e aguarde ~2 minutos

### 1.2 Aplicar Migrations do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20231123_add_white_label_settings.sql
   ```
4. Clique em "Run" para executar a migration
5. Verifique se a tabela `app_settings` foi criada:
   - Vá em **Table Editor**
   - Procure por `app_settings`
   - Deve haver 1 linha com `is_configured = false`

### 1.3 Configurar Storage Bucket

O bucket `org-assets` deve ter sido criado automaticamente pela migration. Verifique:

1. Vá em **Storage** no painel Supabase
2. Confirme que existe um bucket chamado `org-assets`
3. Verifique se o bucket está marcado como **Public**

### 1.4 Obter Credenciais do Supabase

1. No painel Supabase, vá em **Settings** → **API**
2. Copie os seguintes valores:
   - **Project URL** (exemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

---

## ⚙️ PASSO 2: CONFIGURAR APLICAÇÃO FRONTEND

### 2.1 Clonar/Copiar Código-Fonte

```bash
# Se você recebeu o código via Git
git clone [URL_DO_REPOSITORIO]
cd truckapp-admin

# Ou extraia o arquivo ZIP fornecido
unzip voxia-admin-dashboard.zip
cd voxia-admin-dashboard
```

### 2.2 Instalar Dependências

```bash
npm install
```

### 2.3 Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
touch .env.local
```

2. Abra o arquivo `.env.local` e adicione:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API Key (obtenha em https://console.cloud.google.com)
VITE_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE:**
- Substitua `xxxxx.supabase.co` pela URL do seu projeto
- Substitua a `ANON_KEY` pela chave que você copiou
- Substitua a chave do Google Maps pela sua chave válida

### 2.4 Testar Aplicação Localmente

```bash
npm run dev
```

A aplicação deve abrir em `http://localhost:5173`

---

## 🎨 PASSO 3: CONFIGURAÇÃO WHITE-LABEL (SETUP WIZARD)

### 3.1 Acessar Página de Setup

1. Abra o navegador e acesse: `http://localhost:5173/#/setup`
2. Você verá a tela de "Configuração Inicial"

### 3.2 Preencher Dados da Organização

Complete o formulário com os dados da sua empresa:

1. **Nome da Organização:**
   - Digite o nome completo da sua empresa
   - Exemplo: "Transportes Silva Ltda"
   - Este nome aparecerá no topo do dashboard

2. **Logotipo da Organização:**
   - Clique em "Escolher Imagem"
   - Selecione o logo da sua empresa (PNG, JPG ou SVG)
   - Tamanho máximo: 2MB
   - Recomendado: Logo em fundo transparente, 200x200px

3. **Cor Primária:**
   - Clique no seletor de cor
   - Escolha a cor principal da sua marca
   - Ou digite o código hexadecimal (ex: #FF5733)
   - Esta cor será usada em botões, links e destaques

4. **Email de Suporte:**
   - Digite o email de suporte da sua empresa
   - Exemplo: suporte@transportessilva.com
   - **Campo obrigatório**

5. **Telefone de Suporte:**
   - Digite o telefone de contato (opcional)
   - Exemplo: +351 912 345 678

### 3.3 Concluir Configuração

1. Revise todos os dados preenchidos
2. Clique em "Concluir Configuração"
3. Aguarde o processamento (upload do logo + salvamento)
4. Você será redirecionado automaticamente para a tela de login

**✅ SUCESSO!** A configuração white-label está completa.

---

## 👤 PASSO 4: CRIAR PRIMEIRO USUÁRIO ADMIN

### 4.1 Criar Usuário via Supabase Dashboard

1. No painel Supabase, vá em **Authentication** → **Users**
2. Clique em "Add user" → "Create new user"
3. Preencha:
   - **Email:** admin@suaempresa.com
   - **Password:** Crie uma senha forte
   - **Auto Confirm User:** ✅ Marque esta opção
4. Clique em "Create user"
5. **Copie o User ID** (UUID) que aparece

### 4.2 Adicionar Usuário à Tabela `admins`

1. Vá em **SQL Editor** no Supabase
2. Execute o seguinte SQL (substitua os valores):

```sql
INSERT INTO public.admins (id, name, email, role, active)
VALUES (
  'COLE_AQUI_O_USER_ID',  -- UUID copiado do passo anterior
  'Administrador',         -- Nome do admin
  'admin@suaempresa.com',  -- Email (mesmo do Auth)
  'owner',                 -- Função: owner, manager ou operator
  true                     -- Ativo
);
```

3. Clique em "Run"

### 4.3 Fazer Login

1. Acesse `http://localhost:5173/#/login`
2. Digite o email e senha criados
3. Clique em "Entrar"

**🎉 PARABÉNS!** Você está dentro do sistema!

---

## 🚀 PASSO 5: DEPLOY EM PRODUÇÃO

### 5.1 Build da Aplicação

```bash
npm run build
```

Isso criará uma pasta `dist/` com os arquivos otimizados.

### 5.2 Opções de Hospedagem

#### Opção A: Vercel (Recomendado - Grátis)

1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Faça deploy:
   ```bash
   vercel
   ```

3. Configure as variáveis de ambiente no painel Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_KEY`

#### Opção B: Netlify

1. Arraste a pasta `dist/` para https://app.netlify.com/drop
2. Configure as variáveis de ambiente no painel Netlify

#### Opção C: Servidor Próprio (Apache/Nginx)

1. Copie o conteúdo da pasta `dist/` para o diretório do servidor
2. Configure o servidor para servir `index.html` em todas as rotas

---

## 🔒 PASSO 6: SEGURANÇA E MANUTENÇÃO

### 6.1 Configurar RLS (Row Level Security)

As políticas RLS já foram criadas pela migration. Verifique:

1. No Supabase, vá em **Database** → **Tables**
2. Clique em cada tabela e vá em **Policies**
3. Confirme que existem políticas ativas

### 6.2 Backup do Banco de Dados

Configure backups automáticos:

1. No Supabase, vá em **Settings** → **Database**
2. Em "Backups", configure:
   - **Point-in-time Recovery:** Ativado (planos pagos)
   - **Daily Backups:** Ativado

### 6.3 Monitoramento

1. Acesse **Reports** no painel Supabase
2. Monitore:
   - Uso de API
   - Uso de Storage
   - Número de usuários ativos

---

## ❓ TROUBLESHOOTING

### Problema: "Failed to fetch app settings"

**Solução:**
1. Verifique se a migration foi aplicada corretamente
2. Confirme que a tabela `app_settings` existe
3. Verifique as credenciais no `.env.local`

### Problema: "Acesso negado. Não tem permissões de administrador"

**Solução:**
1. Verifique se o usuário foi adicionado à tabela `admins`
2. Confirme que o `id` na tabela `admins` corresponde ao User ID do Auth
3. Verifique se `active = true` na tabela `admins`

### Problema: Logo não aparece

**Solução:**
1. Verifique se o bucket `org-assets` está marcado como Public
2. Confirme que o upload foi bem-sucedido
3. Teste o URL do logo diretamente no navegador

### Problema: Cor primária não muda

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique se o código hexadecimal está correto (#RRGGBB)
3. Faça logout e login novamente

---

## 📞 SUPORTE

Para suporte técnico, entre em contato:

- **Email:** suporte@voxia.com
- **Documentação:** https://docs.voxia.com
- **Status do Sistema:** https://status.voxia.com

---

## 📄 LICENÇA

Este software é fornecido sob licença white-label. Cada instalação é única e pertence ao cliente que a adquiriu. Não é permitido redistribuir ou revender este software sem autorização expressa da Voxia.

---

**Última Atualização:** 2023-11-23  
**Versão do Guia:** 1.0  
**Versão do Software:** 1.0.0
