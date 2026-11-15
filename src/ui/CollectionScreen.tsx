'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, Star } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions } from '@/data/campaign';
import { creatureRoles, getCreatureAppearance } from '@/data/creatures';
import { elementById } from '@/data/elements';
import { getCreatureUnlockStars } from '@/data/progression';
import { regionalRosters } from '@/data/regionalCreatures';
import { ElementTag } from './ElementInfo';
import { GymBadge } from './GymBadge';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import { useProgress } from './useProgress';

export function CollectionScreen() {
  const { expeditionResults, totalStars } = useProgress();
  const { t, localized, describe } = useLocale();
  const [region, setRegion] = useState(campaignRegions[0]);
  const roster = regionalRosters[region.id];
  const unlocked = roster.filter(({ id }) => totalStars >= getCreatureUnlockStars(id)).length;

  return (
    <>
      <SiteHeader active="collection" />
      <main className="collection-shell">
        <Link href="/#expedicoes" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> {t.expeditions}</Link>
        <div className="section-heading collection-heading">
          <div><h1>{t.collection}</h1><p>{t.availableCreatures(unlocked, roster.length)}</p></div>
          <span className="collection-stars"><Star size={18} fill="currentColor" aria-hidden="true" /> {t.stars(totalStars)}</span>
        </div>
        <div className="collection-regions" role="group" aria-label={t.chooseRegion}>
          {campaignRegions.map((option) => <button key={option.id} className="quiet-button" aria-pressed={option.id === region.id} type="button" onClick={() => setRegion(option)}>{localized(option)}</button>)}
        </div>
        <ul className="badge-case" aria-label={t.badgeCount(region.gyms.filter(({ id }) => expeditionResults[id]).length, region.gyms.length)}>
          {region.gyms.map((gym) => {
            const earned = Boolean(expeditionResults[gym.id]);
            return (
              <li key={gym.id} data-earned={earned}>
                <span className="badge-case-art"><GymBadge badge={gym.badge} size={26} /></span>
                <span>{t.badge(gym.badge)}</span>
                {earned && <Check size={14} aria-hidden="true" />}
                <span className="sr-only">{earned ? t.clearedGym : t.lockedGym}</span>
              </li>
            );
          })}
        </ul>
        <div className="collection-grid">
          {roster.map((creature) => {
            const required = getCreatureUnlockStars(creature.id);
            const locked = totalStars < required;
            const levelTwo = getCreatureAppearance(creature, 2);
            const levelThree = getCreatureAppearance(creature, 3);
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
                    <div>
                      <span>{t.evolution}</span>
                      <ol className="evolution-levels">
                        <li><span>{t.level} 2</span><strong>{localized(levelTwo)}</strong></li>
                        <li><span>{t.level} 3</span><strong>{levelThree.name === levelTwo.name ? t.finalAbility : localized(levelThree)}</strong></li>
                      </ol>
                      <p>{describe(levelThree)}</p>
                    </div>
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
