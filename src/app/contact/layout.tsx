import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with NPC Rwanda — find our address, phone, email, and send us a message. We\'re here to support athletes, partners, and the para-sport community.',
  keywords: ['NPC Rwanda', 'contact', 'address', 'phone', 'email', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/contact' },
  openGraph: {
    title: 'Contact NPC Rwanda',
    description: 'Reach out to the National Paralympic Committee of Rwanda.',
    url: 'https://npcrwanda.org/contact',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
