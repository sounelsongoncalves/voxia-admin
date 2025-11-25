import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBrqV1QDLs1nC605U47NLQeo2MG1hizL_w",
    authDomain: "truckapp-bdf31.firebaseapp.com",
    projectId: "truckapp-bdf31",
    storageBucket: "truckapp-bdf31.firebasestorage.app",
    messagingSenderId: "848525359650",
    appId: "1:848525359650:web:11535e84e669a5adf3687b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = () => {
    return getToken(messaging, {
        // ⚠️ IMPORTANTE: Você precisa gerar este par de chaves no Firebase Console!
        // Vá em Project Settings -> Cloud Messaging -> Web Push certificates -> Generate Key pair
        vapidKey: 'BDO4N6_2AEQaUq1UMXm_NqNcRPw_s3yX42bxO4bKQyaV3XVlivNwsoZtwA_acWBZBQ8RRaGaeMwjvGwxT6n7uLs'
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
