# Decisões

## Versão inicial

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

## Edição com Pokémon

- Os catálogos usam nomes e modelos do Pokémon 3D API Assets. Os retratos e personagens do menu foram renderizados a partir dos GLBs desse catálogo. [Origem e licenças](ASSETS.md)
- As famílias com três formas chegam à forma final no nível 3. Os elementos, habilidades e custos seguem o balanceamento do tower defense.
- A arte de cenário foi editada com o ImageGen integrado para receber os retratos sem sobrepor as criaturas da ilustração anterior.

```text
Edit the supplied woodland diorama key art. Perform exactly three small removals: erase the orange creature with a crystal crest on the lower-right octagonal stone pad and restore the bare radial stone paving; erase the little yellow lantern creature with green leaves in the middle foreground and restore the uninterrupted trail edge, moss and foliage; erase the blue round creature by the waterfall and restore the falling water and stones. The brass lanterns attached to wooden posts remain part of the environment. The composition should read as an unoccupied original fantasy battlefield with empty pads, to receive separate interactive HTML-rendered characters later. Keep the dark, almost empty negative space on the left and the same forest, amber gateway, lighting, scene, viewpoint, and aspect ratio. No characters, lettering or additions.
```

## Campanha regional

- O jogo passa a se chamar Pokémon Tower League. O menu organiza oito ginásios em cada uma das três regiões iniciais. A campanha de cada região pode ser iniciada de forma independente e o torneio reúne todas depois das 24 insígnias.
- As equipes regionais usam espécies introduzidas em Kanto, Johto ou Hoenn. Os papéis táticos e o sistema de elementos do tower defense determinam as habilidades das torres.
- Os recordes da campanha são armazenados pelo ID da expedição. As estrelas anteriores continuam contando para os desbloqueios da Coleção.
