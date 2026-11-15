'use client';

import Link from 'next/link';
import { ArrowDown, ArrowRight, Compass, Flame, Mountain, Trees } from 'lucide-react';
import { brand } from '@/config/brand';
import { maps } from '@/data/maps';
import { getStarsForLives } from '@/data/progression';
import { SiteHeader } from './SiteHeader';
import { Stars } from './Stars';
import { useProgress } from './useProgress';

const biomeIcons = { forest: Trees, cave: Mountain, volcano: Flame };
const difficulties = { intro: 'Introdução', standard: 'Intermediário', expert: 'Avançado' };

export function HomeScreen() {
  const { bestLives } = useProgress();
  return (
    <>
      <SiteHeader active="maps" />
      <main>
        <section className="entry flex items-center" aria-labelledby="home-title">
          <div className="entry-content">
            <p className="section-kicker"><Compass size={16} aria-hidden="true" /> Tower defense 3D</p>
            <h1 id="home-title">{brand.name}</h1>
            <p className="entry-description">Posicione suas criaturas, combine seus elementos e resista às ondas que ameaçam cada região.</p>
            <a href="#expedicoes" className="gold-button">Escolher expedição <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </section>
        <section id="expedicoes" className="expeditions" aria-labelledby="expedition-title">
          <div className="section-heading">
            <h2 id="expedition-title">Expedições</h2>
            <p>30 ondas por região</p>
          </div>
          <div className="map-cards">
            {maps.map((map) => {
              const Icon = biomeIcons[map.theme.biome];
              const stars = getStarsForLives(bestLives[map.id] ?? 0);
              return (
                <Link href={map.id === 'forest' ? '/play' : `/play/${map.id}`} className="map-card" key={map.id} aria-label={`Jogar ${map.name}`}>
                  <div className={`map-cover cover-${map.theme.biome}`}><Icon size={38} strokeWidth={1.25} aria-hidden="true" /></div>
                  <div className="map-card-content">
                    <div className="map-card-kicker"><span>{difficulties[map.difficulty]}</span><Stars count={stars} /></div>
                    <h3>{map.name}</h3>
                    <p>{map.subtitle}</p>
                    <span className="map-card-action">Jogar <ArrowRight size={16} aria-hidden="true" /></span>
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
