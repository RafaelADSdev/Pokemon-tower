import { Star } from 'lucide-react';
import { useLocale } from './locale';

export function Stars({ count, size = 17 }: { count: number; size?: number }) {
  const { t } = useLocale();
  return (
    <span className="map-stars" aria-label={t.starsOfThree(count)} role="img">
      {[1, 2, 3].map((value) => <Star key={value} aria-hidden="true" size={size} className={value <= count ? 'earned' : undefined} fill={value <= count ? 'currentColor' : 'none'} />)}
    </span>
  );
}
