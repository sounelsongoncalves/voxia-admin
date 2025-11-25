# ✅ WHITE-LABEL DEPLOYMENT CHECKLIST

**Tech Lead:** Use este checklist antes de entregar ao cliente  
**Data:** 2023-11-23

---

## 📋 PRÉ-ENTREGA

### Código
- [ ] Todos os arquivos commitados no repositório
- [ ] `.env.local` adicionado ao `.gitignore`
- [ ] Dependências atualizadas (`npm install`)
- [ ] Build local funciona (`npm run build`)
- [ ] Sem erros de TypeScript (`npm run type-check` se disponível)
- [ ] Sem warnings críticos no console

### Documentação
- [ ] `INSTALLATION_GUIDE.md` revisado
- [ ] `WHITE_LABEL_SUMMARY.md` completo
- [ ] `README_WHITE_LABEL.md` criado
- [ ] Comentários no código atualizados

### Database
- [ ] Migration testada localmente
- [ ] Migration testada em Supabase de teste
- [ ] RLS policies verificadas
- [ ] Storage bucket configurado corretamente
- [ ] Script de reset disponível (para testes)

---

## 🧪 TESTES

### Setup Wizard
- [ ] Acesso a `/setup` funciona
- [ ] Form validation funciona
- [ ] Upload de logo funciona (PNG, JPG, SVG)
- [ ] Limite de 2MB validado
- [ ] Preview do logo aparece
- [ ] Color picker funciona
- [ ] Hex input sincroniza com color picker
- [ ] Email validation funciona
- [ ] Submit salva no banco
- [ ] Redirect para `/login` após setup
- [ ] `/setup` bloqueado após configuração

### Branding
- [ ] Logo aparece na sidebar
- [ ] Nome da org aparece na sidebar
- [ ] Cor primária aplica em botões
- [ ] Cor primária aplica em links
- [ ] Cor primária aplica em destaques
- [ ] Page title atualiza
- [ ] Branding persiste após refresh
- [ ] Branding persiste após logout/login

### Segurança
- [ ] RLS permite leitura pública de `app_settings`
- [ ] RLS permite insert apenas para autenticados
- [ ] RLS permite update apenas para autenticados
- [ ] Storage bucket `org-assets` é público
- [ ] Upload requer autenticação
- [ ] Não há vazamento de dados sensíveis

---

## 📦 ENTREGA AO CLIENTE

### Arquivos para Enviar
- [ ] Código-fonte completo (ZIP ou Git)
- [ ] `INSTALLATION_GUIDE.md`
- [ ] `README_WHITE_LABEL.md`
- [ ] Migration SQL (`supabase/migrations/20231123_add_white_label_settings.sql`)
- [ ] Exemplo `.env.local` (sem valores reais)

### Informações para Fornecer
- [ ] URL do repositório (se Git)
- [ ] Versão do Node.js requerida (18+)
- [ ] Link para criar conta Supabase
- [ ] Link para obter Google Maps API Key
- [ ] Email de suporte técnico
- [ ] SLA de suporte (se aplicável)

---

## 🚀 PÓS-ENTREGA

### Suporte Inicial
- [ ] Agendar call de onboarding com cliente
- [ ] Validar que cliente criou Supabase
- [ ] Validar que migration foi aplicada
- [ ] Validar que env vars estão corretas
- [ ] Validar que setup wizard funcionou
- [ ] Validar que primeiro admin foi criado
- [ ] Validar que branding está aplicado

### Monitoramento
- [ ] Configurar alertas de erro (se aplicável)
- [ ] Configurar monitoramento de uptime
- [ ] Documentar acessos de emergência
- [ ] Criar runbook de troubleshooting

---

## 🔧 TROUBLESHOOTING COMUM

### Cliente não consegue acessar `/setup`
**Causa:** Migration não aplicada  
**Solução:** Verificar se tabela `app_settings` existe

### Logo não aparece
**Causa:** Bucket não é público  
**Solução:** Marcar `org-assets` como público no Supabase

### Cor não muda
**Causa:** Cache do navegador  
**Solução:** Hard refresh (Ctrl+Shift+R)

### "Acesso negado" no login
**Causa:** Usuário não está na tabela `admins`  
**Solução:** Inserir usuário com SQL fornecido no guia

---

## 📊 MÉTRICAS DE SUCESSO

### Instalação Bem-Sucedida
- [ ] Cliente completou setup em < 30 minutos
- [ ] Branding aplicado corretamente
- [ ] Primeiro admin criado com sucesso
- [ ] Cliente consegue fazer login
- [ ] Cliente consegue navegar no dashboard

### Satisfação do Cliente
- [ ] Cliente aprovou o visual personalizado
- [ ] Cliente não reportou bugs críticos
- [ ] Cliente entende como usar o sistema
- [ ] Cliente tem acesso ao suporte

---

## 📝 NOTAS FINAIS

### Próximos Passos (Fase 2 - Opcional)
- [ ] Painel admin para editar settings
- [ ] Múltiplos logos (light/dark)
- [ ] Favicon customizado
- [ ] Email templates com branding
- [ ] PDF reports com branding

### Lições Aprendidas
- Documentar aqui qualquer problema encontrado durante a entrega
- Atualizar o guia de instalação se necessário
- Melhorar o processo para próximas entregas

---

**Checklist Completado Por:** _________________  
**Data:** _________________  
**Cliente:** _________________  
**Status:** [ ] Aprovado para Entrega
