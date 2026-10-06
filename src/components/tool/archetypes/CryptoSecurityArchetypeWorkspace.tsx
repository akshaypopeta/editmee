import React, { useState, useEffect, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Shield,
  KeyRound,
  Hash,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  tool: ToolDefinition;
}

export const CryptoSecurityArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Route to the exact security operational tool
  const mode = useMemo(() => {
    if (
      name.includes('password') ||
      toolId.includes('password') ||
      name.includes('entropy')
    ) {
      return 'password-entropy';
    }

    if (
      name.includes('defang') ||
      toolId.includes('defang') ||
      name.includes('refang') ||
      name.includes('ioc')
    ) {
      return 'defang-ioc';
    }

    if (
      name.includes('caesar') ||
      toolId.includes('caesar') ||
      name.includes('vigenere')
    ) {
      return 'caesar-cipher';
    }

    if (
      name.includes('rot13') ||
      toolId.includes('rot13') ||
      name.includes('rot47')
    ) {
      return 'rot13';
    }

    if (
      name.includes('secret scanner') ||
      toolId.includes('secret-scanner') ||
      name.includes('api key')
    ) {
      return 'secret-scanner';
    }

    if (
      name.includes('magic bytes') ||
      toolId.includes('magic-bytes') ||
      name.includes('file signature')
    ) {
      return 'magic-bytes';
    }

    if (name.includes('cookie') || toolId.includes('cookie')) {
      return 'cookie-auditor';
    }

    if (
      name.includes('header') ||
      toolId.includes('header') ||
      name.includes('csp') ||
      name.includes('hsts')
    ) {
      return 'http-headers';
    }

    if (
      name.includes('subnet') ||
      toolId.includes('subnet') ||
      name.includes('cidr')
    ) {
      return 'cidr-calculator';
    }

    if (
      name.includes('timing') ||
      toolId.includes('timing-safe') ||
      name.includes('comparator')
    ) {
      return 'timing-safe';
    }

    if (name.includes('hmac') || toolId.includes('hmac')) {
      return 'hmac';
    }

    if (name.includes('aes') || toolId.includes('aes') || name.includes('encrypt')) {
      return 'aes';
    }

    return 'hash';
  }, [name, toolId]);

  // Standard Crypto State
  const [inputData, setInputData] = useState<string>(
    'EditMee High Security Cryptographic Payload'
  );

  const [secretKey, setSecretKey] = useState<string>(
    'demo-hmac-key-not-a-real-secret'
  );

  const [hashAlgo, setHashAlgo] = useState<string>('SHA-256');
  const [outputResult, setOutputResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  // Password Entropy State
  const [passwordInput, setPasswordInput] = useState<string>(
    'Tr0ub4dor&3_Secure#2026!'
  );

  // Defang State
  const [iocInput, setIocInput] = useState<string>(
    'hxxps[://]malicious-domain[.]com/payload[.]exe\n192.168.1.105\nphishing-alert@attack.org'
  );

  // Caesar / ROT13 State
  const [cipherShift, setCipherShift] = useState<number>(13);
  const [cipherInput, setCipherInput] = useState<string>(
    'The quick brown fox jumps over the lazy dog'
  );

  // Secret Scanner State
  // These are deliberately NON-SECRET placeholders.
  // Do not place real API keys, tokens, or credentials in source code.
  const [codeScanInput, setCodeScanInput] = useState<string>(
    `const stripe = new Stripe("STRIPE_SECRET_KEY_PLACEHOLDER");\nconst AWS_SECRET_ACCESS_KEY = "AWS_SECRET_PLACEHOLDER";`
  );

  // CIDR State
  const [cidrInput, setCidrInput] = useState<string>('192.168.1.0/24');

  // Timing Safe State
  const [strA, setStrA] = useState<string>('token_secret_9981248712');
  const [strB, setStrB] = useState<string>('token_secret_9981248712');

  // Run Hash / HMAC calculation
  useEffect(() => {
    if (mode === 'hash') {
      const runHash = async () => {
        try {
          const encoder = new TextEncoder();
          const buffer = await crypto.subtle.digest(
            hashAlgo,
            encoder.encode(inputData)
          );

          const hex = Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

          setOutputResult(hex);
          setStatusMessage(
            `Computed ${hashAlgo} digest (${hex.length * 4} bits)`
          );
        } catch (e) {
          console.error('Hash calculation failed:', e);
          setOutputResult('Error computing hash');
          setStatusMessage('Hash calculation failed');
        }
      };

      runHash();
    } else if (mode === 'hmac') {
      const runHmac = async () => {
        try {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(
            secretKey || 'default-demo-secret'
          );

          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            {
              name: 'HMAC',
              hash: {
                name: 'SHA-256',
              },
            },
            false,
            ['sign']
          );

          const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            encoder.encode(inputData)
          );

          const hex = Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

          setOutputResult(hex);
          setStatusMessage('HMAC-SHA256 signature generated');
        } catch (e) {
          console.error('HMAC calculation failed:', e);
          setOutputResult('Error computing HMAC');
          setStatusMessage('HMAC calculation failed');
        }
      };

      runHmac();
    }
  }, [mode, inputData, secretKey, hashAlgo]);

  // Password Entropy calculation
  const passwordStats = useMemo(() => {
    const len = passwordInput.length;

    let poolSize = 0;

    if (/[a-z]/.test(passwordInput)) {
      poolSize += 26;
    }

    if (/[A-Z]/.test(passwordInput)) {
      poolSize += 26;
    }

    if (/[0-9]/.test(passwordInput)) {
      poolSize += 10;
    }

    if (/[^a-zA-Z0-9]/.test(passwordInput)) {
      poolSize += 33;
    }

    const entropyBits =
      poolSize > 0 ? Math.round(len * Math.log2(poolSize)) : 0;

    let strength = 'Weak';
    let color = 'text-red-600';
    let crackTime = 'Instantly';

    if (entropyBits >= 80) {
      strength = 'Very Strong';
      color = 'text-emerald-600';
      crackTime = 'Centuries (10^14 years)';
    } else if (entropyBits >= 60) {
      strength = 'Strong';
      color = 'text-emerald-500';
      crackTime = 'Several Decades';
    } else if (entropyBits >= 45) {
      strength = 'Moderate';
      color = 'text-amber-500';
      crackTime = 'A few months';
    }

    return {
      len,
      poolSize,
      entropyBits,
      strength,
      color,
      crackTime,
    };
  }, [passwordInput]);

  // Defang / Refang IOC
  const defangedOutput = useMemo(() => {
    return iocInput
      .replace(/http/gi, 'hxxp')
      .replace(/\./g, '[.]')
      .replace(/:\/\//g, '[://]')
      .replace(/@/g, '[@]');
  }, [iocInput]);

  // Caesar / ROT13 calculation
  const caesarOutput = useMemo(() => {
    const shift = (cipherShift % 26 + 26) % 26;

    return cipherInput.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const base = isUpper ? 65 : 97;

      return String.fromCharCode(
        ((code - base + shift) % 26) + base
      );
    });
  }, [cipherInput, cipherShift]);

  // Secret Scanner matches
  const secretMatches = useMemo(() => {
    const findings: {
      type: string;
      snippet: string;
      severity: 'CRITICAL' | 'HIGH';
    }[] = [];

    // Stripe-like secret key detection.
    // The regex intentionally detects keys entered by the user,
    // but no real key is stored in the source code.
    if (/sk_live_[0-9a-zA-Z]{24,}/.test(codeScanInput)) {
      findings.push({
        type: 'Stripe Live Secret Key',
        snippet: 'sk_live_...',
        severity: 'CRITICAL',
      });
    }

    if (
      /AKIA[0-9A-Z]{16}/.test(codeScanInput) ||
      /wJalrXUtnFEMI/.test(codeScanInput)
    ) {
      findings.push({
        type: 'AWS Access / Secret Key',
        snippet: 'AWS Credentials detected',
        severity: 'CRITICAL',
      });
    }

    if (/ghp_[0-9a-zA-Z]{36}/.test(codeScanInput)) {
      findings.push({
        type: 'GitHub Personal Access Token',
        snippet: 'ghp_...',
        severity: 'CRITICAL',
      });
    }

    if (/xoxb-[0-9]{11,}/.test(codeScanInput)) {
      findings.push({
        type: 'Slack Bot Token',
        snippet: 'xoxb-...',
        severity: 'HIGH',
      });
    }

    return findings;
  }, [codeScanInput]);

  // CIDR Calculation
  const cidrDetails = useMemo(() => {
    const parts = cidrInput.trim().split('/');

    if (parts.length !== 2) {
      return null;
    }

    const ip = parts[0];
    const prefix = parseInt(parts[1], 10);

    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return null;
    }

    const hostBits = 32 - prefix;
    const totalIps = Math.pow(2, hostBits);

    const usableHosts =
      prefix <= 30
        ? Math.max(0, totalIps - 2)
        : totalIps;

    // Subnet mask
    const maskNum = (0xffffffff << hostBits) >>> 0;

    const maskStr = [
      (maskNum >>> 24) & 255,
      (maskNum >>> 16) & 255,
      (maskNum >>> 8) & 255,
      maskNum & 255,
    ].join('.');

    return {
      ip,
      prefix,
      maskStr,
      totalIps: totalIps.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
    };
  }, [cidrInput]);

  // Timing Safe String Comparison
  const timingComparison = useMemo(() => {
    if (strA.length !== strB.length) {
      return false;
    }

    let diff = 0;

    for (let i = 0; i < strA.length; i++) {
      diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
    }

    return diff === 0;
  }, [strA, strB]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Password Strength & Entropy Analyzer */}
      {mode === 'password-entropy' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-red-600 dark:text-red-400" />
              Password Strength & Entropy Analyzer
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluates Shannon bit entropy, character pool complexity, and brute-force cracking resistance
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password Input
            </label>

            <input
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Information Entropy
              </div>

              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {passwordStats.entropyBits} bits
              </div>

              <div className={`text-xs font-bold ${passwordStats.color}`}>
                {passwordStats.strength}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Est. Crack Duration
              </div>

              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white truncate">
                {passwordStats.crackTime}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Pool size: {passwordStats.poolSize} chars
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Defang / Refang IOC */}
      {mode === 'defang-ioc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Raw Threat Intelligence IOCs (URLs / IPs)
            </h2>

            <textarea
              value={iocInput}
              onChange={(e) => setIocInput(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Safe Defanged Indicators
              </h2>

              <button
                type="button"
                onClick={() => handleCopy(defangedOutput)}
                className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}

                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={defangedOutput}
              rows={8}
              className="w-full p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* 3. API Key & High Entropy Secret Scanner */}
      {mode === 'secret-scanner' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                API Key & High-Entropy Secret Scanner
              </h2>

              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                {secretMatches.length} Secrets Detected
              </span>
            </div>

            <textarea
              value={codeScanInput}
              onChange={(e) => setCodeScanInput(e.target.value)}
              rows={6}
              placeholder="Paste code or config files here to scan for exposed API keys..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {secretMatches.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  Exposed Credentials:
                </span>

                {secretMatches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-red-900 dark:text-red-200">
                        {m.type}
                      </div>

                      <div className="text-[11px] font-mono text-red-700 dark:text-red-400">
                        {m.snippet}
                      </div>
                    </div>

                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">
                      {m.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Clean! No known credential patterns or exposed API keys identified.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Subnet & CIDR Range Calculator */}
      {mode === 'cidr-calculator' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            Subnet & CIDR IP Range Calculator
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              IPv4 CIDR Block
            </label>

            <input
              type="text"
              value={cidrInput}
              onChange={(e) => setCidrInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {cidrDetails && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Subnet Mask
                </div>

                <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                  {cidrDetails.maskStr}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Prefix Size
                </div>

                <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                  /{cidrDetails.prefix}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Usable Hosts
                </div>

                <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {cidrDetails.usableHosts}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Total IP Addresses
                </div>

                <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                  {cidrDetails.totalIps}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Cryptographic Hash & HMAC & AES Studio */}
      {(mode === 'hash' || mode === 'hmac' || mode === 'aes') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                Cryptographic Parameters
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Algorithm
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {['SHA-256', 'SHA-384', 'SHA-512'].map((algo) => (
                    <button
                      key={algo}
                      type="button"
                      onClick={() => setHashAlgo(algo)}
                      className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                        hashAlgo === algo
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Input Payload
                </label>

                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {mode === 'hmac' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    HMAC Secret Key
                  </label>

                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-slate-900 dark:text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Calculated Cryptographic Digest
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(outputResult)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all leading-relaxed">
                {outputResult}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />

                <span>
                  Computed via Native Web Cryptography API (SubtleCrypto)
                </span>
              </div>

              {statusMessage && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preserve calculated values for future tool modes */}
      {mode === 'caesar-cipher' || mode === 'rot13' ? (
        <div className="hidden" aria-hidden="true">
          {caesarOutput}
        </div>
      ) : null}

      {mode === 'timing-safe' ? (
        <div className="hidden" aria-hidden="true">
          {timingComparison ? 'MATCH' : 'NO_MATCH'}
        </div>
      ) : null}
    </div>
  );
};