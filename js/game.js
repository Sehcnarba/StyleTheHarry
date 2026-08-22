/* =========================================================
   Style The Harry — lógica do jogo
   ========================================================= */

/* ---------------------------------------------------------
   PLACEHOLDERS DE IMAGEM
   ---------------------------------------------------------
   Enquanto não existem imagens finais, o jogo usa emojis.
   Quando tiveres a foto da rapariga e as caricaturas/fotos do
   Harry, basta:
     1) Colocar os ficheiros dentro de assets/images/
     2) Preencher os caminhos aqui em baixo

   Nada mais no código precisa de mudar — os emojis são
   automaticamente substituídos pelas imagens.
   ----------------------------------------------------------- */
const ASSETS = {
  girl: 'assets/images/girl.png',       // a rapariga durante o jogo (corpo inteiro)
  basket: null,         // ex: 'assets/images/basket.png' — ainda por adicionar
  menuGirl: 'assets/images/girl-face.png', // cara da rapariga no ecrã de menu
  menuHarry: 'assets/images/harry-12.png', // imagem dentro da moldura de coração do menu
  harryVariants: [
    'assets/images/harry-1.png',
    'assets/images/harry-2.png',
    'assets/images/harry-3.png',
    'assets/images/harry-4.png',
    'assets/images/harry-5.png',
    'assets/images/harry-6.png',
    'assets/images/harry-7.png',
    'assets/images/harry-8.png',
    'assets/images/harry-9.png',
    'assets/images/harry-10.png',
    'assets/images/harry-11.png',
    'assets/images/harry-12.png',
    'assets/images/harry-13.png',
    'assets/images/harry-14.png',
    'assets/images/harry-15.png',
    'assets/images/harry-16.png',
  ],
};

// Emojis usados enquanto ASSETS.harryVariants estiver vazio.
const FALLBACK_HARRY_EMOJIS = ['😍', '🤩', '😘'];

/* ---------------------------------------------------------
   CONFIGURAÇÃO DO JOGO
   ----------------------------------------------------------- */
const MAX_LIVES = 10;
const POINTS_PER_SPEED_TIER = 20;   // a cada 20 pontos aumenta a velocidade
const BASE_FALL_MS = 3600;          // tempo a cair do topo até ao fundo (nível 0)
const FALL_MS_MULT = 0.86;          // cada nível multiplica a duração por isto — sem limite, sobe para sempre
const FALL_MS_FLOOR = 1;            // apenas uma rede de segurança técnica (evita duração 0/negativa), não é um limite de jogo
const SPAWN_INTERVAL_MS = 950;      // intervalo entre comics a cair
const SPAWN_INTERVAL_MIN = 480;
const SPAWN_JITTER = 160;

const HIGHSCORES_KEY = 'styleTheHarry.highscores.v1';
const MAX_HIGHSCORES = 10;

/* ---------------------------------------------------------
   ESTADO
   ----------------------------------------------------------- */
let gameState = 'menu'; // 'menu' | 'playing' | 'gameover'
let score = 0;
let lives = MAX_LIVES;
let pointerX = null;
let activeComics = [];
let livesEls = [];
let rafId = null;
let spawnTimer = null;
let highscores = loadHighscores();
let pendingFinalScore = 0;
let highscoreQualifies = false;

/* ---------------------------------------------------------
   ELEMENTOS
   ----------------------------------------------------------- */
const screens = {
  menu: document.getElementById('screen-menu'),
  game: document.getElementById('screen-game'),
  gameover: document.getElementById('screen-gameover'),
};

const gameArea = document.getElementById('game-area');
const girlEl = document.getElementById('girl');
const basketEl = document.getElementById('basket');
const livesContainer = document.getElementById('lives');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const gameoverPanel = document.getElementById('gameover-panel');
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const menuButton = document.getElementById('menu-button');
const exitButton = document.getElementById('exit-button');

const leaderboardOpenButton = document.getElementById('leaderboard-open-button');
const leaderboardCloseButton = document.getElementById('leaderboard-close-button');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardListMenu = document.getElementById('leaderboard-list-menu');
const leaderboardListGameover = document.getElementById('leaderboard-list-gameover');
const highscoreForm = document.getElementById('highscore-form');
const playerNameInput = document.getElementById('player-name-input');

