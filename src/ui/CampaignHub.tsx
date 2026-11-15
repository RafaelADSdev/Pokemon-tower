import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, LockKeyhole, Trophy } from 'lucide-react';
import { useState } from 'react';
import { campaignRegions, finalTournament, type CampaignExpedition, type GymExpedition } from '@/data/campaign';
import { getStarsForLives } from '@/data/progression';
import { campaignGymTotal, countBadges, isExpeditionUnlocked, type ExpeditionResults } from '@/lib/campaignProgress';
import { GymBadge } from './GymBadge';
import { gymPalette } from './gymPalette';
import { useLocale } from './locale';
import { Stars } from './Stars';
import { useProgress } from './useProgress';

type BattleState = 'cleared' | 'available' | 'locked';

function BattleStep({ expedition, label, state, next }: {
  expedition: CampaignExpedition;
  label: string;
  state: BattleState;
  next: boolean;
}) {
  const { t, localized } = useLocale();
  const waves = t.waveCount(expedition.waves.length);
  const title = localized(expedition.map);
  const name = title.startsWith(label) ? title : `${label} · ${title}`;
  const action = state === 'cleared' ? t.clearedGym : t.unlockedGym;
  const Icon = state === 'locked' ? LockKeyhole : state === 'cleared' ? Check : ArrowRight;
  const attributes = { 'data-expedition-id': expedition.id, 'data-kind': expedition.kind, 'data-state': state };
  const contents = (
    <>
      <span className="gym-step-label">{label}</span>
      <Icon className="gym-step-icon" size={14} aria-hidden="true" />
      <small>{waves}</small>
    </>
  );
  return (
    <li>
      {state === 'locked' ? (
        <span className="gym-step" {...attributes}>
          {contents}
          <span className="sr-only">{t.lockedGym}</span>
        </span>
      ) : (
        <Link
          className="gym-step"
          href={`/expeditions/${expedition.id}`}
          prefetch={false}
          aria-label={`${name} · ${waves} · ${action}`}
          data-next={next || undefined}
          {...attributes}
        >
          {contents}
        </Link>
      )}
    </li>
  );
}

function GymCard({ gym, results }: { gym: GymExpedition; results: ExpeditionResults }) {
  const { t, language, localized } = useLocale();
  const lives = results[gym.id] ?? 0;
  const getState = (expedition: CampaignExpedition): BattleState => {
    if (!isExpeditionUnlocked(expedition, results)) return 'locked';
    return (results[expedition.id] ?? 0) > 0 ? 'cleared' : 'available';
  };
  const stages = [...gym.routes, gym.qualifier, gym];
  const next = lives === 0 ? stages.find((stage) => getState(stage) === 'available') : undefined;
  const locked = stages.every((stage) => getState(stage) === 'locked');
  const gymTitle = `${gym.id}-title`;
  const routeOffset = (gym.order - 1) * gym.routes.length;

  return (
    <article
      className="gym-card"
      style={gymPalette(gym.specialty)}
      data-gym={gym.id}
      data-cleared={lives > 0}
      data-locked={locked || undefined}
      data-active={Boolean(next) || undefined}
      aria-labelledby={gymTitle}
    >
      <div className="gym-card-top">
        <span className="gym-mark"><GymBadge badge={gym.badge} size={37} /></span>
        <div className="gym-card-main">
          <span className="gym-leader">{t.gymLeader(gym.leader)}</span>
          <h3 id={gymTitle}>{localized(gym.map)}</h3>
        </div>
      </div>
      <div className="gym-card-meta">
        <span className="gym-type">{language === 'en' ? gym.typeEn : gym.type}</span>
        <span className="gym-badge-name">{t.badge(gym.badge)}</span>
        {lives > 0 && <Stars count={getStarsForLives(lives)} size={14} />}
      </div>
      <div className="gym-battles">
        <div className="gym-step-group">
          <h4>{t.routeBattles}</h4>
          <ol className="gym-step-list gym-route-steps">
            {gym.routes.map((route) => (
              <BattleStep key={route.id} expedition={route} label={t.routeBattle(routeOffset + route.routeNumber)}
                state={getState(route)} next={route.id === next?.id} />
            ))}
          </ol>
        </div>
        <div className="gym-step-group">
          <h4>{t.gymBattles}</h4>
          <ol className="gym-step-list gym-arena-steps">
            <BattleStep expedition={gym.qualifier} label={t.qualifierBattle}
              state={getState(gym.qualifier)} next={gym.qualifier.id === next?.id} />
            <BattleStep expedition={gym} label={t.leaderBattle} state={getState(gym)} next={gym.id === next?.id} />
          </ol>
        </div>
      </div>
    </article>
  );
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
        <div id="campaign-gyms" className="gym-grid">
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
