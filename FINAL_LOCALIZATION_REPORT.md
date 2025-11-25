# Relatório de Localização e Rebranding - Voxia Admin

## Resumo das Alterações

Este relatório detalha as modificações realizadas para localizar o painel administrativo para Português de Portugal (PT-PT) e realizar o rebranding para "Voxia".

### 1. Rebranding para "Voxia"
Todas as referências visíveis à marca "TrucksUp" foram atualizadas para "Voxia".
- **Arquivos Alterados:**
  - `pages/AdminLogin.tsx`: Título e textos de boas-vindas.
  - `pages/AdminOnboarding.tsx`: Título de boas-vindas.
  - `components/Sidebar.tsx`: Nome da aplicação e email de suporte (`admin@voxia.com`).
  - `components/Copilot.tsx`: Título do assistente ("IA Voxia").
  - `pages/Settings.tsx`: Nome da empresa e email.
  - `pages/CreateUser.tsx`: Placeholder de email.
  - `index.html`: Título da página (`document.title`).
  - `constants.ts`: (Se houver referências, foram verificadas).

### 2. Atualização do Menu Principal
O menu lateral foi reorganizado e expandido conforme solicitado.
- **Novos Itens:**
  - **Chat**: Rota `/chat`, utilizando o componente `ChatCenter`.
  - **Copiloto IA**: Rota `/copilot`, utilizando a nova página `CopilotPage`.
  - **Utilizadores**: Rota `/users`, utilizando a página `Settings` (reaproveitada para listagem).
- **Arquivos Alterados:**
  - `constants.ts`: Definição dos itens do menu.
  - `App.tsx`: Definição das rotas e guardas de navegação.

### 3. Localização para Português de Portugal (PT-PT)
Termos específicos do Brasil foram substituídos pelos equivalentes em Portugal.
- **Termos Substituídos:**
  - `CPF` -> `NIF`
  - `CNH` / `Habilitação` -> `Carta de Condução`
  - `Telefone Celular` -> `Telemóvel`
  - `Caminhão` -> `Camião`
  - `Placa` -> `Matrícula`
  - `Endereço` -> `Morada`
  - `Usuário` -> `Utilizador`
  - `Gerente` -> `Gestor`
  - `Cadastrar` -> `Registar`
  - `Salvar` -> `Guardar`
  - `Fabricação` -> `Fabrico`
  - `Baixar` -> `Descarregar`
  - `Contato` -> `Contacto`
  - `Você` -> (Removido ou reformulado para impessoal/formal)
- **Arquivos Alterados:**
  - `pages/CreateDriver.tsx`
  - `pages/CreateVehicle.tsx`
  - `pages/CreateTrip.tsx`
  - `pages/CreateUser.tsx`
  - `pages/Settings.tsx`
  - `pages/AdminLogin.tsx`
  - `pages/AdminHome.tsx`
  - `pages/DriverDetail.tsx`
  - `pages/TrailersList.tsx`
  - `pages/VehiclesList.tsx`
  - `pages/LiveMap.tsx`

### 4. Criação de Novos Componentes
- **`pages/CopilotPage.tsx`**: Criada uma página dedicada para o Copiloto IA para permitir acesso via menu lateral sem duplicar a lógica do componente flutuante existente.

### 5. Ajustes Técnicos
- **`types.ts`**: Atualizada a interface `Driver` para incluir campos opcionais `cpf` e `license_number` para compatibilidade com o formulário de criação.

## Próximos Passos Sugeridos
1. **Validação Visual**: Navegar por todas as telas para garantir que os textos não quebram o layout.
2. **Testes de Fluxo**: Verificar se a criação de motoristas, veículos e viagens continua funcional com os novos labels (a lógica de backend não foi alterada, mas é bom validar).
3. **Tradução Profunda**: Se houver mensagens de erro vindas do backend (Supabase), estas podem ainda estar em inglês ou PT-BR, dependendo da configuração do servidor.

---
**Data:** 21/11/2025
**Autor:** Antigravity (Google Deepmind)
