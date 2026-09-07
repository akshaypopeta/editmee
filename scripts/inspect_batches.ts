(globalThis as any).DOMMatrix = class DOMMatrix {};
(globalThis as any).ImageData = class ImageData {};
(globalThis as any).Path2D = class Path2D {};

async function inspectBatches() {
  const batches = await import('../src/tools/catalog/new_batches/index');
  console.log('allNew1000Tools count:', batches.allNew1000Tools.length);
}

inspectBatches().catch(console.error);
