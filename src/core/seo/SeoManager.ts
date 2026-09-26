/**
 * EditMee SEO & Document Head Metadata Manager
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolDefinition } from '../../types';
import { getToolContent } from '../../data/toolDescriptions';
import { getToolCanonicalPath, CANONICAL_ORIGIN } from '../routing/toolUrls';

export interface PageMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  robots?: string;
  ogType?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
}

/**
 * Check if running in production canonical domain
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'editmee.com' || hostname === 'www.editmee.com';
}

/**
 * Determine robots meta value based on production domain check
 */
export function getRobotsDirective(override?: string): string {
  if (override) return override;
  // Indexable only on canonical production domain (editmee.com)
  // Preview environments (like editmee.ai.studio or localhost) must NOT be indexed
  return isProductionDomain() ? 'index, follow' : 'noindex, nofollow';
}

export const DEFAULT_APP_METADATA: PageMetadata = {
  title: 'EditMee — Universal Digital-Work Platform | Free PDF, Image & Office Tools',
  description:
    'Universal digital-work platform with client-first PDF editing, image studio, document & resume builders, data analytics, developer utilities, calculators, and EditMee AI intelligence.',
  canonicalPath: '/',
  robots: getRobotsDirective(),
  ogType: 'website',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'EditMee',
      url: 'https://editmee.com/',
      description:
        'Universal client-side digital work platform for PDF editing, image processing, documents, developer utilities, and AI productivity tools.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://editmee.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'EditMee',
      applicationCategory: 'BusinessApplication, UtilitiesApplication',
      operatingSystem: 'Any (Web Browser)',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      description:
        'Universal digital productivity suite featuring in-browser PDF editing, image conversion, ATS resume architect, and client-side data utilities.',
    },
  ],
};

export const LEGAL_PAGES_METADATA: Record<string, PageMetadata> = {
  'privacy-policy': {
    title: 'Privacy Policy — EditMee Universal Workplace Suite',
    description:
      'Official EditMee Privacy Policy. Learn about our strict zero-server-upload architecture, local-first browser computation, cryptographic security, cookies, user rights, and data protection practices.',
    canonicalPath: '/privacy-policy/',
    robots: getRobotsDirective(),
    ogType: 'article',
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions — EditMee',
    description:
      'Read the complete Terms and Conditions for EditMee. Understand user responsibilities, permissible tool usage, 100% intellectual property ownership of generated documents, and service terms.',
    canonicalPath: '/terms-and-conditions/',
    robots: getRobotsDirective(),
    ogType: 'article',
  },
  'security-architecture': {
    title: 'Security Architecture & Client-First Threat Model — EditMee',
    description:
      'Explore the technical security architecture of EditMee. Learn how WebAssembly sandboxing, in-memory processing, AES-256 client encryption, and zero remote transit protect sensitive files.',
    canonicalPath: '/security-architecture/',
    robots: getRobotsDirective(),
    ogType: 'article',
  },
  'about-us': {
    title: 'About Us — EditMee Privacy-First Digital Tools',
    description:
      'Learn about EditMee, our founding mission to liberate users from heavy cloud lock-in, and our engineering commitment to fast, private, and secure in-browser productivity tools.',
    canonicalPath: '/about-us/',
    robots: getRobotsDirective(),
    ogType: 'website',
  },
  'contact-us': {
    title: 'Contact Us & Corporate Helpdesk — EditMee',
    description:
      'Get in touch with EditMee technical support, security officers, and enterprise partnerships. Reach us directly at support@editmee.com, contact@editmee.com, or admin@editmee.com.',
    canonicalPath: '/contact-us/',
    robots: getRobotsDirective(),
    ogType: 'website',
  },
  disclaimer: {
    title: 'Legal Disclaimer & Output Verification Notices — EditMee',
    description:
      'Important notices, document verification recommendations, and technical disclaimers regarding generated files and financial calculators on the EditMee platform.',
    canonicalPath: '/disclaimer/',
    robots: getRobotsDirective(),
    ogType: 'website',
  },
};

/**
 * Generate rich SEO metadata for any tool
 */
