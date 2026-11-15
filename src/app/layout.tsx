import type { Metadata } from 'next';
import { brand } from '@/config/brand';
import './globals.css';

export const metadata: Metadata = { title: { default: brand.name, template: `%s | ${brand.name}` }, description: brand.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
