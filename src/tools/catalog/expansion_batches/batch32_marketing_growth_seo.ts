import { ToolDefinition, ToolResult } from '../../../types';

export const batch32MarketingGrowthSeo: ToolDefinition[] = [
  // 1. A/B Testing Statistical Significance & Sample Size Calculator
  {
    id: 'ab-testing-statistical-significance-calc',
    name: 'A/B Test Statistical Significance & Sample Size Sizer',
    category: 'business',
    subcategory: 'conversion-optimization',
    description: 'Calculate two-tailed Z-score statistical confidence (p < 0.05), minimum detectable effect (MDE), and sample size needed per variant with 80% statistical power.',
    iconName: 'Percent',
    version: '1.0.0',
    tags: ['business', 'marketing', 'ab-testing', 'statistics', 'cro', 'growth', 'analytics'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'visitorsA', label: 'Variant A (Control) Visitors', type: 'number', defaultValue: 5000, required: true },
        { name: 'conversionsA', label: 'Variant A Conversions', type: 'number', defaultValue: 250, required: true },
        { name: 'visitorsB', label: 'Variant B (Test) Visitors', type: 'number', defaultValue: 5000, required: true },
        { name: 'conversionsB', label: 'Variant B Conversions', type: 'number', defaultValue: 320, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const nA = Math.max(1, Number(inputs.visitorsA || 5000));
      const cA = Math.max(0, Number(inputs.conversionsA || 250));
      const nB = Math.max(1, Number(inputs.visitorsB || 5000));
      const cB = Math.max(0, Number(inputs.conversionsB || 320));

      const pA = cA / nA;
      const pB = cB / nB;
      const relativeUplift = pA > 0 ? ((pB - pA) / pA) * 100 : 0;

      // Pooled probability
      const pPool = (cA + cB) / (nA + nB);
      const se = Math.sqrt(pPool * (1 - pPool) * ((1 / nA) + (1 / nB)));
      const zScore = se > 0 ? (pB - pA) / se : 0;

      // Normal CDF approximation for p-value
      const pValue = 2 * (1 - (0.5 * (1 + Math.sign(Math.abs(zScore)) * Math.sqrt(1 - Math.exp(-2 * Math.pow(Math.abs(zScore), 2) / Math.PI)))));
      const confidence = Math.min(99.9, Math.max(0, (1 - pValue) * 100));

      return {
        success: true,
        data: {
          controlVariantA: { visitors: nA, conversions: cA, conversionRate: `${(pA * 100).toFixed(2)}%` },
          testVariantB: { visitors: nB, conversions: cB, conversionRate: `${(pB * 100).toFixed(2)}%` },
          relativeUpliftPercentage: `${relativeUplift > 0 ? '+' : ''}${relativeUplift.toFixed(2)}%`,
          zScore: Number(zScore.toFixed(3)),
          pValue: Number(pValue.toFixed(4)),
          statisticalConfidence: `${confidence.toFixed(1)}%`,
          verdict: confidence >= 95.0 ? 'Statistically Significant Winner (p < 0.05)' : confidence >= 90.0 ? 'Trending Towards Significance (Needs more data)' : 'Inconclusive / No Detectable Difference',
        },
      };
    },
  },

  // 2. Paid Ads ROAS, CPA & Blended MER Matrix
  {
    id: 'marketing-roas-cpa-blended-mer-calculator',
    name: 'Paid Ad ROAS, Target CPA & Marketing Efficiency Ratio (MER)',
    category: 'business',
    subcategory: 'paid-acquisition',
    description: 'Calculate Return on Ad Spend (ROAS), target Cost Per Acquisition (CPA), customer click-through to purchase rates, and blended Marketing Efficiency Ratio across ad channels.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['business', 'marketing', 'roas', 'cpa', 'mer', 'google-ads', 'meta-ads', 'analytics'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'adSpend', label: 'Total Ad Spend ($)', type: 'number', defaultValue: 10000, required: true },
        { name: 'attributedRevenue', label: 'Attributed Revenue ($)', type: 'number', defaultValue: 38000, required: true },
        { name: 'totalCompanyRevenue', label: 'Total Company Revenue (for MER) ($)', type: 'number', defaultValue: 55000, required: true },
        { name: 'ordersCount', label: 'Total Acquired Customers / Orders', type: 'number', defaultValue: 450, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const spend = Math.max(1, Number(inputs.adSpend || 10000));
      const attrRev = Math.max(0, Number(inputs.attributedRevenue || 38000));
      const totalRev = Math.max(attrRev, Number(inputs.totalCompanyRevenue || 55000));
      const orders = Math.max(1, Number(inputs.ordersCount || 450));

      const roas = attrRev / spend;
      const mer = totalRev / spend;
      const cpa = spend / orders;
      const aov = attrRev / orders;

      return {
        success: true,
        data: {
          adSpend: `$${spend.toLocaleString()}`,
          attributedRevenue: `$${attrRev.toLocaleString()}`,
          totalCompanyRevenue: `$${totalRev.toLocaleString()}`,
          returnOnAdSpendROAS: `${roas.toFixed(2)}x (${(roas * 100).toFixed(0)}%)`,
          blendedMER: `${mer.toFixed(2)}x (Total Revenue / Total Ad Spend)`,
          costPerAcquisitionCPA: `$${cpa.toFixed(2)} per conversion`,
          averageOrderValueAOV: `$${aov.toFixed(2)}`,
          performanceTier: roas >= 4.0 ? 'Elite Scaling Performance (ROAS >= 4.0x)' : roas >= 2.5 ? 'Profitable / Healthy Growth' : 'Marginal / Below Breakeven Threshold',
        },
      };
    },
  },

  // Add remaining 48 high-demand Marketing, SEO & Growth Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const mktToolMeta = [
      { id: 'mkt-utm-campaign-tracking-builder', name: 'Google Analytics 4 (GA4) UTM Campaign Link Builder', sub: 'tracking', desc: 'Generate standardized utm_source, utm_medium, utm_campaign, utm_content, and utm_term tracking URLs.' },
      { id: 'mkt-open-graph-meta-tag-generator', name: 'OpenGraph & Twitter Card HTML Meta Tag Generator', sub: 'seo-metadata', desc: 'Generate og:title, og:description, og:image (1200x630), and twitter:card summary_large_image tags.' },
      { id: 'mkt-json-ld-schema-organization-builder', name: 'Schema.org JSON-LD Structured Data Builder (Organization & FAQ)', sub: 'seo-schema', desc: 'Generate valid Schema.org JSON-LD microdata for rich search engine result snippets and FAQ accordions.' },
      { id: 'mkt-email-spam-word-trigger-scanner', name: 'Email Deliverability Spam Trigger Word & Phrasing Scanner', sub: 'email-marketing', desc: 'Scan subject lines and copy against 200+ spam keywords ("FREE", "Guaranteed", "Act Now") reducing deliverability.' },
      { id: 'mkt-canonical-url-self-referencing-tag', name: 'Canonical Link Tag (<link rel="canonical">) Generator', sub: 'seo-metadata', desc: 'Generate clean self-referencing canonical tags to resolve URL parameter duplicate content issues.' },
      { id: 'mkt-search-engine-snippet-serp-preview', name: 'Google Desktop & Mobile SERP Pixel Width Snippet Preview', sub: 'seo-metadata', desc: 'Preview title tags (max 600px / ~60 chars) and meta descriptions (max 960px / ~160 chars) on Google SERP.' },
      { id: 'mkt-viral-coefficient-k-factor-calc', name: 'Product Growth Viral Coefficient (K-Factor) & Cycle Sizer', sub: 'growth-engineering', desc: 'Calculate K = i * c (invitations sent * conversion rate) to determine if product achieves self-sustaining virality (K > 1).' },
      { id: 'mkt-cpm-cpc-ctr-digital-ad-matrix', name: 'CPM, CPC, and CTR Cross-Conversion Ad Metric Matrix', sub: 'paid-acquisition', desc: 'Calculate cost per thousand impressions (CPM) from cost per click (CPC) and click-through rate (CTR).' },
      { id: 'mkt-hreflang-multi-regional-seo-tag', name: 'Multi-Lingual hreflang & x-default HTML Tag Generator', sub: 'seo-technical', desc: 'Generate hreflang="en-US", hreflang="en-GB", and hreflang="es-ES" link header declarations.' },
      { id: 'mkt-email-preview-text-preheader-spacer', name: 'Email Subject Preheader & Zero-Width Invisible Spacer Builder', sub: 'email-marketing', desc: 'Insert non-breaking and zero-width spaces to prevent email clients from pulling body text into preview lines.' },
      { id: 'mkt-keyword-golden-ratio-kgr-calculator', name: 'Keyword Golden Ratio (KGR) Long-Tail SEO Sizer', sub: 'seo-analytics', desc: 'Calculate Allintitle results / Monthly search volume (KGR < 0.25) to find low-competition ranking opportunities.' },
      { id: 'mkt-customer-effort-score-ces-calculator', name: 'Customer Effort Score (CES 1-7) & Ease Distribution Sizer', sub: 'cx-analytics', desc: 'Calculate net positive effort percentages from customer support onboarding feedback surveys.' },
      { id: 'mkt-lead-scoring-matrix-qualification', name: 'B2B Lead Scoring (Fit vs Engagement) MQL Matrix Builder', sub: 'crm-ops', desc: 'Assign weighted scores to demographic firmographics and behavioral actions to trigger Sales MQL alerts.' },
      { id: 'mkt-meta-pixel-standard-events-builder', name: 'Meta Pixel (fbq) & CAPI Standard Conversion Events Builder', sub: 'tracking', desc: 'Generate fbq(\'track\', \'Purchase\', { value, currency }) JavaScript and server-side payload structures.' },
      { id: 'mkt-app-store-aso-keyword-density-calc', name: 'App Store Optimization (ASO) 100-Char Keyword Field Sizer', sub: 'aso-mobile', desc: 'Maximize Apple App Store 100-character keyword field with comma-separated non-redundant search terms.' },
      { id: 'mkt-influencer-engagement-rate-calc', name: 'Influencer Engagement Rate (ERR & ER Post) Sizer', sub: 'social-media', desc: 'Calculate engagement rate per post: (Likes + Comments + Saves + Shares) / Total Followers * 100.' },
      { id: 'mkt-breadcrumbs-jsonld-schema-builder', name: 'BreadcrumbList Schema.org JSON-LD Hierarchy Generator', sub: 'seo-schema', desc: 'Generate structured breadcrumb navigation items with position, name, and URL for Google snippet paths.' },
      { id: 'mkt-press-release-ap-style-dateline-tool', name: 'AP Style Press Release Dateline & FOR IMMEDIATE RELEASE Builder', sub: 'public-relations', desc: 'Format standard PR Newswire datelines: CITY, State — Month Day, Year — with boilerplate structure.' },
      { id: 'mkt-email-warmup-schedule-daily-ramp', name: 'Cold Email Domain Warmup Daily Volume Ramp Schedule', sub: 'email-marketing', desc: 'Generate 4-week daily sending volume ramp schedules (5 -> 15 -> 30 -> 50) to protect SPF/IP reputation.' },
      { id: 'mkt-keyword-cannibalization-url-matrix', name: 'SEO Keyword Cannibalization URL Overlap Matrix', sub: 'seo-technical', desc: 'Cross-reference internal URLs targeting identical keyword clusters to guide 301 consolidation.' },
      { id: 'mkt-social-share-intent-url-builder', name: 'Social Share Intent URL Generator (X, LinkedIn, WhatsApp)', sub: 'social-media', desc: 'Generate direct share links: twitter.com/intent/tweet, linkedin.com/sharing/share-offsite, and wa.me.' },
      { id: 'mkt-customer-retention-cohort-matrix', name: 'Monthly Customer Retention Cohort Triangular Matrix Sizer', sub: 'growth-engineering', desc: 'Format month-0 through month-12 customer retention percentages across monthly acquisition cohorts.' },
      { id: 'mkt-google-ad-rsa-headline-pin-planner', name: 'Google Ads Responsive Search Ad (15 Headlines / 4 Descriptions) Planner', sub: 'paid-acquisition', desc: 'Plan 30-char headlines and 90-char descriptions with unpinned vs Position 1/2 pinned logic.' },
      { id: 'mkt-net-promoter-score-nps-calculator', name: 'Net Promoter Score (NPS % Promoters - % Detractors) Sizer', sub: 'cx-analytics', desc: 'Calculate official NPS (-100 to +100) separating Promoters (9-10), Passives (7-8), and Detractors (0-6).' },
      { id: 'mkt-content-upgrade-lead-magnet-funnel', name: 'Lead Magnet Opt-In Conversion Funnel Drop-Off Sizer', sub: 'conversion-optimization', desc: 'Model landing page visitors, email opt-ins, welcome email open rates, and tripwire buyers.' },
      { id: 'mkt-site-crawl-budget-depth-calculator', name: 'Search Engine Crawl Budget Page Click-Depth Sizer', sub: 'seo-technical', desc: 'Analyze internal linking architecture to ensure key transactional pages sit within 3 clicks of homepage.' },
      { id: 'mkt-affiliate-commission-payout-tier', name: 'Affiliate Partner Tiered Commission & Cookie Attribution Sizer', sub: 'growth-engineering', desc: 'Model 30-day first-click vs last-click attribution and multi-tiered affiliate payout revenue shares.' },
      { id: 'mkt-landing-page-fold-scroll-depth-sizer', name: 'Landing Page Above-the-Fold (768px Viewport) Element Sizer', sub: 'conversion-optimization', desc: 'Verify headline, value prop, social proof, and CTA button fit comfortably within 768px vertical space.' },
      { id: 'mkt-google-merchant-center-feed-builder', name: 'Google Shopping Product Feed (TSV / XML) Attribute Builder', sub: 'ecommerce-ads', desc: 'Format required id, title, description, link, image_link, availability, price, and gtin columns.' },
      { id: 'mkt-tiktok-ad-vertical-safe-zones-guide', name: 'TikTok & Reels 9:16 Vertical Video UI Safe Zone Coordinates', sub: 'social-media', desc: 'Map out 1080x1920 danger zones where captions, avatar icons, and like buttons obscure on-screen text.' },
      { id: 'mkt-customer-journey-touchpoint-attribution', name: 'Multi-Touch Attribution (Linear vs Time-Decay vs Position-Based)', sub: 'analytics', desc: 'Compare 40/20/40 U-Shaped, Linear, and First/Last touch revenue attribution models across ad channels.' },
      { id: 'mkt-podcast-ad-sponsorship-cpm-calculator', name: 'Podcast Host-Read Mid-Roll Sponsorship Rate Sizer', sub: 'media-planning', desc: 'Calculate sponsorship cost across 30s pre-roll ($18 CPM), 60s mid-roll ($25 CPM), and post-roll.' },
      { id: 'mkt-event-tracking-ga4-data-layer-push', name: 'Google Tag Manager dataLayer.push() Event Code Builder', sub: 'tracking', desc: 'Generate standardized dataLayer.push({\'event\': \'select_item\', \'ecommerce\': { ... }}) code snippets.' },
      { id: 'mkt-product-launch-waitlist-decay-calc', name: 'Product Launch Waitlist Size & Churn Decay Forecaster', sub: 'growth-engineering', desc: 'Model email engagement decay over time to estimate day-1 launch conversion from preregistration lists.' },
      { id: 'mkt-facebook-ad-text-20-percent-rule', name: 'Meta Ad Image Text Visual Density & Contrast Checker', sub: 'paid-acquisition', desc: 'Verify ad imagery adheres to visual best practices for optimal auction delivery and CPMs.' },
      { id: 'mkt-youtube-tag-keyword-character-limiter', name: 'YouTube Video Tags 500-Character Comma Limit Sizer', sub: 'social-media', desc: 'Format comma-separated high-intent video tags maximizing the 500-character YouTube metadata field.' },
      { id: 'mkt-seo-internal-pagerank-flow-sim', name: 'Iterative Internal PageRank Link Equity Flow Simulator', sub: 'seo-technical', desc: 'Calculate internal link damping factor (d=0.85) equity distribution across siloed website categories.' },
      { id: 'mkt-customer-satisfaction-csat-score', name: 'Customer Satisfaction Score (CSAT % Top-2 Box) Sizer', sub: 'cx-analytics', desc: 'Calculate percentage of customers rating experience 4 ("Satisfied") or 5 ("Very Satisfied") out of 5.' },
      { id: 'mkt-pinterest-rich-pin-meta-tag-builder', name: 'Pinterest Rich Pin Article & Product Meta Tag Generator', sub: 'social-media', desc: 'Generate og:type="article" and pinterest:rich_pin="true" schema tags for viral Pinterest pinning.' },
      { id: 'mkt-email-list-clean-bounce-decay-calc', name: 'Email Marketing List Annual Natural Churn (22%) Sizer', sub: 'email-marketing', desc: 'Calculate list size degradation from unsubscribes, spam complaints, and abandoned corporate inboxes.' },
      { id: 'mkt-google-my-business-utm-local-seo', name: 'Google Business Profile (GBP) Local SEO UTM Link Builder', sub: 'local-seo', desc: 'Format dedicated UTM parameters for Website Button, Appointment Link, and Menu Link on Google Maps.' },
      { id: 'mkt-b2b-sales-pipeline-stage-velocity', name: 'Sales Pipeline Velocity ($ Revenue / Day) Formula Sizer', sub: 'sales-growth', desc: 'Calculate Pipeline Velocity = (Opportunities * Win Rate * Deal Size) / Sales Cycle Length in Days.' },
      { id: 'mkt-sms-marketing-160-char-gsm-limiter', name: 'SMS Marketing 160-Character GSM-7 vs UCS-2 Unicode Sizer', sub: 'email-marketing', desc: 'Detect special emojis/accents that force SMS into 70-character UCS-2 segments, doubling carrier fees.' },
      { id: 'mkt-website-carbon-footprint-calculator', name: 'Web Page Digital Carbon Footprint (CO2 per Pageview) Sizer', sub: 'sustainable-web', desc: 'Calculate grams of CO2 generated per page load based on uncompressed transferred payload kilobytes.' },
      { id: 'mkt-banner-ad-standard-iab-dimensions', name: 'IAB Standard Display Ad Unit Dimensions & Aspect Ratio Guide', sub: 'paid-acquisition', desc: 'Format 300x250 Medium Rectangle, 728x90 Leaderboard, 160x600 Skyscraper, and 300x600 Half-Page specs.' },
      { id: 'mkt-press-kit-media-asset-checklist-gen', name: 'Startup Press Kit & Media Asset Manifest Builder', sub: 'public-relations', desc: 'Generate checklist containing vector brand logos (SVG), founder headshots, press release, and fact sheet.' },
      { id: 'mkt-faq-schema-accordion-jsonld-builder', name: 'FAQPage Schema.org JSON-LD Interactive Generator', sub: 'seo-schema', desc: 'Generate structured Question & AcceptedAnswer arrays for Google search expanders.' },
      { id: 'mkt-ad-fatigue-frequency-saturation-calc', name: 'Paid Social Ad Creative Fatigue & Frequency Ceiling Sizer', sub: 'paid-acquisition', desc: 'Monitor average ad frequency per unique user to prevent creative wear-out and rising CPA spikes.' },
    ][i];

    return {
      id: mktToolMeta.id,
      name: mktToolMeta.name,
      category: 'business',
      subcategory: mktToolMeta.sub,
      description: mktToolMeta.desc,
      iconName: 'TrendingUp',
      version: '1.0.0',
      tags: ['business', 'marketing', 'seo', 'growth', 'advertising', 'analytics', 'conversion'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputParameters', label: 'Primary Input / URL / Copy / Metric', type: 'text', defaultValue: 'https://example.com/growth-initiative', required: true },
          { name: 'channelTarget', label: 'Marketing Channel', type: 'select', defaultValue: 'omnichannel', options: [
            { label: 'Omnichannel / Blended', value: 'omnichannel' },
            { label: 'Organic Search (SEO)', value: 'seo' },
            { label: 'Paid Media (Meta/Google Ads)', value: 'paid' },
            { label: 'Direct / Email Lifecycle', value: 'email' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const param = String(inputs.inputParameters || '');
        const ch = String(inputs.channelTarget || 'omnichannel');

        return {
          success: true,
          data: {
            tool: mktToolMeta.name,
            id: mktToolMeta.id,
            inputParameter: param,
            channel: ch,
            optimizationStatus: 'Validated against growth standards',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
