-- =====================================================
-- EXEMPLO: Resetar Configuração White-Label
-- =====================================================
-- Use este script APENAS em ambiente de desenvolvimento/teste
-- para resetar a configuração e testar o Setup Wizard novamente
-- =====================================================

-- ATENÇÃO: Isto irá apagar a configuração atual!
-- Certifique-se de que deseja fazer isto antes de executar.

-- 1. Resetar flag de configuração
UPDATE public.app_settings
SET 
    is_configured = false,
    org_name = NULL,
    logo_url = NULL,
    primary_color = '#00CC99',
    support_email = NULL,
    support_phone = NULL
WHERE id = (SELECT id FROM public.app_settings LIMIT 1);

-- 2. (Opcional) Limpar logos antigos do storage
-- Execute manualmente no painel Supabase > Storage > org-assets > logos
-- Ou use a API do Supabase para deletar programaticamente

-- 3. Verificar reset
SELECT * FROM public.app_settings;

-- Resultado esperado:
-- is_configured: false
-- org_name: NULL
-- logo_url: NULL
-- primary_color: #00CC99
-- support_email: NULL
-- support_phone: NULL

-- Agora você pode acessar /setup novamente e reconfigurar
