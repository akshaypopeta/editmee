import { ToolDefinition } from '../../types';
import { deduplicateTools } from '../../core/tool-registry/deduplication';
import { allNew1000Tools } from './new_batches';
import { allExpansion789Tools } from './expansion_batches';

const rawDeferredTools: ToolDefinition[] = [
  ...allNew1000Tools,
  ...allExpansion789Tools,
];

const dedupeResult = deduplicateTools(rawDeferredTools);
export const deferredCatalogTools: ToolDefinition[] = dedupeResult.canonicalTools;
export const deferredAliasMap = dedupeResult.aliasMap;
