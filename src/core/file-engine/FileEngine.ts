export class FileEngine {
  /**
   * Reads a File as an ArrayBuffer (safe for WebAssembly / pdf-lib / workers)
   */
  public static async readAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file as ArrayBuffer'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Reads a File as a Text string
   */
  public static async readAsText(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file as text'));
      reader.readAsText(file);
    });
  }

  /**
   * Reads a File as a Data URL (base64 string)
   */
  public static async readAsDataURL(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Loads an image file into an HTMLImageElement
   */
  public static async loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image into DOM'));

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const url = URL.createObjectURL(source);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.src = url;
      }
    });
  }

  /**
   * Triggers a safe browser file download
   */
  public static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Triggers download of raw text content
   */
  public static downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([text], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Formats file size in readable units (KB, MB, GB)
   */
  public static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Detects clean file extension
   */
  public static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  /**
   * Validates file size against a maximum limit (e.g. 50MB)
   */
  public static validateFileSize(file: File, maxSizeBytes = 50 * 1024 * 1024): boolean {
    return file.size <= maxSizeBytes;
  }
}

export const fileEngine = FileEngine;
