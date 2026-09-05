import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "Executive Committee & Leadership | NPCRwanda",
  description: "Meet the executive board, administrative leadership, and commissioners steering the National Paralympic Committee of Rwanda.",
  path: "/leaders",
});

export default function LeadersLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    {
        "name": "Home",
        "url": "/"
    },
    {
        "name": "Leadership",
        "url": "/leaders"
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
