# Instruções para Correção de Notificações Push (Driver App)

Para que as notificações cheguem corretamente ao dispositivo do motorista, é necessário garantir que o **Token FCM (Firebase Cloud Messaging)** seja capturado no dispositivo real e salvo no banco de dados Supabase, substituindo o token de teste (`dummy_token_for_testing_nelson`).

Siga estas instruções no código do **Aplicativo do Motorista** (Mobile ou Web):

## 1. Configuração do Firebase (Frontend do Motorista)

Certifique-se de que o Firebase está inicializado corretamente no app do motorista.

### Se for React Native (Mobile):
No arquivo principal (ex: `App.tsx` ou um Contexto de Auth):

```typescript
import messaging from '@react-native-firebase/messaging';
import { supabase } from './services/supabase'; // Sua instância do Supabase

// Função para solicitar permissão e pegar o token
async function requestUserPermissionAndGetToken(userId: string) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    
    // 1. Pegar o Token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // 2. Salvar no Supabase (Tabela drivers)
    if (token && userId) {
      const { error } = await supabase
        .from('drivers')
        .update({ fcm_token: token })
        .eq('id', userId); // Assumindo que o ID do motorista é o mesmo do Auth User

      if (error) console.error('Erro ao salvar token FCM:', error);
      else console.log('Token FCM atualizado com sucesso!');
    }
  }
}

// Chame esta função logo após o Login bem-sucedido
```

### Se for Web (React/PWA):
No arquivo onde você gerencia o Login (ex: `AuthProvider.tsx`):

```typescript
import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig"; // Sua config do Firebase
import { supabase } from "./services/supabase";

async function saveMessagingToken(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "SUA_VAPID_KEY_AQUI" // Pegue no Console do Firebase -> Project Settings -> Cloud Messaging -> Web Push Certificates
      });

      if (token) {
        console.log('FCM Token:', token);
        // Atualizar no Supabase
        await supabase
          .from('drivers')
          .update({ fcm_token: token })
          .eq('id', userId);
      }
    }
  } catch (error) {
    console.error('Erro ao pegar token:', error);
  }
}
```

## 2. Listener para Atualização de Token
O token pode mudar (ex: reinstalação do app, limpeza de dados). Adicione um listener para manter atualizado.

**React Native:**
```typescript
useEffect(() => {
  const unsubscribe = messaging().onTokenRefresh(token => {
    saveTokenToDatabase(token); // Reutilize a lógica de salvar
  });
  return unsubscribe;
}, []);
```

## 3. Teste Final
1. Faça Logout e Login novamente no App do Motorista em um **dispositivo real** (emuladores às vezes não geram tokens válidos sem Google Play Services).
2. Verifique no banco de dados (tabela `drivers`) se a coluna `fcm_token` mudou de `dummy_token_...` para um código longo e aleatório.
3. Crie uma nova viagem no Painel Admin e verifique se a notificação chega.
