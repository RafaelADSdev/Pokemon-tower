import { ArrowUp, Coins, Crosshair, LockKeyhole, Sprout } from 'lucide-react';
import { brand } from '@/config/brand';
import { creatures, creatureRoles, targetPriorities, type TargetPriority } from '@/data/creatures';
import { getCreatureUnlockStars } from '@/data/progression';
import { gameRules } from '@/data/rules';
import type { GameRuntime } from '@/game/runtime';
import type { GameState } from '@/game/store/gameStore';
import { ElementGlyph, ElementInfo } from './ElementInfo';

const priorities: Record<TargetPriority, string> = { first: 'Primeiro', last: 'Último', strongest: 'Mais forte', nearest: 'Mais próximo' };

export function CreaturesPanel({ runtime, game, totalStars }: { runtime: GameRuntime; game: GameState; totalStars: number }) {
  const { money, selectedSlot, paused, status } = game;
  const active = !paused && (status === 'ready' || status === 'running');
  const entity = selectedSlot ? runtime.getTower(selectedSlot) : undefined;
  const tower = entity?.tower;
  const position = selectedSlot?.toUpperCase();

  if (selectedSlot && tower) {
    const { definition, level, evolved, priority, totalSpent, stats } = tower;
    const nextLevel = definition.levels[level - 1];
    const display = evolved ? definition.evolution : definition;
    const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
    return (
      <section className="battle-panel creature-panel" aria-labelledby="tower-title">
        <div className="panel-heading"><h2 id="tower-title"><ElementGlyph element={definition.element} size={19} />{display.name}</h2><span>{position} · Nível {level}</span></div>
        <p className="panel-copy">{display.description}</p>
        <dl className="tower-stats">
          {stats.targets !== 'none' && <>
            <div><dt>Dano</dt><dd>{number.format(tower.effectiveDamage)}</dd></div>
            <div><dt>Alcance</dt><dd>{number.format(tower.effectiveRange)}</dd></div>
            <div><dt>Recarga</dt><dd>{number.format(stats.cooldown)} s</dd></div>
          </>}
          {stats.support && <>
            <div><dt>Raio</dt><dd>{number.format(stats.support.radius)}</dd></div>
            <div><dt>Dano aliado</dt><dd>+{number.format(stats.support.damage * 100)}%</dd></div>
            <div><dt>Alcance aliado</dt><dd>+{number.format(stats.support.range * 100)}%</dd></div>
          </>}
          {stats.income && <>
            <div><dt>Moedas</dt><dd>+{stats.income.amount}</dd></div>
            <div><dt>Intervalo</dt><dd>{number.format(stats.income.interval)} s</dd></div>
          </>}
        </dl>
        {stats.targets !== 'none' && <ElementInfo element={definition.element} />}
        {definition.targets !== 'none' && (
          <label className="priority-field"><Crosshair size={15} aria-hidden="true" /> Prioridade
            <select value={priority} disabled={!active} onChange={(event) => runtime.setTargetPriority(selectedSlot, event.target.value as TargetPriority)}>
              {targetPriorities.map((key) => <option key={key} value={key}>{priorities[key]}</option>)}
            </select>
          </label>
        )}
        <div className="tower-actions">
          {nextLevel && <button type="button" className="gold-button" disabled={!active || money < nextLevel.cost} onClick={() => runtime.upgradeTower(selectedSlot)}><ArrowUp size={15} aria-hidden="true" /> {level === 2 ? 'Evoluir' : 'Melhorar'} · {nextLevel.cost}</button>}
          <button type="button" className="quiet-button" disabled={!active} onClick={() => runtime.sellTower(selectedSlot)}>Vender · {Math.floor(totalSpent * gameRules.sellRefund)}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="battle-panel creature-panel" aria-labelledby="recruit-title">
      <div className="panel-heading"><h2 id="recruit-title"><Sprout size={18} aria-hidden="true" /> {brand.creatures}</h2>{position && <span>{position}</span>}</div>
      <p className="panel-copy" role="status">{position ? 'Escolha a criatura para implantar.' : 'Escolha uma posição para montar sua defesa.'}</p>
      <div className="recruit-list">
        {creatures.map((creature) => {
          const required = getCreatureUnlockStars(creature.id);
          const locked = totalStars < required;
          return (
            <button type="button" className="recruit" key={creature.id} disabled={locked || !selectedSlot || !active || money < creature.cost}
              onClick={() => selectedSlot && runtime.placeTower(selectedSlot, creature.id)} title={creature.description}>
              <span className="recruit-emblem"><ElementGlyph element={creature.element} size={19} /></span>
              <span className="recruit-copy">
                <strong>{creature.name}</strong><small>{creatureRoles[creature.role].name}</small>
                <span className="price">{locked ? <><LockKeyhole size={12} aria-hidden="true" />{required} {required === 1 ? 'estrela' : 'estrelas'}</> : <><Coins size={12} aria-label="moedas" /> {creature.cost}</>}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
