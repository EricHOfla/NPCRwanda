import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Staff Login | NPC Rwanda',
  description: 'Administrative and staff authentication portal for the National Paralympic Committee of Rwanda.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
