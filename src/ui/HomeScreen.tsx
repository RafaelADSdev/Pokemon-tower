'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, Compass } from 'lucide-react';
import { brand } from '@/config/brand';
import { maps } from '@/data/maps';
import { getStarsForLives } from '@/data/progression';
import { gameRules } from '@/data/rules';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import { Stars } from './Stars';
import { useProgress } from './useProgress';

export function HomeScreen() {
  const { bestLives } = useProgress();
  const { language, localized, t } = useLocale();
  return (
    <>
      <SiteHeader active="maps" />
      <main>
        <section className="entry flex items-center" aria-labelledby="home-title">
          <picture className="entry-art">
            <source media="(max-width: 650px)" srcSet="/images/amber-wood-mobile.webp" />
            <Image src="/images/amber-wood.webp" alt="" fill unoptimized fetchPriority="high" sizes="100vw" />
          </picture>
          <div className="entry-content">
            <p className="section-kicker"><Compass size={16} aria-hidden="true" /> Tower defense 3D</p>
            <h1 id="home-title">{brand.name}</h1>
            <p className="entry-description">{t.hero}</p>
            <a href="#expedicoes" className="gold-button">{t.chooseExpedition} <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </section>
        <section id="expedicoes" className="expeditions" aria-labelledby="expedition-title">
          <div className="section-heading">
            <h2 id="expedition-title">{t.expeditions}</h2>
            <p>{t.wavesPerMap(gameRules.maxWaves)}</p>
          </div>
          <div className="map-cards">
            {maps.map((map) => {
              const stars = getStarsForLives(bestLives[map.id] ?? 0);
              const name = localized(map);
              return (
                <Link href={map.id === 'forest' ? '/play' : `/play/${map.id}`} className="map-card" key={map.id} aria-label={t.playMap(name)} aria-description={t.starsOfThree(stars)}>
                  <div className={`map-cover cover-${map.theme.biome}`}><Image src={`/images/map-${map.id}.webp`} alt="" fill unoptimized sizes="(max-width: 650px) 100vw, 33vw" /></div>
                  <div className="map-card-content">
                    <div className="map-card-kicker"><span>{t.difficulties[map.difficulty]}</span><Stars count={stars} /></div>
                    <h3>{name}</h3>
                    <p>{language === 'en' ? map.subtitleEn : map.subtitle}</p>
                    <span className="map-card-action">{t.play} <ArrowRight size={16} aria-hidden="true" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
