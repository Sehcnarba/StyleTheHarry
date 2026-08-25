# Style The Harry 💗

Um mini-jogo cómico: a rapariga corre para os lados a tentar apanhar, com a cesta, os "Harry's" (comics/caricaturas do Harry Styles) que caem do céu.

## Como jogar

Abre `index.html` num browser (basta fazer duplo-clique no ficheiro, ou usar uma extensão tipo "Live Server").

- **Mover:** move o rato (ou o dedo, em telemóvel/tablet) para a esquerda e direita — a rapariga segue-te. As setas ← → do teclado também funcionam.
- **Objetivo:** apanha os Harry's *dentro da cesta* antes de caírem ao chão. Cada apanha = **+1 ponto**.
- **Vidas:** começas com **10 vidas** (corações no topo). Perdes uma vida sempre que um Harry cai sem ser apanhado na cesta.
- **Pausa:** o botão ⏸️ (ao lado do ✕) pausa o jogo a qualquer momento — os Harry's ficam parados no ar até continuares. Também dá para pausar/continuar com a tecla **Esc** ou **P**.
- **Sair a meio do jogo:** o botão ✕ no canto superior esquerdo (ou "Sair" no menu de pausa) termina o jogo de imediato (perdes todas as vidas automaticamente).
- **Dificuldade:** escolhe-se no menu, antes de começar a jogar. Em qualquer uma, a cada **10 pontos** a velocidade de queda aumenta — sem limite, até ficar mesmo impossível de continuar — e cada Harry cai a uma velocidade ligeiramente diferente dos outros (ao acaso, à volta da velocidade base do momento):
  - **Fácil** — só cai um Harry de cada vez, velocidade de queda mais lenta.
  - **Intermédio** — caem 1-2 Harrys em simultâneo, velocidade normal. Pontuação final ×1.5.
  - **Difícil** — caem até 3 Harrys em simultâneo, velocidade normal. Pontuação final ×2.
- **Super Harries (opcional):** interruptor no menu, independente da dificuldade. Quando ligado, aparecem ocasionalmente:
  - ⭐ **Super Harry** — dourado, maior, com halo brilhante. Vale **+5 pontos** se apanhado; se fugir, custa **5 vidas de uma vez**.
  - 🖤 **Anti-Harry** — cores invertidas, halo preto. Se o apanhares, **perdes 10 pontos**; se fugir, não perdes nenhuma vida (é seguro deixá-lo cair).
- **Fim de jogo:** quando as vidas chegam a 0 (ou saíres pelo botão ✕), o coração parte-se e aparece o teu score final (já com o multiplicador da dificuldade aplicado). Se entrares no **top 10**, é-te pedido o nome para guardar o recorde.

## Recordes (scoreboard)

O top10 é **partilhado online** (via Firebase/Firestore) entre todos os jogadores que acedam ao mesmo site — quem estiver a jogar no GitHub Pages (ou noutro sítio onde o jogo esteja publicado) compete pelo mesmo top10. Se acabares o jogo com um score que entra no top 10, aparece um pequeno formulário a pedir o teu nome antes dos botões finais.

O jogo guarda sempre também uma cópia no `localStorage` do teu browser, como reserva: se não houver internet (ou a Firebase não carregar por alguma razão), o jogo continua a funcionar normalmente, só que o top10 mostrado fica limitado aos teus próprios resultados nesse browser/computador, em vez do top10 partilhado.

A lista pode ser vista a qualquer momento a partir do menu, no botão "🏆 Recordes".

### Configuração da Firebase

A ligação está em dois ficheiros:

- `js/firebase-config.js` — a configuração do projeto Firebase (chaves públicas, geradas na consola da Firebase). Se um dia quiseres usar outro projeto Firebase, basta substituir os valores aqui.
- `js/leaderboard-online.js` — a camada que fala com o Firestore (ler o top10, guardar um novo score). Se a Firebase não estiver disponível, este ficheiro degrada-se sozinho e o jogo passa a usar só o `localStorage`.

No projeto Firebase (consola → Firestore Database → separador "Regras"), as regras de segurança usadas são:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /highscores/{entry} {
      allow read: if true;
      allow create: if
        request.resource.data.keys().hasOnly(['name', 'score', 'createdAt']) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() <= 14 &&
        request.resource.data.score is int &&
        request.resource.data.score > 0 &&
        request.resource.data.score <= 100000 &&
        request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

Isto deixa qualquer pessoa ler o top10, mas só permite criar uma entrada nova e válida (nome curto, score dentro de um intervalo plausível) — nunca apagar ou alterar entradas de outros jogadores. O plano gratuito da Firebase ("Spark") não precisa de cartão de crédito e inclui, por dia, 50 mil leituras e 20 mil escritas — muito acima do que um jogo como este costuma gastar.

## Estrutura do projeto

```
StyleTheHarry/
├── index.html              # Marcação das 3 telas: menu, jogo, game over
├── css/
│   └── style.css           # Todo o estilo visual e animações
├── js/
│   ├── game.js                 # Lógica do jogo (estado, física simples, colisões, HUD)
│   ├── firebase-config.js      # Configuração do projeto Firebase (recordes online)
│   └── leaderboard-online.js   # Camada que fala com o Firestore (top10 partilhado)
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
- `POINTS_PER_SPEED_TIER` — pontos necessários para subir de velocidade (atualmente 10)
- `BASE_FALL_MS` / `FALL_MS_MULT` — controlam a velocidade de queda inicial e o quão rápido isso escala (sem limite máximo, por decisão de desenho — `FALL_MS_FLOOR` é só uma rede de segurança técnica, não uma dificuldade máxima)
- `FALL_SPEED_VARIATION` — variação aleatória de velocidade de cada Harry à volta da base do tier (atualmente ±35%)
- `SPAWN_INTERVAL_MS` / `SPAWN_INTERVAL_MIN` — frequência com que aparecem novas vagas de Harry's
- `MAX_HIGHSCORES` — quantos resultados ficam guardados no scoreboard (atualmente 10)
- `DIFFICULTIES` — um bloco por dificuldade (Fácil/Intermédio/Difícil), com quantos Harry's caem em simultâneo (`maxSimultaneous`), o multiplicador da velocidade de queda (`fallDurationMultiplier`) e o multiplicador aplicado à pontuação final (`scoreMultiplier`)
- `DEFAULT_DIFFICULTY` — dificuldade pré-selecionada da primeira vez que alguém abre o jogo (atualmente `hard`)
- `SUPER_HARRY_CHANCE` / `ANTI_HARRY_CHANCE` — probabilidade de cada Harry gerado ser Super/Anti quando a opção está ligada (atualmente ~7% e ~6%)
- `COMIC_SCORE_DELTA` / `COMIC_LIFE_LOSS_ON_MISS` — pontos ganhos/perdidos e vidas perdidas por tipo de Harry (normal/super/anti)

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
