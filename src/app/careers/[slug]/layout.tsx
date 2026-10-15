import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  generatePageMetadata,
  getJobPostingJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo';
import { normalizeSlug } from '@/lib/slug';

interface CareerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function findCareerBySlug(slug: string) {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const clean = normalizeSlug(slug);

  // 1. Direct query
  let job = await prisma.career.findFirst({
    where: {
      OR: [
        { slug },
        { slug: decoded },
        { slug: clean },
        { id: slug },
      ],
    },
  });

  // 2. Normalized fallback
  if (!job) {
    const all = await prisma.career.findMany();
    job = all.find(c => 
      c.id === slug ||
      c.slug.toLowerCase() === slug.toLowerCase() ||
      c.slug.toLowerCase() === decoded.toLowerCase() ||
      normalizeSlug(c.slug) === clean
    ) || null;
  }

  return job;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const job = await findCareerBySlug(slug);

    if (!job) {
      return generatePageMetadata({
        title: 'Career Not Found',
        description: 'The requested career opportunity could not be found or has expired.',
        path: `/careers/${slug}`,
        noIndex: true,
      });
    }

    const shortDesc = job.desc
      ? job.desc.replace(/<[^>]*>?/gm, '').replace(/[#*`_]/g, '').slice(0, 160).trim()
      : `${job.title} vacancy at National Paralympic Committee of Rwanda`;

    return generatePageMetadata({
      title: `${job.title} - Careers`,
      description: shortDesc,
      path: `/careers/${job.slug || slug}`,
      type: 'article',
      publishedTime: job.createdAt.toISOString(),
      modifiedTime: job.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[CareerMetadata] Error loading career metadata:', error);
    return generatePageMetadata({
      title: 'Career Opportunity',
      description: 'Explore employment opportunities with the National Paralympic Committee of Rwanda.',
      path: `/careers/${slug}`,
    });
  }
}

export default async function CareerLayout({ children, params }: CareerLayoutProps) {
  const { slug } = await params;
  const job = await findCareerBySlug(slug);

  if (!job) {
    return <>{children}</>;
  }

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Careers', url: '/careers' },
    { name: job.title, url: `/careers/${job.slug}` },
  ]);

  const cleanDescription = job.desc
    ? job.desc.replace(/<[^>]*>?/gm, '').replace(/[#*`_]/g, '').slice(0, 5000).trim()
    : job.title;

  const jobPostingJsonLd = getJobPostingJsonLd({
    title: job.title,
    description: cleanDescription,
    slug: job.slug,
    location: job.location,
    deadline: job.deadline,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      {children}
    </>
  );
}
