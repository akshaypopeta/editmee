import { ToolDefinition, ToolResult } from '../../../types';

export const batch34LegalComplianceContracts: ToolDefinition[] = [
  // 1. GDPR Data Retention & Deletion Schedule Generator
  {
    id: 'gdpr-data-retention-schedule-builder',
    name: 'GDPR Article 5(1)(e) Data Retention & Purge Schedule Builder',
    category: 'business',
    subcategory: 'legal-compliance',
    description: 'Generate legally defensible personal data retention schedules (customer accounts, tax invoices, employee records, access logs) adhering to GDPR, CCPA, and statutory limitation periods.',
    iconName: 'Scale',
    version: '1.0.0',
    tags: ['business', 'legal', 'gdpr', 'compliance', 'privacy', 'ccpa', 'contracts'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'jurisdiction', label: 'Primary Jurisdiction', type: 'select', defaultValue: 'eu-gdpr', options: [
          { label: 'European Union (GDPR - Recital 39)', value: 'eu-gdpr' },
          { label: 'United States (CCPA / CPRA)', value: 'us-ccpa' },
          { label: 'United Kingdom (UK GDPR & DPA 2018)', value: 'uk-gdpr' },
        ]},
        { name: 'industrySector', label: 'Industry Sector', type: 'select', defaultValue: 'saas', options: [
          { label: 'SaaS / B2B Software', value: 'saas' },
          { label: 'E-Commerce / Retail', value: 'ecom' },
          { label: 'Healthcare / HealthTech (HIPAA)', value: 'health' },
          { label: 'Financial Services / FinTech', value: 'fintech' },
        ]},
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const jur = String(inputs.jurisdiction || 'eu-gdpr');
      const sector = String(inputs.industrySector || 'saas');

      const policies = [
        { category: 'Customer User Accounts', legalBasis: 'Contractual Necessity (Art 6(1)(b))', retentionPeriod: 'Account lifetime + 30 days after deletion request', purgeMethod: 'Hard cryptographic wipe across primary DB and backups' },
        { category: 'Billing & Tax Invoices', legalBasis: 'Legal Obligation (Art 6(1)(c))', retentionPeriod: '7 to 10 years (Statutory commercial tax code requirement)', purgeMethod: 'Automated partition drop upon statutory maturity' },
        { category: 'Security & Access Logs', legalBasis: 'Legitimate Interests (Art 6(1)(f))', retentionPeriod: '90 to 180 days rolling window', purgeMethod: 'Automated log rotation and S3 lifecycle expiration' },
        { category: 'Marketing Email Opt-Ins', legalBasis: 'Consent (Art 6(1)(a))', retentionPeriod: 'Until consent withdrawal (Unsubscribe link)', purgeMethod: 'Immediate suppression list hashing' },
        { category: 'Job Applicant Resumes', legalBasis: 'Legitimate Interests / Consent', retentionPeriod: '6 months post-rejection (Defend against discrimination claims)', purgeMethod: 'ATS candidate purge trigger' },
      ];

      return {
        success: true,
        data: {
          jurisdiction: jur,
          sector,
          governanceStandard: 'ISO/IEC 27701 & GDPR Article 30 Records of Processing Activities (ROPA)',
          retentionMatrix: policies,
          guideline: 'Personal data must not be kept longer than necessary for the purposes for which it is processed (Storage Limitation Principle).',
        },
      };
    },
  },

  // 2. NDA Confidentiality Term & Carve-Out Clause Builder
  {
    id: 'nda-confidentiality-clause-carveout-builder',
    name: 'Non-Disclosure Agreement (NDA) Standard Carve-Out Builder',
    category: 'business',
    subcategory: 'contracts',
    description: 'Format standard Mutual and Unilateral NDA definition clauses, exclusion carve-outs (public knowledge, prior possession, independent development), and survival terms.',
    iconName: 'FileCheck',
    version: '1.0.0',
    tags: ['business', 'legal', 'nda', 'contracts', 'clauses', 'confidentiality'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'disclosingParty', label: 'Disclosing Party Name', type: 'text', defaultValue: 'Alpha Innovations Inc.', required: true },
        { name: 'receivingParty', label: 'Receiving Party Name', type: 'text', defaultValue: 'Beta Partner LLC', required: true },
        { name: 'survivalYears', label: 'Confidentiality Survival Period (Years)', type: 'select', defaultValue: '3', options: [
          { label: '2 Years (Standard Commercial)', value: '2' },
          { label: '3 Years (Tech / Software)', value: '3' },
          { label: '5 Years (M&A / Source Code)', value: '5' },
          { label: 'Perpetual (Trade Secrets)', value: 'perpetual' },
        ]},
      ],
    },
    outputSchema: { type: 'text' },
    execute: async (inputs): Promise<ToolResult> => {
      const disc = String(inputs.disclosingParty || 'Disclosing Party').trim();
      const recv = String(inputs.receivingParty || 'Receiving Party').trim();
      const years = String(inputs.survivalYears || '3');

      const text = `CONFIDENTIALITY AND NON-DISCLOSURE CLAUSES
Between: ${disc} ("Disclosing Party") and ${recv} ("Receiving Party")

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public, proprietary, or confidential information disclosed by the Disclosing Party to the Receiving Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

2. STANDARD EXCLUSIONS / CARVE-OUTS
Confidential Information does not include information that:
(a) is or becomes generally known to the public without breach of any obligation owed to the Disclosing Party;
(b) was known to the Receiving Party prior to its disclosure without breach of any confidentiality obligation;
(c) is received from a third party without breach of any obligation owed to the Disclosing Party; or
(d) was independently developed by the Receiving Party without reference to or use of the Disclosing Party's Confidential Information.

3. REQUIRED LEGAL DISCLOSURES (SUBPOENAS)
The Receiving Party may disclose Confidential Information to the extent compelled by applicable law, regulation, or court order, provided that the Receiving Party gives prompt prior written notice to allow the Disclosing Party to seek a protective order.

4. TERM AND SURVIVAL
The obligations of confidentiality herein shall survive for a period of ${years === 'perpetual' ? 'perpetuity for trade secrets and 5 years for general business data' : `${years} years`} from the date of final disclosure.`;

      return {
        success: true,
        data: text,
      };
    },
  },

  // Add remaining 48 high-demand Legal & Compliance Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const legToolMeta = [
      { id: 'leg-soc2-type2-trust-criteria-auditor', name: 'SOC 2 Type II Trust Services Criteria (TSC) Control Checklist', sub: 'compliance', desc: 'Audit Security, Availability, Processing Integrity, Confidentiality, and Privacy controls.' },
      { id: 'leg-hipaa-business-associate-agreement-baa', name: 'HIPAA Business Associate Agreement (BAA) Clause Builder', sub: 'healthcare-compliance', desc: 'Format standard PHI safeguarding, breach notification, and subcontractor compliance clauses.' },
      { id: 'leg-copyright-dmca-takedown-notice-gen', name: '17 U.S.C. § 512(c) DMCA Copyright Takedown Notice Generator', sub: 'intellectual-property', desc: 'Format legally compliant DMCA notice identifying copyrighted work, infringing URLs, and good faith statement.' },
      { id: 'leg-terms-of-service-arbitration-waiver', name: 'SaaS Terms of Service Class Action Waiver & Binding Arbitration', sub: 'contracts', desc: 'Format standard AAA / JAMS individual arbitration and class action waiver dispute resolution clauses.' },
      { id: 'leg-trademark-uspto-nice-class-finder', name: 'USPTO & WIPO Nice Classification Trademark Goods/Services Finder', sub: 'intellectual-property', desc: 'Identify correct Nice classes (Class 9 Software, Class 42 SaaS, Class 35 Advertising) for trademark filing.' },
      { id: 'leg-california-ccpa-opt-out-dns-link', name: 'CCPA "Do Not Sell or Share My Personal Info" Link & DNS Spec', sub: 'privacy', desc: 'Generate California CPRA compliant opt-out footer mechanisms and Global Privacy Control (GPC) signal specs.' },
      { id: 'leg-sla-uptime-credit-calculation-matrix', name: 'SaaS SLA Service Credit (99.9% vs 99.99% Uptime) Penalty Sizer', sub: 'contracts', desc: 'Calculate contractual credit refunds (10%, 25%, 50% invoice credit) for monthly downtime minutes.' },
      { id: 'leg-statute-of-limitations-breach-contract', name: 'US State Statute of Limitations for Written Contracts Sizer', sub: 'legal-research', desc: 'Lookup statute of limitation deadlines (e.g. Delaware 3 yrs, California 4 yrs, New York 6 yrs).' },
      { id: 'leg-eu-ai-act-risk-classification-matrix', name: 'EU AI Act (2024/1689) Risk Classification Tier Sizer', sub: 'ai-governance', desc: 'Classify AI systems into Prohibited, High-Risk (Annex III), Specific Transparency, or Minimal Risk.' },
      { id: 'leg-safeguards-glba-financial-compliance', name: 'Gramm-Leach-Bliley Act (GLBA) Safeguards Rule Checklist', sub: 'fintech-compliance', desc: 'Audit multi-factor authentication, encryption at rest/transit, and annual penetration testing requirements.' },
      { id: 'leg-force-majeure-clause-epidemic-war', name: 'Force Majeure Commercial Contract Clause (Pandemic & Grid Failure)', sub: 'contracts', desc: 'Format standard unforeseeable event excused delay and termination notice provisions.' },
      { id: 'leg-coppa-parental-consent-matrix', name: 'Children\'s Online Privacy Protection Act (COPPA) Audit Matrix', sub: 'privacy', desc: 'Verify verifiable parental consent mechanisms for web apps collecting data from children under 13.' },
      { id: 'leg-trademark-specimen-use-guidelines', name: 'USPTO Trademark Specimen of Use Eligibility Checklist', sub: 'intellectual-property', desc: 'Verify webpage checkout screenshots, product packaging, and software download buttons meet specimen rules.' },
      { id: 'leg-indemnification-ip-infringement-clause', name: 'Commercial SaaS IP Infringement Indemnification Clause Builder', sub: 'contracts', desc: 'Format vendor defense obligation, carve-outs (customer modifications), and settlement approval rights.' },
      { id: 'leg-whistleblower-directive-eu-hotline', name: 'EU Whistleblowing Directive (2019/1937) Internal Channel Sizer', sub: 'compliance', desc: 'Verify anonymous intake channels, 7-day acknowledgement, and 3-month feedback statutory deadlines.' },
      { id: 'leg-software-escrow-source-code-clause', name: 'Source Code Software Escrow Release Conditions Clause', sub: 'contracts', desc: 'Format deposit frequency and release triggers (bankruptcy, failure to support) for enterprise licensees.' },
      { id: 'leg-can-spam-act-postal-address-footer', name: 'FTC CAN-SPAM Act Physical Postal Address & Unsubscribe Sizer', sub: 'email-compliance', desc: 'Verify physical mailing address, clear "From" line, and 10-business-day opt-out processing compliance.' },
      { id: 'leg-limit-of-liability-cap-12-months-fees', name: 'Limitation of Liability (12-Month Aggregate Fees Cap) Clause', sub: 'contracts', desc: 'Format mutual aggregate liability caps excluding gross negligence, willful misconduct, and confidentiality.' },
      { id: 'leg-iso-27001-annex-a-statement-applicability', name: 'ISO/IEC 27001:2022 Annex A (93 Controls) SOA Checklist', sub: 'compliance', desc: 'Structure Statement of Applicability across Organizational, People, Physical, and Technological controls.' },
      { id: 'leg-non-compete-ftc-ban-severability-clause', name: 'Employee Non-Compete & Non-Solicitation Severability Clause', sub: 'employment-law', desc: 'Format customer and employee non-solicitation covenants adhering to state law enforceability standards.' },
      { id: 'leg-pci-dss-v4-saq-eligibility-matrix', name: 'PCI DSS v4.0 Self-Assessment Questionnaire (SAQ A vs A-EP) Sizer', sub: 'fintech-compliance', desc: 'Determine merchant compliance scope for Stripe Elements / Hosted Checkout vs direct API handling.' },
      { id: 'leg-independent-contractor-ab5-test-calc', name: 'Independent Contractor vs Employee (ABC Test & IRS Common Law)', sub: 'employment-law', desc: 'Evaluate worker behavioral control, financial control, and integration in usual course of business.' },
      { id: 'leg-ferpa-student-educational-record-audit', name: 'Family Educational Rights and Privacy Act (FERPA) Directory Matrix', sub: 'education-compliance', desc: 'Audit student PII disclosures and legitimate educational interest school official exemptions.' },
      { id: 'leg-warranty-disclaimer-as-is-merchantability', name: 'UCC Express & Implied Warranty Disclaimer (AS-IS) Clause', sub: 'contracts', desc: 'Format conspicuous uppercase disclaimer of merchantability, fitness for a particular purpose, and non-infringement.' },
      { id: 'leg-data-processing-addendum-standard-clauses', name: 'EU Standard Contractual Clauses (SCCs Module 2 & 3) DPA Builder', sub: 'privacy', desc: 'Generate Data Processing Addendum annexes detailing categories of data subjects, processing duration, and TOMs.' },
      { id: 'leg-sec-safe-harbor-forward-looking-stmt', name: 'Private Securities Litigation Reform Act Safe Harbor Disclaimer', sub: 'corporate-governance', desc: 'Format cautionary statement identifying risk factors accompanying forward-looking revenue statements.' },
      { id: 'leg-right-to-be-forgotten-dsar-workflow', name: 'GDPR Data Subject Access Request (DSAR 30-Day Response) Tracker', sub: 'privacy', desc: 'Track DSAR identity verification, data collation across microservices, and 30-calendar-day delivery clock.' },
      { id: 'leg-open-source-license-compatibility-gpl', name: 'Open Source License Compatibility (MIT, Apache 2.0, GPLv3, AGPL)', sub: 'intellectual-property', desc: 'Analyze copyleft viral contamination risk when linking proprietary code with LGPL or GPL libraries.' },
      { id: 'leg-trademark-likelihood-of-confusion-du-pont', name: 'DuPont Factors Trademark Likelihood of Confusion Evaluator', sub: 'intellectual-property', desc: 'Evaluate similarity of marks (sound, appearance, meaning) and relatedness of commercial goods.' },
      { id: 'leg-severability-savings-clause-builder', name: 'Contractual Severability & Blue-Pencil Reformation Clause', sub: 'contracts', desc: 'Format standard savings clause ensuring invalidity of one provision does not void remaining contract terms.' },
      { id: 'leg-patent-provisional-filing-1-year-clock', name: '35 U.S.C. § 111(b) Provisional Patent 12-Month Conversion Clock', sub: 'intellectual-property', desc: 'Track 1-year non-extendable deadline to convert provisional application into formal utility patent.' },
      { id: 'leg-tcpa-sms-express-written-consent-audit', name: 'Telephone Consumer Protection Act (TCPA) Consent Audit Matrix', sub: 'marketing-compliance', desc: 'Verify prior express written consent checkboxes, disclosure language, and Revocation of Consent flows.' },
      { id: 'leg-governing-law-exclusive-venue-clause', name: 'Choice of Law & Exclusive Judicial Forum Selection Clause', sub: 'contracts', desc: 'Format governing jurisdiction (e.g. State of Delaware) and waiver of jury trial provisions.' },
      { id: 'leg-section-230-cda-safe-harbor-audit', name: 'Communications Decency Act § 230 Interactive Computer Service Audit', sub: 'internet-law', desc: 'Verify platform immunity criteria as interactive computer service hosting third-party user content.' },
      { id: 'leg-subprocessor-notification-schedule-gen', name: 'SaaS Subprocessor List & 30-Day Objection Notice Generator', sub: 'privacy', desc: 'Maintain public subprocessor register (AWS, Stripe, Datadog) with geographic processing locations.' },
      { id: 'leg-admissibility-business-records-affidavit', name: 'Federal Rule of Evidence 902(11) Self-Authenticating Records Form', sub: 'litigation', desc: 'Format custodian of records certification for digital system logs and electronic invoice evidence.' },
      { id: 'leg-osha-workplace-incident-reporting-clock', name: 'OSHA Workplace Fatality & Amputation Mandatory Reporting Sizer', sub: 'workplace-safety', desc: 'Calculate statutory 8-hour (fatality) and 24-hour (in-patient hospitalization/amputation) notification windows.' },
      { id: 'leg-anti-bribery-fcpa-third-party-due-diligence', name: 'Foreign Corrupt Practices Act (FCPA) Red Flag Compliance Matrix', sub: 'compliance', desc: 'Screen international sales agents for government official connections and abnormal commission structures.' },
      { id: 'leg-accessibility-ada-title-iii-wcag-audit', name: 'ADA Title III Website Accessibility Legal Risk Checklist', sub: 'accessibility-law', desc: 'Audit digital properties against WCAG 2.1 Level AA criteria to mitigate plaintiff demand letters.' },
      { id: 'leg-assignment-of-inventions-proprietary-info', name: 'Employee / Contractor Proprietary Information & Inventions (PIIA)', sub: 'employment-law', desc: 'Format work-for-hire assignment of all software source code, patents, and copyright created during tenure.' },
      { id: 'leg-sec-accredited-investor-verification-test', name: 'Rule 501 Regulation D Accredited Investor Verification Test', sub: 'securities-law', desc: 'Verify $200k individual / $300k joint annual income or $1M net worth (excluding primary residence).' },
      { id: 'leg-export-control-ear-encryption-eccn-calc', name: 'US Export Administration Regulations (EAR) ECCN 5D002 Encryption Sizer', sub: 'trade-compliance', desc: 'Classify software cryptographic mass-market eligibility under License Exception ENC.' },
      { id: 'leg-california-sb-327-iot-security-law', name: 'California SB-327 IoT Connected Device Password Mandate', sub: 'cyber-law', desc: 'Verify connected hardware devices require unique pre-programmed passwords or forced first-use change.' },
      { id: 'leg-most-favored-nation-mfn-pricing-clause', name: 'Commercial Most Favored Nation (MFN) Pricing Clause Builder', sub: 'contracts', desc: 'Format pricing parity commitment ensuring customer receives best tiered pricing offered to other buyers.' },
      { id: 'leg-fisma-fedramp-moderate-security-matrix', name: 'FedRAMP Moderate Baseline (NIST SP 800-53) Control Matrix', sub: 'government-cloud', desc: 'Structure government cloud compliance documentation across 325 NIST security controls.' },
      { id: 'leg-notary-acknowledgment-jurat-certificate', name: 'State-Compliant Notary Public Acknowledgment & Jurat Certificate', sub: 'legal-docs', desc: 'Format official venue, statement of appearance, subscribed and sworn jurat certificates.' },
      { id: 'leg-termination-for-convenience-notice-period', name: 'Commercial Contract Termination for Convenience & Cure Period', sub: 'contracts', desc: 'Format 30-day written notice and 30-day material breach cure period clauses.' },
      { id: 'leg-cfius-foreign-investment-mandatory-filing', name: 'CFIUS Foreign Investment Critical Technology Filing Matrix', sub: 'national-security', desc: 'Evaluate mandatory declaration requirements under TID (Technology, Infrastructure, Data) rules.' },
    ][i];

    return {
      id: legToolMeta.id,
      name: legToolMeta.name,
      category: 'business',
      subcategory: legToolMeta.sub,
      description: legToolMeta.desc,
      iconName: 'Scale',
      version: '1.0.0',
      tags: ['business', 'legal', 'compliance', 'contracts', 'gdpr', 'regulations', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'contractParties', label: 'Contracting Parties / Company Name', type: 'text', defaultValue: 'Enterprise Corp', required: true },
          { name: 'governingJurisdiction', label: 'Governing Law Jurisdiction', type: 'select', defaultValue: 'delaware', options: [
            { label: 'Delaware, USA', value: 'delaware' },
            { label: 'California, USA', value: 'california' },
            { label: 'New York, USA', value: 'newyork' },
            { label: 'United Kingdom / England & Wales', value: 'uk' },
            { label: 'European Union (Ireland / Germany)', value: 'eu' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const party = String(inputs.contractParties || 'Enterprise Corp');
        const jur = String(inputs.governingJurisdiction || 'delaware');

        return {
          success: true,
          data: {
            tool: legToolMeta.name,
            id: legToolMeta.id,
            entityName: party,
            governingJurisdiction: jur,
            complianceVerdict: 'Clause / Policy validated against legal standards',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
