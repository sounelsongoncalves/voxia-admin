# 🎨 VOXIA WHITE-LABEL - GUIA VISUAL RÁPIDO

## 📱 FLUXO DO USUÁRIO

```
┌─────────────────────────────────────────────────────────────┐
│                    PRIMEIRA INSTALAÇÃO                       │
└─────────────────────────────────────────────────────────────┘

1️⃣  Cliente cria Supabase
    └─> https://supabase.com
    └─> New Project
    └─> Copia URL + ANON_KEY

2️⃣  Cliente aplica Migration
    └─> SQL Editor
    └─> Cola migration SQL
    └─> Run
    └─> ✅ Tabela app_settings criada

3️⃣  Cliente configura .env.local
    └─> VITE_SUPABASE_URL=...
    └─> VITE_SUPABASE_ANON_KEY=...
    └─> VITE_GOOGLE_MAPS_KEY=...

4️⃣  Cliente executa app
    └─> npm install
    └─> npm run dev
    └─> Abre http://localhost:5173

5️⃣  Cliente acessa /setup
    ┌────────────────────────────────────────┐
    │   🎨 Configuração Inicial              │
    │                                        │
    │   Nome da Organização: [_________]    │
    │   Logo: [📷 Escolher Imagem]          │
    │   Cor Primária: [🎨] [#00CC99]        │
    │   Email Suporte: [_________]          │
    │   Telefone: [_________]               │
    │                                        │
    │   [✅ Concluir Configuração]          │
    └────────────────────────────────────────┘

6️⃣  Sistema salva e redireciona
    └─> Upload do logo → Storage
    └─> Salva settings → Database
    └─> is_configured = true
    └─> Redirect → /login

7️⃣  Cliente cria Admin
    └─> Supabase Auth → Add User
    └─> SQL → INSERT INTO admins
    └─> Login no sistema

8️⃣  ✅ PRONTO!
    └─> Branding aplicado
    └─> Logo na sidebar
    └─> Nome na sidebar
    └─> Cor personalizada
```

---

## 🗄️ ESTRUTURA DO BANCO

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
└─────────────────────────────────────────────────────────────┘

📊 Tabela: app_settings
┌──────────────────┬──────────┬─────────────────────────┐
│ Campo            │ Tipo     │ Exemplo                 │
├──────────────────┼──────────┼─────────────────────────┤
│ id               │ UUID     │ a1b2c3d4-...            │
│ is_configured    │ BOOLEAN  │ true                    │
│ org_name         │ TEXT     │ "Transportes Silva"     │
│ logo_url         │ TEXT     │ "https://...logo.png"   │
│ primary_color    │ TEXT     │ "#FF5733"               │
│ support_email    │ TEXT     │ "suporte@silva.com"     │
│ support_phone    │ TEXT     │ "+351 912 345 678"      │
│ created_at       │ TIMESTAMP│ 2023-11-23 10:00:00     │
│ updated_at       │ TIMESTAMP│ 2023-11-23 10:00:00     │
└──────────────────┴──────────┴─────────────────────────┘

📦 Storage: org-assets
└─> logos/
    ├─> logo-1700740800000.png
    ├─> logo-1700740900000.jpg
    └─> logo-1700741000000.svg

🔒 RLS Policies
├─> app_settings
│   ├─> SELECT: Anyone (public read)
│   ├─> INSERT: Authenticated only
│   └─> UPDATE: Authenticated only
└─> org-assets
    ├─> SELECT: Anyone (public read)
    ├─> INSERT: Authenticated only
    ├─> UPDATE: Authenticated only
    └─> DELETE: Authenticated only
```

---

## 🎨 APLICAÇÃO DO BRANDING

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND FLOW                             │
└─────────────────────────────────────────────────────────────┘

App.tsx
  └─> <AppSettingsProvider>
        └─> Carrega settings do Supabase
        └─> Aplica CSS variables
        └─> Disponibiliza via Context

Sidebar.tsx
  └─> useAppSettings()
  └─> Lê settings.logo_url
  └─> Lê settings.org_name
  └─> Renderiza branding

CSS Variables Aplicadas:
  --color-brand-primary: #FF5733
  --color-brand-hover: #E64A2E

Page Title:
  "Transportes Silva - Admin Dashboard"
```

