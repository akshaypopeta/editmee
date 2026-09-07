(globalThis as any).DOMMatrix = class DOMMatrix {};
(globalThis as any).ImageData = class ImageData {};
(globalThis as any).Path2D = class Path2D {};

async function auditExpansion() {
  const { allCatalogTools, allCatalogs, allRealTools } = await import('../src/tools/catalog/index');
  console.log(`Current allCatalogTools length: ${allCatalogTools.length}`);

  const categoryCounts: Record<string, number> = {};
  for (const t of allCatalogTools) {
    const c = (t.category || 'other').toLowerCase();
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  }

  console.log('\n--- All unique categories in allCatalogTools ---');
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`- ${cat}: ${count}`);
  }
}

auditExpansion().catch(console.error);
