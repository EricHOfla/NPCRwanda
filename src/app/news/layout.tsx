import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "Latest Paralympic News & Stories | NPCRwanda",
  description: "Official news, competition results, athlete stories, press releases, and updates from the National Paralympic Committee of Rwanda.",
  path: "/news",
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    {
        "name": "Home",
        "url": "/"
    },
    {
        "name": "News",
        "url": "/news"
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
