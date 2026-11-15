'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, Badge, BadgeCheck, LockKeyhole, Star } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions } from '@/data/campaign';
import { creatureRoles } from '@/data/creatures';
import { elementById } from '@/data/elements';
import { getCreatureUnlockStars } from '@/data/progression';
import { regionalRosters } from '@/data/regionalCreatures';
import { ElementTag } from './ElementInfo';
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
            const Icon = earned ? BadgeCheck : Badge;
            return <li key={gym.id} data-earned={earned}><Icon size={17} aria-hidden="true" /><span>{t.badge(gym.badge)}</span><span className="sr-only">{earned ? t.clearedGym : t.lockedGym}</span></li>;
          })}
        </ul>
        <div className="collection-grid">
          {roster.map((creature) => {
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
