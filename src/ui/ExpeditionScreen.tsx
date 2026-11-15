'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import type { CampaignExpedition } from '@/data/campaign';
import { campaignGymTotal, countBadges, expeditionPrerequisite, isExpeditionUnlocked } from '@/lib/campaignProgress';
import { Battlefield } from './Battlefield';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import { useProgress } from './useProgress';

export function ExpeditionScreen({ expedition }: { expedition: CampaignExpedition }) {
  const { expeditionResults } = useProgress();
  const { t, localized } = useLocale();
  if (isExpeditionUnlocked(expedition, expeditionResults)) {
    return <Battlefield map={expedition.map} expedition={expedition} />;
  }

  const prerequisite = expeditionPrerequisite(expedition, expeditionResults);
  return (
    <>
      <SiteHeader />
      <main className="expedition-locked">
        <LockKeyhole aria-hidden="true" size={33} />
        <h1>{localized(expedition.map)}</h1>
        {prerequisite && (
          <>
            <p>{t.gymLocked(localized(prerequisite.map))}</p>
            <Link href={`/expeditions/${prerequisite.id}`} className="gold-button">{t.goToBattle} <ArrowRight size={16} aria-hidden="true" /></Link>
          </>
        )}
        {expedition.kind === 'tournament' && (
          <>
            <p>{t.finalLocked(campaignGymTotal)}</p>
            <p>{t.badgeCount(countBadges(expeditionResults), campaignGymTotal)}</p>
          </>
        )}
        <Link href="/#expedicoes" className={prerequisite ? 'back-link mt-4' : 'gold-button'}><ArrowLeft size={16} aria-hidden="true" /> {t.backToMaps}</Link>
      </main>
    </>
  );
}
