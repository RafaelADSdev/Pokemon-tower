import { ArrowUp, Coins, Crosshair, LockKeyhole, Sprout } from 'lucide-react';
import Image from 'next/image';
import { creatures, creatureRoles, targetPriorities, type TargetPriority } from '@/data/creatures';
import { getCreatureUnlockStars } from '@/data/progression';
import { gameRules } from '@/data/rules';
import type { GameRuntime } from '@/game/runtime';
import type { GameState } from '@/game/store/gameStore';
import { ElementGlyph, ElementInfo } from './ElementInfo';
import { useLocale } from './locale';

export function CreaturesPanel({ runtime, game, totalStars }: { runtime: GameRuntime; game: GameState; totalStars: number }) {
  const { language, t, localized, describe } = useLocale();
  const { money, selectedSlot, paused, status } = game;
  const active = !paused && (status === 'ready' || status === 'running');
  const entity = selectedSlot ? runtime.getTower(selectedSlot) : undefined;
  const tower = entity?.tower;
  const position = selectedSlot?.toUpperCase();

  if (selectedSlot && tower) {
    const { definition, level, evolved, priority, totalSpent, stats } = tower;
    const nextLevel = definition.levels[level - 1];
    const display = evolved ? definition.evolution : definition;
    const number = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
    return (
      <section className="battle-panel creature-panel" aria-labelledby="tower-title">
        <div className="panel-heading"><h2 id="tower-title"><ElementGlyph element={definition.element} size={19} />{localized(display)}</h2><span>{position} · {t.level} {level}</span></div>
        <p className="panel-copy">{describe(display)}</p>
        <dl className="tower-stats">
          {stats.targets !== 'none' && <>
            <div><dt>{t.damage}</dt><dd>{number.format(tower.effectiveDamage)}</dd></div>
            <div><dt>{t.range}</dt><dd>{number.format(tower.effectiveRange)}</dd></div>
            <div><dt>{t.cooldown}</dt><dd>{number.format(stats.cooldown)} s</dd></div>
          </>}
          {stats.support && <>
            <div><dt>{t.radius}</dt><dd>{number.format(stats.support.radius)}</dd></div>
            <div><dt>{t.allyDamage}</dt><dd>+{number.format(stats.support.damage * 100)}%</dd></div>
            <div><dt>{t.allyRange}</dt><dd>+{number.format(stats.support.range * 100)}%</dd></div>
          </>}
          {stats.income && <>
            <div><dt>{t.coins}</dt><dd>+{stats.income.amount}</dd></div>
            <div><dt>{t.interval}</dt><dd>{number.format(stats.income.interval)} s</dd></div>
          </>}
        </dl>
        {stats.targets !== 'none' && <ElementInfo element={definition.element} />}
        {definition.targets !== 'none' && (
          <label className="priority-field"><Crosshair size={15} aria-hidden="true" /> {t.priority}
            <select value={priority} disabled={!active} onChange={(event) => runtime.setTargetPriority(selectedSlot, event.target.value as TargetPriority)}>
              {targetPriorities.map((key) => <option key={key} value={key}>{t.priorities[key]}</option>)}
            </select>
          </label>
        )}
        <div className="tower-actions">
          {nextLevel && <button type="button" className="gold-button" disabled={!active || money < nextLevel.cost} onClick={() => runtime.upgradeTower(selectedSlot)}><ArrowUp size={15} aria-hidden="true" /> {level === 2 ? t.evolve : t.upgrade} · {nextLevel.cost}</button>}
          <button type="button" className="quiet-button" disabled={!active} onClick={() => runtime.sellTower(selectedSlot)}>{t.sell} · {Math.floor(totalSpent * gameRules.sellRefund)}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="battle-panel creature-panel" aria-labelledby="recruit-title">
      <div className="panel-heading"><h2 id="recruit-title"><Sprout size={18} aria-hidden="true" /> {t.creatures}</h2>{position && <span>{position}</span>}</div>
      <p className="panel-copy" role="status">{position ? t.pickCreature : t.pickPosition}</p>
      <div className="recruit-list">
        {creatures.map((creature) => {
          const required = getCreatureUnlockStars(creature.id);
          const locked = totalStars < required;
          return (
            <button type="button" className="recruit" key={creature.id} data-locked={locked} disabled={locked || !selectedSlot || !active || money < creature.cost}
              onClick={() => selectedSlot && runtime.placeTower(selectedSlot, creature.id)} title={describe(creature)}>
              <span className="recruit-emblem">
                <Image src={`/images/creatures/${creature.id}.webp`} width={44} height={44} alt="" unoptimized />
                <ElementGlyph element={creature.element} size={11} />
              </span>
              <span className="recruit-copy">
                <strong>{localized(creature)}</strong><small>{localized(creatureRoles[creature.role])}</small>
                <span className="price">{locked ? <><LockKeyhole size={12} aria-hidden="true" />{t.stars(required)}</> : <><Coins size={12} aria-label={t.coins} /> {creature.cost}</>}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
