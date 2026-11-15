'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Coins, Flag, Heart, Sprout } from 'lucide-react';
import { brand } from '@/config/brand';
import { forestMap } from '@/data/maps/forest';
import { useGameStore } from '@/game/store/gameStore';

const Scene = dynamic(() => import('@/render/Scene').then((module) => module.Scene), {
  ssr: false,
  loading: () => <p role="status" className="board-loading">Preparando o campo…</p>,
});

export function Battlefield() {
  const money = useGameStore((state) => state.money);
  const lives = useGameStore((state) => state.lives);
  const wave = useGameStore((state) => state.wave);
  const maxWaves = useGameStore((state) => state.maxWaves);
  const selected = useGameStore((state) => state.selectedSlot);
  const selectSlot = useGameStore((state) => state.selectSlot);

  return (
    <main className="battle-shell">
      <header className="battle-header">
        <Link href="/" className="wordmark"><Sprout size={23} aria-hidden="true" />{brand.name}</Link>
        <Link href="/" className="quiet-button"><ArrowLeft size={15} aria-hidden="true" /> Menu</Link>
      </header>
      <div className="battle-layout">
        <section className="battle-main" aria-labelledby="map-name">
          <div className="battle-title">
            <h1 id="map-name">{forestMap.name}</h1>
            <dl className="stat-list" aria-label="Recursos da partida">
              <div><dt><Coins size={17} aria-hidden="true" /><span className="sr-only">Moedas</span></dt><dd>{money}</dd></div>
              <div><dt><Heart size={17} aria-hidden="true" /><span className="sr-only">Vidas</span></dt><dd>{lives}</dd></div>
              <div><dt><Flag size={17} aria-hidden="true" /><span className="sr-only">Onda</span></dt><dd>{wave}/{maxWaves}</dd></div>
            </dl>
          </div>
          <div className="battle-board"><Scene map={forestMap} selectedSlot={selected} onSelectSlot={selectSlot} /></div>
        </section>
      </div>
    </main>
  );
}
