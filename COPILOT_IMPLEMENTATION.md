# Implementação do Centro de Inteligência Artificial (Copilot) - Voxia Admin

## Resumo
Foi implementada uma página dedicada para o Copiloto IA (`/copilot`), com funcionalidades de chat persistente e configurações de provedor de IA (Google/OpenAI).

## Alterações Realizadas

### 1. Banco de Dados (Supabase)
- **Tabela `ai_settings`**: Criada para armazenar configurações de IA por administrador.
- **Criptografia**: Habilitada extensão `pgcrypto` para criptografar chaves de API.
- **RPCs**:
  - `save_ai_settings`: Salva configurações criptografando a API Key.
  - `get_decrypted_api_key`: Recupera configurações descriptografadas (usada apenas pela Edge Function).
- **Políticas RLS**: Configuradas para garantir que cada admin acesse apenas suas configurações.

### 2. Edge Function (`copilot-query`)
- Criada e implantada função serverless que:
  1. Autentica o usuário.
  2. Recupera a API Key descriptografada do banco.
  3. Recupera o histórico da conversa.
  4. Chama a API do provedor escolhido (OpenAI ou Google Gemini).
  5. Salva a mensagem do usuário e a resposta da IA no banco (`copilot_messages`).
  6. Retorna a resposta para o frontend.

### 3. Frontend
- **`pages/CopilotPage.tsx`**:
  - Transformada em uma página completa com duas abas: **Conversa** e **Configurações**.
  - **Aba Conversa**: Interface de chat estilo mensageiro, com histórico carregado do banco.
  - **Aba Configurações**: Permite selecionar provedor (Google/OpenAI), modelo e inserir API Key com segurança.
- **`repositories/aiSettingsRepo.ts`**: Gerencia a leitura e escrita das configurações de IA.
- **`services/copilot.ts`**: Atualizado para delegar a lógica de processamento para a Edge Function.

## Fluxo de Segurança
1. O usuário insere a API Key no Frontend.
2. O Frontend envia para o Supabase via RPC `save_ai_settings`.
3. O Banco criptografa a chave usando `pgp_sym_encrypt` antes de salvar.
4. Ao usar o chat, o Frontend chama a Edge Function (sem enviar a chave).
5. A Edge Function (ambiente seguro) recupera e descriptografa a chave para fazer a chamada à API externa.
6. A chave nunca é exposta ao navegador após ser salva.

## Como Testar
1. Acesse a rota `/copilot` ou clique em "Copiloto IA" no menu.
2. Vá na aba **Configurações**.
3. Escolha um provedor (ex: Google), modelo e insira uma API Key válida. Clique em Salvar.
4. Vá na aba **Conversa**.
5. Envie uma mensagem (ex: "Olá, quem é você?").
6. Verifique se a resposta aparece e se, ao recarregar a página, o histórico é mantido.

---
**Data:** 23/11/2025
**Autor:** Antigravity (Google Deepmind)
