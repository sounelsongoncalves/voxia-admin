# 🚛 Voxia Fleet Management - White-Label Edition

Sistema completo de gestão de frota com suporte a white-label.

## 🎯 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_GOOGLE_MAPS_KEY=sua-chave-google-maps
```

### 3. Executar Localmente
```bash
npm run dev
```

### 4. Configurar White-Label

Na primeira execução, acesse:
```
http://localhost:5173/#/setup
```

Preencha:
- Nome da sua organização
- Logo (PNG/JPG/SVG, máx 2MB)
- Cor primária da marca
- Email e telefone de suporte

## 📚 Documentação Completa

- **[Guia de Instalação](./INSTALLATION_GUIDE.md)** - Passo a passo completo
- **[Resumo White-Label](./WHITE_LABEL_SUMMARY.md)** - Detalhes técnicos
- **[Relatório de QA](./QA_AUDIT_REPORT.md)** - Status do projeto

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 🚀 Deploy

### Vercel (Recomendado)
```bash
vercel
```

### Netlify
Arraste a pasta `dist/` para https://app.netlify.com/drop

## 📞 Suporte

Para dúvidas técnicas, consulte o [Guia de Instalação](./INSTALLATION_GUIDE.md) ou entre em contato com suporte@voxia.com

---

**Versão:** 1.0.0  
**Licença:** White-Label (uso exclusivo do cliente licenciado)
