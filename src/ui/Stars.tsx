import { Star } from 'lucide-react';

export function Stars({ count, size = 17 }: { count: number; size?: number }) {
  return (
    <span className="map-stars" aria-label={`${count} de 3 estrelas`} role="img">
      {[1, 2, 3].map((value) => <Star key={value} aria-hidden="true" size={size} className={value <= count ? 'earned' : undefined} fill={value <= count ? 'currentColor' : 'none'} />)}
    </span>
  );
}
