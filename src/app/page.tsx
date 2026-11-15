import Link from 'next/link';
import { ArrowRight, Sprout } from 'lucide-react';
import { brand } from '@/config/brand';

export default function HomePage() {
  return (
    <main className="entry flex min-h-dvh items-center">
      <div className="entry-content">
        <div className="entry-emblem"><Sprout aria-hidden="true" /></div>
        <h1>{brand.name}</h1>
        <p>{brand.description}</p>
        <Link href="/play" className="gold-button">Jogar <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </main>
  );
}
