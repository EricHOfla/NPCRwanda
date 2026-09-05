import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "District Paralympic Sports Committees (DPSCO) | NPCRwanda",
  description: "Directory and contacts for District Paralympic Sports Committees (DPSCO) coordinating grassroots para sports across all 30 districts of Rwanda.",
  path: "/members/dpsco",
});

export default function DpscoLayout({ children }: { children: React.ReactNode }) {
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
        "name": "DPSCO",
        "url": "/members/dpsco"
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
