import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { campaignExpeditions, getCampaignExpedition } from '@/data/campaign';
import { ExpeditionScreen } from '@/ui/ExpeditionScreen';

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return campaignExpeditions.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const expedition = getCampaignExpedition((await params).id);
  if (!expedition) notFound();
  return { title: expedition.map.name, description: expedition.map.description };
}

export default async function ExpeditionPage({ params }: PageProps) {
  const expedition = getCampaignExpedition((await params).id);
  if (!expedition) notFound();
  return <ExpeditionScreen key={expedition.id} expedition={expedition} />;
}
