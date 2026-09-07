(globalThis as any).DOMMatrix = class DOMMatrix {};
(globalThis as any).ImageData = class ImageData {};
(globalThis as any).Path2D = class Path2D {};

async function checkRegistry() {
  const { toolRegistry } = await import('../src/core/tool-registry/ToolRegistry');
  const { registerAllTools } = await import('../src/core/tool-registry/registerAllTools');
  registerAllTools();

  const all = toolRegistry.getAll();
  console.log(`Total tools in ToolRegistry: ${all.length}`);
}

checkRegistry().catch(console.error);
