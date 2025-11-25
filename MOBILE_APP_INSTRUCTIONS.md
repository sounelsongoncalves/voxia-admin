# Instruções para o Aplicativo Móvel (Driver App)

Para que as notificações push funcionem, o aplicativo móvel precisa enviar o token FCM do dispositivo para o Supabase.

## 1. Dependências Necessárias (Flutter)

No seu `pubspec.yaml`, certifique-se de ter:

```yaml
dependencies:
  firebase_messaging: ^14.7.10
  supabase_flutter: ^2.3.0
```

## 2. Código para Capturar e Salvar o Token

Adicione este código na inicialização do seu app (ex: após o login do motorista):

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> setupPushNotifications() async {
  final supabase = Supabase.instance.client;
  final user = supabase.auth.currentUser;

  if (user == null) return;

  // 1. Solicitar permissão (iOS/Android 13+)
  FirebaseMessaging messaging = FirebaseMessaging.instance;
  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  if (settings.authorizationStatus == AuthorizationStatus.authorized) {
    print('Permissão de notificação concedida');

    // 2. Obter o token FCM
    String? token = await messaging.getToken();
    print('FCM Token: $token');

    if (token != null) {
      // 3. Salvar o token na tabela 'drivers'
      // Assumindo que o ID do motorista é o mesmo do usuário autenticado (user.id)
      try {
        await supabase.from('drivers').update({
          'fcm_token': token,
          'updated_at': DateTime.now().toIso8601String(),
        }).eq('id', user.id);
        
        print('Token salvo no Supabase com sucesso!');
      } catch (e) {
        print('Erro ao salvar token no Supabase: $e');
      }
    }
  } else {
    print('Permissão de notificação negada');
  }

  // 4. (Opcional) Escutar atualizações de token
  FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
    await supabase.from('drivers').update({
      'fcm_token': newToken,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', user.id);
  });
}
```

## 3. Teste Final

1.  Execute o app no dispositivo real (emuladores podem não gerar tokens válidos).
2.  Faça login.
3.  Verifique no painel do Supabase se a coluna `fcm_token` do motorista foi preenchida.
4.  Crie uma viagem no Painel Admin e a notificação deve chegar!
