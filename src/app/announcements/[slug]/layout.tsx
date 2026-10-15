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
    description: `NPC Rwanda official announcement: ${title}. Important notice for athletes, coaches, and the Rwandan para-sport community.`,
    alternates: { canonical: `https://npcrwanda.org/announcements/${slug}` },
    openGraph: {
      title: `${title} | NPC Rwanda Announcements`,
      description: `Official NPC Rwanda announcement: ${title}`,
      url: `https://npcrwanda.org/announcements/${slug}`,
      images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
    },
  };
}

export default function AnnouncementArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
