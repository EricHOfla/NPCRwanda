'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18N, PHRASE_I18N } from '../data/translations';

type Language = 'en' | 'fr' | 'rw';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load language from localStorage after mounting
    const savedLang = localStorage.getItem('site_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'rw')) {
      setLangState(savedLang);
    }
    setIsHydrated(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('site_lang', newLang);
    // Update HTML element lang attribute
    document.documentElement.lang = newLang === 'rw' ? 'rw' : newLang;
  };

  const t = (key: string): string => {
    if (!key) return '';
    
    if (key.startsWith('phrase.')) {
      const phrase = key.slice(7);
      if (lang === 'en') return phrase;
      const mapped = PHRASE_I18N[lang] && PHRASE_I18N[lang][phrase];
      return mapped || phrase;
    }
    
    const translated = I18N[lang]?.[key] || I18N['en']?.[key];
    return translated !== undefined ? translated : key;
  };

  // Prevent flash of default language if user preferred another
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div style={{ visibility: isHydrated ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
