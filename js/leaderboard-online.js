/* =========================================================
   Recordes ONLINE — top10 partilhado por todos os jogadores
   =========================================================
   Pequena camada por cima do Firestore (Firebase). Se, por qualquer
   razão, a Firebase não estiver disponível (sem internet, script
   bloqueado, projeto mal configurado, etc.), `isAvailable()` devolve
   false e o resto do jogo usa automaticamente só os recordes locais
   (localStorage) — ver js/game.js.
   ----------------------------------------------------------- */
const OnlineLeaderboard = (function () {
  const COLLECTION = 'highscores';
  let db = null;
  let available = false;

  try {
    if (window.firebase && firebase.apps && firebase.apps.length) {
      db = firebase.firestore();
      available = true;
    }
  } catch (err) {
    console.warn('Firestore indisponível — a usar apenas recordes locais.', err);
    db = null;
    available = false;
  }

  async function fetchTop10() {
    if (!available) return null;
    try {
      const snapshot = await db
        .collection(COLLECTION)
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return { name: data.name, score: data.score };
      });
    } catch (err) {
      console.warn('Não foi possível carregar o top10 online:', err);
      return null;
    }
  }

  async function submitScore(name, score) {
    if (!available) return false;
    try {
      await db.collection(COLLECTION).add({
        name: name,
        score: score,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.warn('Não foi possível guardar o recorde online:', err);
      return false;
    }
  }

  return {
    fetchTop10: fetchTop10,
    submitScore: submitScore,
    isAvailable: function () { return available; },
  };
})();
