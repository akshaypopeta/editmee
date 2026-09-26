import { RawSeoAuditResult } from '../../../server/seoAuditService';
import { SeoIssue, SeoAuditReport } from './types';

export function evaluateRawAudit(raw: RawSeoAuditResult): SeoAuditReport {
  const issues: SeoIssue[] = [];

  // 1. HTTP Status & Connection
  if (raw.statusCode >= 400) {
    issues.push({
      id: 'issue_http_status_error',
      title: `Server Responded With HTTP ${raw.statusCode}`,
      category: 'indexability',
      severity: 'critical',
      whatHappened: `The web server returned HTTP error status ${raw.statusCode} (${raw.statusText || 'Error'}) instead of a successful 200 OK.`,
      whyItMatters:
        'Search engine crawlers and real visitors cannot access your website content properly. HTTP errors cause pages to be dropped from search indexes.',
      howToFix:
        'Verify your web server routing, check DNS records, resolve server runtime crashes, and confirm the target page URL exists.',
      canAutoFix: false,
      technicalDetails: `Status: ${raw.statusCode} ${raw.statusText}\nTarget: ${raw.url}\nFinal URL: ${raw.finalUrl}`,
    });
  } else if (raw.statusCode === 200) {
    issues.push({
      id: 'issue_http_status_ok',
      title: 'HTTP 200 OK Response',
      category: 'indexability',
      severity: 'passed',
      whatHappened: 'The web server successfully responded with standard HTTP 200 OK.',
      whyItMatters: 'Ensures search engines and users can retrieve and index your web page reliably.',
      howToFix: 'No action required. Your server response is healthy.',
      canAutoFix: false,
      technicalDetails: `HTTP 200 OK received in ${raw.durationMs}ms with ${raw.htmlSizeKb} KB content payload.`,
    });
  }

  // Protocol & HTTPS
  if (raw.protocol !== 'https:') {
    issues.push({
      id: 'issue_http_insecure',
      title: 'Insecure HTTP Connection (No SSL/TLS)',
      category: 'security',
      severity: 'high',
      whatHappened: 'The website is served over unencrypted HTTP rather than modern HTTPS.',
      whyItMatters:
        'Google treats HTTPS as a confirmed ranking signal. Modern browsers label HTTP sites as "Not Secure", which repels visitors and harms conversions.',
      howToFix:
        'Install a free SSL/TLS certificate (e.g., via Let\'s Encrypt or your hosting provider) and enforce 301 redirects from HTTP to HTTPS.',
      canAutoFix: false,
      technicalDetails: `Served over plain ${raw.protocol} at ${raw.finalUrl}`,
    });
  } else {
    issues.push({
      id: 'issue_https_secure',
      title: 'Secure HTTPS Protocol Active',
      category: 'security',
      severity: 'passed',
      whatHappened: 'The page is securely served over encrypted HTTPS.',
      whyItMatters: 'Protects user data in transit, prevents ISP tampering, and satisfies search engine security ranking requirements.',
      howToFix: 'No action required. SSL encryption is configured.',
      canAutoFix: false,
      technicalDetails: `Valid HTTPS protocol detected at ${raw.finalUrl}`,
    });
  }

  // Mixed Content
  if (raw.mixedContent.hasMixedContent) {
    issues.push({
      id: 'issue_mixed_content',
      title: 'Mixed Content Detected (Insecure Resources on HTTPS)',
      category: 'security',
      severity: 'high',
      whatHappened: `The HTTPS page requests ${raw.mixedContent.insecureResources.length} subresource(s) over unencrypted HTTP.`,
      whyItMatters:
        'Browsers actively block mixed content (scripts, stylesheets, media), causing layout breakage or security warnings for visitors.',
      howToFix:
        'Update asset URLs (images, scripts, styles) from "http://" to "https://" or use protocol-relative "//" paths.',
      canAutoFix: false,
      technicalDetails: `Insecure assets:\n${raw.mixedContent.insecureResources.join('\n')}`,
    });
  }

  // 2. Title Tag
  const cleanTitle = raw.title?.value || '';
  if (!raw.title?.exists || cleanTitle.trim().length === 0) {
    issues.push({
      id: 'issue_missing_title',
      title: 'Missing or Empty <title> Tag',
      category: 'meta',
      severity: 'critical',
      whatHappened: 'The HTML <head> section does not contain a populated <title> element.',
      whyItMatters:
        'The title tag is one of the most important on-page SEO ranking factors and defines the clickable headline shown in Google search results.',
      howToFix: 'Add a descriptive <title> tag between 30 and 60 characters inside the <head> tag of your HTML document.',
      canAutoFix: true,
      autoFixType: 'add_title',
      technicalDetails: 'No <title> element detected inside <head>.',
      fileTargetPattern: 'index.html',
      recommendedValue: `<title>${cleanTitle || 'Home — High Performance Web Application'}</title>`,
    });
  } else if (cleanTitle.length < 30) {
    issues.push({
      id: 'issue_title_short',
      title: `Page Title is Very Short (${cleanTitle.length} characters)`,
      category: 'meta',
      severity: 'medium',
      whatHappened: `Your page title is only ${cleanTitle.length} characters long. Recommended length is 30–60 characters.`,
      whyItMatters:
        'Short titles miss valuable opportunities to include relevant primary keywords and secondary branding signals.',
      howToFix:
        'Expand the title to 30–60 characters by adding specific product benefits or brand identity (e.g. "Primary Keyword — Benefit | Brand").',
      canAutoFix: false,
      currentValue: cleanTitle,
      technicalDetails: `Current title (${cleanTitle.length} chars): "${cleanTitle}"`,
    });
  } else if (cleanTitle.length > 65) {
    issues.push({
      id: 'issue_title_long',
      title: `Page Title Exceeds Recommended Length (${cleanTitle.length} characters)`,
      category: 'meta',
      severity: 'medium',
      whatHappened: `Your page title has ${cleanTitle.length} characters. Google typically truncates titles longer than 60 characters on SERPs.`,
      whyItMatters:
        'Truncated titles end with ellipsis ("..."), cutting off important branding and lowering search result click-through rates (CTR).',
      howToFix: 'Shorten the page title to 50–60 characters while placing key search terms near the beginning.',
      canAutoFix: false,
      currentValue: cleanTitle,
      technicalDetails: `Current title (${cleanTitle.length} chars): "${cleanTitle}"`,
    });
  } else {
    issues.push({
      id: 'issue_title_optimal',
      title: `Optimal Page Title Length (${cleanTitle.length} characters)`,
      category: 'meta',
      severity: 'passed',
      whatHappened: `Page title length (${cleanTitle.length} characters) is within the optimal 30–65 character window.`,
      whyItMatters: 'Renders cleanly across mobile and desktop search engine results pages without premature truncation.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Title: "${cleanTitle}"`,
    });
  }

  // 3. Meta Description
  const metaDesc = raw.metaDescription?.value || '';
  if (!raw.metaDescription?.exists || metaDesc.trim().length === 0) {
    issues.push({
      id: 'issue_missing_meta_desc',
      title: 'Missing Meta Description Tag',
      category: 'meta',
      severity: 'high',
      whatHappened: 'The HTML <head> is missing a <meta name="description"> tag.',
      whyItMatters:
        'Search engines use meta descriptions to generate the preview snippet beneath your headline in search results. A missing description reduces click-through rates.',
      howToFix:
        'Add a <meta name="description" content="..."> tag inside the <head> containing a compelling summary between 70 and 155 characters.',
      canAutoFix: true,
      autoFixType: 'add_meta_desc',
      technicalDetails: '<meta name="description"> not found in document <head>.',
      fileTargetPattern: 'index.html',
      recommendedValue: `<meta name="description" content="Discover professional solutions and tools designed to optimize your digital workflow with fast, secure results.">`,
    });
  } else if (metaDesc.length < 70) {
    issues.push({
      id: 'issue_meta_desc_short',
      title: `Meta Description is Very Brief (${metaDesc.length} characters)`,
      category: 'meta',
      severity: 'medium',
      whatHappened: `The meta description is only ${metaDesc.length} characters. Best practice recommendation is 70–160 characters.`,
      whyItMatters:
        'Very short descriptions fail to give searchers enough context to click, prompting Google to replace it with arbitrary text scraped from your page.',
      howToFix: 'Expand your meta description to 120–155 characters with a clear benefit and call-to-action.',
      canAutoFix: false,
      currentValue: metaDesc,
      technicalDetails: `Current length: ${metaDesc.length} chars. Snippet: "${metaDesc}"`,
    });
  } else if (metaDesc.length > 165) {
    issues.push({
      id: 'issue_meta_desc_long',
      title: `Meta Description May Truncate (${metaDesc.length} characters)`,
      category: 'meta',
      severity: 'medium',
      whatHappened: `The meta description is ${metaDesc.length} characters. Desktop and mobile SERPs typically cut off descriptions past 155–160 characters.`,
      whyItMatters: 'Important messaging or call-to-actions placed at the end will be cut off by search engines.',
      howToFix: 'Tighten the description to stay between 130 and 155 characters.',
      canAutoFix: false,
      currentValue: metaDesc,
      technicalDetails: `Current length: ${metaDesc.length} chars.`,
    });
  } else {
    issues.push({
      id: 'issue_meta_desc_optimal',
      title: `Optimal Meta Description Length (${metaDesc.length} characters)`,
      category: 'meta',
      severity: 'passed',
      whatHappened: `The meta description length (${metaDesc.length} chars) fits nicely within Google snippet limits.`,
      whyItMatters: 'Provides an engaging, untruncated preview that maximizes organic search click-through rate.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Description: "${metaDesc}"`,
    });
  }

  // 4. Canonical Tag
  if (!raw.canonical?.exists || !raw.canonical.value) {
    issues.push({
      id: 'issue_missing_canonical',
      title: 'Missing Canonical Tag (<link rel="canonical">)',
      category: 'indexability',
      severity: 'high',
      whatHappened: 'No canonical URL element was found in the HTML document <head>.',
      whyItMatters:
        'Without a canonical tag, search engines may treat tracking query parameters, trailing slash variations, or duplicate domains as separate pages, diluting ranking power.',
      howToFix: `Add <link rel="canonical" href="${raw.finalUrl}"> inside the <head> of the page.`,
      canAutoFix: true,
      autoFixType: 'add_canonical',
      technicalDetails: 'No <link rel="canonical"> detected.',
      fileTargetPattern: 'index.html',
      recommendedValue: `<link rel="canonical" href="${raw.finalUrl}">`,
    });
  } else if (!raw.canonical.isAbsolute) {
    issues.push({
      id: 'issue_canonical_relative',
      title: 'Canonical Tag Uses Relative URL Instead of Absolute URL',
      category: 'indexability',
      severity: 'medium',
      whatHappened: `The canonical href ("${raw.canonical.value}") is a relative path rather than an absolute URL with https://.`,
      whyItMatters:
        'Google officially recommends absolute canonical URLs to prevent ambiguity across domains, subdomains, and CDN mirrors.',
      howToFix: `Update the canonical href to include the full origin: <link rel="canonical" href="${raw.origin}${raw.canonical.value.startsWith('/') ? '' : '/'}${raw.canonical.value}">`,
      canAutoFix: false,
      currentValue: raw.canonical.value,
      technicalDetails: `Detected canonical: ${raw.canonical.value}`,
    });
  } else {
    issues.push({
      id: 'issue_canonical_valid',
      title: 'Valid Canonical Tag Present',
      category: 'indexability',
      severity: 'passed',
      whatHappened: `Canonical URL correctly configured as absolute path "${raw.canonical.value}".`,
      whyItMatters: 'Consolidates ranking signals and prevents duplicate content indexation penalties.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Canonical target: ${raw.canonical.value}`,
    });
  }

  // 5. Viewport / Mobile Friendly
  if (!raw.viewport?.exists) {
    issues.push({
      id: 'issue_missing_viewport',
      title: 'Missing Mobile Viewport Meta Tag',
      category: 'mobile',
      severity: 'critical',
      whatHappened: 'The document does not include a <meta name="viewport"> tag.',
      whyItMatters:
        'Google uses mobile-first indexing for 100% of websites. Without a viewport tag, mobile browsers render desktop-scaled pages with microscopic text, failing mobile audits.',
      howToFix:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> inside the HTML <head>.',
      canAutoFix: true,
      autoFixType: 'add_viewport',
      technicalDetails: '<meta name="viewport"> not found.',
      fileTargetPattern: 'index.html',
      recommendedValue: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    });
  } else if (!raw.viewport.isMobileOptimized) {
    issues.push({
      id: 'issue_viewport_suboptimal',
      title: 'Suboptimal Viewport Configuration',
      category: 'mobile',
      severity: 'high',
      whatHappened: `The viewport tag exists ("${raw.viewport.value}") but lacks "width=device-width".`,
      whyItMatters: 'Mobile devices will not adapt layout width dynamically to the physical screen width.',
      howToFix: 'Update viewport tag to: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      canAutoFix: true,
      autoFixType: 'add_viewport',
      currentValue: raw.viewport.value,
      technicalDetails: `Current viewport: "${raw.viewport.value}"`,
    });
  } else {
    issues.push({
      id: 'issue_viewport_valid',
      title: 'Mobile Viewport Configured Correctly',
      category: 'mobile',
      severity: 'passed',
      whatHappened: 'Responsive mobile viewport meta tag is properly set with width=device-width.',
      whyItMatters: 'Satisfies Google mobile-first indexing standards and delivers proper responsive scaling.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Viewport: "${raw.viewport.value}"`,
    });
  }

  // 6. Robots Meta Tag & Indexability Directives
  if (raw.robotsMeta?.noindex) {
    issues.push({
      id: 'issue_robots_noindex',
      title: 'Active "noindex" Directive Blocking Search Engines',
      category: 'indexability',
      severity: 'critical',
      whatHappened: `The page contains a robots directive with "noindex" ("${raw.robotsMeta.value}").`,
      whyItMatters:
        'Google, Bing, and other search engines are explicitly instructed NOT to index this page. It will never rank in public search results while this tag is present.',
      howToFix:
        'Remove "noindex" from your <meta name="robots"> tag or HTTP response headers if this page is intended for public indexing.',
      canAutoFix: false,
      currentValue: raw.robotsMeta.value,
      technicalDetails: `Detected robots directive: "${raw.robotsMeta.value}"`,
    });
  } else {
    issues.push({
      id: 'issue_robots_indexable',
      title: 'Page is Indexable (No Blocking noindex Tag)',
      category: 'indexability',
      severity: 'passed',
      whatHappened: 'No blocking "noindex" meta directive was detected. Page is open for indexing.',
      whyItMatters: 'Allows search crawlers to index and display your content in search engine rankings.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: raw.robotsMeta?.exists
        ? `Robots directive: "${raw.robotsMeta.value}"`
        : 'Default index/follow active (no restricting meta tag).',
    });
  }

  // 7. Robots.txt
  if (!raw.robotsTxt.exists) {
    issues.push({
      id: 'issue_missing_robots_txt',
      title: 'Missing or Inaccessible robots.txt File',
      category: 'indexability',
      severity: 'high',
      whatHappened: `HTTP request to ${raw.robotsTxt.url} returned status ${raw.robotsTxt.status || '404'}.`,
      whyItMatters:
        'A robots.txt file guides search engine bots on how to crawl your site safely and points them directly to your sitemap.',
      howToFix: 'Create a robots.txt file in the root public directory containing crawl rules and your sitemap link.',
      canAutoFix: true,
      autoFixType: 'add_robots_txt',
      technicalDetails: `Tested URL: ${raw.robotsTxt.url} (Status: ${raw.robotsTxt.status})`,
      fileTargetPattern: 'robots.txt',
      recommendedValue: `User-agent: *\nAllow: /\n\nSitemap: ${raw.origin}/sitemap.xml\n`,
    });
  } else if (raw.robotsTxt.isDisallowed) {
    issues.push({
      id: 'issue_robots_txt_disallow',
      title: 'robots.txt Disallow Rule Blocks This Page',
      category: 'indexability',
      severity: 'high',
      whatHappened: 'A Disallow directive inside your robots.txt matches this URL path.',
      whyItMatters: 'Search bots will refuse to crawl or refresh content on this page.',
      howToFix: 'Edit your robots.txt file to remove the Disallow line restricting this path.',
      canAutoFix: false,
      technicalDetails: `robots.txt content:\n${raw.robotsTxt.contentSnippet || 'No snippet available'}`,
    });
  } else {
    issues.push({
      id: 'issue_robots_txt_valid',
      title: 'Valid robots.txt File Accessible',
      category: 'indexability',
      severity: 'passed',
      whatHappened: `robots.txt is live at ${raw.robotsTxt.url} and allows crawler access to this page.`,
      whyItMatters: 'Ensures orderly search engine crawling without unintended access denials.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Found at ${raw.robotsTxt.url}. Sitemaps declared: ${raw.robotsTxt.sitemapsFound.length}`,
    });
  }

  // 8. Sitemap.xml
  if (!raw.sitemapXml.exists) {
    issues.push({
      id: 'issue_missing_sitemap_xml',
      title: 'Missing or Invalid XML Sitemap',
      category: 'indexability',
      severity: 'medium',
      whatHappened: `Could not locate a valid XML sitemap at ${raw.sitemapXml.url} (Status: ${raw.sitemapXml.status || '404'}).`,
      whyItMatters:
        'An XML sitemap helps search engines discover all accessible URLs on your domain quickly, especially for new websites or pages without internal links.',
      howToFix:
        'Generate an XML sitemap (sitemap.xml) listing your public site URLs and place it in your website root.',
      canAutoFix: true,
      autoFixType: 'add_sitemap_xml',
      technicalDetails: `Checked target: ${raw.sitemapXml.url}`,
      fileTargetPattern: 'sitemap.xml',
      recommendedValue: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${raw.origin}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
    });
  } else {
    issues.push({
      id: 'issue_sitemap_xml_valid',
      title: 'Valid XML Sitemap Located',
      category: 'indexability',
      severity: 'passed',
      whatHappened: `XML sitemap found at ${raw.sitemapXml.url} containing valid <urlset> entries.`,
      whyItMatters: 'Speeds up indexing of newly published pages and updates across search engines.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Sitemap URL: ${raw.sitemapXml.url} (detected entries: ${raw.sitemapXml.urlCount || 'valid format'})`,
    });
  }

  // 9. Heading Structure & H1
  if (raw.headings.h1Count === 0) {
    issues.push({
      id: 'issue_missing_h1',
      title: 'Missing Primary <h1> Heading',
      category: 'headings',
      severity: 'high',
      whatHappened: 'The page does not contain any <h1> heading tag.',
      whyItMatters:
        'The <h1> heading represents the primary subject of the page for search engines and assistive screen readers.',
      howToFix: 'Add a single, clear <h1> tag near the top of your page content summarizing the primary topic.',
      canAutoFix: false,
      technicalDetails: 'No <h1> tags found in document body.',
      fileTargetPattern: 'index.html',
    });
  } else if (raw.headings.h1Count > 1) {
    issues.push({
      id: 'issue_multiple_h1',
      title: `Multiple <h1> Headings Detected (${raw.headings.h1Count} found)`,
      category: 'headings',
      severity: 'medium',
      whatHappened: `Found ${raw.headings.h1Count} separate <h1> tags on the page.`,
      whyItMatters:
        'While HTML5 technically allows multiple <h1> tags in distinct section elements, SEO best practice strongly favors one primary <h1> per page to maintain clear topical focus.',
      howToFix:
        'Convert secondary <h1> headings into <h2> subheadings, reserving <h1> exclusively for the main page headline.',
      canAutoFix: false,
      technicalDetails: `Found <h1> values:\n${raw.headings.h1Values.map((h, i) => `${i + 1}. "${h}"`).join('\n')}`,
    });
  } else {
    issues.push({
      id: 'issue_h1_optimal',
      title: 'Single Primary <h1> Heading Present',
      category: 'headings',
      severity: 'passed',
      whatHappened: `Page contains exactly 1 primary <h1>: "${raw.headings.h1Values[0]}".`,
      whyItMatters: 'Communicates clear topical focus to search crawlers and screen readers.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `<h1> content: "${raw.headings.h1Values[0]}"`,
    });
  }

  // 10. Open Graph Tags
  if (!raw.openGraph.complete) {
    issues.push({
      id: 'issue_missing_og_tags',
      title: 'Incomplete Open Graph (Social Sharing) Metadata',
      category: 'meta',
      severity: 'medium',
      whatHappened: `Missing essential Open Graph tags: ${raw.openGraph.missingKeys.join(', ')}.`,
      whyItMatters:
        'Social media networks (LinkedIn, Facebook, Discord, Slack, iMessage) rely on Open Graph tags to generate rich link preview cards with images and titles.',
      howToFix:
        'Add the missing og:title, og:description, og:image, and og:url <meta property="..."> tags to your <head>.',
      canAutoFix: true,
      autoFixType: 'add_og_tags',
      technicalDetails: `Missing keys: ${raw.openGraph.missingKeys.join(', ')}`,
      fileTargetPattern: 'index.html',
      recommendedValue: `<meta property="og:title" content="${cleanTitle || 'Welcome'}">\n<meta property="og:description" content="${metaDesc || 'Discover powerful digital workflows.'}">\n<meta property="og:url" content="${raw.finalUrl}">\n<meta property="og:type" content="website">`,
    });
  } else {
    issues.push({
      id: 'issue_og_tags_complete',
      title: 'Complete Open Graph Tags Configured',
      category: 'meta',
      severity: 'passed',
      whatHappened: 'Page includes og:title, og:description, og:image, and og:url properties.',
      whyItMatters: 'Produces high-converting, professional preview cards when shared on social media and messaging apps.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `og:title="${raw.openGraph.title}", og:image="${raw.openGraph.image || 'present'}"`,
    });
  }

  // 11. Twitter Cards
  if (!raw.twitterCard.complete) {
    issues.push({
      id: 'issue_missing_twitter_cards',
      title: 'Missing Twitter / X Preview Card Metadata',
      category: 'meta',
      severity: 'medium',
      whatHappened: `Missing Twitter card tags: ${raw.twitterCard.missingKeys.join(', ')}.`,
      whyItMatters:
        'Without twitter:card metadata, shares on X / Twitter display as plain links without an eye-catching visual preview banner.',
      howToFix: 'Add <meta name="twitter:card" content="summary_large_image"> and accompanying title/description tags.',
      canAutoFix: true,
      autoFixType: 'add_twitter_tags',
      technicalDetails: `Missing tags: ${raw.twitterCard.missingKeys.join(', ')}`,
      fileTargetPattern: 'index.html',
      recommendedValue: `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${cleanTitle || 'Welcome'}">\n<meta name="twitter:description" content="${metaDesc || 'Discover powerful digital workflows.'}">`,
    });
  } else {
    issues.push({
      id: 'issue_twitter_cards_complete',
      title: 'Twitter / X Card Metadata Present',
      category: 'meta',
      severity: 'passed',
      whatHappened: `Twitter card configured with card type "${raw.twitterCard.card}".`,
      whyItMatters: 'Ensures rich media cards with hero imagery on X / Twitter feeds.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `twitter:card="${raw.twitterCard.card}"`,
    });
  }

  // 12. Images & Alt Attributes
  if (raw.images.missingAltCount > 0) {
    issues.push({
      id: 'issue_missing_img_alt',
      title: `${raw.images.missingAltCount} Image(s) Missing Alt Attributes`,
      category: 'images',
      severity: raw.images.missingAltCount > 5 ? 'high' : 'medium',
      whatHappened: `Found ${raw.images.missingAltCount} <img> tag(s) without an alt attribute.`,
      whyItMatters:
        'Search engine image algorithms depend on alt attributes to understand image context. Visually impaired users using screen readers cannot perceive images lacking alt text.',
      howToFix: 'Add descriptive alt="Your image description" attributes to all content images.',
      canAutoFix: true,
      autoFixType: 'fix_img_alt',
      technicalDetails: `Sample images missing alt:\n${raw.images.sampleMissingAlt.map((s) => s.src).join('\n')}`,
      fileTargetPattern: '*.html',
    });
  } else if (raw.images.total > 0) {
    issues.push({
      id: 'issue_img_alt_valid',
      title: 'All Images Contain Alt Attributes',
      category: 'images',
      severity: 'passed',
      whatHappened: `All ${raw.images.total} image(s) on the page specify an alt attribute.`,
      whyItMatters: 'Satisfies accessibility (WCAG) guidelines and enables visual indexing in Google Image Search.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `${raw.images.total} image(s) verified.`,
    });
  }

  // 13. Structured Data (JSON-LD)
  if (raw.structuredData.hasMalformed) {
    issues.push({
      id: 'issue_malformed_jsonld',
      title: 'Malformed Structured Data (JSON-LD Syntax Error)',
      category: 'structured_data',
      severity: 'high',
      whatHappened: 'One or more <script type="application/ld+json"> blocks contained invalid JSON syntax.',
      whyItMatters:
        'Search engines cannot parse malformed structured data, discarding your chance at rich search snippets, product stars, or knowledge panels.',
      howToFix:
        'Validate your JSON syntax, remove trailing commas, verify all object keys are double-quoted, and repair unclosed brackets.',
      canAutoFix: true,
      autoFixType: 'fix_malformed_jsonld',
      technicalDetails: raw.structuredData.items.find((i) => !i.isValid)?.parseError || 'Invalid JSON syntax detected.',
      fileTargetPattern: 'index.html',
    });
  } else if (raw.structuredData.count === 0) {
    issues.push({
      id: 'issue_missing_jsonld',
      title: 'No JSON-LD Structured Data Markup Detected',
      category: 'structured_data',
      severity: 'low',
      whatHappened: 'The page does not include any Schema.org structured data (application/ld+json).',
      whyItMatters:
        'Structured data helps Google understand your business, product, article, or organization, qualifying your site for enhanced rich results.',
      howToFix: 'Add a JSON-LD schema block (such as WebSite, Organization, or WebPage) inside your <head>.',
      canAutoFix: false,
      technicalDetails: '0 JSON-LD scripts found.',
    });
  } else {
    issues.push({
      id: 'issue_jsonld_valid',
      title: `Valid JSON-LD Structured Data (${raw.structuredData.count} schema block(s))`,
      category: 'structured_data',
      severity: 'passed',
      whatHappened: `Detected ${raw.structuredData.count} valid JSON-LD schema block(s) without syntax errors.`,
      whyItMatters: 'Helps search engines comprehend entity relationships and qualifies pages for Google rich snippets.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `Types: ${raw.structuredData.items.map((i) => i.type || 'Object').join(', ')}`,
    });
  }

  // 14. Broken Links Sample
  if (raw.links.brokenCount > 0) {
    issues.push({
      id: 'issue_broken_internal_links',
      title: `${raw.links.brokenCount} Broken Internal Link(s) Detected`,
      category: 'links',
      severity: 'high',
      whatHappened: `Sample verification found ${raw.links.brokenCount} internal link(s) returning HTTP errors.`,
      whyItMatters:
        'Broken links waste crawler budget, trap search bots in dead ends, and frustrate visitors with 404 pages.',
      howToFix: 'Update dead link URLs or implement 301 redirects to active replacement pages.',
      canAutoFix: false,
      technicalDetails: `Broken links:\n${raw.links.sampleBroken.map((b) => `${b.href} (HTTP ${b.status})`).join('\n')}`,
    });
  } else if (raw.links.internalCount > 0) {
    issues.push({
      id: 'issue_internal_links_healthy',
      title: 'Healthy Internal Link Structure',
      category: 'links',
      severity: 'passed',
      whatHappened: `Detected ${raw.links.internalCount} internal link(s) without dead-end errors in sample testing.`,
      whyItMatters: 'Distributes page authority and enables efficient search crawler navigation.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `${raw.links.internalCount} internal, ${raw.links.externalCount} external links found.`,
    });
  }

  // 15. Performance Signals
  if (raw.ttfbMs > 1800) {
    issues.push({
      id: 'issue_slow_ttfb',
      title: `Slow Time to First Byte (TTFB: ${raw.ttfbMs}ms)`,
      category: 'performance',
      severity: 'medium',
      whatHappened: `Server response time was ${raw.ttfbMs}ms. Recommended TTFB is under 600ms.`,
      whyItMatters: 'Slow server response delays page rendering and signals sluggish server hosting to crawlers.',
      howToFix: 'Enable server page caching, leverage a global CDN (e.g. Cloudflare), and optimize backend queries.',
      canAutoFix: false,
      technicalDetails: `TTFB: ${raw.ttfbMs}ms`,
    });
  } else if (raw.ttfbMs < 700) {
    issues.push({
      id: 'issue_fast_ttfb',
      title: `Fast Server Response Time (TTFB: ${raw.ttfbMs}ms)`,
      category: 'performance',
      severity: 'passed',
      whatHappened: `The server delivered the first byte in ${raw.ttfbMs}ms, well below the 800ms threshold.`,
      whyItMatters: 'Quick initial byte delivery provides snappy load times and maximizes crawl capacity.',
      howToFix: 'No action required.',
      canAutoFix: false,
      technicalDetails: `TTFB: ${raw.ttfbMs}ms`,
    });
  }

  // Summary counts
  const summary = {
    total: issues.length,
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    passed: issues.filter((i) => i.severity === 'passed').length,
    unableToVerify: issues.filter((i) => i.severity === 'unable_to_verify').length,
  };

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    targetUrl: raw.url,
    timestamp: raw.timestamp,
    durationMs: raw.durationMs,
    statusCode: raw.statusCode,
    statusText: raw.statusText,
    finalUrl: raw.finalUrl,
    protocol: raw.protocol,
    ttfbMs: raw.ttfbMs,
    htmlSizeKb: raw.htmlSizeKb,
    crawledPagesCount: raw.crawlPages.length,
    issues,
    summary,
    raw,
  };
}
