import Link from 'next/link';
import { BookOpen, Map, Sprout } from 'lucide-react';
import { brand } from '@/config/brand';

export function SiteHeader({ active }: { active?: 'maps' | 'collection' }) {
  return (
    <header className="battle-header site-header">
      <Link href="/" className="wordmark"><span><Sprout size={20} aria-hidden="true" /></span>{brand.name}</Link>
      <nav className="site-nav" aria-label="Navegação principal">
        <Link href="/#expedicoes" aria-current={active === 'maps' ? 'page' : undefined}><Map size={16} aria-hidden="true" /> Expedições</Link>
        <Link href="/collection" aria-current={active === 'collection' ? 'page' : undefined}><BookOpen size={16} aria-hidden="true" /> Coleção</Link>
      </nav>
    </header>
  );
}