/* ---------------------------------------------------------
   SUBSTITUIÇÃO DE EMOJI POR IMAGEM (placeholders -> arte final)
   ----------------------------------------------------------- */
function applyImageAsset(elementId, assetPath, altText) {
  if (!assetPath) return;
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';
  const img = document.createElement('img');
  img.src = assetPath;
  img.alt = altText || '';
  el.appendChild(img);
}

function initAssets() {
  applyImageAsset('girl-emoji', ASSETS.girl, 'Rapariga');
  applyImageAsset('basket-emoji', ASSETS.basket, 'Cesta');
  applyImageAsset('menu-girl-emoji', ASSETS.menuGirl, 'Rapariga');
  applyImageAsset('menu-harry-emoji', ASSETS.menuHarry, 'Harry Styles');
}

function createComicSprite() {
  if (ASSETS.harryVariants && ASSETS.harryVariants.length) {
    const src = ASSETS.harryVariants[Math.floor(Math.random() * ASSETS.harryVariants.length)];
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Harry Styles';
    return img;
  }
  const span = document.createElement('span');
  span.textContent = FALLBACK_HARRY_EMOJIS[Math.floor(Math.random() * FALLBACK_HARRY_EMOJIS.length)];
  return span;
}

/* ---------------------------------------------------------
   RECORDES (top 10, guardados no browser do jogador)
   ----------------------------------------------------------- */
function loadHighscores() {
  try {
    const raw = localStorage.getItem(HIGHSCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.name === 'string' && typeof e.score === 'number')
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HIGHSCORES);
  } catch (err) {
    console.warn('Não foi possível ler os recordes guardados:', err);
    return [];
  }
}

function saveHighscores() {
  try {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highscores));
  } catch (err) {
    console.warn('Não foi possível guardar os recordes:', err);
  }
}

function qualifiesForHighscore(candidateScore) {
  if (candidateScore <= 0) return false;
  if (highscores.length < MAX_HIGHSCORES) return true;
  const lowest = highscores[highscores.length - 1].score;
  return candidateScore > lowest;
}

function addHighscore(name, finalScore) {
  const cleanName = (name || '').trim().slice(0, 14) || 'Anónimo';
  const entry = { name: cleanName, score: finalScore };
  highscores.push(entry);
  highscores.sort((a, b) => b.score - a.score);
  if (highscores.length > MAX_HIGHSCORES) highscores.length = MAX_HIGHSCORES;
  saveHighscores();
  return entry;
}

function renderLeaderboard(containerEl, highlightEntry) {
  containerEl.innerHTML = '';

  if (!highscores.length) {
    const li = document.createElement('li');
    li.className = 'leaderboard-empty';
    li.textContent = 'Ainda não há recordes — sê o/a primeiro/a!';
    containerEl.appendChild(li);
    return;
  }

  highscores.forEach((entry, i) => {
    const li = document.createElement('li');
    if (highlightEntry && entry === highlightEntry) li.classList.add('is-you');

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = (i + 1) + '.';

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = entry.name;

    const pts = document.createElement('span');
    pts.className = 'pts';
    pts.textContent = String(entry.score);

    li.append(rank, name, pts);
    containerEl.appendChild(li);
  });
}

function submitHighscore() {
  if (!highscoreQualifies) return;
  const entry = addHighscore(playerNameInput.value, pendingFinalScore);
  highscoreQualifies = false;
  highscoreForm.classList.add('hidden');
  renderLeaderboard(leaderboardListGameover, entry);
}

/* ---------------------------------------------------------
   NAVEGAÇÃO ENTRE ECRÃS
   ----------------------------------------------------------- */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    const isActive = key === name;
    el.classList.toggle('hidden', !isActive);
    el.setAttribute('aria-hidden', String(!isActive));
  });
}

/* ---------------------------------------------------------
   VIDAS (HUD)
   ----------------------------------------------------------- */
function renderLives() {
  livesContainer.innerHTML = '';
  livesEls = [];
  for (let i = 0; i < MAX_LIVES; i++) {
    const span = document.createElement('span');
    span.className = 'life';
    span.textContent = '❤️';
    livesContainer.appendChild(span);
    livesEls.push(span);
  }
}

