/**
 * EditMee SEO & Document Head Metadata Manager
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PageMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  robots?: string;
  ogType?: string;
  structuredData?: Record<string, any>;
}

export const DEFAULT_APP_METADATA: PageMetadata = {
  title: 'EditMee — PDF, Image, Document & AI Tools',
  description:
    'EditMee is a universal, privacy-first digital work platform. Edit PDFs, manipulate images, format documents, generate ATS resumes, analyze CSVs, and run automated pipelines entirely in your browser with zero server data leakage.',
  canonicalPath: '/',
  robots: 'index, follow',
  ogType: 'website',
  structuredData: {
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
};

export const LEGAL_PAGES_METADATA: Record<string, PageMetadata> = {
  'privacy-policy': {
    title: 'Privacy Policy — EditMee Universal Workplace Suite',
    description:
      'Official EditMee Privacy Policy. Learn about our strict zero-server-upload architecture, local-first browser computation, cryptographic security, cookies, user rights, and data protection practices.',
    canonicalPath: '/privacy-policy',
    robots: 'index, follow',
    ogType: 'article',
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions — EditMee',
    description:
      'Read the complete Terms and Conditions for EditMee. Understand user responsibilities, permissible tool usage, 100% intellectual property ownership of generated documents, and service terms.',
    canonicalPath: '/terms-and-conditions',
    robots: 'index, follow',
    ogType: 'article',
  },
  'security-architecture': {
    title: 'Security Architecture & Client-First Threat Model — EditMee',
    description:
      'Explore the technical security architecture of EditMee. Learn how WebAssembly sandboxing, in-memory processing, AES-256 client encryption, and zero remote transit protect sensitive files.',
    canonicalPath: '/security-architecture',
    robots: 'index, follow',
    ogType: 'article',
  },
  'about-us': {
    title: 'About Us — EditMee Privacy-First Digital Tools',
    description:
      'Learn about EditMee, our founding mission to liberate users from heavy cloud lock-in, and our engineering commitment to fast, private, and secure in-browser productivity tools.',
    canonicalPath: '/about-us',
    robots: 'index, follow',
    ogType: 'website',
  },
  'contact-us': {
    title: 'Contact Us & Corporate Helpdesk — EditMee',
    description:
      'Get in touch with EditMee technical support, security officers, and enterprise partnerships. Reach us directly at support@editmee.com, contact@editmee.com, or admin@editmee.com.',
    canonicalPath: '/contact-us',
    robots: 'index, follow',
    ogType: 'website',
  },
  disclaimer: {
    title: 'Legal Disclaimer & Output Verification Notices — EditMee',
    description:
      'Important notices, document verification recommendations, and technical disclaimers regarding generated files and financial calculators on the EditMee platform.',
    canonicalPath: '/disclaimer',
    robots: 'index, follow',
    ogType: 'website',
  },
};

/**
 * Updates document head with appropriate SEO and Social tags
 */
export function updateDocumentHead(meta: PageMetadata) {
  // Title
  document.title = meta.title;

  // Meta Description
  updateMetaTag('description', meta.description);

  // Robots
  updateMetaTag('robots', meta.robots || 'index, follow');

  // Open Graph
  updateMetaProperty('og:title', meta.title);
  updateMetaProperty('og:description', meta.description);
  updateMetaProperty('og:type', meta.ogType || 'website');
  updateMetaProperty('og:image', `${window.location.origin}/editmee-logo.svg`);

  // Canonical Link
  const fullCanonicalUrl = `${window.location.origin}${meta.canonicalPath}`;
  updateMetaProperty('og:url', fullCanonicalUrl);
  updateCanonicalLink(fullCanonicalUrl);

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

function updateStructuredData(data?: Record<string, any>) {
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
  DEFAULT_APP_METADATA,
  LEGAL_PAGES_METADATA,
};
