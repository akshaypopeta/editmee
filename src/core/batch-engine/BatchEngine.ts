import JSZip from 'jszip';
import { ToolDefinition, BatchItemResult, ToolResult } from '../../types';
import { toolExecutor } from '../tool-executor/ToolExecutor';
import { FileEngine } from '../file-engine/FileEngine';

export interface BatchOptions {
  concurrency?: number;
  onItemUpdate?: (item: BatchItemResult) => void;
  onOverallProgress?: (percent: number, completedCount: number, totalCount: number) => void;
}

export class BatchEngine {
  private static instance: BatchEngine;

  private constructor() {}

  public static getInstance(): BatchEngine {
    if (!BatchEngine.instance) {
      BatchEngine.instance = new BatchEngine();
    }
    return BatchEngine.instance;
  }

  /**
   * Executes a tool across a list of input files
   */
  public async processBatch(
    tool: ToolDefinition,
    files: File[],
    sharedParams: Record<string, any> = {},
    options?: BatchOptions
  ): Promise<{ items: BatchItemResult[]; zipBlob?: Blob }> {
    const items: BatchItemResult[] = files.map((file, idx) => ({
      id: `batch_${idx}_${file.name}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    const total = items.length;
    let completed = 0;
    const concurrency = options?.concurrency || 2;

    const processItem = async (item: BatchItemResult) => {
      item.status = 'processing';
      item.progress = 20;
      options?.onItemUpdate?.(item);

      const input = {
        ...sharedParams,
        file: item.file,
      };

      try {
        const result: ToolResult = await toolExecutor.execute(tool, input, {
          onProgress: (p) => {
            item.progress = p;
            options?.onItemUpdate?.(item);
          },
        });

        item.result = result;
        if (result.success) {
          item.status = 'completed';
          item.progress = 100;
        } else {
          item.status = 'failed';
          item.error = result.error || 'Execution failed';
        }
      } catch (err: any) {
        item.status = 'failed';
        item.error = err.message || 'Processing error';
      }

      completed++;
      options?.onItemUpdate?.(item);
      options?.onOverallProgress?.(Math.round((completed / total) * 100), completed, total);
    };

    // Execute in controlled chunks
    const queue = [...items];
    const workers = Array(Math.min(concurrency, total))
      .fill(null)
      .map(async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (item) {
            await processItem(item);
          }
        }
      });

    await Promise.all(workers);

    // Create consolidated ZIP package for all successful file blobs
    const zip = new JSZip();
    let fileCountInZip = 0;

    for (const item of items) {
      if (item.result?.blob && item.status === 'completed') {
        const filename = item.result.filename || `processed_${item.file.name}`;
        zip.file(filename, item.result.blob);
        fileCountInZip++;
      } else if (item.result?.text && item.status === 'completed') {
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');
        zip.file(`${baseName}_result.txt`, item.result.text);
        fileCountInZip++;
      }
    }

    let zipBlob: Blob | undefined;
    if (fileCountInZip > 0) {
      zipBlob = await zip.generateAsync({ type: 'blob' });
    }

    return { items, zipBlob };
  }

  /**
   * Helper to download the batch zip archive
   */
  public downloadZip(zipBlob: Blob, zipName = 'editmee_batch_export.zip'): void {
    FileEngine.downloadBlob(zipBlob, zipName);
  }
}

export const batchEngine = BatchEngine.getInstance();
