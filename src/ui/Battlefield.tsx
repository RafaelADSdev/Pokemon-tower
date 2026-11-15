'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Coins, Flag, Flame, Heart, Pause, Play, RotateCcw, Sprout } from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';
import { brand } from '@/config/brand';
import { starterCreature } from '@/data/creatures';
import { forestMap } from '@/data/maps/forest';
import { forestWaves } from '@/data/waves/forest';
import { createGameRuntime } from '@/game/runtime';

const Scene = dynamic(() => import('@/render/Scene').then((module) => module.Scene), {
  ssr: false,
  loading: () => <p role="status" className="board-loading">Preparando o campo…</p>,
});

export function Battlefield() {
  const [runtime] = useState(() => createGameRuntime(forestMap, { waves: forestWaves }));
  const game = useStore(runtime.store);
  const { money, lives, wave, maxWaves, selectedSlot, selectSlot, occupiedSlots, speed, paused, status } = game;
  const selectedTower = selectedSlot ? occupiedSlots[selectedSlot] : undefined;
  const ended = status === 'victory' || status === 'defeat';
  const canRecruit = Boolean(selectedSlot && !selectedTower && money >= starterCreature.cost && !ended && !paused);

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
            <Scene map={forestMap} runtime={runtime} selectedSlot={selectedSlot} onSelectSlot={selectSlot} />
            {ended && (
              <div className="board-overlay">
                <div role="status">
                  <h2>{status === 'victory' ? 'Vitória!' : 'A defesa caiu'}</h2>
                  <p>{status === 'victory' ? `O bosque está seguro com ${lives} vidas restantes.` : `A última onda alcançada foi a ${wave}.`}</p>
                  <button className="gold-button" onClick={() => runtime.restart()}><RotateCcw size={15} aria-hidden="true" /> Jogar novamente</button>
                </div>
              </div>
            )}
          </div>
          <div className="slot-tray" role="group" aria-label="Posições de construção">
            <span>Posições</span>
            {forestMap.slots.map(({ id }) => (
              <button key={id} type="button" aria-pressed={selectedSlot === id} data-occupied={Boolean(occupiedSlots[id])}
                aria-label={`Posição ${id.toUpperCase()}${occupiedSlots[id] ? ', ocupada' : ''}`}
                disabled={ended} onClick={() => selectSlot(id)}>{id}</button>
            ))}
          </div>
        </section>
        <aside className="battle-aside" aria-label="Comandos de batalha">
          <section className="battle-panel">
            <h2><Flag size={18} aria-hidden="true" /> Ondas</h2>
            <p className="panel-copy" role="status">{paused ? 'Partida pausada' : status === 'running' ? `Onda ${wave} em andamento` : ended ? 'Partida encerrada' : `Onda ${wave + 1} pronta para começar`}</p>
            <div className="field-controls">
              <button className="gold-button" onClick={() => runtime.startWave()} disabled={status !== 'ready' || paused}><Play size={15} aria-hidden="true" /> Iniciar onda</button>
              <button className="quiet-button" onClick={game.togglePaused} disabled={ended} aria-label={paused ? 'Continuar' : 'Pausar'}>
                {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
              </button>
              <div className="speed-controls" role="group" aria-label="Velocidade de jogo">
                {([1, 2, 3] as const).map((rate) => (
                  <button key={rate} aria-pressed={speed === rate} onClick={() => game.setSpeed(rate)} disabled={ended}>{rate}×</button>
                ))}
              </div>
            </div>
          </section>
          <section className="battle-panel">
            <h2><Sprout size={18} aria-hidden="true" /> {brand.creatures}</h2>
            <p className="panel-copy" role="status">{selectedTower ? `${starterCreature.name} defende a posição ${selectedSlot?.toUpperCase()}.` : selectedSlot ? `Posição ${selectedSlot.toUpperCase()} selecionada. Escolha a criatura para implantar.` : 'Escolha uma posição no mapa para implantar uma criatura.'}</p>
            <div className="recruit-list">
              <button type="button" className="recruit" disabled={!canRecruit} onClick={() => selectedSlot && runtime.placeTower(selectedSlot, starterCreature.id)}>
                <span className="recruit-emblem"><Flame size={20} aria-hidden="true" /></span>
                <span className="recruit-copy"><strong>{starterCreature.name}</strong><small>{starterCreature.description}</small></span>
                <span className="price"><Coins size={13} aria-label="moedas" /> {starterCreature.cost}</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
