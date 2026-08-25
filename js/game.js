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
const POINTS_PER_SPEED_TIER = 10;   // a cada 10 pontos aumenta a velocidade
const BASE_FALL_MS = 3600;          // tempo a cair do topo até ao fundo (nível 0)
const FALL_MS_MULT = 0.86;          // cada nível multiplica a duração por isto — sem limite, sobe para sempre
const FALL_MS_FLOOR = 1;            // apenas uma rede de segurança técnica (evita duração 0/negativa), não é um limite de jogo
const FALL_SPEED_VARIATION = 0.35;  // cada Harry cai com velocidade base ±35%, ao acaso
const SPAWN_INTERVAL_MS = 950;      // intervalo entre "vagas" de comics a cair
const SPAWN_INTERVAL_MIN = 480;
const SPAWN_JITTER = 160;

const HIGHSCORES_KEY = 'styleTheHarry.highscores.v1';
const MAX_HIGHSCORES = 10;

/* ---------------------------------------------------------
   DIFICULDADES (escolhidas no menu, antes de jogar)
   ----------------------------------------------------------- */
const DIFFICULTIES = {
  easy: {
    label: 'Fácil',
    hint: 'Só cai um Harry de cada vez, a velocidade é menor.',
    maxSimultaneous: 1,       // sempre 1 de cada vez
    fallDurationMultiplier: 1.4, // queda mais lenta (duração maior)
    scoreMultiplier: 1,
  },
  medium: {
    label: 'Intermédio',
    hint: 'Caem 1-2 Harrys de cada vez, velocidade normal. Pontuação final ×1.5.',
    maxSimultaneous: 2,
    fallDurationMultiplier: 1,
    scoreMultiplier: 1.5,
  },
  hard: {
    label: 'Difícil',
    hint: 'Caem 1-3 Harrys de cada vez, velocidade normal. Pontuação final ×2.',
    maxSimultaneous: 3,
    fallDurationMultiplier: 1,
    scoreMultiplier: 2,
  },
};
const DEFAULT_DIFFICULTY = 'hard'; // mantém o comportamento que o jogo já tinha
const DIFFICULTY_KEY = 'styleTheHarry.difficulty.v1';

/* ---------------------------------------------------------
   SUPER HARRIES (dourados) + ANTI-HARRIES (invertidos) — opcional,
   independente da dificuldade, ligado/desligado no menu.
   ----------------------------------------------------------- */
const SUPER_HARRIES_KEY = 'styleTheHarry.superHarries.v1';
const SUPER_HARRY_CHANCE = 0.07; // ~7% de cada Harry gerado
const ANTI_HARRY_CHANCE = 0.06;  // ~6% de cada Harry gerado

// Pontos ganhos/perdidos ao apanhar cada tipo de Harry.
const COMIC_SCORE_DELTA = { normal: 1, super: 5, anti: -10 };
// Vidas perdidas quando cada tipo de Harry NÃO é apanhado (cai ao chão).
const COMIC_LIFE_LOSS_ON_MISS = { normal: 1, super: 5, anti: 0 };

/* ---------------------------------------------------------
   ESTADO
   ----------------------------------------------------------- */
let gameState = 'menu'; // 'menu' | 'playing' | 'paused' | 'ending' | 'gameover'
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
let pausedAt = null;
let difficulty = loadDifficulty();
let superHarriesEnabled = loadSuperHarriesPref();

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
const pauseButton = document.getElementById('pause-button');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseScoreEl = document.getElementById('pause-score');
const resumeButton = document.getElementById('resume-button');
const pauseExitButton = document.getElementById('pause-exit-button');

const difficultyButtons = Array.from(document.querySelectorAll('.difficulty-btn'));
const difficultyHint = document.getElementById('difficulty-hint');
const superHarriesToggle = document.getElementById('super-harries-toggle');
const multiplierBadge = document.getElementById('multiplier-badge');
const finalScoreDetail = document.getElementById('final-score-detail');

