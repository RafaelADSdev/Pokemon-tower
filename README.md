# Pokémon Tower League

Tower defense 3D de fã para navegador. Desafie 24 ginásios em Kanto, Johto e Hoenn, monte equipes de Pokémon nativos e conquiste as insígnias para entrar no Torneio Final.

## Rodar localmente

Use Node.js 24 e pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

Abra [Pokémon Tower League local](http://localhost:3000). Para testar a versão de produção, rode `pnpm build` e `pnpm start`.

O navegador carrega os modelos 3D conforme a partida precisa deles. Durante uma evolução, a torre mantém o último Pokémon 3D carregado até a nova forma estar disponível. Enquanto o primeiro modelo carrega, a torre usa o retrato local do Pokémon. [Pokémon 3D API Assets](https://github.com/Pokemon-3D-api/assets)

## Jogar

- Escolha uma região e desafie o primeiro ginásio. Cada vitória conquista a insígnia do ginásio e libera o próximo da mesma região. As três regiões podem ser iniciadas em qualquer ordem.
- Selecione um espaço `+` no tabuleiro ou um botão de posição abaixo dele e implante um Pokémon com as moedas iniciais. A loja oferece oito famílias nativas da região em jogo.
- Inicie a onda. As criaturas atacam automaticamente, e você recebe moedas por derrotar inimigos e concluir ondas. Você pode chamar a próxima enquanto a atual ainda está em andamento.
- Selecione uma torre para melhorar, mudar a prioridade ou vender por 70% do total investido. Cada melhoria avança uma forma na cadeia evolutiva quando há outra forma no elenco. O nível 3 libera a habilidade final. A prévia da onda também permite inspecionar as fraquezas dos inimigos.
- Arraste para mover a câmera. Use a roda do mouse ou o gesto de pinça para ajustar o zoom. No teclado, `N` chama a próxima onda, `Espaço` pausa ou retoma, `1` a `3` alteram a velocidade e `Esc` limpa a seleção.
- Você ganha 1 estrela ao vencer, 2 com pelo menos 8 vidas e 3 com pelo menos 16 vidas. O melhor resultado de cada expedição conta para desbloquear Pokémon da Coleção. Insígnias e estrelas são guardadas no navegador.
- Com as 24 insígnias, o Torneio Final reúne adversários das três regiões em 16 ondas numa arena de duas rotas.

Os tabuleiros clássicos permanecem acessíveis em `/play`, `/play/cave` e `/play/volcano`. A campanha usa variantes desses três terrenos, com trilhas, cores e ondas adaptadas aos ginásios. [Referências de Kanto](https://pokemonletsgo.pokemon.com/en-ca/kanto-region/) · [Johto](https://www.pokemon.com/uk/features/a-visitors-guide-to-johto) · [Hoenn](https://www.pokemon.com/br/destaques/relembrando-a-regiao-hoenn-em-destaque)

## Editar conteúdo

| Conteúdo | Onde editar |
| --- | --- |
| Nome do jogo | `src/config/brand.ts` |
| Ginásios e torneio | Edite líderes, insígnias e temas em `src/data/campaign/gyms.ts`. As curvas de ondas estão em `src/data/campaign/waves.ts`. Os adversários nativos e chefes estão em `src/data/regionEnemies.ts`. |
| Equipes regionais | Edite `src/data/regionalCreatures.ts`. Cada família regional usa o custo e as habilidades do papel tático correspondente. |
| Criaturas | Adicione uma entrada em `src/data/creatures.ts` com ID único, textos `name`/`nameEn` e `description`/`descriptionEn`, elemento, papel, atributos, alvos, dois upgrades e evolução. Defina a exigência de estrelas em `src/data/progression.ts`. |
| Inimigos | Adicione uma entrada em `src/data/enemies.ts` com vida, velocidade, recompensa, elemento e traços. Um inimigo dividido aponta para outro ID desse catálogo. |
| Elementos e atributos globais | Edite as vantagens em `src/data/elements.ts`, os recursos e escalas em `src/data/rules.ts` e o empilhamento em `src/data/status.ts`. |
| Mapa | Crie a definição em `src/data/maps/`. Escolha um bioma e preencha as dimensões da mesa, os caminhos `[x, z]`, as posições com IDs únicos e a paleta. Registre o ID em `src/data/maps/types.ts`, a definição em `src/data/maps/index.ts` e o conjunto de ondas em `src/data/waves/index.ts`. Adicione `public/images/map-<id>.webp` para o menu e `public/audio/<id>.mp3` para a trilha. |
| Ondas | Edite `src/data/waves/<mapa>.ts`. A função `group` recebe ID do inimigo, quantidade, intervalo entre inimigos em segundos, atraso inicial opcional e índice opcional do caminho. As ondas são numeradas a partir de 1. |
| Modelos e retratos | Use `pokemonAppearance(númeroDaPokédex, nome)` nos catálogos para resolver os GLBs da revisão fixada em `src/data/pokemon.ts`. Para um modelo local, coloque o arquivo em `public/models/` e aponte `model` para `/models/arquivo.glb`. Defina `portrait` para o retrato de cada torre. Registre a origem em `ASSETS.md`. |

O pipeline `pnpm assets:models` recria os GLBs originais compactados e atualiza o catálogo tipado de nós. As licenças e a regeneração do áudio estão no [registro de assets](ASSETS.md).

## Verificar

```sh
pnpm lint
pnpm test
pnpm build
```

Os testes incluem vitórias nos 24 ginásios e nas 16 ondas do Torneio Final com as equipes da campanha. Também verificam o desbloqueio de ginásios por insígnias, os elencos regionais, os mapas clássicos e as regras de combate.

### Benchmark com 300 inimigos

Na edição com Pokémon, a medição de 3 segundos com 300 inimigos ativos na RTX 5060 registrou 164 FPS de mediana no desktop e 82,6 FPS na emulação de Pixel 7 com CPU limitada em 4×. O p99 foi de 6,2 ms e 18,3 ms por quadro, respectivamente.

As medições de simulação, tamanho inicial e Lighthouse abaixo registram a edição original.

- `pnpm bench` mede os passos fixos com 300 inimigos e 11 torres evoluídas. Em um i5-14600KF com Node 24.21, a simulação registrou 0,026 ms de mediana e 0,093 ms no p95 após o aquecimento, em 2.400 passos.
- Instale `playwright-core` em um diretório auxiliar e rode `node scripts/bench-browser.mjs <caminho-do-playwright-core> <executável-do-Chrome>`. Defina `CRITTER_MOBILE_CPU_THROTTLE=4` para repetir o perfil móvel com CPU limitada e `CRITTER_APP_URL` para medir a transferência de JavaScript do build em execução.
- Com 300 inimigos durante 8 segundos no Chrome com RTX 5060, o caso desktop de 1440 × 900 registrou mediana de 163,9 FPS e p99 de 6,2 ms por quadro. A emulação de Pixel 7 com CPU limitada em 4× registrou mediana de 82,0 FPS e p99 de 30,1 ms. A emulação usa a GPU do desktop. A validação em celular e notebook físicos de referência permanece pendente.
- O JavaScript inicial transferido foi de 189 kB no menu e 442 kB no campo. Após descompressão, os tamanhos foram 618 kB e 1,56 MB. A entrada do campo carrega o tabuleiro. Criaturas, inimigos e efeitos entram a partir da primeira interação com a partida.
- No Lighthouse 13.6 com perfil móvel, o menu marcou 93 em Desempenho e o campo marcou 81. Ambos marcaram 100 em Acessibilidade, Práticas recomendadas e SEO.

## Publicar

Importe o repositório como projeto Next.js na Vercel ou rode `pnpm dlx vercel deploy` no diretório para gerar uma prévia. Para publicar em produção, rode `pnpm dlx vercel deploy --prod`. O jogo usa arquivos públicos e armazenamento do navegador, e roda sem variáveis de ambiente. `vercel.json` fixa a versão do pnpm usada em instalação e build. [Documentação de deploy pela CLI](https://vercel.com/docs/projects/deploy-from-cli)
