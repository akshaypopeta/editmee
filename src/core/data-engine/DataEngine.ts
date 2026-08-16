export interface DataStats {
  isNumeric: boolean;
  uniqueValues: number;
  nullCount: number;
  mean?: number;
  sum?: number;
  min?: number;
  max?: number;
}

export interface CsvStats {
  rowCount: number;
  columnCount: number;
  headers: string[];
  columnStats: {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'date';
    nullCount: number;
    uniqueCount: number;
    min?: number;
    max?: number;
    avg?: number;
  }[];
}

export class DataEngine {
  /**
   * Robust CSV parser supporting quotes, commas, newlines, and escape characters
   */
  public static parseCsv(csvText: string, delimiter = ','): { headers: string[]; rows: Record<string, string>[]; rawRows: string[][] } {
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        lines.push(currentRow);
      }
    }

    if (lines.length === 0) {
      return { headers: [], rows: [], rawRows: [] };
    }

    const headers = lines[0];
    const rawRows = lines.slice(1);
    const rows = rawRows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] ?? '';
      });
      return obj;
    });

    return { headers, rows, rawRows };
  }

  /**
   * Formats headers and rows back into valid CSV string
   */
  public static formatCsv(headers: string[], rows: string[][] | Record<string, string>[], delimiter = ','): string {
    return this.exportToCsv(headers, rows as any, delimiter);
  }

  public static exportToCsv(headers: string[], rows: Record<string, string>[] | string[][], delimiter = ','): string {
    const escapeCell = (cell: string) => {
      const needsQuotes = cell.includes(delimiter) || cell.includes('"') || cell.includes('\n') || cell.includes('\r');
      if (needsQuotes) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };

    const headerLine = headers.map(escapeCell).join(delimiter);
    const rowLines = rows.map((r) => {
      if (Array.isArray(r)) {
        return r.map((c) => escapeCell(c || '')).join(delimiter);
      }
      return headers.map((h) => escapeCell(r[h] || '')).join(delimiter);
    });

    return [headerLine, ...rowLines].join('\n');
  }

  public static exportToJson(rows: Record<string, string>[] | any[]): string {
    return JSON.stringify(rows, null, 2);
  }

  public static computeColumnStats(headers: string[], rows: Record<string, string>[] | string[][]): Record<string, DataStats> {
    const stats: Record<string, DataStats> = {};

    headers.forEach((h, colIdx) => {
      const values: string[] = rows
        .map((r) => {
          if (Array.isArray(r)) return r[colIdx] ?? '';
          return r[h] ?? '';
        })
        .filter((v) => v !== '');

      const nullCount = rows.length - values.length;
      const uniqueValues = new Set(values).size;

      const numValues = values.map(Number).filter((n) => !isNaN(n));
      const isNumeric = numValues.length > 0 && numValues.length === values.length;

      if (isNumeric) {
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);
        const sum = numValues.reduce((a, b) => a + b, 0);
        const mean = Number((sum / numValues.length).toFixed(2));
        stats[h] = {
          isNumeric: true,
          uniqueValues,
          nullCount,
          mean,
          sum: Number(sum.toFixed(2)),
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
        };
      } else {
        stats[h] = {
          isNumeric: false,
          uniqueValues,
          nullCount,
        };
      }
    });

    return stats;
  }

  public static deduplicateRows(rows: Record<string, string>[]): Record<string, string>[] {
    const seen = new Set<string>();
    const unique: Record<string, string>[] = [];
    for (const r of rows) {
      const key = JSON.stringify(r);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }
    return unique;
  }

  public static cleanEmptyRows(rows: Record<string, string>[]): Record<string, string>[] {
    return rows.filter((r) => Object.values(r).some((v) => v && v.trim().length > 0));
  }

  /**
   * Converts CSV to JSON array of objects
   */
  public static csvToJson(csvText: string): any[] {
    const { rows } = this.parseCsv(csvText);
    return rows;
  }

  /**
   * Converts JSON array of objects to CSV
   */
  public static jsonToCsv(jsonData: any[]): string {
    if (!Array.isArray(jsonData) || jsonData.length === 0) return '';
    const headers = Array.from(
      new Set(jsonData.flatMap((obj) => (typeof obj === 'object' && obj ? Object.keys(obj) : [])))
    );
    return this.exportToCsv(headers, jsonData);
  }

  /**
   * Sorts CSV rows by column index or key
   */
  public static sortRows(rows: string[][], colIdx: number, ascending = true): string[][] {
    return [...rows].sort((a, b) => {
      const valA = a[colIdx] || '';
      const valB = b[colIdx] || '';
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return ascending ? numA - numB : numB - numA;
      }
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  /**
   * Removes exact duplicate rows (raw string array)
   */
  public static removeDuplicates(rows: string[][]): string[][] {
    const seen = new Set<string>();
    const unique: string[][] = [];

    for (const row of rows) {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    }
    return unique;
  }

  /**
   * Computes statistical summary across numeric and categorical columns
   */
  public static computeStats(headers: string[], rows: string[][]): CsvStats {
    const colStats = headers.map((name, colIdx) => {
      const values = rows.map((r) => r[colIdx] || '').filter((v) => v !== '');
      const nullCount = rows.length - values.length;
      const uniqueCount = new Set(values).size;

      const numValues = values.map(Number).filter((n) => !isNaN(n));
      const isNumeric = numValues.length > 0 && numValues.length === values.length;

      if (isNumeric) {
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);
        const avg = numValues.reduce((acc, v) => acc + v, 0) / numValues.length;
        return {
          name,
          type: 'number' as const,
          nullCount,
          uniqueCount,
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
          avg: Number(avg.toFixed(2)),
        };
      }

      return {
        name,
        type: 'string' as const,
        nullCount,
        uniqueCount,
      };
    });

    return {
      rowCount: rows.length,
      columnCount: headers.length,
      headers,
      columnStats: colStats,
    };
  }
}