export function getToolSeoMetadata(tool: ToolDefinition): PageMetadata {
  const content = getToolContent(tool.id, tool.category, tool.name);
  const canonicalPath = getToolCanonicalPath(tool.id);
  const fullCanonicalUrl = `${CANONICAL_ORIGIN}${canonicalPath}`;

  const cleanDesc = (content.shortDescription || tool.description || '')
    .replace(/\s+/g, ' ')
    .trim();
  const description =
    cleanDesc.length > 155
      ? cleanDesc.slice(0, 152) + '...'
      : cleanDesc;

  const featureList = content.features?.map((f) => f.title).join(', ') || 'Client-side processing, Zero server upload, Instant execution';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://editmee.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `${tool.category.toUpperCase()} Tools`,
          item: `https://editmee.com/category/${tool.category}/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.name,
          item: fullCanonicalUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: fullCanonicalUrl,
      applicationCategory: `${tool.category.toUpperCase()}Application`,
      operatingSystem: 'Any Web Browser (Chrome, Safari, Firefox, Edge, Mobile WebKit)',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      featureList,
      browserRequirements: 'Requires JavaScript. Runs 100% locally in browser without server upload.',
    },
  ];

  return {
    title: `${tool.name} — Free Online Tool | EditMee`,
    description,
    canonicalPath,
    keywords: `${tool.name}, ${tool.category} online tool, free ${tool.name}, browser tool, client-side privacy, EditMee`,
    robots: getRobotsDirective(),
    ogType: 'website',
    structuredData,
  };
}

/**
 * Generate SEO metadata for category listing pages
 */
export function getCategorySeoMetadata(categoryId: string): PageMetadata {
  const catName = categoryId.toUpperCase();
  const canonicalPath = `/category/${categoryId.toLowerCase()}/`;

  return {
    title: `${catName} Tools & Online Utilities | EditMee`,
    description: `Explore all high-performance ${catName} online utilities. 100% free, private, client-side file, document and media processing directly in your browser.`,
    canonicalPath,
    keywords: `${categoryId} tools, online ${categoryId} editor, free ${categoryId} utilities, EditMee`,
    robots: getRobotsDirective(),
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${catName} Tools — EditMee`,
      url: `${CANONICAL_ORIGIN}${canonicalPath}`,
      description: `Free, client-side ${catName} tools and utilities on EditMee.`,
    },
  };
}

/**
 * Generate SEO metadata for 404 Not Found pages
 */
export function getNotFoundSeoMetadata(path: string): PageMetadata {
  return {
    title: 'Page Not Found (404) — EditMee',
    description: 'The requested tool or page could not be found on EditMee. Browse our directory of 500+ free client-side tools.',
    canonicalPath: path.startsWith('/') ? path : `/${path}`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  };
}

/**
 * Updates document head with appropriate SEO and Social tags
 */
export function updateDocumentHead(meta: PageMetadata) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = meta.title;

  // Meta Description
  updateMetaTag('description', meta.description);

  // Meta Robots
  const robots = getRobotsDirective(meta.robots);
  updateMetaTag('robots', robots);

  // Open Graph
  updateMetaProperty('og:title', meta.title);
  updateMetaProperty('og:description', meta.description);
  updateMetaProperty('og:type', meta.ogType || 'website');
  updateMetaProperty('og:site_name', 'EditMee');
  updateMetaProperty('og:image', `${CANONICAL_ORIGIN}/editmee-logo.svg`);

  // Canonical Link: Always use canonical preferred domain (https://editmee.com)
  const cleanPath = meta.canonicalPath.startsWith('/') ? meta.canonicalPath : `/${meta.canonicalPath}`;
  const fullCanonicalUrl = `${CANONICAL_ORIGIN}${cleanPath}`;
  updateMetaProperty('og:url', fullCanonicalUrl);
  updateCanonicalLink(fullCanonicalUrl);

  // Twitter Card
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', meta.title);
  updateMetaTag('twitter:description', meta.description);
  updateMetaTag('twitter:image', `${CANONICAL_ORIGIN}/editmee-logo.svg`);

  // Structured Data (JSON-LD)
  updateStructuredData(meta.structuredData || DEFAULT_APP_METADATA.structuredData);
}

function updateMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateStructuredData(data?: Record<string, any> | Record<string, any>[]) {
  if (!data) return;
  let script = document.getElementById('editmee-structured-data') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.id = 'editmee-structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export const SeoManager = {
  updateDocumentHead,
  getToolSeoMetadata,
  getCategorySeoMetadata,
  getNotFoundSeoMetadata,
  isProductionDomain,
  getRobotsDirective,
  DEFAULT_APP_METADATA,
  LEGAL_PAGES_METADATA,
};
