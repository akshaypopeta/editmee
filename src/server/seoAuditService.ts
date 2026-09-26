/**
 * EditMee SEO & Marketing Studio Pro - Real Website Auditor & Crawler Service
 * Performs real HTTP/HTTPS requests, robots.txt & sitemap.xml inspection, HTML parsing,
 * heading hierarchy checks, link validation, image optimization signals, and JSON-LD schema analysis.
 */

export interface RawSeoAuditResult {
  url: string;
  origin: string;
  timestamp: string;
  durationMs: number;
  statusCode: number;
  statusText: string;
  finalUrl: string;
  isRedirected: boolean;
  protocol: 'https:' | 'http:';
  ttfbMs: number;
  htmlSizeKb: number;
  headers: Record<string, string>;
  
  // Real Signals
  title?: {
    value: string;
    length: number;
    exists: boolean;
  };
  metaDescription?: {
    value: string;
    length: number;
    exists: boolean;
  };
  canonical?: {
    value: string;
    exists: boolean;
    matchesUrl: boolean;
    isAbsolute: boolean;
  };
  robotsMeta?: {
    value: string;
    exists: boolean;
    noindex: boolean;
    nofollow: boolean;
    none: boolean;
  };
  viewport?: {
    value: string;
    exists: boolean;
    isMobileOptimized: boolean;
  };
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    complete: boolean;
    missingKeys: string[];
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    complete: boolean;
    missingKeys: string[];
  };
  headings: {
    h1Count: number;
    h1Values: string[];
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hierarchyIssues: string[];
  };
  images: {
    total: number;
    missingAltCount: number;
    emptyAltCount: number;
    sampleMissingAlt: { src: string; alt?: string }[];
    totalWithAlt: number;
    externalImagesCount: number;
  };
  links: {
    total: number;
    internalCount: number;
    externalCount: number;
    nofollowCount: number;
    brokenCount: number;
    sampleBroken: { href: string; status: number | string }[];
  };
  structuredData: {
    found: boolean;
    count: number;
    items: {
      type?: string;
      context?: string;
      raw: string;
      isValid: boolean;
      parseError?: string;
    }[];
    hasMalformed: boolean;
  };
  hreflang: {
    found: boolean;
    entries: { lang: string; href: string }[];
  };
  mixedContent: {
    hasMixedContent: boolean;
    insecureResources: string[];
  };
  robotsTxt: {
    status: number;
    exists: boolean;
    url: string;
    isDisallowed: boolean;
    sitemapsFound: string[];
    contentSnippet?: string;
  };
  sitemapXml: {
    status: number;
    exists: boolean;
    url: string;
    urlCount?: number;
    isValidXml: boolean;
  };
  crawlPages: {
    url: string;
    statusCode: number;
    title?: string;
    metaDescription?: string;
    h1Count: number;
    missingAltCount: number;
    durationMs: number;
  }[];
  verificationNotes: string[];
}

// Helpers
function extractAttribute(tagStr: string, attrName: string): string | undefined {
  const regex = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, 'i');
  const match = tagStr.match(regex);
  if (match) return match[1];
  
  // Unquoted attribute fallback
  const unquotedRegex = new RegExp(`${attrName}\\s*=\\s*([^\\s>]+)`, 'i');
  const uMatch = tagStr.match(unquotedRegex);
  return uMatch ? uMatch[1] : undefined;
}

function cleanHtmlText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Perform a real SEO audit on a target website URL
 */
