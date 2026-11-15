import Link from 'next/link';
import { BookOpen, Map, Sprout } from 'lucide-react';
import { brand } from '@/config/brand';
import { toggleLanguage, useLocale } from './locale';

export function SiteHeader({ active, action }: { active?: 'maps' | 'collection' | 'battle'; action?: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <header className="battle-header site-header">
      <Link href="/" className="wordmark"><span>{active ? <i className="league-ball" aria-hidden="true" /> : <Sprout size={20} aria-hidden="true" />}</span>{brand.name}</Link>
      <div className="site-tools">
        <nav className="site-nav" aria-label={t.navigation}>
          <Link href="/#expedicoes" aria-current={active === 'maps' ? 'page' : undefined}><Map size={16} aria-hidden="true" /> {t.expeditions}</Link>
          <Link href="/collection" aria-current={active === 'collection' ? 'page' : undefined}><BookOpen size={16} aria-hidden="true" /> {t.collection}</Link>
        </nav>
        {action}
        <button type="button" className="site-control" aria-label={t.languageSwitch} onClick={toggleLanguage}>{t.languageCode}</button>
      </div>
    </header>
  );
}
