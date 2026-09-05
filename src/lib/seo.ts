import type { Metadata } from 'next';

export const SITE_CONFIG = {
  siteName: 'NPCRwanda',
  fullName: 'National Paralympic Committee of Rwanda',
  siteUrl: 'https://npcrwanda.org',
  defaultTitle: 'NPCRwanda | National Paralympic Committee of Rwanda',
  titleTemplate: '%s | NPCRwanda',
  defaultDescription:
    'Official website of the National Paralympic Committee of Rwanda (NPC Rwanda). Dedicated to the development of Paralympic sports, empowering Rwandan para-athletes, and fostering inclusion through athletic excellence.',
  defaultOgImage: 'https://npcrwanda.org/assets/img/logo.png',
  locale: 'en_RW',
  address: {
    streetAddress: 'Amahoro National Stadium, Remera',
    addressLocality: 'Kigali',
    addressRegion: 'Kigali City',
    addressCountry: 'RW',
  },
  contact: {
    email: 'info@npcrwanda.org',
    phone: '+250 788 400 887',
  },
  sameAs: [
    'https://facebook.com/npcrwanda',
    'https://twitter.com/npcrwanda',
    'https://instagram.com/npcrwanda',
    'https://youtube.com/npcrwanda',
  ],
};

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  authors?: string[];
  tags?: string[];
}

/**
 * Helper to ensure absolute URL for images and canonical paths
 */
export function getAbsoluteUrl(urlPath: string): string {
  if (!urlPath) return SITE_CONFIG.siteUrl;
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  const cleanPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
  return `${SITE_CONFIG.siteUrl}${cleanPath}`;
}

/**
 * Generate standard Next.js Metadata for any public page
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    image,
    noIndex = false,
    keywords = [],
    type = 'website',
    publishedTime,
    modifiedTime,
    section,
    authors,
    tags,
  } = options;

  const canonicalUrl = getAbsoluteUrl(path);
  const imageUrl = image ? getAbsoluteUrl(image) : SITE_CONFIG.defaultOgImage;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.fullName,
      locale: SITE_CONFIG.locale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            section,
            authors: authors && authors.length > 0 ? authors : [SITE_CONFIG.fullName],
            tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@npcrwanda',
      creator: '@npcrwanda',
    },
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}

/**
 * Organization JSON-LD Schema
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    '@id': `${SITE_CONFIG.siteUrl}/#organization`,
    name: SITE_CONFIG.fullName,
    alternateName: ['NPC Rwanda', 'NPCRwanda', 'National Paralympic Committee of Rwanda'],
    url: SITE_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.siteUrl}/assets/img/logo.png`,
      caption: 'NPC Rwanda Logo',
    },
    image: `${SITE_CONFIG.siteUrl}/assets/img/logo.png`,
    description: SITE_CONFIG.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.phone,
      contactType: 'general inquiries',
      email: SITE_CONFIG.contact.email,
      availableLanguage: ['English', 'Kinyarwanda', 'French'],
    },
    sameAs: SITE_CONFIG.sameAs,
  };
}

/**
 * Article JSON-LD Schema
 */
export function getArticleJsonLd(article: {
  title: string;
  desc?: string;
  description?: string;
  slug?: string;
  url?: string;
  img?: string;
  imageUrl?: string;
  date?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  datePublished?: string | Date;
  dateModified?: string | Date;
}) {
  const finalUrl = article.url 
    ? getAbsoluteUrl(article.url) 
    : article.slug 
    ? getAbsoluteUrl(`/news/${article.slug}`) 
    : SITE_CONFIG.siteUrl;

  const rawImage = article.imageUrl || article.img;
  const finalImage = rawImage ? getAbsoluteUrl(rawImage) : SITE_CONFIG.defaultOgImage;
  const description = article.description || article.desc || article.title;
  const pubDate = article.datePublished || article.createdAt;
  const modDate = article.dateModified || article.updatedAt || pubDate;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${finalUrl}#article`,
    headline: article.title,
    description,
    url: finalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': finalUrl,
    },
    image: [finalImage],
    datePublished: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    dateModified: modDate ? new Date(modDate).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
      url: SITE_CONFIG.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
      url: SITE_CONFIG.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/assets/img/logo.png`,
      },
    },
  };
}

/**
 * BreadcrumbList JSON-LD Schema
 */
export function getBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string; url?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url || item.path || '/'),
    })),
  };
}
