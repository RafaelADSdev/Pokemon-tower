# Decisões

- A navegação começa em um menu e a partida acontece em `/play`. A interface usa tons de floresta, detalhes em âmbar e alto contraste para os controles de batalha.
- O render abre apenas na rota de jogo. A interface e o conteúdo podem carregar antes do WebGL.
- Os commits de fase usam a identidade local `Codex`, pois o diretório inicial não tinha repositório nem identidade Git configurada.
- O segundo upgrade muda a forma e a habilidade da criatura. O custo da implantação e das duas melhorias compõe o valor de venda.
- Chamar uma onda cedo permite que ela avance junto com as anteriores. A vitória exige concluir todas as ondas iniciadas e sobreviver.
- As três expedições ficam disponíveis desde o início. O navegador salva o melhor total de vidas de cada vitória e calcula as estrelas e os desbloqueios a partir desses recordes.
- Modelos e sons foram produzidos para o jogo e disponibilizados sob CC0. O menu usa retratos derivados dos modelos, capturas dos tabuleiros e uma ilustração de floresta criada com o ImageGen integrado. [Registro de licenças](ASSETS.md)

## Prompt da ilustração do menu

```text
Use case: stylized-concept. Asset: wide landscape key art for an original web tower defense game, 3:2 full-bleed intended to crop horizontally. Handmade low-poly isometric woodland diorama with the detail and lighting of a miniature photographed on a dark stage. The RIGHT two thirds carry the subject: an S-shaped ochre trail on a moss-covered floating slice of rocky earth, angular conifers framing it, warm amber crystal gate, and a few stone octagonal tower pads. On the nearer right pad an original small faceted terracotta ember creature, like a round ceramic stove sprite with a small black face mask with tiny pale eyes and one amber flame shard as a crest; tiny mint leaf lantern creature and a blue pebble river spirit farther down the trail, never based on any existing IP. Rich moss greens, spruce and olive shadows, golden lanterns, dusty bits of light, clean spatial hierarchy and tactile handmade surfaces. Long perspective scene viewed at a 40 degree angle from above. The LEFT 36 percent should be dark open forest green chiaroscuro with minimal detail to support actual HTML title overlay. Full bleed, shallow distant mist, refined videogame key art, crisp prominent miniature. No letters, words, typography, logo, UI, watermarks, collage panels, or known characters or franchise references.
```