const leaderboardOpenButton = document.getElementById('leaderboard-open-button');
const leaderboardCloseButton = document.getElementById('leaderboard-close-button');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardListMenu = document.getElementById('leaderboard-list-menu');
const leaderboardListGameover = document.getElementById('leaderboard-list-gameover');
const highscoreForm = document.getElementById('highscore-form');
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');

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
   RECORDES — locais (localStorage) + online (Firestore, partilhados)
   ----------------------------------------------------------
   `highscores` é sempre a cópia local, guardada no browser do jogador —
   funciona offline e serve de reserva. Quando a Firebase está disponível
   (ver js/leaderboard-online.js), `onlineTop10Cache` guarda a última
   lista partilhada por TODOS os jogadores do site, e passa a ser essa
   a lista mostrada/usada para saber se um score entra no top10.
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

let onlineTop10Cache = null; // null = ainda não carregado (ou indisponível) — usa-se o local
let onlineFetchInFlight = null;

function isOnlineLeaderboardAvailable() {
  return typeof OnlineLeaderboard !== 'undefined' && OnlineLeaderboard.isAvailable();
}

// A lista "efetiva": online (partilhada) se já a tivermos, senão a local.
function getEffectiveHighscores() {
  return onlineTop10Cache !== null ? onlineTop10Cache : highscores;
}

function refreshOnlineLeaderboard() {
  if (!isOnlineLeaderboardAvailable()) return Promise.resolve(null);
  if (onlineFetchInFlight) return onlineFetchInFlight;

  onlineFetchInFlight = OnlineLeaderboard.fetchTop10()
    .then((list) => {
      onlineFetchInFlight = null;
      if (list) onlineTop10Cache = list;
      return onlineTop10Cache;
    })
    .catch(() => {
      onlineFetchInFlight = null;
      return onlineTop10Cache;
    });

  return onlineFetchInFlight;
}

function qualifiesForHighscore(candidateScore) {
  if (candidateScore <= 0) return false;
  const list = getEffectiveHighscores();
  if (list.length < MAX_HIGHSCORES) return true;
  const lowest = list[list.length - 1].score;
  return candidateScore > lowest;
}

async function addHighscore(name, finalScore) {
  const cleanName = (name || '').trim().slice(0, 14) || 'Anónimo';
  const entry = { name: cleanName, score: finalScore };

  // Guarda sempre uma cópia local — funciona offline e serve de reserva.
  highscores.push(entry);
  highscores.sort((a, b) => b.score - a.score);
  if (highscores.length > MAX_HIGHSCORES) highscores.length = MAX_HIGHSCORES;
  saveHighscores();

  // Se houver ligação à Firebase, o score conta também para o top10
  // partilhado por todos os jogadores do site.
  if (isOnlineLeaderboardAvailable()) {
    await OnlineLeaderboard.submitScore(cleanName, finalScore);
    await refreshOnlineLeaderboard();
  }

  return entry;
}

