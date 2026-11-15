import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Badge, BadgeCheck, LockKeyhole, Trophy } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions, finalTournament, type GymExpedition } from '@/data/campaign';
import { getStarsForLives } from '@/data/progression';
import { campaignGymTotal, countBadges, isExpeditionUnlocked, type ExpeditionResults } from '@/lib/campaignProgress';
import { useLocale } from './locale';
import { Stars } from './Stars';
import { useProgress } from './useProgress';

function GymCard({ gym, results }: { gym: GymExpedition; results: ExpeditionResults }) {
  const { t, language, localized } = useLocale();
  const lives = results[gym.id] ?? 0;
  const open = isExpeditionUnlocked(gym, results);
  const Glyph = lives ? BadgeCheck : open ? Badge : LockKeyhole;
  const contents = (
    <>
      <span className="gym-mark"><Glyph size={21} aria-hidden="true" /></span>
      <div className="gym-card-main">
        <span className="gym-leader">{gym.order.toString().padStart(2, '0')} · {t.gymLeader(gym.leader)}</span>
        <h3>{localized(gym.map)}</h3>
        <p>{language === 'en' ? gym.typeEn : gym.type} · {t.waveCount(gym.waves.length)}</p>
      </div>
      <div className="gym-card-end">
        {lives > 0 && <Stars count={getStarsForLives(lives)} size={13} />}
        <span>{open ? (lives ? t.clearedGym : t.unlockedGym) : t.lockedGym}</span>
        {open && <ArrowRight size={15} aria-hidden="true" />}
      </div>
    </>
  );
  return open ? (
    <Link href={`/expeditions/${gym.id}`} className="gym-card" data-cleared={lives > 0} prefetch={false}>{contents}</Link>
  ) : <article className="gym-card" data-locked="true">{contents}</article>;
}

export function CampaignHub() {
  const [region, setRegion] = useState(campaignRegions[0]);
  const { t, localized, describe } = useLocale();
  const { expeditionResults } = useProgress();
  const badges = countBadges(expeditionResults);
  const tournamentCompleted = (expeditionResults[finalTournament.id] ?? 0) > 0;
  const tournamentOpen = isExpeditionUnlocked(finalTournament, expeditionResults);

  return (
    <section id="expedicoes" className="expeditions league-hub" aria-labelledby="expedition-title">
      <div className="section-heading">
        <h2 id="expedition-title">{t.chooseRegion}</h2>
        <span className="collection-stars"><BadgeCheck size={17} aria-hidden="true" /> {t.badgeCount(badges, campaignGymTotal)}</span>
      </div>
      <div className="region-selector" role="group" aria-label={t.chooseRegion}>
        {campaignRegions.map((option) => (
          <button key={option.id} type="button" className={`region-choice cover-${option.cover}`} aria-pressed={region.id === option.id} onClick={() => setRegion(option)}>
            <Image src={`/images/map-${option.cover}.webp`} alt="" fill unoptimized sizes="(max-width: 650px) 33vw, 400px" />
            <span className="region-choice-label"><strong>{localized(option)}</strong><small>{t.badgeCount(countBadges(expeditionResults, option.id), option.gyms.length)}</small></span>
          </button>
        ))}
      </div>
      <div className="gym-heading">
        <h2>{t.gyms} · {localized(region)}</h2>
        <p>{describe(region)}</p>
      </div>
      <div className="gym-grid">
        {region.gyms.map((gym) => <GymCard key={gym.id} gym={gym} results={expeditionResults} />)}
      </div>
      <section className="final-tournament" aria-labelledby="final-tournament-title">
        <span className="tournament-icon"><Trophy size={26} aria-hidden="true" /></span>
        <div>
          <h2 id="final-tournament-title">{localized(finalTournament.map)}</h2>
          <p>{tournamentCompleted ? t.championTitle : describe(finalTournament.map)}</p>
        </div>
        {tournamentOpen ? (
          <Link href={`/expeditions/${finalTournament.id}`} className="gold-button" prefetch={false}>{t.enterTournament}<ArrowRight size={16} aria-hidden="true" /></Link>
        ) : <p className="tournament-locked"><LockKeyhole size={16} aria-hidden="true" /> {t.finalLocked(campaignGymTotal)}</p>}
      </section>
    </section>
  );
}
