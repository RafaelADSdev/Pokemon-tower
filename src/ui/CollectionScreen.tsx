'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, Star } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions } from '@/data/campaign';
import { creatureRoles, getCreatureAppearance, type CreatureDefinition } from '@/data/creatures';
import { elementById } from '@/data/elements';
import { getCreatureUnlockStars } from '@/data/progression';
import { regionalRosters } from '@/data/regionalCreatures';
import { ElementTag } from './ElementInfo';
import { GymBadge } from './GymBadge';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import { useProgress } from './useProgress';
import './league-ui.css';
import './collection.css';

function CollectionCard({ creature, totalStars }: { creature: CreatureDefinition; totalStars: number }) {
  const { t, localized, describe } = useLocale();
  const required = getCreatureUnlockStars(creature.id);
  const locked = totalStars < required;
  const levelTwo = getCreatureAppearance(creature, 2);
  const levelThree = getCreatureAppearance(creature, 3);

  return (
    <article className="collection-card" data-locked={locked} style={{ '--element-color': elementById[creature.element].color } as React.CSSProperties}>
      <div className="collection-portrait">
        <Image src={creature.portrait ?? `/images/creatures/${creature.id}.webp`} width={180} height={180} alt="" unoptimized />
        {locked && <span className="locked-label"><LockKeyhole size={13} aria-hidden="true" /><span className="sr-only">{t.lockedGym} · </span>{t.stars(required)}</span>}
      </div>
      <div className="collection-card-content">
        <div className="card-meta"><ElementTag element={creature.element} /><span>{localized(creatureRoles[creature.role])}</span></div>
        <h3>{localized(creature)}</h3>
        <p className="collection-description">{describe(creature)}</p>
        <div className="evolution-preview">
          <div className="evolution-caption"><ArrowUpRight size={15} aria-hidden="true" />{t.evolution}</div>
          <ol className="evolution-levels">
            <li><span>{t.level} 2</span><strong>{localized(levelTwo)}</strong></li>
            <li><span>{t.level} 3</span><strong>{levelThree.name === levelTwo.name ? t.finalAbility : localized(levelThree)}</strong></li>
          </ol>
          <p>{describe(levelThree)}</p>
        </div>
      </div>
    </article>
  );
}

export function CollectionScreen() {
  const { expeditionResults, totalStars } = useProgress();
  const { t, localized } = useLocale();
  const [region, setRegion] = useState(campaignRegions[0]);
  const regionName = localized(region);
  const roster = regionalRosters[region.id];
  const unlocked = roster.filter(({ id }) => totalStars >= getCreatureUnlockStars(id)).length;
  const badges = region.gyms.filter(({ id }) => expeditionResults[id]).length;

  return (
    <div className="league-ui collection-page" data-region={region.id}>
      <SiteHeader active="collection" />
      <main className="collection-shell">
        <Link href="/#expedicoes" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> {t.expeditions}</Link>
        <header className="collection-hero">
          <div className="collection-hero-art">
            <Image src={`/images/league/${region.id}.webp`} alt="" fill unoptimized fetchPriority="high" loading="eager" sizes="(max-width: 650px) 75vw, 720px" />
          </div>
          <div className="collection-hero-copy">
            <h1>{t.collection}</h1>
            <p>{t.availableCreatures(unlocked, roster.length)}</p>
            <span className="collection-stars"><Star size={16} fill="currentColor" aria-hidden="true" /> {t.stars(totalStars)}</span>
          </div>
        </header>
        <div className="collection-regions" role="group" aria-label={t.chooseRegion}>
          {campaignRegions.map((option) => (
            <button key={option.id} className="collection-region" aria-pressed={option.id === region.id} aria-controls="collection-region-content" type="button" onClick={() => setRegion(option)}>
              {localized(option)}
            </button>
          ))}
        </div>
        <div id="collection-region-content">
          <section className="collection-badges" aria-labelledby="collection-badges-title">
            <div className="collection-section-heading">
              <h2 id="collection-badges-title">{t.collectionBadges(regionName)}</h2>
              <span className="collection-badge-count">{t.badgeCount(badges, region.gyms.length)}</span>
            </div>
            <ul className="badge-case" role="list">
              {region.gyms.map((gym) => {
                const earned = Boolean(expeditionResults[gym.id]);
                return (
                  <li key={gym.id} data-earned={earned}>
                    <span className="badge-case-art">
                      <GymBadge badge={gym.badge} size={34} />
                      <span className="badge-case-status" aria-hidden="true">{earned ? <Check size={12} /> : <LockKeyhole size={10} />}</span>
                    </span>
                    <span className="badge-case-name">{gym.badge}</span>
                    <span className="sr-only">{earned ? t.badgeCollected : t.badgePending}</span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="collection-roster" aria-labelledby="collection-roster-title">
            <div className="collection-section-heading"><h2 id="collection-roster-title">{t.collectionRoster(regionName)}</h2></div>
            <div className="collection-grid">
              {roster.map((creature) => <CollectionCard key={`${region.id}:${creature.id}`} creature={creature} totalStars={totalStars} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
