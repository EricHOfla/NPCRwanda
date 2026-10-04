import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  generatePageMetadata,
  getArticleJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo';
import { normalizeSlug } from '@/lib/slug';

interface AnnouncementLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function findArticleBySlug(slug: string) {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const clean = normalizeSlug(slug);

  // 1. Direct query
  let article = await prisma.newsArticle.findFirst({
    where: {
      OR: [
        { slug },
        { slug: decoded },
        { slug: clean },
        { id: slug },
      ],
    },
    select: {
      id: true,
      title: true,
      desc: true,
      img: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      slug: true,
    },
  });

  // 2. Normalized fallback
  if (!article) {
    const all = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        desc: true,
        img: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
      },
    });
    article = all.find(a => 
      a.id === slug ||
      a.slug.toLowerCase() === slug.toLowerCase() ||
      a.slug.toLowerCase() === decoded.toLowerCase() ||
      normalizeSlug(a.slug) === clean
    ) || null;
  }

  return article;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await findArticleBySlug(slug);

    if (!article) {
      return generatePageMetadata({
        title: 'Announcement Not Found',
        description: 'The requested announcement could not be found.',
        path: `/announcements/${slug}`,
        noIndex: true,
      });
    }

    return generatePageMetadata({
      title: article.title,
      description: article.desc || article.title,
      path: `/announcements/${slug}`,
      image: article.img || undefined,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category || 'Announcements',
    });
  } catch (error) {
    console.error('[AnnouncementMetadata] Error loading announcement metadata:', error);
    return generatePageMetadata({
      title: 'Official Announcement',
      description: 'Read the latest official announcements from NPC Rwanda.',
      path: `/announcements/${slug}`,
    });
  }
}

export default async function AnnouncementLayout({
  children,
  params,
}: AnnouncementLayoutProps) {
  const { slug } = await params;
  let articleJsonLd = null;

  try {
    const article = await findArticleBySlug(slug);

    if (article) {
      articleJsonLd = getArticleJsonLd({
        title: article.title,
        description: article.desc || article.title,
        url: `/announcements/${slug}`,
        imageUrl: article.img,
        datePublished: article.createdAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    console.error('[AnnouncementLayout] Error preparing JSON-LD:', error);
  }

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Announcements', url: '/announcements' },
    { name: slug, url: `/announcements/${slug}` },
  ]);

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {children}
    </>
  );
}
