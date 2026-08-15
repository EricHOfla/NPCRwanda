'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '../context/LanguageContext';
import { DataProvider } from '../context/DataContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';

export const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    Promise.all([
      import('aos/dist/aos.css'),
      import('aos')
    ]).then(([, mod]) => {
      const AOS = mod.default;
      AOS.init({
        once: true,
        offset: 120,
        duration: 600,
        easing: 'ease-in-out',
      });
    });
  }, []);

  return (
    <DataProvider>
      <LanguageProvider>
        {!isDashboard && <Header />}
        {isDashboard ? children : <main>{children}</main>}
        {!isDashboard && <Footer />}
        {!isDashboard && <AccessibilityWidget />}
      </LanguageProvider>
    </DataProvider>
  );
};
