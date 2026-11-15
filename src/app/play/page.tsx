import type { Metadata } from 'next';
import { forestMap } from '@/data/maps/forest';
import { Battlefield } from '@/ui/Battlefield';

export const metadata: Metadata = { title: 'Campo de batalha' };

export default function PlayPage() {
  return <Battlefield map={forestMap} />;
}
