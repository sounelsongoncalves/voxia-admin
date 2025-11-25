# Relatório de Correção: Fluxo de Setup Inicial

**Problema:** O fluxo de configuração inicial (`/setup`) permitia configurar a organização mas não criava a conta do administrador (Owner). O usuário era redirecionado para o login sem ter uma senha definida.
**Causa:** A página `Setup.tsx` focava apenas em `app_settings` e não interagia com o sistema de autenticação.

## Solução Implementada

1.  **Atualização da UI (`Setup.tsx`):**
    - Adicionados campos para **Senha de Acesso** e **Confirmar Senha**.
    - Adicionada seção explícita "Conta do Administrador".

2.  **Lógica de Criação de Usuário:**
    - Ao submeter o formulário, o sistema agora executa os seguintes passos em ordem:
        1.  **Criação do Usuário Auth:** Chama a Edge Function `create-user` com o email e senha fornecidos. Define o papel como `owner`.
        2.  **Criação do Registro Admin:** Insere o novo usuário na tabela `admins` com os dados de contato.
        3.  **Configuração da App:** Salva as configurações da organização (`app_settings`).

3.  **Resultado:**
    - Ao finalizar o setup, o usuário já possui credenciais válidas (Email + Senha).
    - O redirecionamento para `/login` agora permite que o usuário entre imediatamente no sistema.

## Como Testar

1.  (Opcional) Limpe a tabela `app_settings` para simular um sistema novo.
2.  Acesse a rota `/setup`.
3.  Preencha os dados da organização.
4.  Preencha o email de admin e a senha.
5.  Clique em "Criar Conta e Configurar".
6.  Após o sucesso e redirecionamento, tente logar com o email e senha definidos.

## Arquivos Modificados
- `pages/Setup.tsx`
