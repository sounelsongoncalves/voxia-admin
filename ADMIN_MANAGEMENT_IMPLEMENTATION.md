# Implementação da Gestão de Administradores - Voxia Admin

## Resumo
Foi implementada a gestão completa de administradores (utilizadores) no painel administrativo, incluindo criação, edição, listagem e gestão de perfil.

## Alterações Realizadas

### 1. Banco de Dados (Supabase)
- **Tabela `admins`**: Adicionadas colunas `phone`, `avatar_url` e `active`.
- **Storage**: Criado bucket `admin-avatars` com políticas de acesso (RLS).
- **Políticas RLS**: Configuradas políticas para leitura, escrita e atualização baseadas nos papéis (`owner`, `manager`, `operator`).

### 2. Frontend - Repositório (`repositories/adminsRepo.ts`)
- Atualizado para suportar os novos campos (`phone`, `avatar_url`, `active`).
- Adicionados métodos:
  - `updateProfile`: Atualiza nome, telefone e avatar.
  - `uploadAvatar`: Realiza upload de imagem para o bucket `admin-avatars`.
  - `updatePassword`: Atualiza a senha do utilizador logado.
  - `toggleAdminStatus`: Ativa/Desativa administradores.

### 3. Frontend - Interfaces (`pages/`)
- **`Settings.tsx`**:
  - Adicionada aba **Gestão de Utilizadores**: Lista administradores com opções de alterar função e ativar/desativar.
  - Adicionada aba **Meu Perfil**: Permite alterar foto, nome, telefone e senha.
- **`CreateDriver.tsx`**:
  - Adicionado **Toggle "Motorista | Administrador"**.
  - Permite criar novos administradores diretamente desta tela, reutilizando a lógica de criação.
- **`CreateUser.tsx`**:
  - Atualizado para incluir campo de **Telemóvel**.
  - Removida seleção de status (padrão: Ativo).

### 4. Tipagem (`types.ts`)
- Atualizada interface `Admin` para incluir `phone`, `avatar_url` e `active`.

## Como Testar
1. **Criar Admin**: Vá em "Motoristas" -> "Adicionar Motorista" -> Selecione "Administrador". Ou vá em "Configurações" -> "Gestão de Utilizadores" -> "Adicionar Utilizador".
2. **Listar/Gerir**: Vá em "Configurações" -> "Gestão de Utilizadores". Tente alterar o papel ou desativar um utilizador.
3. **Perfil**: Vá em "Configurações" -> "Meu Perfil". Tente alterar sua foto, nome ou senha.

---
**Data:** 23/11/2025
**Autor:** Antigravity (Google Deepmind)
