-- =====================================================
-- EXEMPLOS SQL ÚTEIS - VOXIA WHITE-LABEL
-- =====================================================
-- Use estes comandos no SQL Editor do Supabase
-- para gerenciar configurações white-label
-- =====================================================

-- =====================================================
-- 1. VERIFICAR CONFIGURAÇÃO ATUAL
-- =====================================================
SELECT 
    id,
    is_configured,
    org_name,
    logo_url,
    primary_color,
    support_email,
    support_phone,
    created_at,
    updated_at
FROM public.app_settings;


-- =====================================================
-- 2. ATUALIZAR NOME DA ORGANIZAÇÃO
-- =====================================================
UPDATE public.app_settings
SET 
    org_name = 'Novo Nome da Empresa Ltda',
    updated_at = now()
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);


-- =====================================================
-- 3. ATUALIZAR COR PRIMÁRIA
-- =====================================================
UPDATE public.app_settings
SET 
    primary_color = '#FF5733',  -- Substitua pela cor desejada
    updated_at = now()
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);


-- =====================================================
-- 4. ATUALIZAR CONTATOS DE SUPORTE
-- =====================================================
UPDATE public.app_settings
SET 
    support_email = 'novo-suporte@empresa.com',
    support_phone = '+351 987 654 321',
    updated_at = now()
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);


-- =====================================================
-- 5. REMOVER LOGO (volta para ícone padrão)
-- =====================================================
UPDATE public.app_settings
SET 
    logo_url = NULL,
    updated_at = now()
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);


-- =====================================================
-- 6. RESETAR PARA ESTADO INICIAL (CUIDADO!)
-- =====================================================
-- ATENÇÃO: Isto permite acessar /setup novamente
-- Use apenas em ambiente de desenvolvimento/teste
UPDATE public.app_settings
SET 
    is_configured = false,
    org_name = NULL,
    logo_url = NULL,
    primary_color = '#00CC99',
    support_email = NULL,
    support_phone = NULL,
    updated_at = now()
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);


-- =====================================================
-- 7. VERIFICAR LOGOS NO STORAGE
-- =====================================================
SELECT 
    name,
    id,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'org-assets'
ORDER BY created_at DESC;


-- =====================================================
-- 8. CRIAR PRIMEIRO ADMIN (após criar usuário no Auth)
-- =====================================================
-- Passo 1: Criar usuário em Authentication > Users
-- Passo 2: Copiar o User ID (UUID)
-- Passo 3: Executar este SQL (substituindo valores)

INSERT INTO public.admins (id, name, email, role, active)
VALUES (
    'COLE_AQUI_O_USER_ID_DO_AUTH',  -- UUID do usuário criado
    'Nome do Administrador',         -- Nome completo
    'admin@empresa.com',             -- Email (mesmo do Auth)
    'owner',                         -- Função: owner, manager ou operator
    true                             -- Ativo: true ou false
);


-- =====================================================
-- 9. LISTAR TODOS OS ADMINS
-- =====================================================
SELECT 
    a.id,
    a.name,
    a.email,
    a.role,
    a.active,
    a.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.admins a
LEFT JOIN auth.users au ON a.id = au.id
ORDER BY a.created_at DESC;


-- =====================================================
-- 10. DESATIVAR UM ADMIN (sem deletar)
-- =====================================================
UPDATE public.admins
SET 
    active = false,
    updated_at = now()
WHERE email = 'admin@desativar.com';


-- =====================================================
-- 11. REATIVAR UM ADMIN
-- =====================================================
UPDATE public.admins
SET 
    active = true,
    updated_at = now()
WHERE email = 'admin@reativar.com';


-- =====================================================
-- 12. MUDAR ROLE DE UM ADMIN
-- =====================================================
UPDATE public.admins
SET 
    role = 'manager',  -- owner, manager ou operator
    updated_at = now()
WHERE email = 'admin@empresa.com';


-- =====================================================
-- 13. VERIFICAR RLS POLICIES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'app_settings';


-- =====================================================
-- 14. VERIFICAR STORAGE POLICIES
-- =====================================================
SELECT 
    id,
    name,
    definition
FROM storage.policies
WHERE bucket_id = 'org-assets';


-- =====================================================
-- 15. BACKUP DA CONFIGURAÇÃO
-- =====================================================
-- Execute este comando e salve o resultado
-- Útil antes de fazer mudanças
SELECT 
    json_build_object(
        'id', id,
        'is_configured', is_configured,
        'org_name', org_name,
        'logo_url', logo_url,
        'primary_color', primary_color,
        'support_email', support_email,
        'support_phone', support_phone,
        'created_at', created_at,
        'updated_at', updated_at
    ) as backup
FROM public.app_settings;


-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Sempre faça backup antes de UPDATE/DELETE
-- 2. Teste em ambiente de desenvolvimento primeiro
-- 3. Após UPDATE, faça hard refresh no navegador (Ctrl+Shift+R)
-- 4. Logo URL deve ser público e acessível
-- 5. Primary color deve ser hexadecimal (#RRGGBB)
-- 6. Não delete a linha de app_settings, apenas UPDATE
-- 7. Para trocar logo, faça upload via /setup ou manualmente no Storage
