# Assets e licenças

Os modelos, as ilustrações, os cenários e o áudio originais de Critter Defense são disponibilizados sob [CC0 1.0 Universal][cc0]. As dependências visuais de terceiros mantêm suas licenças abaixo.

| Asset | Origem | Licença |
| --- | --- | --- |
| `public/models/*.glb` | Receitas geométricas originais em [src/render/models](src/render/models), exportadas por [scripts/export-models.mjs](scripts/export-models.mjs) | [CC0 1.0][cc0] |
| Tabuleiros, trilhas, vegetação, cristais e formações vulcânicas 3D | Geometria original em [src/render](src/render), com paletas e layout em [src/data/maps](src/data/maps) | [CC0 1.0][cc0] |
| `public/images/map-forest.webp`, `map-cave.webp`, `map-volcano.webp` | Capturas dos tabuleiros originais deste projeto | [CC0 1.0][cc0] |
| `public/images/creatures/*.webp` | Oito retratos renderizados a partir dos GLBs originais | [CC0 1.0][cc0] |
| `public/images/amber-wood.webp`, `amber-wood-mobile.webp`, `src/app/icon.png` | Ilustração original gerada com a ferramenta de imagens da OpenAI. As versões móvel e de ícone derivam da arte principal. [Registro da direção](DECISIONS.md) | [CC0 1.0][cc0] |
| `public/audio/forest.mp3`, `cave.mp3`, `volcano.mp3` | Três trilhas instrumentais originais para floresta, caverna e vulcão, compostas e sintetizadas por [scripts/generate-audio.py](scripts/generate-audio.py) | [CC0 1.0][cc0] |
| `public/audio/{boss,death,defeat,impact,leak,pause,place,sell,shot,ui,upgrade,victory,wave}.mp3` | Treze efeitos originais sintetizados por [scripts/generate-audio.py](scripts/generate-audio.py) | [CC0 1.0][cc0] |
| DM Serif Text | `@fontsource/dm-serif-text` com licença no pacote. [Fontsource][dm] | [SIL OFL 1.1][ofl] |
| Instrument Sans variável | `@fontsource-variable/instrument-sans` com licença no pacote. [Fontsource][instrument] | [SIL OFL 1.1][ofl] |
| Ícones de interface e glifos dos elementos | `lucide-react` com avisos de licença no pacote. [Lucide][lucide] | ISC, com MIT para ícones derivados de Feather |

## Modelos GLB

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
