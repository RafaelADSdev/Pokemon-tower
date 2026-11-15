import type { Metadata } from 'next';
import { Battlefield } from '@/ui/Battlefield';

export const metadata: Metadata = { title: 'Campo de batalha' };

export default function PlayPage() {
  return <Battlefield />;
}
