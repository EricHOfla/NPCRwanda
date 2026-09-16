import type { Metadata } from 'next';

export const SITE_CONFIG = {
  siteName: 'NPC Rwanda (NPCRwanda)',
  brandName: 'NPC Rwanda',
  fullName: 'National Paralympic Committee of Rwanda',
  shortName: 'NPC Rwanda',
  siteUrl: 'https://npcrwanda.org',
  defaultTitle: 'NPC Rwanda (NPCRwanda) - National Paralympic Committee of Rwanda | Official Website',
  titleTemplate: '%s | NPC Rwanda (NPCRwanda)',
  defaultDescription:
    'Official website of the National Paralympic Committee of Rwanda - NPC Rwanda (NPCRwanda). Dedicated to Paralympic sports, sitting volleyball, empowering Rwandan para-athletes, and driving national inclusion through athletic excellence.',
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
    phone: '+250 788 672 739',
  },
  sameAs: [
    'https://www.paralympic.org/rwanda',
    'https://en.wikipedia.org/wiki/National_Paralympic_Committee_of_Rwanda',
    'https://www.wikidata.org/wiki/Q16955743',
    'https://facebook.com/npcrwanda',
    'https://twitter.com/npcrwanda',
    'https://instagram.com/npcrwanda',
    'https://youtube.com/npcrwanda',
  ],
};

export const GLOBAL_KEYWORDS = [
  'NPC Rwanda',
  'npc rwanda',
  'NPCRwanda',
  'npcrwanda',
  'National Paralympic Committee of Rwanda',
  'Rwanda Paralympic Committee',
  'Comité National Paralympique du Rwanda',
  'Paralympic Games Rwanda',
  'Sitting Volleyball Rwanda',
  'Para Athletics Rwanda',
  'Para Sports Rwanda',
  'Rwandan Paralympians',
  'Amahoro Stadium Kigali',
  'NPCRwanda official website',
];

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

  const fullTitle =
    title.includes('NPC Rwanda') || title.includes('National Paralympic Committee')
      ? title
      : `${title} | NPC Rwanda`;

  return {
    title: {
      absolute: fullTitle,
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
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
      locale: SITE_CONFIG.locale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
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
      title: fullTitle,
      description,
      images: [imageUrl],
      site: '@npcrwanda',
      creator: '@npcrwanda',
    },
    keywords: keywords.length > 0 ? keywords : GLOBAL_KEYWORDS,
  };
}

/**
 * WebSite JSON-LD Schema (Used by Google for Search Result Site Names)
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.siteUrl}/#website`,
    url: SITE_CONFIG.siteUrl,
    name: 'NPC Rwanda',
    alternateName: [
      'NPCRwanda',
      'npcrwanda',
      'NPC Rwanda',
      'National Paralympic Committee of Rwanda',
      'Comité National Paralympique du Rwanda',
      'NPC Rwanda Official Website',
    ],
    publisher: {
      '@id': `${SITE_CONFIG.siteUrl}/#organization`,
    },
    inLanguage: ['en-RW', 'rw-RW', 'fr-RW'],
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
    name: 'National Paralympic Committee of Rwanda',
    legalName: 'National Paralympic Committee of Rwanda',
    alternateName: [
      'NPC Rwanda',
      'NPCRwanda',
      'npcrwanda',
      'National Paralympic Committee of Rwanda',
      'Comité National Paralympique du Rwanda',
      'Rwanda Paralympic Committee',
    ],
    url: SITE_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.siteUrl}/assets/img/logo.png`,
      caption: 'National Paralympic Committee of Rwanda (NPC Rwanda) Logo',
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
