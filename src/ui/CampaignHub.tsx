import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, LockKeyhole, Trophy } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions, finalTournament, type GymExpedition } from '@/data/campaign';
import { getStarsForLives } from '@/data/progression';
import { campaignGymTotal, countBadges, isExpeditionUnlocked, type ExpeditionResults } from '@/lib/campaignProgress';
import { GymEmblem, gymPalette } from './GymEmblem';
import { useLocale } from './locale';
import { Stars } from './Stars';
import { useProgress } from './useProgress';

function GymCard({ gym, results }: { gym: GymExpedition; results: ExpeditionResults }) {
  const { t, language, localized } = useLocale();
  const lives = results[gym.id] ?? 0;
  const open = isExpeditionUnlocked(gym, results);
  const contents = (
    <>
      <div className="gym-card-top">
        <GymEmblem className="gym-mark" specialty={gym.specialty} size={25} />
        <span className="gym-stage" aria-hidden="true">{gym.order.toString().padStart(2, '0')}</span>
        {!open && <span className="gym-lock"><LockKeyhole size={13} aria-hidden="true" />{t.lockedGym}</span>}
        {lives > 0 && <BadgeCheck className="gym-complete" size={21} aria-hidden="true" />}
      </div>
      <div className="gym-card-main">
        <span className="gym-leader">{t.gymLeader(gym.leader)}</span>
        <h3>{localized(gym.map)}</h3>
        <p><span className="gym-type">{language === 'en' ? gym.typeEn : gym.type}</span><span>{t.waveCount(gym.waves.length)}</span></p>
      </div>
      <div className="gym-card-end">
        {lives > 0 ? <Stars count={getStarsForLives(lives)} size={14} /> : <span className="gym-badge-name">{t.badge(gym.badge)}</span>}
        {open && <span className="gym-action">{lives ? t.clearedGym : t.unlockedGym}<ArrowRight size={15} aria-hidden="true" /></span>}
      </div>
    </>
  );
  return open ? (
    <Link href={`/expeditions/${gym.id}`} className="gym-card" style={gymPalette(gym.specialty)} data-cleared={lives > 0} prefetch={false}>{contents}</Link>
  ) : <article className="gym-card" style={gymPalette(gym.specialty)} data-locked="true">{contents}</article>;
}

export function CampaignHub() {
  const [region, setRegion] = useState(campaignRegions[0]);
  const { t, localized, describe } = useLocale();
  const { expeditionResults } = useProgress();
  const badges = countBadges(expeditionResults);
  const tournamentCompleted = (expeditionResults[finalTournament.id] ?? 0) > 0;
  const tournamentOpen = isExpeditionUnlocked(finalTournament, expeditionResults);

  return (
    <section id="expedicoes" className="league-campaign" aria-labelledby="expedition-title">
      <div className="league-hub">
        <div className="league-heading">
          <h2 id="expedition-title">{t.chooseRegion}</h2>
          <div className="league-progress">
            <span className="league-progress-icon"><BadgeCheck size={24} aria-hidden="true" /></span>
            <div>
              <span>{t.leagueBadges}</span>
              <div className="league-progress-total"><strong>{badges}<small> / {campaignGymTotal}</small></strong><progress value={badges} max={campaignGymTotal} aria-label={t.badgeCount(badges, campaignGymTotal)} /></div>
            </div>
          </div>
        </div>
        <div className="region-selector" role="group" aria-label={t.chooseRegion}>
          {campaignRegions.map((option) => {
            const selected = region.id === option.id;
            const count = countBadges(expeditionResults, option.id);
            return (
              <button key={option.id} type="button" className="region-choice" data-region={option.id} aria-pressed={selected} onClick={() => setRegion(option)}>
                <span className="region-art">
                  <Image src={`/images/league/${option.id}.webp`} alt="" fill unoptimized sizes="(max-width: 650px) 33vw, 400px" />
                  {selected && <span className="region-picked"><Check size={17} aria-hidden="true" /></span>}
                </span>
                <span className="region-choice-label">
                  <strong>{localized(option)}</strong>
                  <span className="region-progress" aria-hidden="true">{option.gyms.map(({ id }, index) => <i key={id} data-earned={index < count} />)}</span>
                  <small>{t.badgeCount(count, option.gyms.length)}</small>
                </span>
              </button>
            );
          })}
        </div>
        <div className="gym-heading">
          <h2>{t.gyms} · {localized(region)}</h2>
          <p>{describe(region)}</p>
        </div>
        <div className="gym-grid">
          {region.gyms.map((gym) => <GymCard key={gym.id} gym={gym} results={expeditionResults} />)}
        </div>
        <section className="final-tournament" aria-labelledby="final-tournament-title">
          <span className="tournament-icon"><Trophy size={38} strokeWidth={1.75} aria-hidden="true" /></span>
          <div className="tournament-copy">
            <h2 id="final-tournament-title">{localized(finalTournament.map)}</h2>
            <p>{tournamentCompleted ? t.championTitle : describe(finalTournament.map)}</p>
          </div>
          {tournamentOpen ? (
            <Link href={`/expeditions/${finalTournament.id}`} className="gold-button" prefetch={false}>{t.enterTournament}<ArrowRight size={16} aria-hidden="true" /></Link>
          ) : <p className="tournament-locked"><LockKeyhole size={16} aria-hidden="true" /> {t.finalLocked(campaignGymTotal)}</p>}
        </section>
      </div>
    </section>
  );
}
