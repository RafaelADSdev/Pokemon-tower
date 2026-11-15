# Critter Defense

Tower defense 3D de criaturas elementais para navegador. Três expedições de 30 ondas, oito criaturas jogáveis com evolução, dez inimigos e uma coleção que guarda os desbloqueios neste navegador.

## Rodar localmente

Use Node.js 24 e pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

Abra [Critter Defense local](http://localhost:3000). Para testar a versão de produção, rode `pnpm build` e `pnpm start`.

## Jogar

- Escolha uma expedição. Selecione um espaço `+` no tabuleiro ou um botão de posição abaixo dele e implante uma criatura com as moedas iniciais.
- Inicie a onda. As criaturas atacam automaticamente, e você recebe moedas por derrotar inimigos e concluir ondas. Você pode chamar a próxima enquanto a atual ainda está em andamento.
- Selecione uma torre para melhorar, evoluir no nível 3, mudar a prioridade ou vender por 70% do total investido. A prévia da onda também permite inspecionar as fraquezas dos inimigos.
- Arraste para mover a câmera. Use a roda do mouse ou o gesto de pinça para ajustar o zoom. No teclado, `N` chama a próxima onda, `Espaço` pausa ou retoma, `1` a `3` alteram a velocidade e `Esc` limpa a seleção.
- Você ganha 1 estrela ao vencer, 2 com pelo menos 8 vidas e 3 com pelo menos 16 vidas. O melhor resultado por mapa conta para liberar criaturas na Coleção.

## Editar conteúdo

| Conteúdo | Onde editar |
| --- | --- |
| Nome do jogo | `src/config/brand.ts` |
| Criaturas | Adicione uma entrada em `src/data/creatures.ts` com ID único, textos `name`/`nameEn` e `description`/`descriptionEn`, elemento, papel, atributos, alvos, dois upgrades e evolução. Defina a exigência de estrelas em `src/data/progression.ts`. |
| Inimigos | Adicione uma entrada em `src/data/enemies.ts` com vida, velocidade, recompensa, elemento e traços. Um inimigo dividido aponta para outro ID desse catálogo. |
| Elementos e atributos globais | Edite as vantagens em `src/data/elements.ts`, os recursos e escalas em `src/data/rules.ts` e o empilhamento em `src/data/status.ts`. |
| Mapa | Crie a definição em `src/data/maps/`. Escolha um bioma e preencha as dimensões da mesa, os caminhos `[x, z]`, as posições com IDs únicos e a paleta. Registre o ID em `src/data/maps/types.ts`, a definição em `src/data/maps/index.ts` e o conjunto de ondas em `src/data/waves/index.ts`. Adicione `public/images/map-<id>.webp` para o menu e `public/audio/<id>.mp3` para a trilha. |
| Ondas | Edite `src/data/waves/<mapa>.ts`. A função `group` recebe ID do inimigo, quantidade, intervalo entre inimigos em segundos, atraso inicial opcional e índice opcional do caminho. As ondas são numeradas a partir de 1. |
| Modelos e retratos | Coloque o `.glb` em `public/models/` e aponte `model` na criatura, evolução ou inimigo para `/models/arquivo.glb`. Para instanciar um inimigo, exporte um único mesh. Use um retrato `public/images/creatures/<id>.webp` para cada novo ID jogável. Registre a origem em `ASSETS.md`. |

O pipeline `pnpm assets:models` recria os GLBs originais compactados e atualiza o catálogo tipado de nós. As licenças e a regeneração do áudio estão no [registro de assets](ASSETS.md).

## Verificar

```sh
pnpm lint
pnpm test
pnpm build
```

Os testes incluem uma vitória completa na onda 30 de cada mapa com as criaturas iniciais, além de bifurcação determinística, ondas sobrepostas, economia, efeitos, dano e progressão.

### Benchmark com 300 inimigos

- `pnpm bench` mede os passos fixos com 300 inimigos e 11 torres evoluídas. Em um i5-14600KF com Node 24.21, a simulação registrou 0,026 ms de mediana e 0,093 ms no p95 após o aquecimento, em 2.400 passos.
- Instale `playwright-core` em um diretório auxiliar e rode `node scripts/bench-browser.mjs <caminho-do-playwright-core> <executável-do-Chrome>`. Defina `CRITTER_MOBILE_CPU_THROTTLE=4` para repetir o perfil móvel com CPU limitada e `CRITTER_APP_URL` para medir a transferência de JavaScript do build em execução.
- Com 300 inimigos durante 8 segundos no Chrome com RTX 5060, o caso desktop de 1440 × 900 registrou mediana de 163,9 FPS e p99 de 6,2 ms por quadro. A emulação de Pixel 7 com CPU limitada em 4× registrou mediana de 82,0 FPS e p99 de 30,1 ms. A emulação usa a GPU do desktop. A validação em celular e notebook físicos de referência permanece pendente.
- O JavaScript inicial transferido foi de 189 kB no menu e 442 kB no campo. Após descompressão, os tamanhos foram 618 kB e 1,56 MB. A entrada do campo carrega o tabuleiro. Criaturas, inimigos e efeitos entram a partir da primeira interação com a partida.
- No Lighthouse 13.6 com perfil móvel, o menu marcou 93 em Desempenho e o campo marcou 81. Ambos marcaram 100 em Acessibilidade, Práticas recomendadas e SEO.

## Publicar

Importe o repositório como projeto Next.js na Vercel ou rode `pnpm dlx vercel deploy` no diretório para gerar uma prévia. Para publicar em produção, rode `pnpm dlx vercel deploy --prod`. O jogo usa arquivos públicos e armazenamento do navegador, e roda sem variáveis de ambiente. `vercel.json` fixa a versão do pnpm usada em instalação e build. [Documentação de deploy pela CLI](https://vercel.com/docs/projects/deploy-from-cli)