function loseLife() {
  if (lives <= 0) return;
  const idx = lives - 1;
  const el = livesEls[idx];
  if (el) el.classList.add('lost');
  lives--;

  if (lives <= 0) {
    setTimeout(triggerGameOver, 450);
  }
}

function forceLoseAllLives() {
  if (gameState !== 'playing') return;
  livesEls.forEach((el) => el.classList.add('lost'));
  lives = 0;

  // Pára o jogo já (sem mais comics/spawns) e só depois mostra o ecrã de
  // game over, dando tempo à animação dos corações a partir.
  gameState = 'ending';
  if (rafId) cancelAnimationFrame(rafId);
  if (spawnTimer) clearTimeout(spawnTimer);
  setTimeout(triggerGameOver, 450);
}

/* ---------------------------------------------------------
   DIFICULDADE (velocidade de queda)
   ----------------------------------------------------------- */
function currentSpeedTier() {
  return Math.floor(score / POINTS_PER_SPEED_TIER);
}

function currentFallDurationMs() {
  const tier = currentSpeedTier();
  // Sem limite de dificuldade: a cada tier (20 pontos) fica sempre mais rápido.
  // FALL_MS_FLOOR é só uma rede de segurança técnica, não uma dificuldade máxima.
  return Math.max(FALL_MS_FLOOR, Math.round(BASE_FALL_MS * Math.pow(FALL_MS_MULT, tier)));
}

function currentSpawnIntervalMs() {
  const tier = currentSpeedTier();
  return Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MS - tier * 35);
}

/* ---------------------------------------------------------
   MOVIMENTO DA RAPARIGA (rato / dedo / setas)
   ----------------------------------------------------------- */
function onPointerMove(e) {
  if (gameState !== 'playing') return;
  const rect = gameArea.getBoundingClientRect();
  pointerX = e.clientX - rect.left;
}

function onKeyDown(e) {
  if (gameState !== 'playing') return;
  const rect = gameArea.getBoundingClientRect();
  const step = 44;
  if (pointerX == null) pointerX = rect.width / 2;
  if (e.key === 'ArrowLeft') pointerX = Math.max(0, pointerX - step);
  else if (e.key === 'ArrowRight') pointerX = Math.min(rect.width, pointerX + step);
}

function updateGirlPosition() {
  const areaRect = gameArea.getBoundingClientRect();
  const girlWidth = girlEl.offsetWidth || 80;
  const halfWidth = girlWidth / 2;
  const targetX = pointerX == null ? areaRect.width / 2 : pointerX;
  const clamped = Math.min(areaRect.width - halfWidth, Math.max(halfWidth, targetX));
  girlEl.style.left = clamped + 'px';
}

/* ---------------------------------------------------------
   COMICS A CAIR
   ----------------------------------------------------------- */
function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function spawnComic() {
  if (gameState !== 'playing') return;

  const el = document.createElement('div');
  el.className = 'comic';
  el.appendChild(createComicSprite());
  el.style.top = '-12%';
  gameArea.appendChild(el);

  const areaWidth = gameArea.clientWidth;
  const compWidth = el.getBoundingClientRect().width || 50;
  const maxLeft = Math.max(0, areaWidth - compWidth);
  el.style.left = Math.random() * maxLeft + 'px';

  activeComics.push({
    el,
    startTime: performance.now(),
    durationMs: currentFallDurationMs(),
    resolved: false,
  });
}

function scheduleNextSpawn() {
  if (gameState !== 'playing') return;
  spawnComic();
  const base = currentSpawnIntervalMs();
  const jitter = Math.random() * SPAWN_JITTER - SPAWN_JITTER / 2;
  spawnTimer = setTimeout(scheduleNextSpawn, Math.max(280, base + jitter));
}

