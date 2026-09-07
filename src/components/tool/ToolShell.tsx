import React from 'react';
import { ToolDefinition } from '../../types';
import { LegalPageId } from '../common/LegalPages';
import { ToolPageTemplate } from '../navigation/ToolPageTemplate';
import { ArchetypeResolver } from './archetypes/ArchetypeResolver';

interface ToolShellProps {
  tool: ToolDefinition;
  onNavigateHome?: () => void;
  onNavigateCategory?: (category: string) => void;
  onSelectTool?: (toolId: string) => void;
  onOpenLegalPage?: (pageId: LegalPageId) => void;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  onNavigateHome = () => {},
  onNavigateCategory = () => {},
  onSelectTool = () => {},
  onOpenLegalPage,
}) => {
  // 1. If tool has an authentic flagship custom workspace component, render it
  if (tool.customWorkspace) {
    const CustomComp = tool.customWorkspace;
    return (
      <ToolPageTemplate
        tool={tool}
        onNavigateHome={onNavigateHome}
        onNavigateCategory={onNavigateCategory}
        onSelectTool={onSelectTool}
        onOpenLegalPage={onOpenLegalPage}
      >
        <CustomComp tool={tool} />
      </ToolPageTemplate>
    );
  }

  // 2. Otherwise render the specialized dynamic archetype workspace with real logic, live previews, and controls
  return (
    <ToolPageTemplate
      tool={tool}
      onNavigateHome={onNavigateHome}
      onNavigateCategory={onNavigateCategory}
      onSelectTool={onSelectTool}
      onOpenLegalPage={onOpenLegalPage}
    >
      <div id={`tool-workspace-${tool.id}`} className="w-full">
        <ArchetypeResolver tool={tool} />
      </div>
    </ToolPageTemplate>
  );
};
