# Assets e licenças

Os modelos, as ilustrações, os cenários e o áudio originais de Pokémon Tower League são disponibilizados sob [CC0 1.0 Universal][cc0]. As dependências visuais de terceiros mantêm suas licenças abaixo.

| Asset | Origem | Licença |
| --- | --- | --- |
| `public/models/*.glb` | Receitas geométricas originais em [src/render/models](src/render/models), exportadas por [scripts/export-models.mjs](scripts/export-models.mjs) | [CC0 1.0][cc0] |
| Tabuleiros, trilhas, vegetação, cristais e formações vulcânicas 3D | Geometria original em [src/render](src/render), com paletas e layout em [src/data/maps](src/data/maps) | [CC0 1.0][cc0] |
| `public/images/map-forest.webp`, `map-cave.webp`, `map-volcano.webp` | Capturas dos tabuleiros originais deste projeto | [CC0 1.0][cc0] |
| `public/images/creatures/*.webp` | Oito retratos renderizados a partir dos GLBs originais | [CC0 1.0][cc0] |
| `public/images/amber-wood*.webp` e `public/images/amber-trail*.webp` | Ilustrações de cenário criadas com o ImageGen da OpenAI. [Prompts registrados](DECISIONS.md) | [CC0 1.0][cc0] |
| `public/images/league/{kanto,johto,hoenn}.webp` | Panoramas originais da seleção de regiões criados com o ImageGen da OpenAI e recortados de uma prancha de três faixas. [Prompt registrado](DECISIONS.md) | [CC0 1.0][cc0] |
| GLBs remotos de Pokémon | [Pokémon 3D API Assets][pokemon-assets], revisão `429de1288cea0d43f5b4f56305d2276e94239d65` | Direitos dos respectivos titulares de Pokémon. [Aviso do fornecedor][pokemon-rights] |
| `public/images/pokemon/*.webp` e `src/app/icon.png` | Retratos, poses de menu e ícone renderizados dos mesmos GLBs de Pokémon | Direitos dos respectivos titulares de Pokémon. [Aviso do fornecedor][pokemon-rights] |
| `public/images/badges/*.png` | Insígnias das ligas de Kanto, Johto e Hoenn. [Catálogo de insígnias][pokemon-badges] | Direitos dos respectivos titulares de Pokémon |
| `public/audio/forest.mp3`, `cave.mp3`, `volcano.mp3` | Três trilhas instrumentais originais para floresta, caverna e vulcão, compostas e sintetizadas por [scripts/generate-audio.py](scripts/generate-audio.py) | [CC0 1.0][cc0] |
| `public/audio/{boss,death,defeat,impact,leak,pause,place,sell,shot,ui,upgrade,victory,wave}.mp3` | Treze efeitos originais sintetizados por [scripts/generate-audio.py](scripts/generate-audio.py) | [CC0 1.0][cc0] |
| DM Serif Text | `@fontsource/dm-serif-text` com licença no pacote. [Fontsource][dm] | [SIL OFL 1.1][ofl] |
| Instrument Sans variável | `@fontsource-variable/instrument-sans` com licença no pacote. [Fontsource][instrument] | [SIL OFL 1.1][ofl] |
| Ícones de interface e glifos dos elementos | `lucide-react` com avisos de licença no pacote. [Lucide][lucide] | ISC, com MIT para ícones derivados de Feather |

## Insígnias de ginásio

- Kanto usa os ícones de Pokémon: Let's Go, Pikachu! e Let's Go, Eevee! com as margens transparentes aparadas. [Arquivo de sprites de Let's Go][pokemon-badges-kanto]
- Johto usa as insígnias do curta de Murkrow da série POKÉTOON. [Curta oficial][pokemon-badges-poketoon] · [Imagens individuais no WikiDex][pokemon-badges-johto]
- Hoenn usa a arte de Pokémon Global Link catalogada pelo [PokéWiki][pokemon-badges-pokewiki] e pelos [Arquivos Bulbagarden][pokemon-badges-hoenn].

## Modelos GLB de Pokémon

O jogo carrega os GLBs otimizados do catálogo `models/opt/regular` pelo GitHub Raw conforme a partida precisa deles. A campanha acrescenta 65 definições de adversários regionais e 17 famílias adicionais de torres. Os IDs internos do jogo continuam sendo usados nos arquivos de ondas e nas regras de desbloqueio. [Revisão usada][pokemon-assets]

Os arquivos usam compressão Draco. As partes dos inimigos são instanciadas por malha para preservar suas texturas e materiais. Onix e Misdreavus ultrapassam 10 mil triângulos e aparecem como chefes individuais de ginásio.

O repositório informa que os modelos pertencem a Nintendo, Creatures Inc. e GAME FREAK inc. A licença MIT do projeto cobre código e documentação. [Créditos do repositório][pokemon-credits] · [Aviso de direitos autorais][pokemon-rights]

## Modelos GLB originais

- Criaturas com estágio inicial e evolução `-evolved` em GLB: `emberling`, `rivermutt`, `glimleaf`, `duskspore`, `cragbeak`, `runebell`, `voltwing` e `gildmole`.
- Inimigos em GLB: `mossmite`, `reedrunner`, `flinthide`, `galefoal`, `springtail`, `cindershield`, `hollowpod`, `mistveil`, `marrowcrown` e `ashdrummer`.
- Os 26 arquivos ocupam 335.580 bytes. A torre mais detalhada tem 816 triângulos e o inimigo mais detalhado tem 320. As cores vêm dos vértices.
- `pnpm assets:models` exporta as geometrias com `GLTFExporter`, aplica indexação, deduplicação, poda, quantização e compressão [meshopt][meshopt] com glTF Transform e usa `gltfjsx --types` para gerar e validar o catálogo tipado de nós em `src/render/models/generatedNodes.ts`.

## Áudio

As faixas são estéreo e têm aproximadamente 19, 23 e 17 segundos. O áudio completo ocupa 511.940 bytes e é carregado sob demanda após interação. Para regenerar os arquivos, execute `python scripts/generate-audio.py` com NumPy e FFmpeg disponíveis. O script também aceita o FFmpeg fornecido por `imageio-ffmpeg`.

[cc0]: https://creativecommons.org/publicdomain/zero/1.0/
[dm]: https://fontsource.org/fonts/dm-serif-text
[instrument]: https://fontsource.org/fonts/instrument-sans
[ofl]: https://openfontlicense.org/open-font-license-official-text/
[lucide]: https://lucide.dev/license
[meshopt]: https://gltf-transform.dev/modules/functions/functions/meshopt
[pokemon-assets]: https://github.com/Pokemon-3D-api/assets/tree/429de1288cea0d43f5b4f56305d2276e94239d65/models/opt/regular
[pokemon-credits]: https://github.com/Pokemon-3D-api/assets#%EF%B8%8F-license--credits
[pokemon-rights]: https://github.com/Pokemon-3D-api/api-server/blob/main/docs/COPYRIGHT.md
[pokemon-badges]: https://bulbapedia.bulbagarden.net/wiki/Badge#List_of_badges
[pokemon-badges-kanto]: https://pokeamice.com/2022/08/30/lgpe-unpack/
[pokemon-badges-johto]: https://www.wikidex.net/wiki/Categor%C3%ADa:Ilustraciones_de_medallas_de_Johto
[pokemon-badges-hoenn]: https://archives.bulbagarden.net/wiki/File:Stone_Badge.png
[pokemon-badges-pokewiki]: https://www.pokewiki.de/Orden#Hoenn
[pokemon-badges-poketoon]: https://www.youtube.com/watch?v=AuAY3MqTEpg
