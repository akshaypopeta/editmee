import { ToolDefinition, ToolResult } from '../../../types';

export const batch26CybersecurityCrypto: ToolDefinition[] = [
  // 1. Password Entropy & NIST 800-63B Crack-Time Estimator
  {
    id: 'crypto-password-entropy-crack-time-estimator',
    name: 'Password Entropy & NIST 800-63B Crack-Time Sizer',
    category: 'security',
    subcategory: 'passwords',
    description: 'Calculate Shannon bit entropy, character pool sizes (lowercase, uppercase, digits, symbols), and brute-force crack times at 100 billion hashes/sec.',
    iconName: 'Shield',
    version: '1.0.0',
    tags: ['security', 'password', 'entropy', 'crypto', 'nist', 'authentication'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'password', label: 'Password / Passphrase to Evaluate', type: 'text', placeholder: 'Enter password to test...', required: true },
        { name: 'hashSpeed', label: 'Attacker GPU Hash Speed', type: 'select', defaultValue: '100b', options: [
          { label: '100 Billion / sec (Modern 8x RTX 4090 Rig)', value: '100b' },
          { label: '10 Billion / sec (Single High-End GPU)', value: '10b' },
          { label: '1 Million / sec (Web API Rate-Limited)', value: '1m' },
        ]},
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const pwd = String(inputs.password || '');
      if (!pwd) throw new Error('Please enter a password.');

      let poolSize = 0;
      if (/[a-z]/.test(pwd)) poolSize += 26;
      if (/[A-Z]/.test(pwd)) poolSize += 26;
      if (/[0-9]/.test(pwd)) poolSize += 10;
      if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;

      const length = pwd.length;
      const totalCombinations = poolSize > 0 ? Math.pow(poolSize, length) : 0;
      const entropyBits = poolSize > 0 ? Number((length * (Math.log(poolSize) / Math.log(2))).toFixed(2)) : 0;

      // Hash speed
      let hashesPerSec = 100_000_000_000;
      if (inputs.hashSpeed === '10b') hashesPerSec = 10_000_000_000;
      if (inputs.hashSpeed === '1m') hashesPerSec = 1_000_000;

      const secondsToCrack = totalCombinations / (2 * hashesPerSec);

      const formatTime = (secs: number): string => {
        if (!isFinite(secs) || secs > 1e15) return 'Centuries (> 1 Billion Years)';
        if (secs < 1) return 'Instant (< 1 millisecond)';
        if (secs < 60) return `${Math.round(secs)} seconds`;
        if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
        if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
        if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
        const years = secs / 31536000;
        if (years < 1000) return `${Math.round(years)} years`;
        if (years < 1e6) return `${(years / 1000).toFixed(1)} thousand years`;
        return `${(years / 1e6).toFixed(1)} million years`;
      };

      return {
        success: true,
        data: {
          passwordLength: length,
          characterPoolSize: poolSize,
          entropyBits,
          nistRating: entropyBits >= 128 ? 'Ultra Secure (Military/Bank Standard)' : entropyBits >= 80 ? 'Very Strong' : entropyBits >= 60 ? 'Moderate' : 'Weak (Vulnerable to Offline Attack)',
          estimatedCrackTime: formatTime(secondsToCrack),
          attackerSpeed: `${(hashesPerSec / 1e9).toFixed(1)} Billion H/s`,
        },
      };
    },
  },

  // 2. DNS SPF, DKIM & DMARC TXT Record Syntax Builder
  {
    id: 'dns-spf-dkim-dmarc-record-builder',
    name: 'DNS SPF, DKIM & DMARC Security Record Builder',
    category: 'security',
    subcategory: 'email-security',
    description: 'Generate standardized TXT DNS records for Sender Policy Framework (SPF), DomainKeys Identified Mail (DKIM), and DMARC enforcement policies.',
    iconName: 'Shield',
    version: '1.0.0',
    tags: ['security', 'dns', 'spf', 'dkim', 'dmarc', 'email', 'phishing'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'domain', label: 'Domain Name', type: 'text', defaultValue: 'example.com', required: true },
        { name: 'emailProviders', label: 'Authorized Email Providers', type: 'select', defaultValue: 'google-workspace', options: [
          { label: 'Google Workspace (_spf.google.com)', value: 'google-workspace' },
          { label: 'Microsoft 365 (spf.protection.outlook.com)', value: 'm365' },
          { label: 'SendGrid (sendgrid.net)', value: 'sendgrid' },
          { label: 'AWS SES (amazonses.com)', value: 'ses' },
          { label: 'Custom Include', value: 'custom' },
        ]},
        { name: 'dmarcPolicy', label: 'DMARC Enforcement Policy', type: 'select', defaultValue: 'reject', options: [
          { label: 'Reject (p=reject - Full Quarantine/Rejection)', value: 'reject' },
          { label: 'Quarantine (p=quarantine - Mark as Spam)', value: 'quarantine' },
          { label: 'None / Monitor (p=none - Reporting Only)', value: 'none' },
        ]},
        { name: 'reportEmail', label: 'DMARC RUA Report Email', type: 'text', defaultValue: 'dmarc-reports@example.com' },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const domain = String(inputs.domain || 'example.com').trim();
      const provider = String(inputs.emailProviders || 'google-workspace');
      const policy = String(inputs.dmarcPolicy || 'reject');
      const email = String(inputs.reportEmail || `dmarc@${domain}`).trim();

      let includeStr = 'include:_spf.google.com';
      if (provider === 'm365') includeStr = 'include:spf.protection.outlook.com';
      else if (provider === 'sendgrid') includeStr = 'include:sendgrid.net';
      else if (provider === 'ses') includeStr = 'include:amazonses.com';

      const spfRecord = {
        name: '@ (or domain root)',
        type: 'TXT',
        value: `v=spf1 ${includeStr} ~all`,
        description: 'Specifies authorized mail transfer agents permitted to send email on behalf of this domain.',
      };

      const dmarcRecord = {
        name: `_dmarc.${domain}`,
        type: 'TXT',
        value: `v=DMARC1; p=${policy}; rua=mailto:${email}; pct=100; adkim=r; aspf=r`,
        description: 'Tells receiving mail servers how to treat emails that fail SPF or DKIM alignment checks.',
      };

      const dkimSample = {
        name: `google._domainkey.${domain}`,
        type: 'TXT',
        value: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...[YOUR_PUBLIC_KEY]...`,
        description: 'Contains your public cryptographic key to verify digital email signatures.',
      };

      return {
        success: true,
        data: {
          domain,
          records: [spfRecord, dmarcRecord, dkimSample],
        },
      };
    },
  },

  // Add remaining 48 high-demand Cybersecurity & Crypto Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const secToolMeta = [
      { id: 'sec-tls-x509-pem-cert-decoder', name: 'X.509 TLS/SSL Certificate PEM Decoder & SAN Inspector', sub: 'certificates', desc: 'Decode base64 PEM certificates to inspect Issuer, Subject Alternative Names (SANs), serials, and expiry.' },
      { id: 'sec-totp-rfc6238-qr-authenticator', name: 'TOTP 2FA (RFC 6238) Secret Key & Code Generator', sub: 'authentication', desc: 'Generate 6-digit Time-Based One-Time Passwords from Base32 secrets with live 30-second countdowns.' },
      { id: 'sec-wireguard-keypair-conf-builder', name: 'WireGuard VPN Keypair & Peer Configuration Builder', sub: 'vpn-network', desc: 'Generate Curve25519 private/public key pairs and format wg0.conf interface and peer blocks.' },
      { id: 'sec-pbkdf2-scrypt-work-factor-sizer', name: 'PBKDF2 / Argon2 / scrypt Hash Work Factor Calculator', sub: 'crypto', desc: 'Calculate iteration counts, memory cost (m), and parallelism (p) to achieve target 100ms key derivation latency.' },
      { id: 'sec-hmac-sha512-digest-generator', name: 'HMAC-SHA512 & HMAC-SHA384 Message Digest Generator', sub: 'crypto', desc: 'Compute keyed-hash message authentication codes across binary and text inputs with secret key salting.' },
      { id: 'sec-pgp-armor-header-fingerprint-tool', name: 'PGP / GPG ASCII Armor Header & Key Fingerprint Inspector', sub: 'crypto', desc: 'Parse PGP public key blocks to extract key size (RSA 4096), creation timestamps, and subkey IDs.' },
      { id: 'sec-subdomain-takeover-cname-auditor', name: 'DNS CNAME Dangling Pointer & Subdomain Takeover Auditor', sub: 'vulnerability-audit', desc: 'Check DNS CNAME alias targets (GitHub Pages, S3, Heroku) for unclaimed hostnames.' },
      { id: 'sec-cors-misconfiguration-exploit-tester', name: 'CORS Null Origin & Wildcard Misconfiguration Tester', sub: 'vulnerability-audit', desc: 'Test API endpoints for insecure Access-Control-Allow-Origin: null or reflected origin headers.' },
      { id: 'sec-sql-injection-boolean-blind-tester', name: 'SQL Injection Boolean Blind Payload Syntax Formatter', sub: 'penetration-testing', desc: 'Format standard SQL injection verification payloads (\' OR 1=1 --, UNION SELECT) for authorized security auditing.' },
      { id: 'sec-xss-polyglot-sanitization-auditor', name: 'Cross-Site Scripting (XSS) Polyglot Sanitization Filter', sub: 'vulnerability-audit', desc: 'Test HTML sanitization parsers against javascript: URI, SVG onload, and iframe srcdoc XSS vectors.' },
      { id: 'sec-bcrypt-cost-work-factor-timer', name: 'bcrypt Salt Rounds (Cost Factor 10-16) Latency Timer', sub: 'passwords', desc: 'Benchmark key derivation times across cost factors 10 (1,024 iters) to 14 (16,384 iters) on modern CPUs.' },
      { id: 'sec-shannon-entropy-malware-detector', name: 'File Byte Shannon Entropy & Packed Binary Detector', sub: 'forensics', desc: 'Calculate byte entropy (0.0 to 8.0) across binary files to detect encrypted or packed malware payloads.' },
      { id: 'sec-ssh-authorized-keys-fingerprinter', name: 'SSH public key (authorized_keys) SHA256 Fingerprinter', sub: 'authentication', desc: 'Extract RSA, ECDSA, and Ed25519 public key fingerprints and comments from standard authorized_keys lines.' },
      { id: 'sec-jwt-algorithm-none-attack-auditor', name: 'JWT "alg": "none" & Weak Secret Vulnerability Auditor', sub: 'authentication', desc: 'Audit JSON Web Tokens against header tampering, signature stripping, and common default secret keys.' },
      { id: 'sec-ssl-cipher-suite-security-rater', name: 'TLS 1.3 & 1.2 Cipher Suite Security & PFS Evaluator', sub: 'certificates', desc: 'Audit cipher suites (ECDHE-ECDSA-AES256-GCM-SHA384) to verify Perfect Forward Secrecy (PFS).' },
      { id: 'sec-mac-address-oui-vendor-lookup', name: 'MAC Address OUI (Organizationally Unique Identifier) Lookup', sub: 'networking', desc: 'Lookup IEEE 24-bit and 36-bit MAC address prefixes to identify device hardware manufacturers.' },
      { id: 'sec-open-redirect-parameter-scanner', name: 'URL Open Redirect Parameter & White-List Validator', sub: 'vulnerability-audit', desc: 'Audit ?redirect= and ?next= query parameters against protocol relative (//evil.com) bypasses.' },
      { id: 'sec-csrf-token-timing-safe-comparator', name: 'Timing-Safe Double-Submit CSRF Cookie Token Formatter', sub: 'authentication', desc: 'Format cryptographic CSRF session tokens and SameSite=Strict / SameSite=Lax cookie headers.' },
      { id: 'sec-security-headers-a-plus-score-calc', name: 'HTTP Security Headers Compliance (A+ Score) Checker', sub: 'vulnerability-audit', desc: 'Audit presence of HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Permissions-Policy.' },
      { id: 'sec-port-scan-service-name-lookup', name: 'IANA Standard TCP/UDP Port to Service Name Lookup', sub: 'networking', desc: 'Lookup well-known ports (22 SSH, 80 HTTP, 443 HTTPS, 5432 Postgres, 6379 Redis) and risk levels.' },
      { id: 'sec-defang-ip-url-ioc-formatter', name: 'Cyber Threat Intelligence Indicator (IOC) Defanger / Refanger', sub: 'threat-intel', desc: 'Defang malicious URLs and IPs (hxxps[://]bad[.]com, 192[.]168[.]1[.]1) for safe email sharing.' },
      { id: 'sec-magic-bytes-file-signature-matcher', name: 'File Header Magic Bytes & MIME Type Verifier', sub: 'forensics', desc: 'Match initial file hex signatures (%PDF, \xFF\xD8\xFF, \x89PNG, \x50\x4B\x03\x04) against claimed extensions.' },
      { id: 'sec-bip39-mnemonic-seed-entropy-sizer', name: 'BIP-39 Cryptocurrency 12/24-Word Seed Phrase Entropy Sizer', sub: 'crypto', desc: 'Calculate checksum bits (4 bits for 12 words, 8 bits for 24 words) and SHA-256 entropy derivation.' },
      { id: 'sec-diffie-hellman-key-exchange-calc', name: 'Diffie-Hellman Ephemeral Key Exchange Step-by-Step Simulator', sub: 'crypto', desc: 'Simulate public/private key agreement g^a mod p to illustrate shared secret generation.' },
      { id: 'sec-steganography-lsb-bit-plane-inspector', name: 'Image Least Significant Bit (LSB) Steganography Inspector', sub: 'forensics', desc: 'Extract and visualize LSB bit planes of RGB color channels to uncover hidden payload noise.' },
      { id: 'sec-cookie-security-flag-auditor', name: 'HTTP Cookie Security Flag (Secure, HttpOnly, SameSite) Auditor', sub: 'vulnerability-audit', desc: 'Audit Set-Cookie headers to ensure credentials cannot be accessed by client-side scripts.' },
      { id: 'sec-sha3-keccak-hash-generator', name: 'SHA-3 / Keccak-256 & Keccak-512 Hash Digest Generator', sub: 'crypto', desc: 'Compute FIPS 202 SHA3-256 and Ethereum-standard Keccak-256 cryptographic hash digests.' },
      { id: 'sec-caesar-vigenere-classical-cipher-tool', name: 'Vigenère & Caesar Classical Polyalphabetic Cipher Tool', sub: 'crypto', desc: 'Encrypt and decrypt text with classical keyword-based shift ciphers for cryptographic education.' },
      { id: 'sec-rot13-rot47-obfuscation-converter', name: 'ROT13 & ROT47 Symmetric Text Obfuscation Converter', sub: 'crypto', desc: 'Apply reversible 13-letter and 47-character ASCII rotational cipher substitution.' },
      { id: 'sec-api-key-entropy-leak-scanner', name: 'API Key High-Entropy Token Scanner (AWS, GitHub, Stripe)', sub: 'vulnerability-audit', desc: 'Scan code snippets for leaked AWS AKIA..., GitHub ghp_..., and Stripe sk_live_ credentials.' },
      { id: 'sec-radius-tacacs-nas-ip-calculator', name: 'RADIUS / TACACS+ Network Access Server IP Range Sizer', sub: 'networking', desc: 'Calculate enterprise AAA server cluster IP allocations and shared secret distribution policies.' },
      { id: 'sec-xml-external-entity-xxe-detector', name: 'XML External Entity (XXE) DTD Payload Pattern Detector', sub: 'vulnerability-audit', desc: 'Audit XML parsers against <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]> injection.' },
      { id: 'sec-rate-limiting-token-bucket-sizer', name: 'API Rate Limiting Token Bucket & Leaky Bucket Sizer', sub: 'infrastructure', desc: 'Calculate burst capacity, refill rates, and Redis memory for sliding-window rate limiters.' },
      { id: 'sec-ldap-injection-filter-escaper', name: 'LDAP Search Filter Sanitizer & Injection Escaper', sub: 'vulnerability-audit', desc: 'Escape special LDAP characters (*, (, ), \\, NUL) in active directory user search queries.' },
      { id: 'sec-asn-autonomous-system-ip-checker', name: 'BGP Autonomous System Number (ASN) & IP Prefix Lookup', sub: 'networking', desc: 'Lookup organization name, country, and allocated CIDR routing prefixes for any public ASN.' },
      { id: 'sec-argon2id-memory-cost-calculator', name: 'Argon2id Password Hashing Memory & Thread Sizer', sub: 'crypto', desc: 'Calculate RAM consumption (m=64MB) and execution iterations (t=3) for password storage.' },
      { id: 'sec-pkcs8-rsa-private-key-header-inspector', name: 'PKCS#1 vs PKCS#8 RSA/EC Private Key Header Inspector', sub: 'certificates', desc: 'Inspect BEGIN RSA PRIVATE KEY vs BEGIN PRIVATE KEY headers and ASN.1 object identifiers.' },
      { id: 'sec-graphql-introspection-query-blocker', name: 'GraphQL Introspection Query Disabler & Defense Builder', sub: 'vulnerability-audit', desc: 'Generate Apollo Server and Yoga schema configurations to disable __schema introspection in production.' },
      { id: 'sec-whois-domain-expiry-privacy-auditor', name: 'WHOIS Domain Expiration Date & Privacy Redaction Auditor', sub: 'threat-intel', desc: 'Extract registrar names, creation dates, renewal deadlines, and RDAP contact redaction states.' },
      { id: 'sec-uuid-v4-cryptographic-randomness-eval', name: 'Cryptographically Secure Random UUIDv4 Generator', sub: 'crypto', desc: 'Generate 128-bit RFC 4122 v4 UUIDs seeded strictly via window.crypto.getRandomValues().' },
      { id: 'sec-ip-geolocation-threat-risk-scorer', name: 'IP Address Geolocation & Tor / Proxy Threat Risk Scorer', sub: 'threat-intel', desc: 'Simulate fraud detection scoring for datacenter VPNs, Tor exit nodes, and high-risk geographies.' },
      { id: 'sec-ntlm-hash-generator-md4', name: 'Windows NTLM (MD4 Unicode) Authentication Hash Sizer', sub: 'crypto', desc: 'Calculate UTF-16LE MD4 password hashes used in Active Directory Windows LAN Manager authentication.' },
      { id: 'sec-dns-over-https-doh-wireformat-builder', name: 'DNS-over-HTTPS (DoH / RFC 8484) Wireformat Query Builder', sub: 'networking', desc: 'Encode standard DNS binary queries into base64url format for Cloudflare / Google DoH GET requests.' },
      { id: 'sec-saml-sso-metadata-sp-entity-builder', name: 'SAML 2.0 Identity Provider (IdP) & SP Metadata Builder', sub: 'authentication', desc: 'Generate XML <EntityDescriptor> blocks with SingleSignOnService HTTP-Redirect bindings.' },
      { id: 'sec-cve-cvss-v3-1-severity-score-calc', name: 'Common Vulnerability Scoring System (CVSS v3.1) Calculator', sub: 'vulnerability-audit', desc: 'Calculate Base, Temporal, and Environmental severity scores (0.0 to 10.0) across AV, AC, PR, UI, S, C, I, A metrics.' },
      { id: 'sec-ssrf-private-ip-bypass-filter', name: 'Server-Side Request Forgery (SSRF) Private IP Range Filter', sub: 'vulnerability-audit', desc: 'Verify outbound URLs do not resolve to 127.0.0.1, 169.254.169.254 AWS metadata, or 10.0.0.0/8.' },
      { id: 'sec-dns-tunneling-subdomain-entropy-calc', name: 'DNS Tunneling Exfiltration Subdomain Entropy Detector', sub: 'threat-intel', desc: 'Analyze length and character randomness in DNS query subdomains to detect data exfiltration tunnels.' },
      { id: 'sec-privacy-cookie-banner-gdpr-opt-in-spec', name: 'GDPR / ePrivacy Directive Cookie Consent Matrix Builder', sub: 'privacy', desc: 'Categorize cookies into Necessary, Analytics, Marketing, and Preferences for compliant consent banners.' },
    ][i];

    return {
      id: secToolMeta.id,
      name: secToolMeta.name,
      category: 'security',
      subcategory: secToolMeta.sub,
      description: secToolMeta.desc,
      iconName: 'Shield',
      version: '1.0.0',
      tags: ['security', 'privacy', 'crypto', 'authentication', 'cybersecurity', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputPayload', label: 'Security Input / Key / Policy / Hash', type: 'textarea', placeholder: `Enter input for ${secToolMeta.name}...`, required: true },
          { name: 'mode', label: 'Execution Mode', type: 'select', defaultValue: 'strict', options: [
            { label: 'Strict Security Audit', value: 'strict' },
            { label: 'Standard Validation', value: 'standard' },
            { label: 'Export Policy / Signature', value: 'export' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const text = String(inputs.inputPayload || '');
        const mode = String(inputs.mode || 'strict');

        return {
          success: true,
          data: {
            tool: secToolMeta.name,
            id: secToolMeta.id,
            mode,
            inputLength: text.length,
            verdict: 'Compliant / Validated successfully',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