function renderLeaderboard(containerEl, highlight) {
  containerEl.innerHTML = '';

  const list = getEffectiveHighscores();

  if (onlineTop10Cache === null && isOnlineLeaderboardAvailable()) {
    const loading = document.createElement('li');
    loading.className = 'leaderboard-loading';
    loading.textContent = 'A carregar recordes online...';
    containerEl.appendChild(loading);
  }

  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'leaderboard-empty';
    li.textContent = 'Ainda não há recordes — sê o/a primeiro/a!';
    containerEl.appendChild(li);
    return;
  }

  list.forEach((entry, i) => {
    const li = document.createElement('li');
    if (highlight && entry.name === highlight.name && entry.score === highlight.score) {
      li.classList.add('is-you');
    }

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

async function submitHighscore() {
  if (!highscoreQualifies) return;

  if (saveScoreButton) {
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = 'A guardar...';
  }

  const entry = await addHighscore(playerNameInput.value, pendingFinalScore);

  highscoreQualifies = false;
  highscoreForm.classList.add('hidden');
  renderLeaderboard(leaderboardListGameover, entry);

  if (saveScoreButton) {
    saveScoreButton.disabled = false;
    saveScoreButton.textContent = 'Guardar';
  }
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

function loseLives(count) {
  if (lives <= 0 || count <= 0) return;
  const toLose = Math.min(count, lives);
  for (let i = 0; i < toLose; i++) {
    const el = livesEls[lives - 1 - i];
    if (el) el.classList.add('lost');
  }
  lives -= toLose;

  if (lives <= 0) {
    setTimeout(triggerGameOver, 450);
  }
}

function forceLoseAllLives() {
  if (gameState !== 'playing' && gameState !== 'paused') return;
  hidePauseOverlay();
  pausedAt = null;
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
   PAUSA
   ----------------------------------------------------------- */
function showPauseOverlay() {
  pauseOverlay.classList.remove('hidden');
  pauseOverlay.setAttribute('aria-hidden', 'false');
}

function hidePauseOverlay() {
  pauseOverlay.classList.add('hidden');
  pauseOverlay.setAttribute('aria-hidden', 'true');
}

function pauseGame() {
  if (gameState !== 'playing') return;
  gameState = 'paused';
  pausedAt = performance.now();

  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (spawnTimer) clearTimeout(spawnTimer);
  spawnTimer = null;

  pauseScoreEl.textContent = String(score);
  showPauseOverlay();
}

function resumeGame() {
  if (gameState !== 'paused') return;

  // Todos os comics em queda "saltam" para a frente o mesmo tempo que o
  // jogo esteve em pausa, para não parecer que teleportam ao continuar.
  const pauseDuration = performance.now() - pausedAt;
  activeComics.forEach((c) => { c.startTime += pauseDuration; });
  pausedAt = null;

  gameState = 'playing';
  hidePauseOverlay();

  if (DIFFICULTIES[difficulty].maxSimultaneous === 1) {
    // Fácil: só volta a agendar um novo Harry se não sobrou nenhum a cair.
    maybeSpawnNextForEasyMode();
  } else {
    spawnTimer = setTimeout(scheduleNextSpawn, 400);
  }
  rafId = requestAnimationFrame(tick);
}

function togglePause() {
  if (gameState === 'playing') pauseGame();
  else if (gameState === 'paused') resumeGame();
}

/* ---------------------------------------------------------
   DIFICULDADE (escolhida no menu) + VELOCIDADE DE QUEDA
   ----------------------------------------------------------- */
function loadDifficulty() {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY);
    if (raw && DIFFICULTIES[raw]) return raw;
  } catch (err) {
    console.warn('Não foi possível ler a dificuldade guardada:', err);
  }
  return DEFAULT_DIFFICULTY;
}

function saveDifficulty() {
  try {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch (err) {
    console.warn('Não foi possível guardar a dificuldade:', err);
  }
}

function loadSuperHarriesPref() {
  try {
    return localStorage.getItem(SUPER_HARRIES_KEY) === '1';
  } catch (err) {
    return false;
  }
}

function saveSuperHarriesPref() {
  try {
    localStorage.setItem(SUPER_HARRIES_KEY, superHarriesEnabled ? '1' : '0');
  } catch (err) {
    console.warn('Não foi possível guardar a preferência de Super Harries:', err);
  }
}

function setDifficulty(key) {
  if (!DIFFICULTIES[key]) return;
  difficulty = key;
  saveDifficulty();

  difficultyButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.difficulty === key);
  });
  if (difficultyHint) difficultyHint.textContent = DIFFICULTIES[key].hint;
}

function setSuperHarries(enabled) {
  superHarriesEnabled = enabled;
  saveSuperHarriesPref();

  if (superHarriesToggle) {
    superHarriesToggle.classList.toggle('is-on', enabled);
    superHarriesToggle.setAttribute('aria-pressed', String(enabled));
  }
}

function updateMultiplierBadge() {
  const mult = DIFFICULTIES[difficulty].scoreMultiplier;
  if (!multiplierBadge) return;
  if (mult > 1) {
    multiplierBadge.textContent = '×' + mult + ' no final';
    multiplierBadge.classList.remove('hidden');
  } else {
    multiplierBadge.classList.add('hidden');
  }
}

function currentSpeedTier() {
  return Math.floor(score / POINTS_PER_SPEED_TIER);
}

