import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMapId, mapById, maps } from '@/data/maps';
import { Battlefield } from '@/ui/Battlefield';

type MapPageProps = { params: Promise<{ map: string }> };

export function generateStaticParams() {
  return maps.map(({ id }) => ({ map: id }));
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { map } = await params;
  if (!isMapId(map)) notFound();
  return { title: mapById[map].name };
}

export default async function MapPage({ params }: MapPageProps) {
  const { map } = await params;
  if (!isMapId(map)) notFound();
  return <Battlefield key={map} map={mapById[map]} />;
}