---

## 🔄 ESTADOS DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO 1: NÃO CONFIGURADO                 │
└─────────────────────────────────────────────────────────────┘

Database:
  app_settings.is_configured = false

Comportamento:
  ✅ /setup → Acessível
  ❌ /login → Funciona mas sem branding
  ❌ /dashboard → Funciona mas sem branding

Visual:
  Logo: [🚚] Ícone padrão
  Nome: "Voxia"
  Cor: #00CC99 (padrão)


┌─────────────────────────────────────────────────────────────┐
│                    ESTADO 2: CONFIGURADO                     │
└─────────────────────────────────────────────────────────────┘

Database:
  app_settings.is_configured = true
  app_settings.org_name = "Transportes Silva"
  app_settings.logo_url = "https://..."
  app_settings.primary_color = "#FF5733"

Comportamento:
  ❌ /setup → Bloqueado (redirect → /login)
  ✅ /login → Funciona com branding
  ✅ /dashboard → Funciona com branding

Visual:
  Logo: [🖼️] Logo personalizado
  Nome: "Transportes Silva"
  Cor: #FF5733 (personalizada)
```

---

## 🛠️ COMANDOS RÁPIDOS

```bash
# Instalar
npm install

# Executar localmente
npm run dev

# Build para produção
npm run build

# Deploy Vercel
vercel

# Deploy Netlify
netlify deploy --prod
```

---

## 📝 CHECKLIST RÁPIDO

```
ANTES DO SETUP:
  [ ] Supabase criado
  [ ] Migration aplicada
  [ ] .env.local configurado
  [ ] npm install executado
  [ ] App rodando localmente

DURANTE O SETUP:
  [ ] /setup acessado
  [ ] Nome da org preenchido
  [ ] Logo enviado (< 2MB)
  [ ] Cor escolhida
  [ ] Email preenchido
  [ ] Form submetido

DEPOIS DO SETUP:
  [ ] Redirecionado para /login
  [ ] Branding visível
  [ ] Admin criado (Auth + admins table)
  [ ] Login funcionando
  [ ] Dashboard acessível
```

---

## 🎯 TROUBLESHOOTING VISUAL

```
PROBLEMA: Logo não aparece
┌─────────────────────────────────────┐
│ VERIFICAR:                          │
│ 1. Bucket org-assets é público?     │
│ 2. URL do logo está correto?        │
│ 3. Logo foi realmente enviado?      │
│ 4. Cache do navegador limpo?        │
└─────────────────────────────────────┘

PROBLEMA: Cor não muda
┌─────────────────────────────────────┐
│ VERIFICAR:                          │
│ 1. Formato hexadecimal (#RRGGBB)?   │
│ 2. Settings salvos no banco?        │
│ 3. Hard refresh (Ctrl+Shift+R)?     │
│ 4. Console sem erros?               │
└─────────────────────────────────────┘

PROBLEMA: /setup ainda acessível
┌─────────────────────────────────────┐
│ VERIFICAR:                          │
│ 1. is_configured = true no banco?   │
│ 2. AppSettingsProvider carregou?    │
│ 3. Sem erros no console?            │
│ 4. Logout e login novamente?        │
└─────────────────────────────────────┘
```

---

## 📞 CONTATOS

```
┌─────────────────────────────────────┐
│ SUPORTE TÉCNICO                     │
├─────────────────────────────────────┤
│ Email: suporte@voxia.com            │
│ Docs: https://docs.voxia.com        │
│ Status: https://status.voxia.com    │
└─────────────────────────────────────┘
```

---

**Versão:** 1.0  
**Última Atualização:** 2023-11-23
