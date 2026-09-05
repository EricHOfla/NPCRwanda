import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "National Para Sports Federations | NPCRwanda",
  description: "National sports federations affiliated with the National Paralympic Committee of Rwanda.",
  path: "/members/federations",
});

export default function FederationsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    {
        "name": "Home",
        "url": "/"
    },
    {
        "name": "Members",
        "url": "/about"
    },
    {
        "name": "Federations",
        "url": "/members/federations"
    }
]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
