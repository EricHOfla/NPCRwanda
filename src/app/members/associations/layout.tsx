import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "Disability Sports Associations | NPCRwanda",
  description: "Affiliated district and regional disability sports associations developing Paralympic sports across the provinces of Rwanda.",
  path: "/members/associations",
});

export default function AssociationsLayout({ children }: { children: React.ReactNode }) {
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
        "name": "Associations",
        "url": "/members/associations"
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