export async function auditWebsiteReal(
  rawTargetUrl: string,
  maxPagesToCrawl: number = 3
): Promise<RawSeoAuditResult> {
  let parsedUrl: URL;
  try {
    let clean = rawTargetUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    parsedUrl = new URL(clean);
  } catch (err: any) {
    throw new Error(`Invalid URL format: ${rawTargetUrl}. Please include a valid http:// or https:// domain.`);
  }

  // Security: prevent loopback or private network SSRF attacks
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Access to private or local loopback addresses is restricted for security.');
  }

  const origin = parsedUrl.origin;
  const startTime = Date.now();
  const verificationNotes: string[] = [];

  // 1. Fetch Main Page with real timing
  let response: Response;
  let html = '';
  let durationMs = 0;
  let ttfbMs = 0;
  let finalUrl = parsedUrl.href;
  let isRedirected = false;
  let statusCode = 0;
  let statusText = '';
  const responseHeaders: Record<string, string> = {};

  try {
    const fetchStart = performance.now();
    response = await fetch(parsedUrl.href, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0; +https://editmee.com/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });
    ttfbMs = Math.round(performance.now() - fetchStart);
    statusCode = response.status;
    statusText = response.statusText;
    finalUrl = response.url || parsedUrl.href;
    isRedirected = finalUrl !== parsedUrl.href;

    response.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val;
    });

    html = await response.text();
    durationMs = Date.now() - startTime;
  } catch (fetchErr: any) {
    const msg = fetchErr?.message || String(fetchErr);
    throw new Error(`Failed to reach ${parsedUrl.href}: ${msg}. Site may be offline, blocking requests, or timing out.`);
  }

  const htmlSizeKb = Number((Buffer.byteLength(html, 'utf8') / 1024).toFixed(1));
  const protocol = (finalUrl.startsWith('https:') ? 'https:' : 'http:') as 'https:' | 'http:';

  // 2. Extract Head & Meta tags
  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : undefined;
  const title = {
    value: rawTitle || '',
    length: rawTitle ? rawTitle.length : 0,
    exists: Boolean(rawTitle && rawTitle.length > 0),
  };

  // Meta Tags
  const metaTags: string[] = html.match(/<meta\s+[^>]+>/gi) || [];
  
  // Meta Description
  let metaDescVal: string | undefined;
  for (const tag of metaTags) {
    const name = extractAttribute(tag, 'name') || extractAttribute(tag, 'property');
    if (name && name.toLowerCase() === 'description') {
      metaDescVal = extractAttribute(tag, 'content');
      break;
    }
  }
  const metaDescription = {
    value: metaDescVal ? cleanHtmlText(metaDescVal) : '',
    length: metaDescVal ? cleanHtmlText(metaDescVal).length : 0,
    exists: Boolean(metaDescVal && metaDescVal.trim().length > 0),
  };

  // Canonical Link
  const linkTags: string[] = html.match(/<link\s+[^>]+>/gi) || [];
  let canonicalHref: string | undefined;
  for (const tag of linkTags) {
    const rel = extractAttribute(tag, 'rel');
    if (rel && rel.toLowerCase().split(/\s+/).includes('canonical')) {
      canonicalHref = extractAttribute(tag, 'href');
      break;
    }
  }
  const canonical = {
    value: canonicalHref || '',
    exists: Boolean(canonicalHref && canonicalHref.trim().length > 0),
    matchesUrl: canonicalHref ? canonicalHref.trim() === finalUrl || canonicalHref.trim() === parsedUrl.href : false,
    isAbsolute: canonicalHref ? /^https?:\/\//i.test(canonicalHref) : false,
  };

  // Robots Meta
  let robotsMetaVal: string | undefined;
  for (const tag of metaTags) {
    const name = extractAttribute(tag, 'name');
    if (name && name.toLowerCase() === 'robots') {
      robotsMetaVal = extractAttribute(tag, 'content');
      break;
    }
  }
  const rVal = (robotsMetaVal || '').toLowerCase();
  const robotsMeta = {
    value: robotsMetaVal || '',
    exists: Boolean(robotsMetaVal),
    noindex: rVal.includes('noindex'),
    nofollow: rVal.includes('nofollow'),
    none: rVal.includes('none'),
  };

  // Viewport
  let viewportVal: string | undefined;
  for (const tag of metaTags) {
    const name = extractAttribute(tag, 'name');
    if (name && name.toLowerCase() === 'viewport') {
      viewportVal = extractAttribute(tag, 'content');
      break;
    }
  }
  const vpVal = (viewportVal || '').toLowerCase();
  const viewport = {
    value: viewportVal || '',
    exists: Boolean(viewportVal),
    isMobileOptimized: vpVal.includes('width=device-width'),
  };

  // Open Graph
  const ogData: Record<string, string> = {};
  for (const tag of metaTags) {
    const property = extractAttribute(tag, 'property');
    if (property && property.toLowerCase().startsWith('og:')) {
      const key = property.toLowerCase();
      const content = extractAttribute(tag, 'content');
      if (content) ogData[key] = content;
    }
  }
  const ogRequired = ['og:title', 'og:description', 'og:image', 'og:url'];
  const missingOg = ogRequired.filter((k) => !ogData[k]);
  const openGraph = {
    title: ogData['og:title'],
    description: ogData['og:description'],
    image: ogData['og:image'],
    url: ogData['og:url'],
    type: ogData['og:type'],
    complete: missingOg.length === 0,
    missingKeys: missingOg,
  };

  // Twitter Card
  const twitterData: Record<string, string> = {};
  for (const tag of metaTags) {
    const name = extractAttribute(tag, 'name');
    if (name && name.toLowerCase().startsWith('twitter:')) {
      const key = name.toLowerCase();
      const content = extractAttribute(tag, 'content');
      if (content) twitterData[key] = content;
    }
  }
  const twitterRequired = ['twitter:card', 'twitter:title', 'twitter:description'];
  const missingTwitter = twitterRequired.filter((k) => !twitterData[k]);
  const twitterCard = {
    card: twitterData['twitter:card'],
    title: twitterData['twitter:title'],
    description: twitterData['twitter:description'],
    image: twitterData['twitter:image'],
    complete: missingTwitter.length === 0,
    missingKeys: missingTwitter,
  };

  // Headings
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Values = h1Matches.map((m) => cleanHtmlText(m[1])).filter((t) => t.length > 0);
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (html.match(/<h4[^>]*>/gi) || []).length;
  const h5Count = (html.match(/<h5[^>]*>/gi) || []).length;
  const h6Count = (html.match(/<h6[^>]*>/gi) || []).length;

  const hierarchyIssues: string[] = [];
  if (h1Values.length === 0) {
    hierarchyIssues.push('Missing H1 heading on the page');
  } else if (h1Values.length > 1) {
    hierarchyIssues.push(`Multiple H1 headings detected (${h1Values.length}). Best practice is a single primary H1.`);
  }
  if (h1Values.length === 0 && h2Count > 0) {
    hierarchyIssues.push('Page skips H1 and starts directly with H2.');
  }

  const headings = {
    h1Count: h1Values.length,
    h1Values,
    h2Count,
    h3Count,
    h4Count,
    h5Count,
    h6Count,
    hierarchyIssues,
  };

  // Images & Alt attributes
  const imgTags: string[] = html.match(/<img\s+[^>]+>/gi) || [];
  let missingAltCount = 0;
  let emptyAltCount = 0;
  let externalImagesCount = 0;
  const sampleMissingAlt: { src: string; alt?: string }[] = [];

  for (const tag of imgTags) {
    const src = extractAttribute(tag, 'src') || '';
    const hasAlt = /alt\s*=/i.test(tag);
    const alt = extractAttribute(tag, 'alt');

    if (/^https?:\/\//i.test(src) && !src.startsWith(origin)) {
      externalImagesCount++;
    }

    if (!hasAlt) {
      missingAltCount++;
      if (sampleMissingAlt.length < 5) {
        sampleMissingAlt.push({ src });
      }
    } else if (alt !== undefined && alt.trim() === '') {
      emptyAltCount++;
    }
  }

  const images = {
    total: imgTags.length,
    missingAltCount,
    emptyAltCount,
    sampleMissingAlt,
    totalWithAlt: imgTags.length - missingAltCount,
    externalImagesCount,
  };

  // Links & Broken Link Sampling
  const aTags: string[] = html.match(/<a\s+[^>]+>/gi) || [];
  let internalCount = 0;
  let externalCount = 0;
  let nofollowCount = 0;
  const internalHrefs: string[] = [];

  for (const tag of aTags) {
    const href = extractAttribute(tag, 'href');
    const rel = (extractAttribute(tag, 'rel') || '').toLowerCase();
    if (rel.includes('nofollow')) nofollowCount++;

    if (href) {
      const cleanHref = href.trim();
      if (
        cleanHref.startsWith('#') ||
        cleanHref.startsWith('javascript:') ||
        cleanHref.startsWith('mailto:') ||
        cleanHref.startsWith('tel:')
      ) {
        continue;
      }

      if (cleanHref.startsWith('/') || cleanHref.startsWith(origin)) {
        internalCount++;
        try {
          const abs = new URL(cleanHref, origin).href;
          if (!internalHrefs.includes(abs)) internalHrefs.push(abs);
        } catch {}
      } else if (/^https?:\/\//i.test(cleanHref)) {
        externalCount++;
      }
    }
  }

  // Sample check up to 4 internal links for real broken link detection
  const sampleBroken: { href: string; status: number | string }[] = [];
  const linksToCheck = internalHrefs.slice(0, 4);
  for (const linkUrl of linksToCheck) {
    try {
      const linkRes = await fetch(linkUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0)' },
        signal: AbortSignal.timeout(4000),
      });
      if (linkRes.status >= 400) {
        sampleBroken.push({ href: linkUrl, status: linkRes.status });
      }
    } catch (e: any) {
      // If HEAD is rejected, try fast GET
      try {
        const linkResGet = await fetch(linkUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0)' },
          signal: AbortSignal.timeout(3000),
        });
        if (linkResGet.status >= 400) {
          sampleBroken.push({ href: linkUrl, status: linkResGet.status });
        }
      } catch {
        // Network timeout / unverified
      }
    }
  }

  const links = {
    total: aTags.length,
    internalCount,
    externalCount,
    nofollowCount,
    brokenCount: sampleBroken.length,
    sampleBroken,
  };

  // Structured Data (JSON-LD)
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const structuredItems: RawSeoAuditResult['structuredData']['items'] = [];
  let hasMalformed = false;

  for (const block of jsonLdBlocks) {
    const rawContent = (block[1] || '').trim();
    if (!rawContent) continue;

    try {
      const parsed = JSON.parse(rawContent);
      const isArray = Array.isArray(parsed);
      const first = isArray ? parsed[0] : parsed;
      structuredItems.push({
        type: first?.['@type'] || (isArray ? 'Array' : 'Object'),
        context: first?.['@context'],
        raw: rawContent,
        isValid: true,
      });
    } catch (parseErr: any) {
      hasMalformed = true;
      structuredItems.push({
        raw: rawContent,
        isValid: false,
        parseError: parseErr.message || 'JSON-LD syntax parse failure',
      });
    }
  }

  const structuredData = {
    found: structuredItems.length > 0,
    count: structuredItems.length,
    items: structuredItems,
    hasMalformed,
  };

  // Hreflang
  const hreflangEntries: { lang: string; href: string }[] = [];
  for (const tag of linkTags) {
    const rel = (extractAttribute(tag, 'rel') || '').toLowerCase();
    const hreflang = extractAttribute(tag, 'hreflang');
    const href = extractAttribute(tag, 'href');
    if (rel.includes('alternate') && hreflang && href) {
      hreflangEntries.push({ lang: hreflang, href });
    }
  }
  const hreflang = {
    found: hreflangEntries.length > 0,
    entries: hreflangEntries,
  };

  // Mixed Content (Insecure resources on HTTPS)
  const insecureResources: string[] = [];
  if (protocol === 'https:') {
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["'](http:\/\/[^"']+)["']/gi)].map((m) => m[1]);
    const cssHrefs = [...html.matchAll(/<link[^>]+href=["'](http:\/\/[^"']+)["'][^>]*rel=["']stylesheet["']/gi)].map((m) => m[1]);
    const imgSrcs = [...html.matchAll(/<img[^>]+src=["'](http:\/\/[^"']+)["']/gi)].map((m) => m[1]);
    
    insecureResources.push(...scriptSrcs, ...cssHrefs, ...imgSrcs);
  }
  const mixedContent = {
    hasMixedContent: insecureResources.length > 0,
    insecureResources: insecureResources.slice(0, 5),
  };

  // 3. Inspect robots.txt
  let robotsTxtStatus = 0;
  let robotsTxtContent = '';
  let robotsTxtSitemaps: string[] = [];
  let isPathDisallowed = false;
  const robotsTxtUrl = `${origin}/robots.txt`;

  try {
    const rRes = await fetch(robotsTxtUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0)' },
      signal: AbortSignal.timeout(5000),
    });
    robotsTxtStatus = rRes.status;
    if (rRes.ok) {
      robotsTxtContent = await rRes.text();
      // Extract sitemaps listed in robots.txt
      const smMatches = robotsTxtContent.match(/Sitemap:\s*(https?:\/\/[^\s\r\n]+)/gi) || [];
      robotsTxtSitemaps = smMatches.map((m) => m.replace(/Sitemap:\s*/i, '').trim());

      // Check if root or target path is disallowed
      const pathToCheck = parsedUrl.pathname || '/';
      const lines = robotsTxtContent.split('\n').map((l) => l.trim());
      let currentUserAgentApplies = false;
      for (const line of lines) {
        if (/^User-agent:\s*\*/i.test(line)) {
          currentUserAgentApplies = true;
        } else if (/^User-agent:/i.test(line)) {
          currentUserAgentApplies = false;
        } else if (currentUserAgentApplies && /^Disallow:\s*(.*)/i.test(line)) {
          const match = line.match(/^Disallow:\s*(.*)/i);
          const disallowPath = match ? match[1].trim() : '';
          if (disallowPath === '/' || (disallowPath && pathToCheck.startsWith(disallowPath))) {
            isPathDisallowed = true;
          }
        }
      }
    }
  } catch (err: any) {
    verificationNotes.push(`robots.txt could not be reached: ${err.message || 'Timeout'}`);
  }

  const robotsTxt = {
    status: robotsTxtStatus,
    exists: robotsTxtStatus === 200 && robotsTxtContent.length > 0,
    url: robotsTxtUrl,
    isDisallowed: isPathDisallowed,
    sitemapsFound: robotsTxtSitemaps,
    contentSnippet: robotsTxtContent ? robotsTxtContent.slice(0, 400) : undefined,
  };

  // 4. Inspect sitemap.xml
  let sitemapUrl = robotsTxtSitemaps.length > 0 ? robotsTxtSitemaps[0] : `${origin}/sitemap.xml`;
  let sitemapStatus = 0;
  let sitemapUrlCount = 0;
  let isValidXml = false;

  try {
    const sRes = await fetch(sitemapUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0)' },
      signal: AbortSignal.timeout(5000),
    });
    sitemapStatus = sRes.status;
    if (sRes.ok) {
      const sitemapBody = await sRes.text();
      isValidXml = sitemapBody.includes('<urlset') || sitemapBody.includes('<sitemapindex');
      const locMatches = sitemapBody.match(/<loc>/gi) || [];
      sitemapUrlCount = locMatches.length;
    }
  } catch (sErr: any) {
    verificationNotes.push(`sitemap.xml could not be reached: ${sErr.message || 'Timeout'}`);
  }

  const sitemapXml = {
    status: sitemapStatus,
    exists: sitemapStatus === 200 && isValidXml,
    url: sitemapUrl,
    urlCount: sitemapUrlCount,
    isValidXml,
  };

  // 5. Multi-Page Crawling (Safely crawl up to maxPagesToCrawl same-domain URLs)
  const crawlPages: RawSeoAuditResult['crawlPages'] = [
    {
      url: finalUrl,
      statusCode,
      title: title.value,
      metaDescription: metaDescription.value,
      h1Count: headings.h1Count,
      missingAltCount: images.missingAltCount,
      durationMs,
    },
  ];

  if (maxPagesToCrawl > 1 && internalHrefs.length > 0) {
    const targets = internalHrefs
      .filter((u) => u !== finalUrl && u !== parsedUrl.href)
      .slice(0, Math.min(maxPagesToCrawl - 1, 4));

    for (const crawlTarget of targets) {
      const crawlStart = performance.now();
      try {
        const subRes = await fetch(crawlTarget, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EditMeeBot/2.0)' },
          signal: AbortSignal.timeout(5000),
        });
        const subHtml = await subRes.text();
        const subDuration = Math.round(performance.now() - crawlStart);

        const subTitleMatch = subHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const subTitle = subTitleMatch ? cleanHtmlText(subTitleMatch[1]) : undefined;
        
        let subMetaDesc: string | undefined;
        const subMetaTags = subHtml.match(/<meta\s+[^>]+>/gi) || [];
        for (const t of subMetaTags) {
          if ((extractAttribute(t, 'name') || '').toLowerCase() === 'description') {
            subMetaDesc = extractAttribute(t, 'content');
            break;
          }
        }

        const subH1Count = (subHtml.match(/<h1[^>]*>/gi) || []).length;
        const subImgTags = subHtml.match(/<img\s+[^>]+>/gi) || [];
        const subMissingAlt = subImgTags.filter((img) => !/alt\s*=/i.test(img)).length;

        crawlPages.push({
          url: crawlTarget,
          statusCode: subRes.status,
          title: subTitle,
          metaDescription: subMetaDesc ? cleanHtmlText(subMetaDesc) : undefined,
          h1Count: subH1Count,
          missingAltCount: subMissingAlt,
          durationMs: subDuration,
        });
      } catch {
        // Skip timed-out subpages safely
      }
    }
  }

  return {
    url: parsedUrl.href,
    origin,
    timestamp: new Date().toISOString(),
    durationMs,
    statusCode,
    statusText,
    finalUrl,
    isRedirected,
    protocol,
    ttfbMs,
    htmlSizeKb,
    headers: responseHeaders,
    title,
    metaDescription,
    canonical,
    robotsMeta,
    viewport,
    openGraph,
    twitterCard,
    headings,
    images,
    links,
    structuredData,
    hreflang,
    mixedContent,
    robotsTxt,
    sitemapXml,
    crawlPages,
    verificationNotes,
  };
}
