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
    description: `Job opportunity at NPC Rwanda: ${title}. Apply now to join Rwanda's National Paralympic Committee team.`,
    alternates: { canonical: `https://npcrwanda.org/careers/${slug}` },
    openGraph: {
      title: `${title} | NPC Rwanda Careers`,
      description: `Career opportunity at NPC Rwanda: ${title}`,
      url: `https://npcrwanda.org/careers/${slug}`,
      images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
    },
  };
}

export default function CareerDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
