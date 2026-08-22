# Style The Harry 💗

Um mini-jogo cómico: a rapariga corre para os lados a tentar apanhar, com a cesta, os "Harry's" (comics/caricaturas do Harry Styles) que caem do céu.

## Como jogar

Abre `index.html` num browser (basta fazer duplo-clique no ficheiro, ou usar uma extensão tipo "Live Server").

- **Mover:** move o rato (ou o dedo, em telemóvel/tablet) para a esquerda e direita — a rapariga segue-te. As setas ← → do teclado também funcionam.
- **Objetivo:** apanha os Harry's *dentro da cesta* antes de caírem ao chão. Cada apanha = **+1 ponto**.
- **Vidas:** começas com **10 vidas** (corações no topo). Perdes uma vida sempre que um Harry cai sem ser apanhado na cesta.
- **Sair a meio do jogo:** o botão ✕ no canto superior esquerdo termina o jogo de imediato (perdes todas as vidas automaticamente).
- **Dificuldade:** a cada **20 pontos**, a velocidade de queda aumenta — sem limite, até ficar mesmo impossível de continuar.
- **Fim de jogo:** quando as vidas chegam a 0 (ou saíres pelo botão ✕), o coração parte-se e aparece o teu score final. Se entrares no **top 10**, é-te pedido o nome para guardar o recorde.

## Recordes (scoreboard)

O jogo guarda os **10 melhores resultados** no próprio browser onde é jogado (usando `localStorage` — cada browser/computador tem a sua lista, não é partilhada online). Se acabares o jogo com um score que entra no top 10, aparece um pequeno formulário a pedir o teu nome antes dos botões finais. A lista dos melhores 10 pode ser vista a qualquer momento a partir do menu, no botão "🏆 Recordes".

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

## Imagens

Os 16 Harry's que caem já usam as tuas fotos (`assets/images/harry-1.png` a `harry-16.png`), recortadas e otimizadas à volta da cara. A rapariga também já usa a tua ilustração (`girl.png` no jogo, `girl-face.png` no menu), com o fundo removido. Só a cesta continua como emoji placeholder. Detalhes em [`assets/images/README.md`](assets/images/README.md).

## Afinar a jogabilidade

No topo de `js/game.js` há um bloco de constantes fácil de ajustar:

- `MAX_LIVES` — número de vidas (atualmente 10)
- `POINTS_PER_SPEED_TIER` — pontos necessários para subir de velocidade (atualmente 20)
- `BASE_FALL_MS` / `FALL_MS_MULT` — controlam a velocidade de queda inicial e o quão rápido isso escala (sem limite máximo, por decisão de desenho — `FALL_MS_FLOOR` é só uma rede de segurança técnica, não uma dificuldade máxima)
- `SPAWN_INTERVAL_MS` / `SPAWN_INTERVAL_MIN` — frequência com que aparecem Harry's
- `MAX_HIGHSCORES` — quantos resultados ficam guardados no scoreboard (atualmente 10)

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
- Diferentes tipos de comic (alguns valem mais pontos, outros são "power-ups")
- Scoreboard online partilhado (atualmente é só local, por browser)