function showFloatScore(basketRect, areaRect) {
  const el = document.createElement('div');
  el.className = 'float-score';
  el.textContent = '+1';
  el.style.left = basketRect.left - areaRect.left + basketRect.width / 2 - 10 + 'px';
  el.style.top = basketRect.top - areaRect.top - 14 + 'px';
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function catchComic(comic) {
  comic.resolved = true;
  score++;
  scoreEl.textContent = String(score);
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');

  basketEl.classList.remove('catch-bounce');
  void basketEl.offsetWidth;
  basketEl.classList.add('catch-bounce');

  const areaRect = gameArea.getBoundingClientRect();
  showFloatScore(basketEl.getBoundingClientRect(), areaRect);

  comic.el.classList.add('caught');
  setTimeout(() => comic.el.remove(), 380);
}

function missComic(comic) {
  comic.resolved = true;
  comic.el.classList.add('missed');
  setTimeout(() => comic.el.remove(), 450);
  loseLife();
}

function updateComics(timestamp) {
  if (!activeComics.length) return;
  const basketRect = basketEl.getBoundingClientRect();
  const stillActive = [];

  for (const comic of activeComics) {
    const elapsed = timestamp - comic.startTime;
    const pct = Math.min(104, (elapsed / comic.durationMs) * 100);
    comic.el.style.top = pct + '%';

    if (rectsOverlap(comic.el.getBoundingClientRect(), basketRect)) {
      catchComic(comic);
      continue;
    }
    if (pct >= 100) {
      missComic(comic);
      continue;
    }
    stillActive.push(comic);
  }

  activeComics = stillActive;
}

/* ---------------------------------------------------------
   CICLO PRINCIPAL
   ----------------------------------------------------------- */
function tick(timestamp) {
  if (gameState !== 'playing') return;
  updateGirlPosition();
  updateComics(timestamp);
  rafId = requestAnimationFrame(tick);
}

/* ---------------------------------------------------------
   TRANSIÇÕES DE ESTADO
   ----------------------------------------------------------- */
function clearComics() {
  activeComics.forEach((c) => c.el.remove());
  activeComics = [];
}

function startGame() {
  gameState = 'playing';
  score = 0;
  lives = MAX_LIVES;
  pointerX = null;

  scoreEl.textContent = '0';
  renderLives();
  clearComics();
  gameoverPanel.classList.add('hidden');

  showScreen('game');
  updateGirlPosition();

  spawnTimer = setTimeout(scheduleNextSpawn, 400);
  rafId = requestAnimationFrame(tick);
}

function triggerGameOver() {
  gameState = 'gameover';
  if (rafId) cancelAnimationFrame(rafId);
  if (spawnTimer) clearTimeout(spawnTimer);
  clearComics();

  pendingFinalScore = score;
  highscoreQualifies = qualifiesForHighscore(pendingFinalScore);

  finalScoreEl.textContent = String(score);
  gameoverPanel.classList.add('hidden');

  if (highscoreQualifies) {
    playerNameInput.value = '';
    highscoreForm.classList.remove('hidden');
  } else {
    highscoreForm.classList.add('hidden');
  }
  renderLeaderboard(leaderboardListGameover, null);

  showScreen('gameover');

  // O coração parte-se primeiro; o painel com o score (e o formulário de
  // recorde, se for o caso) aparece a seguir.
  setTimeout(() => {
    gameoverPanel.classList.remove('hidden');
    if (highscoreQualifies) playerNameInput.focus();
  }, 1000);
}

function backToMenu() {
  gameState = 'menu';
  if (rafId) cancelAnimationFrame(rafId);
  if (spawnTimer) clearTimeout(spawnTimer);
  clearComics();
  showScreen('menu');
}

/* ---------------------------------------------------------
   EVENTOS
   ----------------------------------------------------------- */
gameArea.addEventListener('pointermove', onPointerMove);
gameArea.addEventListener('pointerdown', onPointerMove);
window.addEventListener('keydown', onKeyDown);

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);
menuButton.addEventListener('click', backToMenu);
exitButton.addEventListener('click', forceLoseAllLives);

highscoreForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitHighscore();
});

leaderboardOpenButton.addEventListener('click', () => {
  renderLeaderboard(leaderboardListMenu, null);
  leaderboardModal.classList.remove('hidden');
  leaderboardModal.setAttribute('aria-hidden', 'false');
});

leaderboardCloseButton.addEventListener('click', () => {
  leaderboardModal.classList.add('hidden');
  leaderboardModal.setAttribute('aria-hidden', 'true');
});

/* ---------------------------------------------------------
   INÍCIO
   ----------------------------------------------------------- */
initAssets();
renderLives();
showScreen('menu');