function currentFallDurationMs() {
  const tier = currentSpeedTier();
  // Sem limite de dificuldade: a cada tier (POINTS_PER_SPEED_TIER pontos) fica sempre mais rápido.
  // FALL_MS_FLOOR é só uma rede de segurança técnica, não uma dificuldade máxima.
  const baseDuration = BASE_FALL_MS * DIFFICULTIES[difficulty].fallDurationMultiplier * Math.pow(FALL_MS_MULT, tier);

  // Cada Harry tem a sua própria velocidade, ±FALL_SPEED_VARIATION à volta da
  // base do tier atual: um fator aleatório entre (1 - X) e (1 + X) na
  // *velocidade* — como duração e velocidade são inversas, dividimos a
  // duração base por esse fator (fator > 1 = mais rápido = cai em menos tempo).
  const speedFactor = 1 + (Math.random() * 2 - 1) * FALL_SPEED_VARIATION;
  const randomizedDuration = baseDuration / speedFactor;

  return Math.max(FALL_MS_FLOOR, Math.round(randomizedDuration));
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

// Decide o tipo de cada Harry gerado: normal, ou (se a opção Super Harries
// estiver ligada) ocasionalmente super (dourado) ou anti (invertido).
function pickComicType() {
  if (!superHarriesEnabled) return 'normal';
  const roll = Math.random();
  if (roll < SUPER_HARRY_CHANCE) return 'super';
  if (roll < SUPER_HARRY_CHANCE + ANTI_HARRY_CHANCE) return 'anti';
  return 'normal';
}

function spawnComic() {
  if (gameState !== 'playing') return;

  const type = pickComicType();

  const el = document.createElement('div');
  el.className = type === 'normal' ? 'comic' : 'comic ' + type;
  el.appendChild(createComicSprite());
  el.style.top = '-12%';
  gameArea.appendChild(el);

  const areaWidth = gameArea.clientWidth;
  const compWidth = el.getBoundingClientRect().width || 50;
  const maxLeft = Math.max(0, areaWidth - compWidth);
  el.style.left = Math.random() * maxLeft + 'px';

  activeComics.push({
    el,
    type,
    startTime: performance.now(),
    durationMs: currentFallDurationMs(),
    resolved: false,
  });
}

function scheduleNextSpawn() {
  if (gameState !== 'playing') return;
  spawnTimer = null;

  const maxSimultaneous = DIFFICULTIES[difficulty].maxSimultaneous;

  if (maxSimultaneous === 1) {
    // Fácil: nunca há mais do que um Harry no ecrã ao mesmo tempo — a
    // próxima vaga só é agendada quando este for resolvido (apanhado ou
    // perdido), em maybeSpawnNextForEasyMode().
    spawnComic();
    return;
  }

  // Intermédio/Difícil: cada vaga larga entre 1 e o máximo simultâneo da
  // dificuldade escolhida, podendo sobrepor-se a Harrys anteriores ainda a
  // cair — cada um com a sua posição, tipo e velocidade próprias.
  const count = 1 + Math.floor(Math.random() * maxSimultaneous);
  for (let i = 0; i < count; i++) spawnComic();

  const base = currentSpawnIntervalMs();
  const jitter = Math.random() * SPAWN_JITTER - SPAWN_JITTER / 2;
  spawnTimer = setTimeout(scheduleNextSpawn, Math.max(280, base + jitter));
}

// Só é usada em dificuldade Fácil (1 Harry de cada vez): dispara a partir
// de updateComics() a cada frame, e só agenda o próximo Harry quando o
// ecrã estiver mesmo vazio.
function maybeSpawnNextForEasyMode() {
  if (gameState !== 'playing') return;
  if (DIFFICULTIES[difficulty].maxSimultaneous !== 1) return;
  if (activeComics.length > 0) return;
  if (spawnTimer) return;

  const base = currentSpawnIntervalMs();
  const jitter = Math.random() * SPAWN_JITTER - SPAWN_JITTER / 2;
  spawnTimer = setTimeout(scheduleNextSpawn, Math.max(280, base + jitter));
}

function showFloatScore(basketRect, areaRect, delta) {
  const el = document.createElement('div');
  el.className = 'float-score' + (delta < 0 ? ' negative' : '');
  el.textContent = (delta > 0 ? '+' : '') + delta;
  el.style.left = basketRect.left - areaRect.left + basketRect.width / 2 - 10 + 'px';
  el.style.top = basketRect.top - areaRect.top - 14 + 'px';
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function changeScore(delta) {
  score = Math.max(0, score + delta);
  scoreEl.textContent = String(score);
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');
}

function catchComic(comic) {
  comic.resolved = true;
  const delta = COMIC_SCORE_DELTA[comic.type] ?? 1;
  changeScore(delta);

  basketEl.classList.remove('catch-bounce');
  void basketEl.offsetWidth;
  basketEl.classList.add('catch-bounce');

  const areaRect = gameArea.getBoundingClientRect();
  showFloatScore(basketEl.getBoundingClientRect(), areaRect, delta);

  comic.el.classList.add('caught');
  setTimeout(() => comic.el.remove(), 380);
}

function missComic(comic) {
  comic.resolved = true;
  comic.el.classList.add('missed');
  setTimeout(() => comic.el.remove(), 450);

  const lifeLoss = COMIC_LIFE_LOSS_ON_MISS[comic.type] ?? 1;
  if (lifeLoss > 0) loseLives(lifeLoss);
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
  maybeSpawnNextForEasyMode();
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
  updateMultiplierBadge();
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
  hidePauseOverlay();
  if (rafId) cancelAnimationFrame(rafId);
  if (spawnTimer) clearTimeout(spawnTimer);
  clearComics();

  // A pontuação final leva o multiplicador da dificuldade escolhida
  // (Fácil ×1, Intermédio ×1.5, Difícil ×2) — aplicado só no fim, nunca
  // durante o jogo em si.
  const multiplier = DIFFICULTIES[difficulty].scoreMultiplier;
  const rawScore = score;
  pendingFinalScore = Math.round(rawScore * multiplier);
  highscoreQualifies = qualifiesForHighscore(pendingFinalScore);

  finalScoreEl.textContent = String(pendingFinalScore);
  if (multiplier > 1) {
    finalScoreDetail.textContent = rawScore + ' pontos × ' + multiplier + ' (' + DIFFICULTIES[difficulty].label + ')';
    finalScoreDetail.classList.remove('hidden');
  } else {
    finalScoreDetail.classList.add('hidden');
  }
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
  pausedAt = null;
  hidePauseOverlay();
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

// Tecla Esc ou P alterna pausa/continuar, a qualquer momento do jogo.
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    togglePause();
  }
});

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);
menuButton.addEventListener('click', backToMenu);
exitButton.addEventListener('click', forceLoseAllLives);
pauseButton.addEventListener('click', pauseGame);
resumeButton.addEventListener('click', resumeGame);
pauseExitButton.addEventListener('click', forceLoseAllLives);

highscoreForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitHighscore();
});

leaderboardOpenButton.addEventListener('click', () => {
  renderLeaderboard(leaderboardListMenu, null);
  leaderboardModal.classList.remove('hidden');
  leaderboardModal.setAttribute('aria-hidden', 'false');

  // Vai a jogo para a versão mais recente do top10 online e volta a
  // desenhar a lista quando chegar, caso o modal ainda esteja aberto.
  refreshOnlineLeaderboard().then(() => {
    if (!leaderboardModal.classList.contains('hidden')) {
      renderLeaderboard(leaderboardListMenu, null);
    }
  });
});

leaderboardCloseButton.addEventListener('click', () => {
  leaderboardModal.classList.add('hidden');
  leaderboardModal.setAttribute('aria-hidden', 'true');
});

difficultyButtons.forEach((btn) => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
});

superHarriesToggle.addEventListener('click', () => setSuperHarries(!superHarriesEnabled));

/* ---------------------------------------------------------
   INÍCIO
   ----------------------------------------------------------- */
initAssets();
renderLives();
showScreen('menu');
refreshOnlineLeaderboard();
setDifficulty(difficulty);
setSuperHarries(superHarriesEnabled);
