'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, LockKeyhole, Star } from 'lucide-react';
import { creatures, creatureRoles } from '@/data/creatures';
import { elementById } from '@/data/elements';
import { getCreatureUnlockStars } from '@/data/progression';
import { ElementTag } from './ElementInfo';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import { useProgress } from './useProgress';

export function CollectionScreen() {
  const { totalStars } = useProgress();
  const { t, localized, describe } = useLocale();
  const unlocked = creatures.filter(({ id }) => totalStars >= getCreatureUnlockStars(id)).length;

  return (
    <>
      <SiteHeader active="collection" />
      <main className="collection-shell">
        <Link href="/#expedicoes" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> {t.expeditions}</Link>
        <div className="section-heading collection-heading">
          <div><h1>{t.collection}</h1><p>{t.availableCreatures(unlocked, creatures.length)}</p></div>
          <span className="collection-stars"><Star size={18} fill="currentColor" aria-hidden="true" /> {t.stars(totalStars)}</span>
        </div>
        <div className="collection-grid">
          {creatures.map((creature) => {
            const required = getCreatureUnlockStars(creature.id);
            const locked = totalStars < required;
            return (
              <article className="collection-card" data-locked={locked} key={creature.id}>
                <div className="collection-portrait" style={{ '--element-color': elementById[creature.element].color } as React.CSSProperties}>
                  <Image src={creature.portrait ?? `/images/creatures/${creature.id}.webp`} width={150} height={150} alt="" unoptimized />
                  {locked && <span className="locked-label"><LockKeyhole size={13} aria-hidden="true" /> {t.stars(required)}</span>}
                </div>
                <div className="collection-card-content">
                  <div className="card-meta"><ElementTag element={creature.element} /><span>{localized(creatureRoles[creature.role])}</span></div>
                  <h2>{localized(creature)}</h2>
                  <p>{describe(creature)}</p>
                  <div className="evolution-preview">
                    <ArrowUpRight size={17} aria-hidden="true" />
                    <div><span>{t.evolution}</span><strong>{localized(creature.evolution)}</strong><p>{describe(creature.evolution)}</p></div>
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
