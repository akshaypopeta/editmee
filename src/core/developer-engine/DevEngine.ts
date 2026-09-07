import * as Diff from 'diff';

export class DevEngine {
  /**
   * JSON Formatter & Minifier
   */
  public static formatJson(input: string, indent = 2): { output: string; formatted: string; isValid: boolean; valid: boolean; error?: string } {
    try {
      const parsed = JSON.parse(input);
      const output = JSON.stringify(parsed, null, indent);
      return { output, formatted: output, isValid: true, valid: true };
    } catch (e: any) {
      return { output: '', formatted: '', isValid: false, valid: false, error: e.message };
    }
  }

  public static minifyJson(input: string): { output: string; formatted: string; isValid: boolean; valid: boolean; error?: string } {
    try {
      const parsed = JSON.parse(input);
      const output = JSON.stringify(parsed);
      return { output, formatted: output, isValid: true, valid: true };
    } catch (e: any) {
      return { output: '', formatted: '', isValid: false, valid: false, error: e.message };
    }
  }

  /**
   * Base64 encode / decode (Safe UTF-8)
   */
  public static base64Encode(text: string): string {
    const bytes = new TextEncoder().encode(text);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binString);
  }

  public static base64Decode(base64: string): { output: string; text: string; isValid: boolean; valid: boolean; error?: string } {
    try {
      const binString = atob(base64.trim());
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      const output = new TextDecoder().decode(bytes);
      return { output, text: output, isValid: true, valid: true };
    } catch (e: any) {
      return { output: '', text: '', isValid: false, valid: false, error: 'Invalid Base64 string' };
    }
  }

  /**
   * JWT Inspector & Decoder
   */
  public static decodeJwt(token: string): { header: any; payload: any; isExpired: boolean; expDate?: string; error?: string } {
    try {
      const parts = token.trim().split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT format (must have at least header and payload)');
      }

      const header = JSON.parse(this.base64Decode(parts[0]).output);
      const payload = JSON.parse(this.base64Decode(parts[1]).output);

      let isExpired = false;
      let expDate: string | undefined;

      if (payload.exp) {
        const expTime = payload.exp * 1000;
        isExpired = Date.now() > expTime;
        expDate = new Date(expTime).toLocaleString();
      }

      return { header, payload, isExpired, expDate };
    } catch (e: any) {
      return { header: null, payload: null, isExpired: false, error: e.message || 'JWT parse failed' };
    }
  }

  /**
   * Cryptographic Hash (SHA-256, SHA-512, SHA-1)
   */
  public static async generateHash(text: string, algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1' = 'SHA-256'): Promise<string> {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * UUID v4 Generator
   */
  public static generateUuid(): string;
  public static generateUuid(count: number): string[];
  public static generateUuid(count?: number): string | string[] {
    const generate = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    if (count === undefined) {
      return generate();
    }
    return Array.from({ length: count }, () => generate());
  }

  /**
   * Regex live tester
   */
  public static testRegex(pattern: string, flags: string, text: string): { matches: { match: string; index: number; groups: string[] }[]; isValid: boolean; valid: boolean; error?: string } {
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const matches: { match: string; index: number; groups: string[] }[] = [];
      let m: RegExpExecArray | null;

      while ((m = regex.exec(text)) !== null) {
        matches.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        if (!flags.includes('g')) break;
      }

      return { matches, isValid: true, valid: true };
    } catch (e: any) {
      return { matches: [], isValid: false, valid: false, error: e.message };
    }
  }

  /**
   * Text / Code Diff Checker
   */
  public static computeDiff(originalText: string, modifiedText: string, mode: 'chars' | 'words' | 'lines' = 'lines') {
    if (mode === 'chars') {
      return Diff.diffChars(originalText, modifiedText);
    } else if (mode === 'words') {
      return Diff.diffWords(originalText, modifiedText);
    }
    return Diff.diffLines(originalText, modifiedText);
  }

  /**
   * Slug / URL Permalink Generator
   */
  public static generateSlug(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Text Case Transformer
   */
  public static transformCase(
    text: string,
    targetCase: 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'title' | 'sentence' | 'upper' | 'lower'
  ): string {
    const words = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .trim()
      .split(/\s+/);

    switch (targetCase) {
      case 'camel':
        return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
      case 'pascal':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      case 'snake':
        return words.map((w) => w.toLowerCase()).join('_');
      case 'kebab':
        return words.map((w) => w.toLowerCase()).join('-');
      case 'constant':
        return words.map((w) => w.toUpperCase()).join('_');
      case 'title':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      case 'sentence':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      default:
        return text;
    }
  }

  /**
   * Subtitle Time Shifter (SRT format)
   */
  public static shiftSrtTimestamps(srtContent: string, offsetMs: number): string {
    const formatTime = (totalMs: number): string => {
      const ms = Math.max(0, totalMs);
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const remainderMs = ms % 1000;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(remainderMs).padStart(3, '0')}`;
    };

    const parseTime = (timeStr: string): number => {
      const parts = timeStr.trim().replace(',', ':').replace('.', ':').split(':');
      if (parts.length < 4) return 0;
      return (
        Number(parts[0]) * 3600000 +
        Number(parts[1]) * 60000 +
        Number(parts[2]) * 1000 +
        Number(parts[3])
      );
    };

    return srtContent.replace(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/g,
      (_, start, end) => {
        const newStart = formatTime(parseTime(start) + offsetMs);
        const newEnd = formatTime(parseTime(end) + offsetMs);
        return `${newStart} --> ${newEnd}`;
      }
    );
  }

  /**
   * WebVTT to SRT Converter
   */
  public static vttToSrt(vttContent: string): string {
    let srt = vttContent.replace(/^WEBVTT[^\n]*\n+/i, '');
    let counter = 1;
    const blocks = srt.trim().split(/\n\s*\n/);
    return blocks
      .map((block) => {
        const lines = block.trim().split('\n');
        const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
        if (timeLineIdx === -1) return '';
        const timeLine = lines[timeLineIdx].replace(/\./g, ',');
        const textLines = lines.slice(timeLineIdx + 1).map((l) => l.replace(/<[^>]+>/g, ''));
        return `${counter++}\n${timeLine}\n${textLines.join('\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');
  }

  /**
   * Crontab Expression Explainer
   */
  public static explainCron(cronExpr: string): { isValid: boolean; description: string } {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { isValid: false, description: 'Invalid cron expression. Expected 5 standard fields (minute, hour, day of month, month, day of week).' };
    }

    const [min, hour, dom, mon, dow] = parts;
    const descParts: string[] = [];

    if (min === '*' && hour === '*') {
      descParts.push('Every minute');
    } else if (min.startsWith('*/')) {
      descParts.push(`Every ${min.slice(2)} minutes`);
    } else if (min === '0' && hour === '*') {
      descParts.push('At the top of every hour');
    } else if (min !== '*' && hour !== '*') {
      descParts.push(`At ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`);
    } else if (min !== '*') {
      descParts.push(`At minute ${min}`);
    }

    if (dom !== '*') {
      descParts.push(`on day ${dom} of the month`);
    }
    if (mon !== '*') {
      const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      descParts.push(`in ${months[Number(mon)] || mon}`);
    }
    if (dow !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      descParts.push(`on ${days[Number(dow)] || `day ${dow}`}`);
    }

    return {
      isValid: true,
      description: descParts.join(' ') || 'Standard recurring schedule.',
    };
  }

  /**
   * JSON to TypeScript Interface Generator
   */
  public static jsonToTypeScript(jsonStr: string, rootName = 'RootObject'): { tsCode: string; error?: string } {
    try {
      const obj = JSON.parse(jsonStr);
      const interfaces: string[] = [];

      const generateType = (name: string, value: any): string => {
        if (value === null) return 'null | any';
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]';
          const itemType = generateType(`${name}Item`, value[0]);
          return `${itemType}[]`;
        }
        if (typeof value === 'object') {
          const lines: string[] = [];
          for (const key of Object.keys(value)) {
            const propType = generateType(`${name}_${key}`, value[key]);
            const sanitizedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
            lines.push(`  ${sanitizedKey}: ${propType};`);
          }
          const iface = `export interface ${name} {\n${lines.join('\n')}\n}`;
          interfaces.push(iface);
          return name;
        }
        return typeof value;
      };

      generateType(rootName, obj);
      return { tsCode: interfaces.join('\n\n') };
    } catch (err: any) {
      return { tsCode: '', error: err.message || 'Invalid JSON input' };
    }
  }

  /**
   * Morse Code Transcoder
   */
  public static morseCode(text: string, encode = true): string {
    const map: Record<string, string> = {
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
      I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
      Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
      Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
      '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
      ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    };
    const reverseMap = Object.entries(map).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {} as Record<string, string>);

    if (encode) {
      return text
        .toUpperCase()
        .split('')
        .map((c) => map[c] || c)
        .join(' ');
    } else {
      return text
        .split(' ')
        .map((code) => (code === '/' ? ' ' : reverseMap[code] || ''))
        .join('');
    }
  }

  /**
   * Password Entropy & Strength
   */
  public static calculatePasswordEntropy(password: string): { entropyBits: number; strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'; crackTime: string } {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    const entropyBits = Math.round(password.length * (poolSize > 0 ? Math.log2(poolSize) : 0));
    let strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong' = 'Very Weak';
    let crackTime = '< 1 second';

    if (entropyBits >= 80) {
      strength = 'Very Strong';
      crackTime = 'Centuries (Brute-force resilient)';
    } else if (entropyBits >= 60) {
      strength = 'Strong';
      crackTime = 'Decades';
    } else if (entropyBits >= 45) {
      strength = 'Fair';
      crackTime = 'Months to Years';
    } else if (entropyBits >= 30) {
      strength = 'Weak';
      crackTime = 'Minutes to Hours';
    }

    return { entropyBits, strength, crackTime };
  }

  /**
   * Color Space Transcoder
   */
  public static parseColor(colorInput: string): { hex: string; rgb: { r: number; g: number; b: number }; hsl: { h: number; s: number; l: number }; cmyk: { c: number; m: number; y: number; k: number } } {
    let hex = colorInput.trim().replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16) || 0;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    // HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }

    // CMYK
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k);

    return {
      hex: `#${hex.padStart(6, '0').toUpperCase()}`,
      rgb: { r, g, b },
      hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) },
      cmyk: { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) },
    };
  }
}
