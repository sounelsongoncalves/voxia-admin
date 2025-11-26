# Relatório de Atualizações do Dashboard Admin

**Status:** ✅ Concluído

## Alterações Realizadas

### 1. Gestão de Usuários
- **Exclusão de Usuários:** Adicionada a funcionalidade de excluir usuários na lista de gestão (Configurações > Gestão de Utilizadores).
    - Implementada função `deleteAdmin` no repositório `adminsRepo`.
    - Adicionado botão de exclusão na interface com confirmação de segurança.
- **Nova Função (Role):** Adicionada a opção **"Admin"** no formulário de criação de novos usuários.

### 2. Configurações do Projeto
- **Google Maps:** Chave da API atualizada para a nova fornecida (`AIzaSyCH...`).
- **Cores e Tema:** Paleta de cores atualizada no `tailwind.config.js` conforme solicitado:
    - **Primary:** #2b8cee (Azul)
    - **Action:** #34D399 (Verde Água)
    - **Background:** #101922 (Dark)
    - **Surface:** #192633 (Dark Blue)
    - **Text:** #FFFFFF (Primary) / #92adc9 (Secondary)
    - **Status:** Cores de erro, sucesso e aviso ajustadas.

## Próximos Passos
- Para ver as alterações de cores, o servidor de desenvolvimento deve recarregar automaticamente.
- Para testar a exclusão de usuários, acesse a aba de Configurações e tente excluir um usuário de teste (certifique-se de estar logado como Owner).
