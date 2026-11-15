'use client';

import Image from 'next/image';
import { ArrowDown, Compass } from 'lucide-react';
import { type MouseEvent, useRef } from 'react';
import { brand } from '@/config/brand';
import { CampaignHub } from './CampaignHub';
import { HeroAmbience } from './HeroAmbience';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';
import './league-ui.css';
import './league.css';

function scrollToCampaign(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const { hash } = event.currentTarget;
  const campaign = document.getElementById(hash.slice(1));
  if (!campaign) return;

  event.preventDefault();
  if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  campaign.focus({ preventScroll: true });
  campaign.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function HomeScreen() {
  const { t } = useLocale();
  const heroArt = useRef<HTMLImageElement>(null);
  return (
    <div className="league-ui league-home">
      <SiteHeader active="maps" />
      <main>
        <section className="entry flex items-center" aria-labelledby="home-title">
          <picture className="entry-art">
            <source media="(max-width: 650px)" srcSet="/images/amber-trail-mobile.webp" />
            <Image ref={heroArt} src="/images/amber-trail.webp" alt="" fill unoptimized fetchPriority="high" loading="eager" sizes="100vw" />
          </picture>
          <Image src="/images/pokemon/4-hero.webp" alt="" width={600} height={600} unoptimized className="entry-pokemon entry-charmander" />
          <Image src="/images/pokemon/25-hero.webp" alt="" width={600} height={600} unoptimized className="entry-pokemon entry-pikachu" />
          <div className="entry-content">
            <p className="section-kicker"><Compass size={16} aria-hidden="true" /> Tower defense 3D</p>
            <h1 id="home-title">{brand.name}</h1>
            <p className="entry-description">{t.hero}</p>
            <a href="#expedicoes" className="gold-button" onClick={scrollToCampaign}>{t.chooseExpedition} <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <HeroAmbience art={heroArt} />
        </section>
        <CampaignHub />
      </main>
    </div>
  );
}
