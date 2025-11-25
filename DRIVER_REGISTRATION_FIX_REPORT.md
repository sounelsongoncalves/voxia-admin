# Relatório de Correção: Registro de Motorista

**Problema:** Erro `null value in column "id" of relation "drivers" violates not-null constraint` ao tentar registrar um motorista.
**Causa:** A tabela `drivers` possui uma chave estrangeira para `auth.users.id` e não gera IDs automaticamente. O frontend tentava inserir diretamente na tabela `drivers` sem criar o usuário de autenticação correspondente.

## Solução Implementada

1.  **Edge Function `create-user`:**
    - Criada e deployada uma nova função server-side que permite criar usuários no Supabase Auth usando a chave de serviço (Service Role).
    - Isso permite que o Admin crie contas para motoristas sem ser deslogado.

2.  **Frontend (`CreateDriver.tsx`):**
    - Adicionados campos de **Senha** e **Confirmar Senha** ao formulário de motorista.
    - Adicionada validação de senha no `handleSubmit`.

3.  **Repositório (`driversRepo.ts`):**
    - Atualizado método `createDriver` para aceitar `password`.
    - O método agora segue o fluxo:
        1.  Chama `supabase.functions.invoke('create-user')` com email/senha.
        2.  Recebe o `id` do usuário criado.
        3.  Insere o registro na tabela `drivers` usando esse `id`.

## Como Testar

1.  Acesse a tela "Adicionar Motorista".
2.  Preencha os dados pessoais e a nova seção de **Segurança** (Senha).
3.  Clique em "Guardar Motorista".
4.  O sistema deve criar o usuário no Auth e o registro na tabela `drivers` com sucesso.
5.  O motorista poderá usar esse email e senha para logar no App do Motorista.

## Arquivos Modificados
- `pages/CreateDriver.tsx`
- `repositories/driversRepo.ts`
- `supabase/functions/create-user/index.ts` (Novo)
