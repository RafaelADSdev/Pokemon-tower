'use client';

import Image from 'next/image';
import { ArrowDown, Compass } from 'lucide-react';
import { brand } from '@/config/brand';
import { CampaignHub } from './CampaignHub';
import { useLocale } from './locale';
import { SiteHeader } from './SiteHeader';

export function HomeScreen() {
  const { t } = useLocale();
  return (
    <>
      <SiteHeader active="maps" />
      <main>
        <section className="entry flex items-center" aria-labelledby="home-title">
          <picture className="entry-art">
            <source media="(max-width: 650px)" srcSet="/images/amber-trail-mobile.webp" />
            <Image src="/images/amber-trail.webp" alt="" fill unoptimized fetchPriority="high" sizes="100vw" />
          </picture>
          <Image src="/images/pokemon/4-hero.webp" alt="" width={600} height={600} unoptimized className="entry-pokemon entry-charmander" />
          <Image src="/images/pokemon/25-hero.webp" alt="" width={600} height={600} unoptimized className="entry-pokemon entry-pikachu" />
          <div className="entry-content">
            <p className="section-kicker"><Compass size={16} aria-hidden="true" /> Tower defense 3D</p>
            <h1 id="home-title">{brand.name}</h1>
            <p className="entry-description">{t.hero}</p>
            <a href="#expedicoes" className="gold-button">{t.chooseExpedition} <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </section>
        <CampaignHub />
      </main>
    </>
  );
}
