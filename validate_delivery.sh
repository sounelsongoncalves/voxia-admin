#!/bin/bash

# =====================================================
# VOXIA WHITE-LABEL - SCRIPT DE VALIDAÇÃO PRÉ-ENTREGA
# =====================================================
# Execute este script antes de entregar ao cliente
# para validar que tudo está funcionando corretamente
# =====================================================

echo "🔍 VOXIA WHITE-LABEL - VALIDAÇÃO PRÉ-ENTREGA"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# =====================================================
# 1. VERIFICAR ARQUIVOS ESSENCIAIS
# =====================================================
echo "📁 Verificando arquivos essenciais..."

files=(
    "repositories/appSettingsRepo.ts"
    "components/AppSettingsContext.tsx"
    "pages/Setup.tsx"
    "supabase/migrations/20231123_add_white_label_settings.sql"
    "INSTALLATION_GUIDE.md"
    "README_WHITE_LABEL.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file - FALTANDO!"
        ((FAIL++))
    fi
done

echo ""

# =====================================================
# 2. VERIFICAR .gitignore
# =====================================================
echo "🔒 Verificando .gitignore..."

if grep -q ".env.local" .gitignore 2>/dev/null || grep -q "*.local" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env.local está protegido no .gitignore"
    ((PASS++))
else
    echo -e "${RED}✗${NC} .env.local NÃO está no .gitignore!"
    ((FAIL++))
fi

echo ""

# =====================================================
# 3. VERIFICAR DEPENDÊNCIAS
# =====================================================
echo "📦 Verificando dependências..."

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json encontrado"
    ((PASS++))
    
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓${NC} node_modules existe"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} node_modules não encontrado - execute 'npm install'"
        ((WARN++))
    fi
else
    echo -e "${RED}✗${NC} package.json não encontrado!"
    ((FAIL++))
fi

echo ""

# =====================================================
# 4. VERIFICAR IMPORTS NO APP.TSX
# =====================================================
echo "🔗 Verificando imports no App.tsx..."

if grep -q "import { Setup }" App.tsx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Setup importado no App.tsx"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Setup NÃO importado no App.tsx!"
    ((FAIL++))
fi

if grep -q "import { AppSettingsProvider }" App.tsx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} AppSettingsProvider importado no App.tsx"
    ((PASS++))
else
    echo -e "${RED}✗${NC} AppSettingsProvider NÃO importado no App.tsx!"
    ((FAIL++))
fi

if grep -q "/setup" App.tsx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Rota /setup adicionada no App.tsx"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Rota /setup NÃO adicionada no App.tsx!"
    ((FAIL++))
fi

echo ""

# =====================================================
# 5. VERIFICAR SIDEBAR
# =====================================================
echo "🎨 Verificando Sidebar.tsx..."

if grep -q "useAppSettings" components/Sidebar.tsx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} useAppSettings usado na Sidebar"
    ((PASS++))
else
    echo -e "${RED}✗${NC} useAppSettings NÃO usado na Sidebar!"
    ((FAIL++))
fi

echo ""

# =====================================================
# 6. VERIFICAR MIGRATION SQL
# =====================================================
echo "🗄️ Verificando migration SQL..."

migration_file="supabase/migrations/20231123_add_white_label_settings.sql"

if grep -q "CREATE TABLE.*app_settings" "$migration_file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} CREATE TABLE app_settings encontrado"
    ((PASS++))
else
    echo -e "${RED}✗${NC} CREATE TABLE app_settings NÃO encontrado!"
    ((FAIL++))
fi

if grep -q "org-assets" "$migration_file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Bucket org-assets configurado"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Bucket org-assets NÃO configurado!"
    ((FAIL++))
fi

if grep -q "POLICY" "$migration_file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} RLS Policies encontradas"
    ((PASS++))
else
    echo -e "${RED}✗${NC} RLS Policies NÃO encontradas!"
    ((FAIL++))
fi

echo ""

# =====================================================
# 7. VERIFICAR DOCUMENTAÇÃO
# =====================================================
echo "📚 Verificando documentação..."

docs=(
    "INSTALLATION_GUIDE.md"
    "WHITE_LABEL_SUMMARY.md"
    "EXECUTIVE_SUMMARY.md"
    "DEPLOYMENT_CHECKLIST.md"
    "QUICK_REFERENCE.md"
    "DOCUMENTATION_INDEX.md"
    "DELIVERY_SUMMARY.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} $doc - Opcional mas recomendado"
        ((WARN++))
    fi
done

echo ""

# =====================================================
# 8. VERIFICAR CONSOLE.LOGS DESNECESSÁRIOS
# =====================================================
echo "🧹 Verificando console.logs desnecessários..."

console_count=$(grep -r "console.log" pages/ components/ repositories/ 2>/dev/null | grep -v "console.error" | wc -l)

if [ "$console_count" -gt 5 ]; then
    echo -e "${YELLOW}⚠${NC} Encontrados $console_count console.log - considere remover"
    ((WARN++))
else
    echo -e "${GREEN}✓${NC} Console.logs sob controle ($console_count encontrados)"
    ((PASS++))
fi

echo ""

# =====================================================
# 9. VERIFICAR TYPESCRIPT ERRORS (se tsc disponível)
# =====================================================
echo "🔧 Verificando TypeScript..."

if command -v tsc &> /dev/null; then
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo -e "${RED}✗${NC} Erros TypeScript encontrados!"
        ((FAIL++))
    else
        echo -e "${GREEN}✓${NC} Sem erros TypeScript"
        ((PASS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} TypeScript não disponível - pulando verificação"
    ((WARN++))
fi

echo ""

# =====================================================
# 10. VERIFICAR BUILD (opcional)
# =====================================================
echo "🏗️ Verificando build..."

if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} Pasta dist/ existe (build já executado)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Pasta dist/ não existe - execute 'npm run build' para validar"
    ((WARN++))
fi

echo ""

# =====================================================
# RESUMO FINAL
# =====================================================
echo "=============================================="
echo "📊 RESUMO DA VALIDAÇÃO"
echo "=============================================="
echo -e "${GREEN}✓ PASSOU:${NC} $PASS"
echo -e "${RED}✗ FALHOU:${NC} $FAIL"
echo -e "${YELLOW}⚠ AVISOS:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDAÇÃO COMPLETA - PRONTO PARA ENTREGA!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Revisar DEPLOYMENT_CHECKLIST.md"
    echo "2. Preparar pacote para cliente"
    echo "3. Agendar onboarding"
    exit 0
else
    echo -e "${RED}❌ VALIDAÇÃO FALHOU - CORRIJA OS ERROS ANTES DE ENTREGAR${NC}"
    echo ""
    echo "Revise os itens marcados com ✗ acima"
    exit 1
fi
