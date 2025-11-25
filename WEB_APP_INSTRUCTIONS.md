# Instruções para Aplicação Web (Driver Web App)

Como a aplicação do motorista é **Web**, o processo para receber notificações é um pouco diferente do mobile.

## 1. Configurar o Service Worker (Essencial para notificações em background)

Você precisa criar um arquivo chamado `firebase-messaging-sw.js` na pasta `public` do seu projeto.

**Arquivo:** `public/firebase-messaging-sw.js`

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBrqV1QDLs1nC605U47NLQeo2MG1hizL_w",
  authDomain: "truckapp-bdf31.firebaseapp.com",
  projectId: "truckapp-bdf31",
  storageBucket: "truckapp-bdf31.firebasestorage.app",
  messagingSenderId: "848525359650",
  appId: "1:848525359650:web:11535e84e669a5adf3687b"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' // Substitua pelo ícone do seu app
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## 2. Solicitar Permissão e Salvar Token (No Frontend)

No componente principal da sua aplicação (ex: `App.tsx` ou `Dashboard.tsx`), adicione a lógica para pedir permissão e salvar o token.

**Exemplo em React:**

```typescript
import { useEffect } from 'react';
import { requestForToken, messaging } from './services/firebase'; // Importe do arquivo que criamos
import { onMessage } from 'firebase/messaging';
import { supabase } from './services/supabase'; // Seu cliente supabase

const DriverDashboard = () => {

  useEffect(() => {
    // 1. Solicitar Token e Salvar
    const handleNotificationSetup = async () => {
      const token = await requestForToken();
      
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Salva o token no perfil do motorista
          await supabase.from('drivers').update({
            fcm_token: token,
            updated_at: new Date().toISOString()
          }).eq('id', user.id);
          
          console.log('Token Web salvo com sucesso!');
        }
      }
    };

    handleNotificationSetup();

    // 2. Ouvir mensagens quando o app está aberto (Foreground)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      // Aqui você pode mostrar um Toast/Alerta customizado
      alert(`Nova Viagem: ${payload.notification?.title} - ${payload.notification?.body}`);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      <h1>Painel do Motorista</h1>
      {/* Resto da sua interface */}
    </div>
  );
};

export default DriverDashboard;
```

## 3. Testar

1.  Abra a aplicação Web do motorista.
2.  O navegador vai perguntar: **"truckapp-admin deseja enviar notificações"**. Clique em **Permitir**.
3.  Verifique no console do navegador se aparece o token.
4.  Verifique no banco de dados se o token foi salvo.
5.  Crie uma nova viagem no Admin.
6.  A notificação deve aparecer no canto da tela (se o app estiver em background) ou como um alerta (se estiver aberto).
