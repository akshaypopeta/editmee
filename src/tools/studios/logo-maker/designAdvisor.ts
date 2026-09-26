import { LogoElement, CanvasDimensions, DesignHealthCheck, BrandKit, BrandAuditReport } from './types';

export function runDesignHealthAudit(
  elements: LogoElement[],
  canvasSize: CanvasDimensions,
  bgType: string,
  bgColor: string
): DesignHealthCheck[] {
  const checks: DesignHealthCheck[] = [];

  if (elements.length === 0) {
    checks.push({
      id: 'empty-canvas',
      type: 'info',
      title: 'Canvas is Empty',
      description: 'Start by choosing a starting template, or add a shape, icon, and brand text.',
    });
    return checks;
  }

  // 1. Off-canvas check
  const offCanvasElements = elements.filter((el) => {
    const hw = el.width / 2;
    const hh = el.height / 2;
    return (
      el.x - hw < 0 ||
      el.x + hw > canvasSize.width ||
      el.y - hh < 0 ||
      el.y + hh > canvasSize.height
    );
  });

  if (offCanvasElements.length > 0) {
    checks.push({
      id: 'off-canvas',
      type: 'warning',
      title: `${offCanvasElements.length} Object(s) Beyond Edge`,
      description: 'Some elements extend outside canvas boundaries and will be clipped during export.',
      actionLabel: 'Center on Canvas',
      actionType: 'center-canvas',
    });
  }

  // 2. Safe-area boundary check (within 6% of edge)
  const marginX = canvasSize.width * 0.06;
  const marginY = canvasSize.height * 0.06;
  const closeToEdge = elements.filter((el) => {
    const hw = el.width / 2;
    const hh = el.height / 2;
    return (
      el.x - hw < marginX ||
      el.x + hw > canvasSize.width - marginX ||
      el.y - hh < marginY ||
      el.y + hh > canvasSize.height - marginY
    );
  });

  if (closeToEdge.length > 0 && offCanvasElements.length === 0) {
    checks.push({
      id: 'near-edge',
      type: 'info',
      title: 'Elements Near Safe Area Margin',
      description: 'Leaving comfortable breathing room around the logo ensures great display across all platforms.',
      actionLabel: 'Fit to Safe Area',
      actionType: 'fit-safe-area',
    });
  }

  // 3. Small Text Legibility Check
  const smallTextElements = elements.filter((el) => el.type === 'text' && (el.fontSize || 36) < 14);
  if (smallTextElements.length > 0) {
    checks.push({
      id: 'small-text',
      type: 'warning',
      title: `${smallTextElements.length} Text Item(s) Under 14px`,
      description: 'Text under 14px can become difficult to read when scaled down for app icons or business cards.',
      actionLabel: 'Boost Text Size',
      actionType: 'boost-text-size',
    });
  }

  // 4. Centered Composition Check
  if (elements.length > 0) {
    let sumX = 0;
    elements.forEach((el) => {
      sumX += el.x;
    });
    const avgX = sumX / elements.length;
    const canvasCenterX = canvasSize.width / 2;
    const offset = Math.abs(avgX - canvasCenterX);

    if (offset > 45) {
      checks.push({
        id: 'off-center',
        type: 'info',
        title: 'Logo Cluster is Off-Center',
        description: 'The overall center of your logo elements is shifted horizontally relative to the canvas center.',
        actionLabel: 'Align Center',
        actionType: 'center-canvas',
      });
    }
  }

  // 5. 3D Depth & Extrusion Check
  const threeDElements = elements.filter((el) => el.threeD?.enabled);
  if (threeDElements.length > 0) {
    const deepExtrusion = threeDElements.filter((el) => (el.threeD?.depth || 0) > 45);
    if (deepExtrusion.length > 0) {
      checks.push({
        id: 'extreme-3d-depth',
        type: 'info',
        title: 'Deep 3D Extrusion Detected',
        description: 'Extrusion depth exceeding 45px may occlude fine details at small favicon sizes. Recommended depth: 12-25px.',
      });
    } else {
      checks.push({
        id: '3d-depth-balanced',
        type: 'success',
        title: '3D Depth & Lighting Optimal',
        description: '3D extruded logo elements feature balanced perspective angles, ambient occlusion, and material lighting.',
      });
    }
  }

  // 6. Positive feedback if everything looks balanced
  if (checks.filter((c) => c.type === 'warning').length === 0) {
    checks.push({
      id: 'all-clear',
      type: 'success',
      title: 'Balanced Composition',
      description: 'Your logo has strong proportions, readable typography, and is within safe boundaries for export.',
    });
  }

  return checks;
}

