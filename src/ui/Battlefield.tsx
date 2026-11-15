'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BadgeCheck, Coins, Flag, Heart, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { playSound } from '@/audio/audio';
import { campaignRegions, finalTournament, type CampaignExpedition } from '@/data/campaign';
import { enemyById, type EnemyDefinition } from '@/data/enemies';
import type { MapDefinition } from '@/data/maps/types';
import { getStarsForLives } from '@/data/progression';
import { regionalRosters, tournamentRoster } from '@/data/regionalCreatures';
import { createGameRuntime } from '@/game/runtime';
import type { EnemyEntity } from '@/game/ecs/world';
import { isExpeditionUnlocked, nextGym } from '@/lib/campaignProgress';
import { BattleControls } from './BattleControls';
import { CreaturesPanel } from './CreaturesPanel';
import { ElementGlyph, ElementInfo, ElementTag } from './ElementInfo';
import { SiteHeader } from './SiteHeader';
import { Stars } from './Stars';
import { useLocale } from './locale';
import { useBattleAudio } from './useBattleAudio';
import { canRecruitCreature, recordExpeditionVictory, recordVictory, useProgress } from './useProgress';

const Scene = dynamic(() => import('@/render/Scene').then((module) => module.Scene), {
  ssr: false,
  loading: BoardLoading,
});

function BoardLoading() {
  const { t } = useLocale();
  return <p role="status" className="board-loading">{t.loading}</p>;
}

