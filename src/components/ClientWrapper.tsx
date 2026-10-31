'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '../context/LanguageContext';
import { DataProvider } from '../context/DataContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';
import { isAdminHostname } from '@/lib/site-domain';
import { QueryProvider } from '@/components/QueryProvider';

export const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminContext = isAdminHostname();
  const isAuthOrDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname === '/login' ||
    (isAdminContext && pathname === '/');
  const animationsLoaded = useRef(false);

  useEffect(() => {
    // Admin and login screens do not use public-page scroll animations.
    // Load AOS once, after the browser has had time to render the page.
    if (isAuthOrDashboard || animationsLoaded.current) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || animationsLoaded.current) return;
      animationsLoaded.current = true;

      Promise.all([import('aos/dist/aos.css'), import('aos')])
        .then(([, mod]) => {
          if (cancelled) return;
          const AOS = mod.default;
          AOS.init({
            once: true,
            offset: 60,
            duration: 500,
            easing: 'ease-in-out',
            disable: 'mobile',
          });
          AOS.refresh();
        })
        .catch((error) => {
          // Animation is optional; never let it affect page functionality.
          console.warn('Scroll animations could not be loaded:', error);
        });
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAuthOrDashboard]);

  return (
    <QueryProvider>
      <DataProvider>
        <LanguageProvider>
          {!isAuthOrDashboard && <Header />}
          {isAuthOrDashboard ? children : <main>{children}</main>}
          {!isAuthOrDashboard && <Footer />}
          {!isAuthOrDashboard && <AccessibilityWidget />}
        </LanguageProvider>
      </DataProvider>
    </QueryProvider>
  );
};
