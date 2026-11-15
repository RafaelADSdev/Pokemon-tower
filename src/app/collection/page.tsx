import type { Metadata } from 'next';
import { CollectionScreen } from '@/ui/CollectionScreen';

export const metadata: Metadata = { title: 'Coleção' };

export default function CollectionPage() {
  return <CollectionScreen />;
}