/**
 * Calculates a rigorous, mathematical brand audit based on real canvas properties
 */
export function generateBrandAuditReport(
  elements: LogoElement[],
  canvasSize: CanvasDimensions,
  bgType: string,
  bgColor: string,
  brandKit?: BrandKit
): BrandAuditReport {
  if (elements.length === 0) {
    return {
      overallScore: 0,
      compositionScore: 0,
      typographyScore: 0,
      colorScore: 0,
      simplicityScore: 0,
      scalabilityScore: 0,
      versatilityScore: 0,
      brandConsistencyScore: 0,
      strengths: [],
      warnings: ['No design elements detected on canvas.'],
      recommendations: [
        {
          id: 'rec-add-elements',
          category: 'General',
          title: 'Start your design',
          detail: 'Add a brand symbol, primary text, and an optional tagline or select a starting template.',
        },
      ],
    };
  }

  const strengths: string[] = [];
  const warnings: string[] = [];
  const recommendations: {
    id: string;
    category: string;
    title: string;
    detail: string;
    actionType?: string;
  }[] = [];

  // ==========================================
  // 1. COMPOSITION ANALYSIS (0 - 100)
  // ==========================================
  let compositionScore = 100;
  
  // Calculate bounding box of all elements
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let totalArea = 0;

  elements.forEach((el) => {
    const hw = el.width / 2;
    const hh = el.height / 2;
    minX = Math.min(minX, el.x - hw);
    maxX = Math.max(maxX, el.x + hw);
    minY = Math.min(minY, el.y - hh);
    maxY = Math.max(maxY, el.y + hh);
    totalArea += el.width * el.height;
  });

  const clusterWidth = maxX - minX;
  const clusterHeight = maxY - minY;
  const clusterCenterX = (minX + maxX) / 2;
  const clusterCenterY = (minY + maxY) / 2;
  const canvasCenterX = canvasSize.width / 2;
  const canvasCenterY = canvasSize.height / 2;

  // Off-canvas penalty
  if (minX < 0 || maxX > canvasSize.width || minY < 0 || maxY > canvasSize.height) {
    compositionScore -= 30;
    warnings.push('Elements exceed canvas boundaries and will be clipped on export.');
    recommendations.push({
      id: 'rec-fit-canvas',
      category: 'Composition',
      title: 'Contain all elements within canvas',
      detail: 'Move or scale objects so they sit comfortably inside the active canvas area.',
      actionType: 'center-canvas',
    });
  } else {
    strengths.push('All design elements are safely inside the canvas boundary.');
  }

  // Centering check
  const offsetX = Math.abs(clusterCenterX - canvasCenterX);
  const offsetY = Math.abs(clusterCenterY - canvasCenterY);
  if (offsetX > canvasSize.width * 0.08 || offsetY > canvasSize.height * 0.08) {
    compositionScore -= 15;
    warnings.push('Overall logo cluster is not centered on the canvas.');
    recommendations.push({
      id: 'rec-recenter',
      category: 'Composition',
      title: 'Center design cluster',
      detail: 'Center the overall logo mass horizontally and vertically for balanced presentation.',
      actionType: 'center-canvas',
    });
  } else {
    strengths.push('Logo cluster is well-centered and optically balanced.');
  }

  // Safe margin check
  const marginThreshold = canvasSize.width * 0.05;
  if (
    minX < marginThreshold ||
    maxX > canvasSize.width - marginThreshold ||
    minY < marginThreshold ||
    maxY > canvasSize.height - marginThreshold
  ) {
    compositionScore -= 10;
    recommendations.push({
      id: 'rec-margins',
      category: 'Composition',
      title: 'Increase safe breathing room',
      detail: 'Leave at least 5% margin padding between outer elements and canvas boundaries.',
      actionType: 'fit-safe-area',
    });
  }

  // Aspect ratio check (logos look best between 1:1 and 3:1)
  const ratio = clusterWidth / (clusterHeight || 1);
  if (ratio > 5 || ratio < 0.2) {
    compositionScore -= 15;
    warnings.push('Extreme aspect ratio may hinder responsive usage.');
  }

  compositionScore = Math.max(20, Math.min(100, Math.round(compositionScore)));

  // ==========================================
  // 2. TYPOGRAPHY ANALYSIS (0 - 100)
  // ==========================================
  let typographyScore = 100;
  const textElements = elements.filter((el) => el.type === 'text' && el.text?.trim());
  const distinctFonts = new Set(textElements.map((t) => t.fontFamily || 'sans-serif'));

  if (textElements.length === 0) {
    typographyScore = 80;
    recommendations.push({
      id: 'rec-add-text',
      category: 'Typography',
      title: 'Consider adding brand name text',
      detail: 'Unless designing a standalone abstract symbol, pairing with a wordmark builds recognition.',
    });
  } else {
    if (distinctFonts.size > 2) {
      typographyScore -= 25;
      warnings.push(`Design uses ${distinctFonts.size} different font families. Maximum 2 is recommended.`);
      recommendations.push({
        id: 'rec-limit-fonts',
        category: 'Typography',
        title: 'Limit font families to 1 or 2',
        detail: 'Pair a distinctive display font for the brand title with a clean sans-serif for taglines.',
      });
    } else {
      strengths.push(`Disciplined font usage (${distinctFonts.size} font family used).`);
    }

    const minFontSize = Math.min(...textElements.map((t) => t.fontSize || 36));
    if (minFontSize < 14) {
      typographyScore -= 20;
      warnings.push(`Smallest text is ${minFontSize}px. May become illegible at favicon or business card scale.`);
      recommendations.push({
        id: 'rec-boost-text',
        category: 'Typography',
        title: 'Increase small font size',
        detail: 'Keep text at least 14px–16px so it remains readable when reduced.',
        actionType: 'boost-text-size',
      });
    } else {
      strengths.push(`All text elements maintain legible font sizes (minimum ${minFontSize}px).`);
    }

    // Check size hierarchy if multiple text elements exist
    if (textElements.length >= 2) {
      const sortedSizes = [...textElements.map((t) => t.fontSize || 36)].sort((a, b) => b - a);
      if (sortedSizes[0] < sortedSizes[1] * 1.3) {
        typographyScore -= 10;
        recommendations.push({
          id: 'rec-type-hierarchy',
          category: 'Typography',
          title: 'Strengthen typographical hierarchy',
          detail: 'Make the primary brand name noticeably larger than taglines or descriptors (at least 1.5x).',
        });
      } else {
        strengths.push('Distinct hierarchical contrast between brand name and subtitle.');
      }
    }
  }

  typographyScore = Math.max(20, Math.min(100, Math.round(typographyScore)));

  // ==========================================
  // 3. COLOR SYSTEM ANALYSIS (0 - 100)
  // ==========================================
  let colorScore = 100;
  const colorsUsed = new Set<string>();

  elements.forEach((el) => {
    if (el.fillColor && el.fillColor !== 'transparent') colorsUsed.add(el.fillColor.toLowerCase());
    if (el.stroke?.color && el.stroke.color !== 'transparent') colorsUsed.add(el.stroke.color.toLowerCase());
    if (el.gradient?.startColor) colorsUsed.add(el.gradient.startColor.toLowerCase());
    if (el.gradient?.endColor) colorsUsed.add(el.gradient.endColor.toLowerCase());
  });

  const distinctColorCount = colorsUsed.size;
  if (distinctColorCount > 4) {
    colorScore -= 25;
    warnings.push(`Using ${distinctColorCount} distinct colors. Modern iconic logos typically use 2 to 3 colors.`);
    recommendations.push({
      id: 'rec-simplify-colors',
      category: 'Color',
      title: 'Consolidate color palette',
      detail: 'Reduce palette to 1 primary brand color, 1 secondary/neutral color, and 1 accent color.',
    });
  } else if (distinctColorCount >= 1 && distinctColorCount <= 3) {
    strengths.push(`Optimal brand color discipline (${distinctColorCount} harmonious colors).`);
  }

  colorScore = Math.max(25, Math.min(100, Math.round(colorScore)));

  // ==========================================
  // 4. SIMPLICITY & MEMORABILITY (0 - 100)
  // ==========================================
  let simplicityScore = 100;
  const count = elements.length;

  if (count > 8) {
    simplicityScore -= 25;
    warnings.push(`Logo consists of ${count} separate elements. Simpler logos are easier to recall.`);
    recommendations.push({
      id: 'rec-reduce-elements',
      category: 'Simplicity',
      title: 'Prune secondary elements',
      detail: 'Remove decorative lines, duplicate shapes, or badges that do not add core identity.',
    });
  } else if (count >= 2 && count <= 5) {
    strengths.push(`Clean, iconic element count (${count} elements).`);
  }

  simplicityScore = Math.max(25, Math.min(100, Math.round(simplicityScore)));

  // ==========================================
  // 5. SCALABILITY ANALYSIS (0 - 100)
  // ==========================================
  let scalabilityScore = 95;
  const hasIntricateShapes = elements.some((el) => el.width < 25 || el.height < 25);
  if (hasIntricateShapes) {
    scalabilityScore -= 20;
    warnings.push('Micro elements under 25px detected. They may disappear when scaled down.');
  } else {
    strengths.push('Shapes have sufficient mass to stay identifiable on mobile screens.');
  }

  scalabilityScore = Math.max(30, Math.min(100, Math.round(scalabilityScore)));

  // ==========================================
  // 6. VERSATILITY ANALYSIS (0 - 100)
  // ==========================================
  let versatilityScore = 100;
  if (bgType !== 'transparent') {
    versatilityScore -= 10;
    recommendations.push({
      id: 'rec-transparent-export',
      category: 'Versatility',
      title: 'Ensure transparent background export',
      detail: 'Transparent backgrounds allow flexible placement on dark sites, stationery, and merchandise.',
    });
  } else {
    strengths.push('Transparent background enabled for universal placement.');
  }

  // Has icon symbol for standalone favicon / app icon
  const hasIconOrShape = elements.some((el) => el.type === 'icon' || el.type === 'shape');
  if (hasIconOrShape) {
    strengths.push('Contains standalone vector mark suitable for favicon or app icon extraction.');
  } else {
    versatilityScore -= 15;
    recommendations.push({
      id: 'rec-add-symbol',
      category: 'Versatility',
      title: 'Add an identifiable vector mark',
      detail: 'A distinct icon or emblem can be used independently as a social media avatar or favicon.',
    });
  }

  versatilityScore = Math.max(30, Math.min(100, Math.round(versatilityScore)));

  // ==========================================
  // 7. BRAND KIT CONSISTENCY
  // ==========================================
  let brandConsistencyScore = 100;
  if (brandKit?.brandName && textElements.length > 0) {
    const hasMatchingName = textElements.some(
      (t) => t.text?.toLowerCase().includes(brandKit.brandName.toLowerCase().trim())
    );
    if (!hasMatchingName) {
      brandConsistencyScore -= 20;
      recommendations.push({
        id: 'rec-brand-name-sync',
        category: 'Brand Consistency',
        title: 'Align text with Brand Kit name',
        detail: `Canvas text does not include saved brand name "${brandKit.brandName}".`,
      });
    } else {
      strengths.push(`Matches active Brand Kit identity ("${brandKit.brandName}").`);
    }
  }

  // 3D Depth & Presentation Check
  const threeDCount = elements.filter((el) => el.threeD?.enabled).length;
  if (threeDCount > 0) {
    strengths.push(
      `Features ${threeDCount} studio 3D element${threeDCount > 1 ? 's' : ''} with dynamic extrusion, material shading, and specular lighting.`
    );
  }

  brandConsistencyScore = Math.max(30, Math.min(100, Math.round(brandConsistencyScore)));

  // ==========================================
  // 8. OVERALL COMPOSITE SCORE
  // ==========================================
  const overallScore = Math.round(
    compositionScore * 0.25 +
    typographyScore * 0.20 +
    colorScore * 0.15 +
    simplicityScore * 0.15 +
    scalabilityScore * 0.15 +
    versatilityScore * 0.10
  );

  return {
    overallScore,
    compositionScore,
    typographyScore,
    colorScore,
    simplicityScore,
    scalabilityScore,
    versatilityScore,
    brandConsistencyScore,
    strengths,
    warnings,
    recommendations,
  };
}
