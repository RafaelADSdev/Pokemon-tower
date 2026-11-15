'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { en, pt } from './messages';

type Language = 'pt-BR' | 'en';
const key = 'critter-defense.locale';
const change = 'critter-defense:locale';
const LocaleContext = createContext<Language>('pt-BR');
let sessionLanguage: Language | undefined;

function getLanguage(): Language {
  try { return sessionLanguage ?? (window.localStorage.getItem(key) === 'en' ? 'en' : 'pt-BR'); }
  catch { return sessionLanguage ?? 'pt-BR'; }
}

function subscribe(callback: () => void) {
  window.addEventListener(change, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(change, callback);
    window.removeEventListener('storage', callback);
  };
}

export function toggleLanguage() {
  const next = getLanguage() === 'en' ? 'pt-BR' : 'en';
  try {
    window.localStorage.setItem(key, next);
    sessionLanguage = undefined;
  } catch { sessionLanguage = next; }
  window.dispatchEvent(new Event(change));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguage, () => 'pt-BR' as const);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LocaleContext.Provider value={language}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const language = useContext(LocaleContext);
  return {
    language,
    t: language === 'en' ? en : pt,
    localized: (item: { name: string; nameEn: string }) => language === 'en' ? item.nameEn : item.name,
    describe: (item: { description: string; descriptionEn: string }) => language === 'en' ? item.descriptionEn : item.description,
  };
}
