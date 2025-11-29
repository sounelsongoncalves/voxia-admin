# Script de Teste E2E: Voxia Admin + Driver + Supabase

Este script guia a validação manual do fluxo de ponta a ponta.

## Pré-requisitos
1.  **Backend:** Supabase rodando (local ou nuvem). Edge Functions deployadas (`push-notification`).
2.  **Admin:** Web Dashboard rodando (`npm run dev`).
3.  **Driver:** App Android rodando (Emulador ou Dispositivo Físico).

---

## 1. Autenticação

### 1.1. Login Admin
- [ ] Acessar o Painel Admin (`/login`).
- [ ] Entrar com credenciais de administrador.
- [ ] **Resultado Esperado:** Redirecionamento para Dashboard (`/`).

### 1.2. Login Driver
- [ ] No App do Motorista, entrar com credenciais de motorista.
- [ ] **Resultado Esperado:** Acesso à tela inicial (Home/Viagens).

---

## 2. Criação de Viagem (Admin)

### 2.1. Viagem Refrigerada
- [ ] No Admin, ir para **Viagens** > **Nova Viagem**.
- [ ] Preencher Origem e Destino.
- [ ] Selecionar Motorista (o mesmo logado no passo 1.2) e Veículo.
- [ ] Selecionar Tipo de Carga: **Refrigerada**.
- [ ] Preencher:
    - [ ] Temp. Frente: `-18`
    - [ ] Temp. Trás: `-10`
    - [ ] Descrição: `Carga de Teste E2E`
- [ ] Clicar em **Confirmar Viagem**.
- [ ] **Resultado Esperado:** Toast de sucesso e redirecionamento para lista.

---

## 3. Notificação (Backend/Driver)

### 3.1. Verificação Técnica
- [ ] (Opcional) Verificar logs do Supabase Edge Functions.
- [ ] (Opcional) Verificar tabela `notifications` no Supabase:
    - `SELECT * FROM notifications WHERE user_id = 'ID_DO_MOTORISTA' ORDER BY created_at DESC LIMIT 1;`

### 3.2. Verificação Visual
- [ ] Verificar se o dispositivo do motorista recebeu a notificação Push (se configurado).

---

## 4. Recepção da Viagem (Driver)

- [ ] No App do Motorista, atualizar a lista de viagens.
- [ ] Clicar na nova viagem recebida.
- [ ] **Validar Detalhes:**
    - [ ] Temperaturas aparecem corretamente? (-18°C / -10°C)
    - [ ] Descrição "Carga de Teste E2E" aparece?

---

## 5. Jornada e Eventos (Driver)

- [ ] **Iniciar Viagem:** Deslizar para começar.
- [ ] **Registrar Eventos:**
    - [ ] **Carga/Descarga:** Registrar início e fim.
    - [ ] **Portagem:** Registrar uma portagem.
    - [ ] **Abastecimento:**
        - Escolher: Trator ou Galera.
        - Combustível: Gasóleo ou AdBlue.
        - Inserir Litros e Valor.
    - [ ] **Avaria:**
        - Gerar alerta de severidade ALTA.
- [ ] **Finalizar Viagem:** Deslizar para encerrar.
- [ ] **Validar Tela Final:** Mensagem "Bom descanso, [Nome do Motorista]".

---

## 6. Visualização no Admin

- [ ] No Admin, ir para **Viagens** e clicar na viagem recém-criada (agora concluída).
- [ ] **Validar Status:** Deve estar como `Completed` (ou equivalente).
- [ ] **Validar Timeline:**
    - [ ] Eventos de Carga, Portagem, Abastecimento aparecem na linha do tempo?
    - [ ] Coordenadas (se disponíveis) aparecem?
- [ ] **Validar Alertas:**
    - [ ] Ir para **Alertas**.
    - [ ] Verificar se o alerta de Avaria foi criado.
- [ ] **Validar Motorista:**
    - [ ] Ir para **Motoristas** > Detalhes.
    - [ ] Verificar se a viagem conta para o histórico.
