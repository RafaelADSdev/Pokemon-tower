import type { Metadata } from 'next';
import { brand } from '@/config/brand';
import { LocaleProvider } from '@/ui/locale';
import '@fontsource/dm-serif-text/latin-400.css';
import '@fontsource-variable/instrument-sans';
import './globals.css';

export const metadata: Metadata = { title: { default: brand.name, template: `%s | ${brand.name}` }, description: brand.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><LocaleProvider>{children}</LocaleProvider></body></html>;
}