export function Battlefield({ map, expedition }: { map: MapDefinition; expedition?: CampaignExpedition }) {
  const [runtime] = useState(() => createGameRuntime(map, {
    canUseCreature: canRecruitCreature,
    waves: expedition?.waves,
    roster: expedition?.kind === 'gym' ? regionalRosters[expedition.regionId] : expedition && tournamentRoster,
  }));
  const game = useStore(runtime.store);
  const { t, localized, describe } = useLocale();
  const { muted, toggleMuted } = useBattleAudio(runtime, map.id);
  const { totalStars, expeditionResults } = useProgress();
  const [previewEnemy, setPreviewEnemy] = useState<EnemyDefinition | null>(null);
  const { money, lives, wave, maxWaves, selectedSlot, selectSlot, occupiedSlots, selectedEnemyId, status } = game;
  const enemy = selectedEnemyId === null ? previewEnemy : runtime.getEnemy(selectedEnemyId)?.enemy.definition;
  const ended = status === 'victory' || status === 'defeat';
  const gym = expedition?.kind === 'gym' ? expedition : undefined;
  const region = gym && campaignRegions.find(({ id }) => id === gym.regionId);
  const next = gym && nextGym(gym);
  const canPlayNext = next && isExpeditionUnlocked(next, expeditionResults);
  const canPlayFinal = gym && !next && isExpeditionUnlocked(finalTournament, expeditionResults);

  useEffect(() => {
    if (status !== 'victory') return;
    if (expedition) recordExpeditionVictory(expedition.id, lives);
    else recordVictory(map.id, lives);
  }, [status, expedition, map.id, lives]);

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const state = runtime.store.getState();
      if (state.status === 'victory' || state.status === 'defeat') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      switch (event.key.toLowerCase()) {
        case ' ':
          if (target?.closest('button, a')) return;
          event.preventDefault();
          state.togglePaused();
          playSound('pause');
          break;
        case 'n':
          event.preventDefault();
          runtime.startWave();
          break;
        case '1': case '2': case '3':
          state.setSpeed(Number(event.key) as 1 | 2 | 3);
          break;
        case 'escape':
          state.selectSlot(null);
          setPreviewEnemy(null);
          break;
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [runtime]);

  function selectPosition(slot: string) {
    if (ended) return;
    setPreviewEnemy(null);
    selectSlot(slot);
    playSound('ui');
  }

  function inspectEnemy(entity: EnemyEntity) {
    if (ended) return;
    setPreviewEnemy(null);
    game.selectEnemy(entity.id);
  }

  return (
    <div className="battle-shell">
      <SiteHeader action={<button type="button" className="site-control" onClick={toggleMuted} aria-label={muted ? t.unmute : t.mute}>{muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}</button>} />
      <main className="battle-layout">
        <section className="battle-main" aria-labelledby="map-name">
          <div className="battle-title">
            <div>
              <Link href="/#expedicoes" className="back-link battle-back"><ArrowLeft size={13} aria-hidden="true" /> {t.expeditions}</Link>
              <h1 id="map-name">{localized(map)}</h1>
              {region && gym && <p className="battle-gym-context">{localized(region)} · {t.gymLeader(gym.leader)} · {t.badge(gym.badge)}</p>}
            </div>
            <dl className="stat-list" aria-label={t.resources}>
              <div><dt><Coins size={17} aria-hidden="true" /><span className="sr-only">{t.coins}</span></dt><dd>{money}</dd></div>
              <div><dt><Heart size={17} aria-hidden="true" /><span className="sr-only">{t.lives}</span></dt><dd>{lives}</dd></div>
              <div><dt><Flag size={17} aria-hidden="true" /><span className="sr-only">{t.wave}</span></dt><dd>{wave}/{maxWaves}</dd></div>
            </dl>
          </div>
          <div className="battle-board">
            <Scene map={map} runtime={runtime} selectedSlot={selectedSlot} onSelectSlot={selectPosition} onSelectEnemy={inspectEnemy} unavailableMessage={t.noWebGL} />
            {ended && (
              <div className="board-overlay">
                <div role="status">
                  <h2>{status === 'victory' ? (expedition?.kind === 'tournament' ? t.championTitle : t.victory) : t.defeat}</h2>
                  {status === 'victory' && <Stars count={getStarsForLives(lives)} size={23} />}
                  {status === 'victory' && gym && <span className="badge-earned"><BadgeCheck size={16} aria-hidden="true" /> {t.badgeEarned(gym.badge)}</span>}
                  <p>{status === 'victory' ? t.victoryResult(lives) : t.defeatResult(wave)}</p>
                  {status === 'victory' && canPlayNext && <Link className="gold-button" href={`/expeditions/${next.id}`}>{t.nextGym} <ArrowRight size={15} aria-hidden="true" /></Link>}
                  {status === 'victory' && canPlayFinal && <Link className="gold-button" href={`/expeditions/${finalTournament.id}`}>{t.enterTournament} <ArrowRight size={15} aria-hidden="true" /></Link>}
                  <button className={status === 'victory' && (canPlayNext || canPlayFinal) ? 'quiet-button' : 'gold-button'} onClick={() => { setPreviewEnemy(null); runtime.restart(); }}><RotateCcw size={15} aria-hidden="true" /> {t.replay}</button>
                  <Link href="/#expedicoes" className="overlay-map-link">{t.backToMaps}</Link>
                </div>
              </div>
            )}
          </div>
          <div className="slot-tray" role="group" aria-label={t.buildPositions}>
            <span>{t.positions}</span>
            {map.slots.map(({ id }) => (
              <button key={id} type="button" aria-pressed={selectedSlot === id} data-occupied={Boolean(occupiedSlots[id])}
                aria-label={t.position(id.toUpperCase(), Boolean(occupiedSlots[id]))}
                disabled={ended} onClick={() => selectPosition(id)}>{id}</button>
            ))}
          </div>
          <ul className="keyboard-hints" aria-label={t.shortcuts}>
            <li><kbd>{t.shortcutSpace}</kbd> {t.shortcutPause}</li><li><kbd>N</kbd> {t.shortcutWave}</li><li><kbd>1–3</kbd> {t.shortcutSpeed}</li>
          </ul>
        </section>
        <aside className="battle-aside" aria-label={t.commands}>
          <BattleControls runtime={runtime} game={game} onInspect={(definition) => { game.selectEnemy(null); setPreviewEnemy(definition); }} />
          {expedition && !ended && (
            <div className="featured-enemies" aria-label={t.featuredPokemon}>
              <span>{t.featuredPokemon}</span>
              {expedition.featuredEnemies.map((id) => {
                const definition = enemyById[id];
                return definition && <button type="button" key={id} onClick={() => { game.selectEnemy(null); setPreviewEnemy(definition); }}><ElementGlyph size={13} element={definition.element} />{localized(definition)}</button>;
              })}
            </div>
          )}
          {enemy && !ended && (
            <section className="battle-panel" aria-labelledby="enemy-name">
              <div className="panel-heading">
                <h2 id="enemy-name"><ElementGlyph element={enemy.element} />{localized(enemy)}</h2>
                <button type="button" className="icon-action" aria-label={t.closeEnemy} onClick={() => { setPreviewEnemy(null); game.selectEnemy(null); }}><X size={17} aria-hidden="true" /></button>
              </div>
              <p className="panel-copy"><ElementTag element={enemy.element} /></p>
              <p className="panel-copy">{describe(enemy)}</p>
              <ElementInfo element={enemy.element} incoming />
              {enemy.traits.shield && <ElementInfo element={enemy.traits.shield.element} incoming heading={t.shieldDamage} />}
            </section>
          )}
          <CreaturesPanel runtime={runtime} game={game} totalStars={totalStars} />
        </aside>
      </main>
    </div>
  );
}
