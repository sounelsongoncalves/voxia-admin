# Relatório de Correção de KPIs e Filtros

**Status:** ✅ Implementado e Verificado

## Alterações Realizadas

### 1. Backend (Supabase)
Foram criadas Views SQL para garantir a integridade dos dados dos KPIs:
- **`v_online_drivers`**: Seleciona motoristas com localização atualizada nos últimos 10 minutos OU com viagem ativa (`started`, `in_progress`).
- **`v_vehicles_in_use`**: Seleciona veículos associados a jornadas abertas (`open`).
- **`v_latest_locations`**: View auxiliar para obter a localização mais recente de cada motorista.

### 2. Frontend (Repositórios)
- **`repositories/kpiRepo.ts`**: Adicionados métodos `getOnlineDriversCount()` e `getVehiclesInUseCount()` que consultam diretamente as novas views para obter contagens precisas.
- **`repositories/driversRepo.ts`**: Atualizado `getDrivers()` para aceitar filtro `{ online: true }`, filtrando os resultados com base na view `v_online_drivers`.
- **`repositories/vehiclesRepo.ts`**: Atualizado `getVehicles()` para aceitar filtro `{ in_use: true }`, filtrando com base na view `v_vehicles_in_use`.

### 3. Frontend (UI)
- **`pages/AdminHome.tsx`**:
    - KPIs agora exibem números reais vindos do banco de dados.
    - Cards "Motoristas Online" e "Viaturas em Uso" agora redirecionam para as listas com os filtros corretos (`?online=true`, `?in_use=true`).
- **`pages/DriversList.tsx`**: Implementada leitura do parâmetro de URL `?online=true` para filtrar a lista automaticamente.
- **`pages/VehiclesList.tsx`**: Implementada leitura do parâmetro de URL `?in_use=true` para filtrar a lista automaticamente.

## Como Validar

1.  **Dashboard:** Verifique se os números nos cards "Motoristas Online" e "Viaturas em Uso" correspondem à realidade (ex: motoristas com app aberto/viagem ativa).
2.  **Navegação:** Clique no card "Motoristas Online". Você deve ser levado para a lista de motoristas filtrada, mostrando apenas os online.
3.  **Filtros:** Verifique se a URL muda para `/drivers?online=true` e se a lista reflete isso. O mesmo para `/vehicles?in_use=true`.

## Arquivos Modificados
- `repositories/kpiRepo.ts`
- `repositories/driversRepo.ts`
- `repositories/vehiclesRepo.ts`
- `pages/AdminHome.tsx`
- `pages/DriversList.tsx`
- `pages/VehiclesList.tsx`
