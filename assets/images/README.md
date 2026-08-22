# Imagens

Esta pasta está vazia por agora — o jogo usa emojis como placeholder (rapariga, cesta e Harry's) enquanto não há arte final.

Quando tiveres as imagens, coloca-as aqui e edita as constantes no topo de `js/game.js` (objeto `ASSETS`):

| Constante            | Ficheiro sugerido            | Onde aparece                                  |
|-----------------------|-------------------------------|-----------------------------------------------|
| `ASSETS.girl`          | `girl.png`                     | A rapariga durante o jogo                      |
| `ASSETS.basket`         | `basket.png`                    | A cesta que a rapariga segura                  |
| `ASSETS.menuGirl`        | `girl-face.png`                  | Cara da rapariga no ecrã de menu               |
| `ASSETS.menuHarry`        | `harry-menu.png`                  | Imagem dentro da moldura de coração (menu)     |
| `ASSETS.harryVariants`      | `harry-1.png`, `harry-2.png`, ...  | Caricaturas/fotos do Harry que caem (aleatório) |

Não é preciso mudar mais nenhum código — basta preencher os caminhos e os emojis são automaticamente substituídos pelas imagens, mantendo o tamanho e as animações já existentes.

Recomendações:
- Imagens quadradas (ex: 256×256px) funcionam melhor para o Harry que cai e para a moldura do menu, já que ficam recortadas em círculo.
- Usa PNG com fundo transparente para a rapariga e a cesta, para não ficarem com caixa branca à volta.
- Mantém os ficheiros otimizados (idealmente < 200KB cada) para o jogo carregar rápido em telemóvel.
