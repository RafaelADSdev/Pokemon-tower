'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, LockKeyhole, Star } from 'lucide-react';
import { creatures, creatureRoles } from '@/data/creatures';
import { elementById } from '@/data/elements';
import { getCreatureUnlockStars } from '@/data/progression';
import { ElementGlyph, ElementTag } from './ElementInfo';
import { SiteHeader } from './SiteHeader';
import { useProgress } from './useProgress';

export function CollectionScreen() {
  const { totalStars } = useProgress();
  const unlocked = creatures.filter(({ id }) => totalStars >= getCreatureUnlockStars(id)).length;

  return (
    <>
      <SiteHeader active="collection" />
      <main className="collection-shell">
        <Link href="/#expedicoes" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> Expedições</Link>
        <div className="section-heading collection-heading">
          <div><h1>Coleção</h1><p>{unlocked} de {creatures.length} criaturas disponíveis</p></div>
          <span className="collection-stars"><Star size={18} fill="currentColor" aria-hidden="true" /> {totalStars} {totalStars === 1 ? 'estrela' : 'estrelas'}</span>
        </div>
        <div className="collection-grid">
          {creatures.map((creature) => {
            const required = getCreatureUnlockStars(creature.id);
            const locked = totalStars < required;
            return (
              <article className="collection-card" data-locked={locked} key={creature.id}>
                <div className="collection-portrait" style={{ '--element-color': elementById[creature.element].color } as React.CSSProperties}>
                  <ElementGlyph element={creature.element} size={45} />
                  {locked && <span className="locked-label"><LockKeyhole size={13} aria-hidden="true" /> {required} estrelas</span>}
                </div>
                <div className="collection-card-content">
                  <div className="card-meta"><ElementTag element={creature.element} /><span>{creatureRoles[creature.role].name}</span></div>
                  <h2>{creature.name}</h2>
                  <p>{creature.description}</p>
                  <div className="evolution-preview">
                    <ArrowUpRight size={17} aria-hidden="true" />
                    <div><span>Evolução · Nível 3</span><strong>{creature.evolution.name}</strong><p>{creature.evolution.description}</p></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
