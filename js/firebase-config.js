/* =========================================================
   Configuração do projeto Firebase — recordes online
   =========================================================
   Estas chaves vêm da consola da Firebase (Definições do projeto > as
   tuas apps > SDK setup). São públicas por natureza — não são um
   segredo — a segurança fica a cargo das REGRAS do Firestore (ver
   README.md), não de esconder este ficheiro.

   Se um dia precisares de trocar de projeto Firebase, basta substituir
   os valores aqui em baixo — nada mais no jogo precisa de mudar.
   ----------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBs7_NlUfLflIU9XOFL6DWKfSTrKuv7C5c",
  authDomain: "style-the-harry.firebaseapp.com",
  projectId: "style-the-harry",
  storageBucket: "style-the-harry.firebasestorage.app",
  messagingSenderId: "482998915047",
  appId: "1:482998915047:web:3fa6d1a2f4101b72743742"
};

// Se a Firebase não carregar (sem internet, bloqueador de anúncios, etc.),
// o jogo não pode partir — continua tudo a funcionar com os recordes
// guardados localmente no browser (ver js/leaderboard-online.js).
try {
  firebase.initializeApp(firebaseConfig);
} catch (err) {
  console.warn('Não foi possível inicializar a Firebase — os recordes ficam só locais.', err);
}
