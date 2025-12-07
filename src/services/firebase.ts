import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = () => {
    return getToken(messaging, {
        // ⚠️ IMPORTANTE: Você precisa gerar este par de chaves no Firebase Console!
        // Vá em Project Settings -> Cloud Messaging -> Web Push certificates -> Generate Key pair
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    })
        .then((currentToken) => {
            if (currentToken) {
                console.log('FCM Token do Cliente Web:', currentToken);
                // Aqui você pode enviar o token para o seu servidor/banco de dados se necessário
                return currentToken;
            } else {
                console.log('Nenhum token de registro disponível. Solicite permissão para gerar um.');
                return null;
            }
        })
        .catch((err) => {
            console.log('Ocorreu um erro ao recuperar o token.', err);
            return null;
        });
};
