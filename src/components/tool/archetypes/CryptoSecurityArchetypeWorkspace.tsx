import React, { useEffect, useMemo, useState } from 'react';
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

type CryptoMode =
  | 'password-entropy'
  | 'defang-ioc'
  | 'caesar-cipher'
  | 'rot13'
  | 'secret-scanner'
  | 'magic-bytes'
  | 'cookie-auditor'
  | 'http-headers'
  | 'cidr-calculator'
  | 'timing-safe'
  | 'hmac'
  | 'aes'
  | 'hash';

interface SecretMatch {
  type: string;
  snippet: string;
  severity: 'CRITICAL' | 'HIGH';
}

interface CidrDetails {
  ip: string;
  prefix: number;
  maskStr: string;
  totalIps: string;
  usableHosts: string;
}

export const CryptoSecurityArchetypeWorkspace: React.FC<Props> = ({
  tool,
}) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  /*
   * Route to the exact security operational tool.
   */
  const mode = useMemo<CryptoMode>(() => {
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

    if (
      name.includes('aes') ||
      toolId.includes('aes') ||
      name.includes('encrypt')
    ) {
      return 'aes';
    }

    return 'hash';
  }, [name, toolId]);

  /*
   * Standard Crypto State
   *
   * DEMO values only.
   * No real API keys, access tokens, credentials,
   * or production secrets are stored in this source file.
   */
  const [inputData, setInputData] = useState<string>(
    'EditMee High Security Cryptographic Payload'
  );

  const [secretKey, setSecretKey] =
    useState<string>('example-hmac-key');

  const [hashAlgo, setHashAlgo] =
    useState<string>('SHA-256');

  const [aesAction, setAesAction] =
    useState<'encrypt' | 'decrypt'>('encrypt');

  const [aesKey, setAesKey] =
    useState<string>('example-aes-password');

  const [outputResult, setOutputResult] =
    useState<string>('');

  const [copied, setCopied] =
    useState<boolean>(false);

  const [statusMessage, setStatusMessage] =
    useState<string>('Ready');

  /*
   * Password Entropy State
   */
  const [passwordInput, setPasswordInput] =
    useState<string>('ExamplePassword123!');

  /*
   * Defang State
   */
  const [iocInput, setIocInput] = useState<string>(
    `https://example-domain.com/payload.exe
192.168.1.105
security-alert@example.org`
  );

  /*
   * Caesar / ROT13 State
   */
  const [cipherShift, setCipherShift] =
    useState<number>(13);

  const [cipherInput, setCipherInput] =
    useState<string>(
      'The quick brown fox jumps over the lazy dog'
    );

  /*
   * Secret Scanner State
   *
   * Deliberately non-secret placeholders.
   */
  const [codeScanInput, setCodeScanInput] =
    useState<string>(
      `const stripe = new Stripe("YOUR_STRIPE_SECRET_KEY");

const AWS_SECRET_ACCESS_KEY = "YOUR_AWS_SECRET_ACCESS_KEY";

const githubToken = "YOUR_GITHUB_TOKEN";`
    );

  /*
   * CIDR State
   */
  const [cidrInput, setCidrInput] =
    useState<string>('192.168.1.0/24');

  /*
   * Timing Safe State
   */
  const [strA, setStrA] =
    useState<string>('example-token');

  const [strB, setStrB] =
    useState<string>('example-token');

  /*
   * Copy helper
   */
  const handleCopy = async (text: string) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setStatusMessage(
        'Unable to copy to clipboard'
      );
    }
  };

  /*
   * Hash / HMAC calculation
   */
  useEffect(() => {
    if (mode !== 'hash' && mode !== 'hmac') {
      return;
    }

    const runCryptoCalculation = async () => {
      try {
        const encoder = new TextEncoder();

        if (mode === 'hash') {
          const buffer = await crypto.subtle.digest(
            hashAlgo,
            encoder.encode(inputData)
          );

          const hex = Array.from(
            new Uint8Array(buffer)
          )
            .map((byte) =>
              byte.toString(16).padStart(2, '0')
            )
            .join('');

          setOutputResult(hex);

          setStatusMessage(
            `Computed ${hashAlgo} digest (${hex.length * 4} bits)`
          );

          return;
        }

        const keyData = encoder.encode(
          secretKey || 'example-hmac-key'
        );

        const cryptoKey =
          await crypto.subtle.importKey(
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

        const signature =
          await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            encoder.encode(inputData)
          );

        const hex = Array.from(
          new Uint8Array(signature)
        )
          .map((byte) =>
            byte.toString(16).padStart(2, '0')
          )
          .join('');

        setOutputResult(hex);

        setStatusMessage(
          'HMAC-SHA256 signature generated'
        );
      } catch {
        setOutputResult('');

        setStatusMessage(
          mode === 'hash'
            ? 'Error computing hash'
            : 'Error computing HMAC'
        );
      }
    };

    void runCryptoCalculation();
  }, [
    mode,
    inputData,
    secretKey,
    hashAlgo,
  ]);

  /*
   * Password Entropy calculation
   */
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
      poolSize > 0
        ? Math.round(
            len * Math.log2(poolSize)
          )
        : 0;

    let strength = 'Weak';
    let color = 'text-red-600';
    let crackTime = 'Instantly';

    if (entropyBits >= 80) {
      strength = 'Very Strong';
      color = 'text-emerald-600';
      crackTime = 'Centuries';
    } else if (entropyBits >= 60) {
      strength = 'Strong';
      color = 'text-emerald-500';
      crackTime = 'Several decades';
    } else if (entropyBits >= 45) {
      strength = 'Moderate';
      color = 'text-amber-500';
      crackTime = 'Several months';
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

  /*
   * Defang / Refang IOC
   */
  const defangedOutput = useMemo(() => {
    return iocInput
      .replace(/https:\/\//gi, 'hxxps[://]')
      .replace(/http:\/\//gi, 'hxxp[://]')
      .replace(/\./g, '[.]')
      .replace(/@/g, '[@]');
  }, [iocInput]);

  /*
   * Caesar / ROT13 calculation
   */
  const caesarOutput = useMemo(() => {
    const effectiveShift =
      mode === 'rot13'
        ? 13
        : ((cipherShift % 26) + 26) % 26;

    return cipherInput.replace(
      /[a-zA-Z]/g,
      (char) => {
        const code = char.charCodeAt(0);

        const isUpper =
          code >= 65 && code <= 90;

        const base = isUpper ? 65 : 97;

        return String.fromCharCode(
          ((code - base + effectiveShift) % 26) +
            base
        );
      }
    );
  }, [
    cipherInput,
    cipherShift,
    mode,
  ]);

  /*
   * Secret Scanner
   *
   * Detects known credential patterns only.
   * It does not store or transmit secrets.
   */
  const secretMatches = useMemo<SecretMatch[]>(() => {
    const findings: SecretMatch[] = [];

    /*
     * Stripe live secret key pattern.
     */
    if (
      /sk_live_[0-9a-zA-Z]{16,}/.test(
        codeScanInput
      )
    ) {
      findings.push({
        type: 'Stripe Live Secret Key',
        snippet: 'sk_live_...',
        severity: 'CRITICAL',
      });
    }

    /*
     * AWS Access Key pattern.
     */
    if (
      /AKIA[0-9A-Z]{16}/.test(
        codeScanInput
      )
    ) {
      findings.push({
        type: 'AWS Access Key',
        snippet: 'AKIA...',
        severity: 'CRITICAL',
      });
    }

    /*
     * Generic AWS secret assignment.
     */
    if (
      /AWS_SECRET_ACCESS_KEY\s*=\s*["'][^"']{12,}["']/i.test(
        codeScanInput
      )
    ) {
      findings.push({
        type: 'AWS Secret Access Key',
        snippet:
          'AWS_SECRET_ACCESS_KEY detected',
        severity: 'CRITICAL',
      });
    }

    /*
     * GitHub token pattern.
     */
    if (
      /gh[pousr]_[0-9a-zA-Z]{20,}/.test(
        codeScanInput
      )
    ) {
      findings.push({
        type: 'GitHub Token',
        snippet:
          'GitHub token pattern detected',
        severity: 'CRITICAL',
      });
    }

    /*
     * Slack bot token pattern.
     */
    if (
      /xoxb-[0-9]{8,}-[0-9]{8,}/.test(
        codeScanInput
      )
    ) {
      findings.push({
        type: 'Slack Bot Token',
        snippet: 'xoxb-...',
        severity: 'HIGH',
      });
    }

    return findings;
  }, [codeScanInput]);

  /*
   * CIDR Calculation
   */
  const cidrDetails = useMemo<CidrDetails | null>(
    () => {
      const parts = cidrInput
        .trim()
        .split('/');

      if (parts.length !== 2) {
        return null;
      }

      const ip = parts[0].trim();

      const octets = ip.split('.');

      if (octets.length !== 4) {
        return null;
      }

      const validIp = octets.every(
        (octet) => {
          const cleanOctet = octet.trim();

          if (
            cleanOctet === '' ||
            !/^\d+$/.test(cleanOctet)
          ) {
            return false;
          }

          const value = Number(cleanOctet);

          return (
            Number.isInteger(value) &&
            value >= 0 &&
            value <= 255
          );
        }
      );

      if (!validIp) {
        return null;
      }

      const prefix = Number(
        parts[1].trim()
      );

      if (
        !Number.isInteger(prefix) ||
        prefix < 0 ||
        prefix > 32
      ) {
        return null;
      }

      const hostBits = 32 - prefix;

      const totalIps = Math.pow(
        2,
        hostBits
      );

      /*
       * Traditional IPv4 usable-host calculation.
       *
       * /31 and /32 are treated specially.
       */
      const usableHosts =
        prefix <= 30
          ? Math.max(
              0,
              totalIps - 2
            )
          : totalIps;

      const maskNum =
        prefix === 0
          ? 0
          : (0xffffffff << hostBits) >>> 0;

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
        totalIps:
          totalIps.toLocaleString(),
        usableHosts:
          usableHosts.toLocaleString(),
      };
    },
    [cidrInput]
  );

  /*
   * Timing Safe String Comparison
   *
   * This provides constant-work comparison
   * for equal-length strings.
   *
   * For production cryptographic authentication,
   * compare decoded bytes with a dedicated
   * server-side timing-safe primitive.
   */
  const timingComparison = useMemo(() => {
    if (strA.length !== strB.length) {
      return false;
    }

    let diff = 0;

    for (let i = 0; i < strA.length; i++) {
      diff |=
        strA.charCodeAt(i) ^
        strB.charCodeAt(i);
    }

    return diff === 0;
  }, [strA, strB]);

  /*
   * AES-256-GCM key derivation.
   *
   * PBKDF2 derives a 256-bit AES key from
   * the supplied password.
   *
   * The explicit ArrayBuffer copy for salt avoids
   * TypeScript ArrayBufferLike / SharedArrayBuffer
   * compatibility errors with newer DOM typings.
   */
  const deriveAesKey = async (
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> => {
    const encoder = new TextEncoder();

    const baseKey =
      await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

    /*
     * Force salt into a guaranteed ArrayBuffer.
     */
    const saltBuffer =
      new ArrayBuffer(salt.byteLength);

    new Uint8Array(saltBuffer).set(salt);

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    );
  };

  /*
   * AES-256-GCM Encrypt / Decrypt
   */
  const runAes = async () => {
    try {
      if (!aesKey.trim()) {
        setOutputResult('');

        setStatusMessage(
          'Enter an AES password/key'
        );

        return;
      }

      if (aesAction === 'encrypt') {
        const encoder = new TextEncoder();

        const salt =
          crypto.getRandomValues(
            new Uint8Array(16)
          );

        const iv =
          crypto.getRandomValues(
            new Uint8Array(12)
          );

        const key =
          await deriveAesKey(
            aesKey,
            salt
          );

        const encrypted =
          await crypto.subtle.encrypt(
            {
              name: 'AES-GCM',
              iv,
            },
            key,
            encoder.encode(inputData)
          );

        const payload = {
          version: 1,
          algorithm: 'AES-256-GCM',
          salt: Array.from(salt),
          iv: Array.from(iv),
          data: Array.from(
            new Uint8Array(encrypted)
          ),
        };

        setOutputResult(
          JSON.stringify(
            payload,
            null,
            2
          )
        );

        setStatusMessage(
          'AES-256-GCM encryption completed'
        );

        return;
      }

      /*
       * Decryption expects the JSON payload
       * generated by the encryption operation.
       */
      const payload: unknown =
        JSON.parse(inputData);

      if (
        !payload ||
        typeof payload !== 'object'
      ) {
        throw new Error(
          'Invalid AES payload'
        );
      }

      const data =
        payload as Record<
          string,
          unknown
        >;

      if (
        data.algorithm !==
          'AES-256-GCM' ||
        !Array.isArray(data.salt) ||
        !Array.isArray(data.iv) ||
        !Array.isArray(data.data)
      ) {
        throw new Error(
          'Invalid AES payload'
        );
      }

      const salt =
        new Uint8Array(
          data.salt as number[]
        );

      const iv =
        new Uint8Array(
          data.iv as number[]
        );

      const encrypted =
        new Uint8Array(
          data.data as number[]
        );

      if (salt.length !== 16) {
        throw new Error(
          'Invalid AES salt'
        );
      }

      if (iv.length !== 12) {
        throw new Error(
          'Invalid AES IV'
        );
      }

      if (encrypted.length === 0) {
        throw new Error(
          'Invalid encrypted data'
        );
      }

      const key =
        await deriveAesKey(
          aesKey,
          salt
        );

      const decrypted =
        await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv,
          },
          key,
          encrypted
        );

      const decoder =
        new TextDecoder();

      setOutputResult(
        decoder.decode(decrypted)
      );

      setStatusMessage(
        'AES-256-GCM decryption completed'
      );
    } catch {
      setOutputResult('');

      setStatusMessage(
        aesAction === 'decrypt'
          ? 'Unable to decrypt. Check the payload and password.'
          : 'Error during AES encryption'
      );
    }
  };

  /*
   * Main UI
   */
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
              Evaluates character pool complexity and estimated information entropy.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password Input
            </label>

            <input
              type="text"
              value={passwordInput}
              onChange={(event) =>
                setPasswordInput(
                  event.target.value
                )
              }
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

              <div
                className={`text-xs font-bold ${passwordStats.color}`}
              >
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
              Raw Threat Intelligence IOCs
            </h2>

            <textarea
              value={iocInput}
              onChange={(event) =>
                setIocInput(
                  event.target.value
                )
              }
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
                onClick={() =>
                  handleCopy(
                    defangedOutput
                  )
                }
                className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}

                <span>
                  {copied
                    ? 'Copied'
                    : 'Copy'}
                </span>
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
                {secretMatches.length}{' '}
                Secrets Detected
              </span>
            </div>

            <textarea
              value={codeScanInput}
              onChange={(event) =>
                setCodeScanInput(
                  event.target.value
                )
              }
              rows={7}
              placeholder="Paste code or configuration here to scan for exposed credentials..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {secretMatches.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  Exposed Credentials:
                </span>

                {secretMatches.map(
                  (match, index) => (
                    <div
                      key={`${match.type}-${index}`}
                      className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-red-900 dark:text-red-200">
                          {match.type}
                        </div>

                        <div className="text-[11px] font-mono text-red-700 dark:text-red-400">
                          {match.snippet}
                        </div>
                      </div>

                      <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">
                        {match.severity}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

                Clean! No known credential patterns identified.
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
              onChange={(event) =>
                setCidrInput(
                  event.target.value
                )
              }
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

      {/* 5. Caesar / ROT13 */}
      {(mode === 'caesar-cipher' ||
        mode === 'rot13') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {mode === 'rot13'
                ? 'ROT13 Converter'
                : 'Caesar Cipher'}
            </h2>

            {mode === 'caesar-cipher' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Shift
                </label>

                <input
                  type="number"
                  min={-25}
                  max={25}
                  value={cipherShift}
                  onChange={(event) =>
                    setCipherShift(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
            )}

            <textarea
              value={cipherInput}
              onChange={(event) =>
                setCipherInput(
                  event.target.value
                )
              }
              rows={8}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Output
              </h2>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    caesarOutput
                  )
                }
                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}

                Copy
              </button>
            </div>

            <textarea
              readOnly
              value={caesarOutput}
              rows={8}
              className="w-full p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* 6. Timing Safe Comparison */}
      {mode === 'timing-safe' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Timing-Safe String Comparator
          </h2>

          <input
            value={strA}
            onChange={(event) =>
              setStrA(event.target.value)
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm"
            placeholder="First value"
          />

          <input
            value={strB}
            onChange={(event) =>
              setStrB(event.target.value)
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm"
            placeholder="Second value"
          />

          <div
            className={`p-4 rounded-xl border text-sm font-bold ${
              timingComparison
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
            }`}
          >
            {timingComparison
              ? 'Values match'
              : 'Values do not match'}
          </div>
        </div>
      )}

      {/* 7. AES-256-GCM */}
      {mode === 'aes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              AES-256-GCM Parameters
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setAesAction('encrypt')
                }
                className={`py-2 rounded-lg text-xs font-bold border ${
                  aesAction === 'encrypt'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Encrypt
              </button>

              <button
                type="button"
                onClick={() =>
                  setAesAction('decrypt')
                }
                className={`py-2 rounded-lg text-xs font-bold border ${
                  aesAction === 'decrypt'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Decrypt
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                AES Password
              </label>

              <input
                type="password"
                value={aesKey}
                onChange={(event) =>
                  setAesKey(
                    event.target.value
                  )
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {aesAction === 'encrypt'
                  ? 'Plaintext'
                  : 'Encrypted JSON Payload'}
              </label>

              <textarea
                value={inputData}
                onChange={(event) =>
                  setInputData(
                    event.target.value
                  )
                }
                rows={8}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                void runAes();
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wide"
            >
              {aesAction === 'encrypt'
                ? 'Encrypt Data'
                : 'Decrypt Data'}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4" />
                AES Result
              </span>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    outputResult
                  )
                }
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}

                Copy
              </button>
            </div>

            <div className="min-h-[180px] p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all leading-relaxed whitespace-pre-wrap overflow-auto">
              {outputResult ||
                'Result will appear here.'}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />

              <span>
                {statusMessage}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Hash / HMAC */}
      {(mode === 'hash' ||
        mode === 'hmac') && (
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
                  {[
                    'SHA-256',
                    'SHA-384',
                    'SHA-512',
                  ].map((algo) => (
                    <button
                      key={algo}
                      type="button"
                      onClick={() =>
                        setHashAlgo(algo)
                      }
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
                  onChange={(event) =>
                    setInputData(
                      event.target.value
                    )
                  }
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
                    type="password"
                    value={secretKey}
                    onChange={(event) =>
                      setSecretKey(
                        event.target.value
                      )
                    }
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

                  {mode === 'hmac'
                    ? 'HMAC-SHA256 Signature'
                    : 'Calculated Cryptographic Digest'}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      outputResult
                    )
                  }
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {copied
                      ? 'Copied'
                      : 'Copy'}
                  </span>
                </button>
              </div>

              <div className="p-4 min-h-[100px] bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all leading-relaxed whitespace-pre-wrap">
                {outputResult ||
                  'Result will appear here.'}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />

                <span>
                  Computed locally using the native Web Cryptography API.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback informational state */}
      {(
        mode === 'magic-bytes' ||
        mode === 'cookie-auditor' ||
        mode === 'http-headers'
      ) && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />

            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Security Tool Ready
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This security archetype is available for the selected tool.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};