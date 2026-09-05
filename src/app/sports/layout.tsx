import React from 'react';
import type { Metadata } from 'next';
import { generatePageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: "Para Sports Programs in Rwanda | NPCRwanda",
  description: "Explore Paralympic sports disciplines in Rwanda including sitting volleyball, para athletics, para powerlifting, goalball, wheelchair basketball, and grassroots development.",
  path: "/sports",
});

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    {
        "name": "Home",
        "url": "/"
    },
    {
        "name": "Para Sports",
        "url": "/sports"
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
