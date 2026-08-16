import { toolRegistry } from './ToolRegistry';
import { allCatalogTools } from '../../tools/catalog';

let registered = false;

export function registerAllTools() {
  if (registered) return;
  registered = true;

  toolRegistry.registerMany(allCatalogTools);
}

