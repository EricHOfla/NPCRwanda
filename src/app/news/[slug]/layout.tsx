import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  generatePageMetadata,
  getArticleJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo';

interface ArticleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      select: {
        title: true,
        desc: true,
        img: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      return generatePageMetadata({
        title: 'Article Not Found',
        description: 'The requested news article could not be found.',
        path: `/news/${slug}`,
        noIndex: true,
      });
    }

    return generatePageMetadata({
      title: article.title,
      description: article.desc || article.title,
      path: `/news/${slug}`,
      image: article.img || undefined,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category || 'Sports',
    });
  } catch (error) {
    console.error('[ArticleMetadata] Error loading article metadata:', error);
    return generatePageMetadata({
      title: 'News Article',
      description: 'Read the latest Paralympic news from Rwanda.',
      path: `/news/${slug}`,
    });
  }
}

export default async function ArticleLayout({
  children,
  params,
}: ArticleLayoutProps) {
  const { slug } = await params;
  let articleJsonLd = null;
  let articleTitle = 'News Article';

  try {
    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      select: {
        title: true,
        desc: true,
        img: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (article) {
      articleTitle = article.title;
      articleJsonLd = getArticleJsonLd({
        title: article.title,
        description: article.desc || article.title,
        url: `/news/${slug}`,
        imageUrl: article.img,
        datePublished: article.createdAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    console.error('[ArticleLayout] Error preparing JSON-LD:', error);
  }

  const breadcrumbs = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'News', url: '/news' },
    { name: articleTitle, url: `/news/${slug}` },
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
