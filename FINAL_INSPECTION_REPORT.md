# Relatório de Inspeção e Correção - Voxia Admin

## 1. Mapa e Contexto
- **Entrada:** `index.tsx` -> `App.tsx`
- **Auth:** `services/supabase.ts` + `AdminRouteGuard`.
- **Estrutura:**
  - `pages/`: Módulos principais (Trips, Drivers, Vehicles, Chat, Copilot, etc.)
  - `repositories/`: Camada de dados (Supabase)
  - `components/`: UI reutilizável

## 2. Criação e Atribuição de Viagens
- **Status:** O fluxo de criação define status como `'assigned'`, que mapeia para `Pendente` no frontend. Isso está correto para o motorista receber.
- **Campos:** `driver_id` e `vehicle_id` são preenchidos corretamente.
- **Correção:** Ajustado `tripsRepo.ts` para mapear corretamente o tipo de carga (`cargo_type` -> `cargo.type`) ao ler do banco, garantindo que a informação apareça no detalhe da viagem.

## 3. Carga Refrigerada
- **Campos:** `tempFront`, `tempRear` e `jobDescription` estão implementados na tela `CreateTrip`.
- **Persistência:** São salvos tanto em colunas específicas (`temp_front_c`, etc.) quanto no `cargo_json`, garantindo compatibilidade.
- **Visualização:** `TripDetail` exibe estas informações corretamente.

## 4. Chat
- **Implementação:** `ChatCenter` funcional, usa `chatRepo`.
- **Fluxo:** Admin seleciona motorista -> cria/busca thread -> troca mensagens em tempo real (subscription).
- **Tabelas:** Usa `chat_threads` e `chat_messages`.

## 5. IA / Copilot
- **Menu:** Página `CopilotPage` acessível.
- **Segurança:** Chaves de API não são salvas no frontend. `aiSettingsRepo` chama RPC `save_ai_settings` para criptografia no banco.
- **Chat:** Usa Edge Function `copilot-query`.

## 6. Gestão de Utilizadores
- **Tela:** `CreateUser` implementada.
- **Lógica:** Usa `adminsRepo.createAdmin` que invoca Edge Function `create-user` para criar Auth User e registro na tabela `admins`.
- **RBAC:** Verifica se é 'owner' antes de criar.

## 7. Dashboard e KPIs
- **Dados Reais:** `AdminHome` busca dados de todos os repositórios (`driversRepo`, `vehiclesRepo`, etc.).
- **Interatividade:** Cards de KPI são clicáveis e levam às listagens com filtros (ex: `/drivers?online=true`).

## 8. LiveMap
- **Mapa Real:** Implementado com `@react-google-maps/api`.
- **Dados:** Busca `vehiclesRepo` e `locationsRepo` (com realtime).
- **Config:** Usa `VITE_GOOGLE_MAPS_KEY`.

## 9. PT-PT e Nomenclatura
- **NIF:** Encontrado campo `cpf` (label NIF) em `CreateDriver`.
- **Correção:** Removida a obrigatoriedade do campo NIF no formulário de criação de motorista.
- **Matrícula:** `CreateVehicle` já usa o termo "Matrícula".

## 10. Consistência Visual
- **Tema:** Arquivo `theme/colors.ts` define a paleta Dark (Voxia).
- **UI:** Componentes seguem o padrão visual escuro.

## 11. Segurança
- **Scan:** Nenhuma chave sensível (sk-, AIza, etc.) encontrada hardcoded no código fonte.
- **Env:** Uso correto de `import.meta.env`.

## Conclusão
O Voxia Admin está **pronto para apresentação**, com os fluxos principais (Viagens, Chat, Mapa, Dashboard) conectados a dados reais e seguindo a lógica de negócio.

**Pontos de Atenção (Backend):**
- Garantir que as Edge Functions (`push-notification`, `copilot-query`, `create-user`) estejam deployadas.
- Garantir que a RPC `save_ai_settings` exista no banco de dados.
