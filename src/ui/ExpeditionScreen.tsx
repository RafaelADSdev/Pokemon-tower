'use client';

import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import type { CampaignExpedition } from '@/data/campaign';
import { campaignGymTotal, countBadges, isExpeditionUnlocked, previousGym } from '@/lib/campaignProgress';
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

  const previous = previousGym(expedition);
  return (
    <>
      <SiteHeader />
      <main className="expedition-locked">
        <LockKeyhole aria-hidden="true" size={33} />
        <h1>{localized(expedition.map)}</h1>
        <p>{previous ? t.gymLocked(localized(previous.map)) : t.finalLocked(campaignGymTotal)}</p>
        {!previous && <p>{t.badgeCount(countBadges(expeditionResults), campaignGymTotal)}</p>}
        <Link href="/#expedicoes" className="gold-button"><ArrowLeft size={16} aria-hidden="true" /> {t.backToMaps}</Link>
      </main>
    </>
  );
}
