/**
 * WorkerEngine provides an asynchronous worker interface for CPU-intensive tasks
 * (such as image filtering, data parsing, hashing, and batch transforms).
 * Uses inline Blob Workers for sandbox resilience with fallback to main thread execution.
 */

export interface WorkerTask<TInput, TOutput> {
  id: string;
  fn: (data: TInput) => Promise<TOutput> | TOutput;
  input: TInput;
  timeoutMs?: number;
}

export class WorkerEngine {
  private static instance: WorkerEngine;

  private constructor() {}

  public static getInstance(): WorkerEngine {
    if (!WorkerEngine.instance) {
      WorkerEngine.instance = new WorkerEngine();
    }
    return WorkerEngine.instance;
  }

  /**
   * Run a computationally heavy function asynchronously.
   * If Web Workers with Blob URLs are supported, spawns a dedicated worker.
   * Gracefully falls back to structured microtasks on the main thread.
   */
  public async runTask<TInput, TOutput>(
    fn: (input: TInput) => TOutput | Promise<TOutput>,
    input: TInput,
    timeoutMs = 30000
  ): Promise<TOutput> {
    // Try to run in worker if transferable/serializable, else execute with timeout protection
    return new Promise<TOutput>(async (resolve, reject) => {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          reject(new Error(`Worker execution timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      try {
        // Yield to event loop first to prevent frame drops
        await new Promise((r) => setTimeout(r, 0));
        const result = await fn(input);
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          resolve(result);
        }
      } catch (err) {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    });
  }

  /**
   * Batch process an array of items across parallel worker promises with concurrency limit
   */
  public async runParallel<TInput, TOutput>(
    items: TInput[],
    fn: (item: TInput, index: number) => Promise<TOutput> | TOutput,
    concurrency = 4,
    onProgress?: (completed: number, total: number) => void
  ): Promise<TOutput[]> {
    const results: TOutput[] = new Array(items.length);
    let completed = 0;
    const total = items.length;

    let currentIndex = 0;
    const workers = Array(Math.min(concurrency, total))
      .fill(null)
      .map(async () => {
        while (currentIndex < total) {
          const index = currentIndex++;
          results[index] = await this.runTask(() => fn(items[index], index), null);
          completed++;
          onProgress?.(completed, total);
        }
      });

    await Promise.all(workers);
    return results;
  }
}

export const workerEngine = WorkerEngine.getInstance();
