# Style The Harry 💗

Um mini-jogo cómico: a rapariga corre para os lados a tentar apanhar, com a cesta, os "Harry's" (comics/caricaturas do Harry Styles) que caem do céu.

## Como jogar

Abre `index.html` num browser (basta fazer duplo-clique no ficheiro, ou usar uma extensão tipo "Live Server").

- **Mover:** move o rato (ou o dedo, em telemóvel/tablet) para a esquerda e direita — a rapariga segue-te. As setas ← → do teclado também funcionam.
- **Objetivo:** apanha os Harry's com a cesta antes de caírem ao chão. Cada apanha = **+1 ponto**.
- **Vidas:** começas com **10 vidas** (corações no topo). Perdes uma vida sempre que um Harry cai sem seres apanhado na cesta.
- **Dificuldade:** a cada **20 pontos**, a velocidade de queda aumenta.
- **Fim de jogo:** quando as vidas chegam a 0, o coração parte-se e aparece o teu score final, com opção de jogar novamente ou voltar ao menu.

## Estrutura do projeto

```
StyleTheHarry/
├── index.html              # Marcação das 3 telas: menu, jogo, game over
├── css/
│   └── style.css           # Todo o estilo visual e animações
├── js/
│   └── game.js             # Lógica do jogo (estado, física simples, colisões, HUD)
├── assets/
│   └── images/             # Onde entram as imagens finais (ver README dessa pasta)
├── .gitignore
└── README.md
```

Sem dependências, sem build — é HTML/CSS/JS puro, corre em qualquer browser moderno.

## Trocar os placeholders pelas imagens finais

Neste momento a rapariga, a cesta e os Harry's são emojis. Quando tiveres as imagens/caricaturas definitivas, segue as instruções em [`assets/images/README.md`](assets/images/README.md) — resume-se a colocar os ficheiros nessa pasta e preencher os caminhos no topo de `js/game.js` (objeto `ASSETS`). Não é preciso tocar em mais nada.

## Afinar a jogabilidade

No topo de `js/game.js` há um bloco de constantes fácil de ajustar:

- `MAX_LIVES` — número de vidas (atualmente 10)
- `POINTS_PER_SPEED_TIER` — pontos necessários para subir de velocidade (atualmente 20)
- `BASE_FALL_MS` / `MIN_FALL_MS` / `FALL_MS_MULT` — controlam a velocidade de queda e o quão rápido isso escala
- `SPAWN_INTERVAL_MS` / `SPAWN_INTERVAL_MIN` — frequência com que aparecem Harry's

## Publicar no GitHub

Este projeto ainda não tem um repositório Git inicializado nesta pasta. Passos sugeridos a partir de `D:\LocalGitHub\StyleTheHarry`:

```bash
git init
git add .
git commit -m "Primeira versão do jogo Style The Harry"
git branch -M main
git remote add origin <URL-do-teu-repositório-no-GitHub>
git push -u origin main
```

Sugestão de fluxo de branches, para ires seguindo versões:

- `main` — versão estável, jogável a qualquer momento.
- `develop` (opcional) — onde juntas trabalho em curso antes de ir para `main`.
- `feature/...` — uma branch por funcionalidade nova (ex: `feature/imagens-finais`, `feature/sons`, `feature/leaderboard`), que depois faz merge para `develop` ou `main` via pull request.

Exemplo para uma nova funcionalidade:

```bash
git checkout -b feature/imagens-finais
# ... fazer alterações ...
git add .
git commit -m "Adiciona imagens finais da rapariga e do Harry"
git push -u origin feature/imagens-finais
# depois abrir um Pull Request no GitHub para main
```

Como o jogo é só ficheiros estáticos (HTML/CSS/JS), depois de publicado no GitHub também podes ativar o **GitHub Pages** (Settings → Pages → branch `main`, pasta `/root`) para teres um link jogável diretamente no browser, sem precisar de correr nada localmente.

## Ideias para o futuro

- Sons ao apanhar/falhar um Harry
- Ecrã de recordes (high score guardado localmente)
- Diferentes tipos de comic (alguns valem mais pontos, outros são "power-ups")
