# Relatório de Correção - Veículos

## Problemas Identificados
1.  **Erro ao Apagar Veículo:** O usuário relatou não conseguir apagar veículos. A causa provável é a violação de integridade referencial (o veículo está associado a viagens ou motoristas). O código anterior não tratava esse erro, apenas lançava a exceção genérica.
2.  **Problemas na Adição/Edição:** O usuário relatou problemas na adição. A causa provável era a incompatibilidade entre o formato do status no frontend (`Status.Active` = 'Ativo') e o esperado pelo banco de dados (provavelmente 'active', 'inactive', etc.).

## Correções Aplicadas

### 1. Repositório (`vehiclesRepo.ts`)
- **Tratamento de Erro na Exclusão:** Adicionado tratamento específico para o erro `23503` (Foreign Key Violation). Agora, o sistema lança uma mensagem amigável: "Não é possível excluir este veículo pois ele está associado a viagens ou motoristas."
- **Mapeamento de Status:** Implementadas funções auxiliares `mapDbStatusToFrontend` e `mapFrontendStatusToDb` para converter entre os valores do banco ('active', 'inactive', 'maintenance') e os enums do frontend ('Ativo', 'Inativo', 'Erro').
- **Correção nos Métodos:** As funções `getVehicles`, `getVehicleById`, `createVehicle` e `updateVehicle` foram atualizadas para usar esse mapeamento, garantindo que os dados sejam salvos e lidos corretamente.

## Teste
- **Adicionar Veículo:** O status selecionado ('Ativo') é convertido para 'active' antes de salvar.
- **Listar Veículos:** O status vindo do banco ('active') é convertido para 'Ativo' para exibição correta na tabela.
- **Excluir Veículo:** Se o veículo estiver em uso, o usuário receberá uma mensagem clara explicando o motivo do bloqueio.

## Próximos Passos
- Monitorar se o usuário relata novos erros específicos.
