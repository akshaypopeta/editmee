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
}
