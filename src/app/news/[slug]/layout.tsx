import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams =
    params && typeof (params as Promise<{ slug: string }>).then === 'function'
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });

  const slug = resolvedParams?.slug ?? '';
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title,
    description: `Read the full NPC Rwanda news article: ${title}. Stay updated on para-sport events, athlete achievements, and organizational news from Rwanda.`,
    alternates: { canonical: `https://npcrwanda.org/news/${slug}` },
    openGraph: {
      title: `${title} | NPC Rwanda`,
      description: `NPC Rwanda news: ${title}`,
      url: `https://npcrwanda.org/news/${slug}`,
      images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
    },
  };
}

export default function NewsArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
