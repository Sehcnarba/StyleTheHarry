# Imagens

## Harry's que caem — feito ✅

`harry-1.png` a `harry-16.png` já estão prontos e ligados em `js/game.js` (`ASSETS.harryVariants` e `ASSETS.menuHarry`). Foram recortados a partir das 16 fotos que adicionaste em `harries/` (pasta não incluída no Git — ver `.gitignore`): cada um foi recentrado e aparado num quadrado à volta da cara, redimensionado para 320×320px e otimizado (todos abaixo de 200KB), para ficarem nítidos e reconhecíveis mesmo pequenos e dentro do círculo em que aparecem no jogo.

Se quiseres afinar algum enquadramento (mais zoom, mais deslocado, etc.), os originais continuam em `harries/` na raiz do projeto — não precisas de os re-enviar.

Para adicionar mais variantes no futuro, o processo é: recorta a nova imagem num quadrado centrado na cara, exporta com uns 300-320px de lado, coloca-a aqui como `harry-17.png` (por exemplo) e acrescenta o caminho à lista `ASSETS.harryVariants` em `js/game.js`.

## Rapariga — feito ✅

`girl.png` (corpo inteiro, para o jogo) e `girl-face.png` (cara, para o menu) já estão prontos e ligados em `js/game.js` (`ASSETS.girl` e `ASSETS.menuGirl`), recortados a partir da ilustração que adicionaste em `nutri/` (pasta não incluída no Git — ver `.gitignore`).

Ao contrário dos Harry's (que são sempre recortados num quadrado/círculo), `girl.png` é um recorte alto em retrato — mantém as proporções reais do corpo, sem ficar esticado nem cortado. Isto tem uma regra própria em `css/style.css` (`#girl-emoji img`) separada da regra genérica `.emoji img`; se um dia trocares esta imagem por outra, mantém-na também em retrato (corpo inteiro, fundo transparente) para a regra continuar a funcionar bem.

O fundo da ilustração original (cena de hospital) foi removido à volta da personagem — o processo não é automático nem perfeito para desenhos com muito pormenor, por isso se reparares nalgum resquício de fundo nas pontas ao aumentar a imagem, os originais continuam em `nutri/` e o recorte pode ser afinado a partir daí.

## Cesta — ainda por adicionar

Continua como emoji placeholder (🧺). Quando tiveres uma imagem, coloca-a aqui como `basket.png` e preenche `ASSETS.basket` em `js/game.js` — não é preciso mudar mais nenhum código, o emoji é substituído automaticamente.

Recomendações gerais para novas imagens:
- Para ícones/caras (Harry's, cara da rapariga, cesta): quadrados (ex: 256–320px de lado) funcionam melhor, já que ficam recortados em círculo/quadrado arredondado.
- Para a rapariga em corpo inteiro: mantém o retrato alto e fundo transparente.
- Usa PNG com fundo transparente para não ficarem com caixa branca à volta.
- Mantém os ficheiros otimizados (idealmente < 200KB cada) para o jogo carregar rápido em telemóvel.
