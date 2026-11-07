/**
 * PublicLayout – Wraps public-facing pages with the shared Header and Footer.
 * Use this in public page layouts to avoid importing Header/Footer separately.
 */
'use client';
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
