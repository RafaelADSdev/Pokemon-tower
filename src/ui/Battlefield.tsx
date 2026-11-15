'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Coins, Flag, Heart, RotateCcw, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';
import { brand } from '@/config/brand';
import type { EnemyDefinition } from '@/data/enemies';
import { forestMap } from '@/data/maps/forest';
import { forestWaves } from '@/data/waves/forest';
import { createGameRuntime } from '@/game/runtime';
import type { EnemyEntity } from '@/game/ecs/world';
import { BattleControls } from './BattleControls';
import { CreaturesPanel } from './CreaturesPanel';
import { ElementGlyph, ElementInfo, ElementTag } from './ElementInfo';

const Scene = dynamic(() => import('@/render/Scene').then((module) => module.Scene), {
  ssr: false,
  loading: () => <p role="status" className="board-loading">Preparando o campo…</p>,
});

export function Battlefield() {
  const [runtime] = useState(() => createGameRuntime(forestMap, { waves: forestWaves }));
  const game = useStore(runtime.store);
  const [previewEnemy, setPreviewEnemy] = useState<EnemyDefinition | null>(null);
  const { money, lives, wave, maxWaves, selectedSlot, selectSlot, occupiedSlots, selectedEnemyId, status } = game;
  const enemy = selectedEnemyId === null ? previewEnemy : runtime.getEnemy(selectedEnemyId)?.enemy.definition;
  const ended = status === 'victory' || status === 'defeat';

  function selectPosition(slot: string) {
    setPreviewEnemy(null);
    selectSlot(slot);
  }

  function inspectEnemy(entity: EnemyEntity) {
    setPreviewEnemy(null);
    game.selectEnemy(entity.id);
  }

  return (
    <main className="battle-shell">
      <header className="battle-header">
        <Link href="/" className="wordmark"><Sprout size={23} aria-hidden="true" />{brand.name}</Link>
        <Link href="/" className="quiet-button"><ArrowLeft size={15} aria-hidden="true" /> Menu</Link>
      </header>
      <div className="battle-layout">
        <section className="battle-main" aria-labelledby="map-name">
          <div className="battle-title">
            <div><p className="section-kicker">Campo de batalha</p><h1 id="map-name">{forestMap.name}</h1></div>
            <dl className="stat-list" aria-label="Recursos da partida">
              <div><dt><Coins size={17} aria-hidden="true" /><span className="sr-only">Moedas</span></dt><dd>{money}</dd></div>
              <div><dt><Heart size={17} aria-hidden="true" /><span className="sr-only">Vidas</span></dt><dd>{lives}</dd></div>
              <div><dt><Flag size={17} aria-hidden="true" /><span className="sr-only">Onda</span></dt><dd>{wave}/{maxWaves}</dd></div>
            </dl>
          </div>
          <div className="battle-board">
            <Scene map={forestMap} runtime={runtime} selectedSlot={selectedSlot} onSelectSlot={selectPosition} onSelectEnemy={inspectEnemy} />
            {ended && (
              <div className="board-overlay">
                <div role="status">
                  <h2>{status === 'victory' ? 'Vitória!' : 'A defesa caiu'}</h2>
                  <p>{status === 'victory' ? `O bosque está seguro com ${lives} vidas restantes.` : `A última onda alcançada foi a ${wave}.`}</p>
                  <button className="gold-button" onClick={() => { setPreviewEnemy(null); runtime.restart(); }}><RotateCcw size={15} aria-hidden="true" /> Jogar novamente</button>
                </div>
              </div>
            )}
          </div>
          <div className="slot-tray" role="group" aria-label="Posições de construção">
            <span>Posições</span>
            {forestMap.slots.map(({ id }) => (
              <button key={id} type="button" aria-pressed={selectedSlot === id} data-occupied={Boolean(occupiedSlots[id])}
                aria-label={`Posição ${id.toUpperCase()}${occupiedSlots[id] ? ', ocupada' : ''}`}
                disabled={ended} onClick={() => selectPosition(id)}>{id}</button>
            ))}
          </div>
        </section>
        <aside className="battle-aside" aria-label="Comandos de batalha">
          <BattleControls runtime={runtime} game={game} onInspect={(definition) => { game.selectEnemy(null); setPreviewEnemy(definition); }} />
          {enemy && !ended && (
            <section className="battle-panel" aria-labelledby="enemy-name">
              <div className="panel-heading">
                <h2 id="enemy-name"><ElementGlyph element={enemy.element} />{enemy.name}</h2>
                <button type="button" className="icon-action" aria-label="Fechar detalhes do inimigo" onClick={() => { setPreviewEnemy(null); game.selectEnemy(null); }}><X size={17} aria-hidden="true" /></button>
              </div>
              <p className="panel-copy"><ElementTag element={enemy.element} /></p>
              <p className="panel-copy">{enemy.description}</p>
              <ElementInfo element={enemy.element} incoming />
              {enemy.traits.shield && <ElementInfo element={enemy.traits.shield.element} incoming heading="Dano contra o escudo" />}
            </section>
          )}
          <CreaturesPanel runtime={runtime} game={game} />
        </aside>
      </div>
    </main>
  );
}
