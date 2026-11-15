import Image from 'next/image';

export function GymBadge({ badge, size }: { badge: string; size: number }) {
  return (
    <Image
      className="gym-badge-art"
      src={`/images/badges/${badge.toLowerCase()}.png`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      unoptimized
    />
  );
}
