import { CalculatorDefinition, CalculatorResult } from '../types';

export const homeCalculators: CalculatorDefinition[] = [
  // 36. Square Footage & Floor Tile Calculator
  {
    id: 'square-footage-calculator',
    name: 'Square Footage & Flooring Tile Calculator',
    category: 'calculators',
    subcategory: 'home',
    description: 'Calculate total room square footage, material waste allowance, tile count, and required flooring boxes.',
    iconName: 'Grid',
    tags: ['square footage', 'flooring calculator', 'tile calculator', 'sq ft', 'remodeling', 'construction'],
    inputs: [
      { id: 'roomLengthFeet', label: 'Room Length', type: 'number', defaultValue: 16, min: 1, step: 0.5, suffix: 'Feet' },
      { id: 'roomWidthFeet', label: 'Room Width', type: 'number', defaultValue: 12, min: 1, step: 0.5, suffix: 'Feet' },
      { id: 'wasteAllowancePercent', label: 'Waste & Cut Allowance', type: 'select', defaultValue: 10, options: [
        { label: '5% (Simple rectangular room)', value: 5 },
        { label: '10% (Standard cuts & corners)', value: 10 },
        { label: '15% (Diagonal tile or complex hallways)', value: 15 },
        { label: '20% (Herringbone or mosaic)', value: 20 },
      ]},
      { id: 'boxCoverageSqFt', label: 'Coverage per Box / Carton', type: 'number', defaultValue: 24, min: 1, step: 0.5, suffix: 'Sq Ft' },
      { id: 'pricePerSqFt', label: 'Material Price per Sq Ft', type: 'number', defaultValue: 4.5, min: 0, step: 0.25, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const length = Number(inputs.roomLengthFeet) || 16;
      const width = Number(inputs.roomWidthFeet) || 12;
      const wastePct = (Number(inputs.wasteAllowancePercent) || 10) / 100;
      const boxCoverage = Number(inputs.boxCoverageSqFt) || 24;
      const unitPrice = Number(inputs.pricePerSqFt) || 0;

      const baseArea = length * width;
      const wasteArea = baseArea * wastePct;
      const totalAreaNeeded = baseArea + wasteArea;
      const boxesNeeded = Math.ceil(totalAreaNeeded / boxCoverage);
      const totalPurchasedArea = boxesNeeded * boxCoverage;
      const totalMaterialCost = totalPurchasedArea * unitPrice;
      const sqMeters = baseArea * 0.092903;

      return {
        success: true,
        primary: { label: 'Flooring Needed (with waste)', value: `${Math.ceil(totalAreaNeeded)} Sq Ft`, unit: `(${boxesNeeded} boxes)` },
        metrics: [
          { label: 'Net Room Area', value: `${baseArea.toFixed(1)} sq ft`, subtext: `${sqMeters.toFixed(1)} m²`, isHighlight: true },
          { label: 'Total Boxes to Buy', value: `${boxesNeeded} Boxes`, subtext: `${totalPurchasedArea} sq ft purchased` },
          { label: 'Estimated Material Cost', value: `$${totalMaterialCost.toFixed(2)}`, subtext: `@ $${unitPrice.toFixed(2)}/sq ft` },
          { label: 'Waste Allowance Area', value: `${wasteArea.toFixed(1)} sq ft`, subtext: `${(wastePct * 100)}% scrap margin` },
        ],
        breakdownTitle: 'Material Estimating Breakdown',
        breakdownRows: [
          { label: 'True Floor Area', value: `${baseArea.toFixed(1)} sq ft` },
          { label: `Cutting Waste Allowance (${(wastePct * 100)}%)`, value: `+${wasteArea.toFixed(1)} sq ft` },
          { label: 'Minimum Required Coverage', value: `${totalAreaNeeded.toFixed(1)} sq ft` },
          { label: 'Full Box Total Purchased', value: `${totalPurchasedArea} sq ft (${boxesNeeded} boxes)` },
        ],
        interpretation: `A ${length}' × ${width}' room has an area of ${baseArea} sq ft. Adding ${(wastePct * 100)}% for cuts requires ${Math.ceil(totalAreaNeeded)} sq ft. At ${boxCoverage} sq ft/box, buy ${boxesNeeded} boxes ($${totalMaterialCost.toFixed(2)}).`,
        formulaExplanation: 'Net Area = Length × Width. Total Area = Net Area × (1 + Waste %). Boxes = ⌈Total Area / Coverage per Box⌉.',
        exampleCalculation: '16 ft × 12 ft = 192 sq ft. +10% waste = 211.2 sq ft. At 24 sq ft/box = 9 boxes (216 sq ft).',
      };
    },
    seo: {
      title: 'Square Footage & Flooring Calculator - Tiles, Boards & Boxes',
      metaDescription: 'Calculate room square footage, tile cutting waste percentage, required flooring boxes, and total project material cost.',
      keywords: ['square footage calculator', 'flooring calculator', 'tile calculator', 'how many boxes of flooring'],
    },
    howTo: [
      { step: 1, title: 'Enter Room Dimensions', description: 'Input length and width of the room in feet.' },
      { step: 2, title: 'Set Waste Allowance', description: 'Choose 10% for standard installation, or 15% for diagonal layouts.' },
      { step: 3, title: 'Specify Box Packaging', description: 'Enter square footage per box from your tile or hardwood carton.' },
    ],
  },

  // 37. Paint Coverage & Gallons Calculator
  {
    id: 'paint-coverage-calculator',
    name: 'Paint Coverage & Gallons Calculator',
    category: 'calculators',
    subcategory: 'home',
    description: 'Calculate how many gallons of paint to buy for room walls, deducting doors and windows and factoring coats.',
    iconName: 'Paintbrush',
    tags: ['paint calculator', 'gallons of paint', 'wall paint', 'paint coverage', 'home renovation'],
    inputs: [
      { id: 'roomLength', label: 'Room Length (ft)', type: 'number', defaultValue: 14, min: 1, step: 0.5 },
      { id: 'roomWidth', label: 'Room Width (ft)', type: 'number', defaultValue: 12, min: 1, step: 0.5 },
      { id: 'ceilingHeight', label: 'Ceiling Height (ft)', type: 'number', defaultValue: 8, min: 6, max: 25, step: 0.5 },
      { id: 'doorsCount', label: 'Number of Doors', type: 'number', defaultValue: 2, min: 0, max: 10, step: 1 },
      { id: 'windowsCount', label: 'Number of Windows', type: 'number', defaultValue: 2, min: 0, max: 15, step: 1 },
      { id: 'numberOfCoats', label: 'Number of Coats', type: 'select', defaultValue: 2, options: [{ label: '1 Coat (Touch-up)', value: 1 }, { label: '2 Coats (Standard)', value: 2 }, { label: '3 Coats (Dark to light color change)', value: 3 }] },
      { id: 'spreadRate', label: 'Coverage Rate per Gallon', type: 'number', defaultValue: 350, min: 200, max: 500, step: 25, suffix: 'Sq Ft/Gallon' },
    ],
    calculate: (inputs): CalculatorResult => {
      const l = Number(inputs.roomLength) || 14;
      const w = Number(inputs.roomWidth) || 12;
      const h = Number(inputs.ceilingHeight) || 8;
      const doors = Number(inputs.doorsCount) || 0;
      const windows = Number(inputs.windowsCount) || 0;
      const coats = Number(inputs.numberOfCoats) || 2;
      const spread = Number(inputs.spreadRate) || 350;

      const perimeter = 2 * (l + w);
      const grossWallArea = perimeter * h;
      const doorsArea = doors * 21; // Standard door is ~21 sq ft (3' x 7')
      const windowsArea = windows * 15; // Standard window is ~15 sq ft (3' x 5')
      const netWallAreaPerCoat = Math.max(0, grossWallArea - (doorsArea + windowsArea));
      const totalPaintingArea = netWallAreaPerCoat * coats;
      const gallonsNeeded = totalPaintingArea / spread;
      const gallonsToBuy = Math.ceil(gallonsNeeded);

      return {
        success: true,
        primary: { label: 'Paint Required', value: `${gallonsToBuy} Gallons`, unit: `(${gallonsNeeded.toFixed(2)} exact gals)` },
        metrics: [
          { label: 'Net Wall Area per Coat', value: `${Math.round(netWallAreaPerCoat)} sq ft`, subtext: 'Excluding doors/windows', isHighlight: true },
          { label: 'Gross Wall Area', value: `${grossWallArea} sq ft`, subtext: `Perimeter: ${perimeter} ft` },
          { label: 'Coats of Paint', value: `${coats} Coats`, subtext: `${Math.round(totalPaintingArea)} total sq ft` },
          { label: 'Deductions (Openings)', value: `-${doorsArea + windowsArea} sq ft`, subtext: `${doors} doors, ${windows} windows` },
        ],
        breakdownTitle: 'Surface Area Deductions',
        breakdownRows: [
          { label: 'Gross Perimeter Walls', value: `${grossWallArea} sq ft` },
          { label: `Doors Deduction (${doors})`, value: `-${doorsArea} sq ft` },
          { label: `Windows Deduction (${windows})`, value: `-${windowsArea} sq ft` },
          { label: `Total Area for ${coats} Coat(s)`, value: `${Math.round(totalPaintingArea)} sq ft` },
        ],
        interpretation: `Your walls have ${Math.round(netWallAreaPerCoat)} sq ft of paintable surface. For ${coats} coats (${Math.round(totalPaintingArea)} sq ft total) at ${spread} sq ft/gal, purchase ${gallonsToBuy} gallons.`,
        formulaExplanation: 'Net Area = (2 × (Length + Width) × Height) - (Doors × 21) - (Windows × 15). Gallons = ⌈(Net Area × Coats) / Spread Rate⌉.',
        exampleCalculation: '14x12 room with 8ft ceiling: 416 sq ft gross. Less 2 doors (42) and 2 windows (30) = 344 sq ft net. 2 coats = 688 sq ft ÷ 350 = 1.97 → Buy 2 gallons.',
      };
    },
    seo: {
      title: 'Paint Calculator - How Many Gallons of Paint for Room Walls',
      metaDescription: 'Free paint calculator. Estimate gallons of paint needed for interior walls with window and door deductions and multiple coats.',
      keywords: ['paint calculator', 'how many gallons of paint', 'interior paint calculator', 'wall paint coverage'],
    },
    howTo: [
      { step: 1, title: 'Enter Room Dimensions', description: 'Input length, width, and wall height.' },
      { step: 2, title: 'Count Openings', description: 'Enter number of standard doors and windows to subtract non-painted surfaces.' },
      { step: 3, title: 'Select Number of Coats', description: 'Choose 2 coats for clean, uniform coverage.' },
    ],
  },

  // 38. Concrete Slab Volume & Bags Calculator
  {
    id: 'concrete-volume-calculator',
    name: 'Concrete Slab Volume & Bags Calculator',
    category: 'calculators',
    subcategory: 'home',
    description: 'Calculate concrete volume in cubic yards and cubic meters, and number of pre-mixed 60lb and 80lb bags for slabs and footings.',
    iconName: 'Boxes',
    tags: ['concrete calculator', 'cubic yards', 'concrete bags', 'patio slab', 'cement calculator', 'footings'],
    inputs: [
      { id: 'lengthFeet', label: 'Slab Length', type: 'number', defaultValue: 12, min: 0.5, step: 0.5, suffix: 'Feet' },
      { id: 'widthFeet', label: 'Slab Width', type: 'number', defaultValue: 10, min: 0.5, step: 0.5, suffix: 'Feet' },
      { id: 'thicknessInches', label: 'Thickness / Depth', type: 'number', defaultValue: 4, min: 1, max: 24, step: 0.5, suffix: 'Inches' },
      { id: 'wasteAllowancePct', label: 'Spillage / Form Waste', type: 'select', defaultValue: 10, options: [{ label: '5% (Precise forms)', value: 5 }, { label: '10% (Standard recommend)', value: 10 }, { label: '15% (Uneven ground / excavation)', value: 15 }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const l = Number(inputs.lengthFeet) || 12;
      const w = Number(inputs.widthFeet) || 10;
      const tInches = Number(inputs.thicknessInches) || 4;
      const waste = (Number(inputs.wasteAllowancePct) || 10) / 100;

      const tFeet = tInches / 12;
      const baseCuFt = l * w * tFeet;
      const totalCuFt = baseCuFt * (1 + waste);
      const cubicYards = totalCuFt / 27;
      const cubicMeters = totalCuFt * 0.0283168;

      // Bags needed:
      // 80 lb bag yields approx 0.60 cu ft
      // 60 lb bag yields approx 0.45 cu ft
      const bags80 = Math.ceil(totalCuFt / 0.60);
      const bags60 = Math.ceil(totalCuFt / 0.45);

      return {
        success: true,
        primary: { label: 'Ready-Mix Concrete Needed', value: `${cubicYards.toFixed(2)} Cubic Yards`, unit: `(${cubicMeters.toFixed(2)} m³)` },
        metrics: [
          { label: 'Pre-mixed 80-lb Bags', value: `${bags80} Bags`, subtext: '0.60 cu ft per bag', isHighlight: true },
          { label: 'Pre-mixed 60-lb Bags', value: `${bags60} Bags`, subtext: '0.45 cu ft per bag' },
          { label: 'Total Volume', value: `${totalCuFt.toFixed(1)} cu ft`, subtext: `${(waste * 100)}% spillage factor` },
          { label: 'Slab Surface Area', value: `${l * w} sq ft`, subtext: `${tInches}" thick slab` },
        ],
        breakdownTitle: 'Volume & Bag Count',
        breakdownRows: [
          { label: 'Base Slab Volume', value: `${baseCuFt.toFixed(2)} cu ft (${(baseCuFt / 27).toFixed(2)} yd³)` },
          { label: `With ${(waste * 100)}% Reserve Margin`, value: `${totalCuFt.toFixed(2)} cu ft (${cubicYards.toFixed(2)} yd³)` },
          { label: 'If using 80-lb pre-mixed bags', value: `${bags80} bags required` },
          { label: 'If using 60-lb pre-mixed bags', value: `${bags60} bags required` },
        ],
        interpretation: `A ${l}' × ${w}' slab at ${tInches}" depth requires ${cubicYards.toFixed(2)} cubic yards of concrete (including ${(waste * 100)}% margin). If bagging by hand, buy ${bags80} eighty-pound bags.`,
        formulaExplanation: 'Cubic Yards = (Length ft × Width ft × (Depth in / 12)) / 27. Add 10% reserve for sub-base deflection.',
        exampleCalculation: '12 ft × 10 ft × (4/12 ft) = 40 cu ft ÷ 27 = 1.48 yd³. +10% waste = 1.63 cubic yards (74 eighty-lb bags).',
      };
    },
    seo: {
      title: 'Concrete Calculator - Cubic Yards & 80lb/60lb Bags Needed',
      metaDescription: 'Free concrete slab calculator. Calculate concrete volume in cubic yards, cubic meters, and pre-mixed bag quantities for patios, sidewalks, and foundations.',
      keywords: ['concrete calculator', 'cubic yards of concrete', 'concrete bags calculator', 'slab volume'],
    },
    howTo: [
      { step: 1, title: 'Enter Slab Dimensions', description: 'Input length and width of the project in feet.' },
      { step: 2, title: 'Specify Thickness', description: 'Enter slab thickness in inches (4 inches standard for residential patios/sidewalks).' },
      { step: 3, title: 'Choose Delivery or Bags', description: 'Use cubic yards for ready-mix transit trucks, or bag counts for DIY bags.' },
    ],
  },

  // 39. Mulch & Soil Landscaping Calculator
  {
    id: 'mulch-soil-calculator',
    name: 'Mulch & Topsoil Landscaping Calculator',
    category: 'calculators',
    subcategory: 'home',
    description: 'Calculate cubic yards, cubic feet, and standard 2 cu ft bagged mulch needed for garden flowerbeds at your desired depth.',
    iconName: 'Sprout',
    tags: ['mulch calculator', 'soil calculator', 'garden beds', 'landscaping', 'cubic yards', 'topsoil'],
    inputs: [
      { id: 'bedLengthFeet', label: 'Garden Bed Length', type: 'number', defaultValue: 30, min: 1, step: 1, suffix: 'Feet' },
      { id: 'bedWidthFeet', label: 'Garden Bed Width', type: 'number', defaultValue: 6, min: 1, step: 0.5, suffix: 'Feet' },
      { id: 'depthInches', label: 'Mulch / Soil Depth', type: 'select', defaultValue: 3, options: [
        { label: '1 Inch (Light refresh)', value: 1 },
        { label: '2 Inches (Standard top-dressing)', value: 2 },
        { label: '3 Inches (New bed weed prevention)', value: 3 },
        { label: '4 Inches (Heavy weed barrier)', value: 4 },
        { label: '6 Inches (Raised garden bed soil fill)', value: 6 },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const length = Number(inputs.bedLengthFeet) || 30;
      const width = Number(inputs.bedWidthFeet) || 6;
      const depth = Number(inputs.depthInches) || 3;

      const areaSqFt = length * width;
      const volumeCuFt = areaSqFt * (depth / 12);
      const volumeCuYards = volumeCuFt / 27;

      // Standard retail bags are typically 2 cu ft or 3 cu ft
      const bags2CuFt = Math.ceil(volumeCuFt / 2);
      const bags3CuFt = Math.ceil(volumeCuFt / 3);

      return {
        success: true,
        primary: { label: 'Bulk Mulch Needed', value: `${volumeCuYards.toFixed(2)} Cubic Yards`, unit: `(${Math.ceil(volumeCuFt)} cu ft)` },
        metrics: [
          { label: 'Standard 2 Cu Ft Bags', value: `${bags2CuFt} Bags`, subtext: 'Common garden center bags', isHighlight: true },
          { label: 'Large 3 Cu Ft Bags', value: `${bags3CuFt} Bags`, subtext: 'Bulk retail bags' },
          { label: 'Bed Surface Area', value: `${areaSqFt} sq ft`, subtext: `${length}' × ${width}' bed` },
          { label: 'Depth Applied', value: `${depth} Inches`, subtext: 'Uniform spread' },
        ],
        breakdownTitle: 'Purchasing Options',
        breakdownRows: [
          { label: 'Total Cubic Feet Required', value: `${volumeCuFt.toFixed(1)} cu ft` },
          { label: 'Bulk Delivery (Cubic Yards)', value: `${volumeCuYards.toFixed(2)} cubic yards` },
          { label: 'Bagged 2.0 cu ft Bags', value: `${bags2CuFt} bags` },
          { label: 'Bagged 3.0 cu ft Bags', value: `${bags3CuFt} bags` },
        ],
        interpretation: `Covering ${areaSqFt} sq ft of garden bed to a depth of ${depth}" requires ${volumeCuYards.toFixed(2)} cubic yards (${Math.ceil(volumeCuFt)} cu ft). That equals ${bags2CuFt} standard two-cubic-foot bags.`,
        formulaExplanation: 'Cubic Yards = (Length ft × Width ft × (Depth in / 12)) / 27. 1 cubic yard = 13.5 two-cubic-foot bags.',
        exampleCalculation: '30 ft × 6 ft = 180 sq ft. At 3" depth (0.25 ft): 180 × 0.25 = 45 cu ft ÷ 27 = 1.67 cubic yards (23 bags of 2 cu ft).',
      };
    },
    seo: {
      title: 'Mulch & Soil Calculator - Cubic Yards & Bagged Quantity',
      metaDescription: 'Free mulch and soil calculator. Determine cubic yards of bulk mulch or number of 2 cu ft bags for your garden and landscaping beds.',
      keywords: ['mulch calculator', 'soil calculator', 'cubic yards of mulch', 'how many bags of mulch'],
    },
    howTo: [
      { step: 1, title: 'Enter Bed Dimensions', description: 'Input length and width of the garden bed or planter area.' },
      { step: 2, title: 'Select Depth', description: 'Choose 2 to 3 inches for mulch, or deeper for raised garden beds.' },
      { step: 3, title: 'Compare Bulk vs Bags', description: 'See whether buying bulk cubic yards or bagged mulch is more convenient.' },
    ],
  },

  // 40. Wallpaper Rolls Calculator
  {
    id: 'wallpaper-calculator',
    name: 'Wallpaper Rolls & Wall Coverage Calculator',
    category: 'calculators',
    subcategory: 'home',
    description: 'Calculate how many rolls of wallpaper you need factoring in room perimeter, ceiling height, roll dimensions, and pattern repeat drop.',
    iconName: 'Layers',
    tags: ['wallpaper calculator', 'wallpaper rolls', 'wall covering', 'home decor', 'interior design'],
    inputs: [
      { id: 'roomPerimeterFeet', label: 'Total Wall Perimeter', type: 'number', defaultValue: 44, min: 4, step: 1, suffix: 'Feet', helperText: 'Sum of all 4 wall lengths' },
      { id: 'wallHeightFeet', label: 'Wall Height', type: 'number', defaultValue: 9, min: 6, max: 20, step: 0.5, suffix: 'Feet' },
      { id: 'rollWidthInches', label: 'Roll Width', type: 'number', defaultValue: 20.5, min: 10, max: 60, step: 0.5, suffix: 'Inches' },
      { id: 'rollLengthFeet', label: 'Roll Length', type: 'number', defaultValue: 33, min: 10, max: 100, step: 1, suffix: 'Feet' },
      { id: 'patternRepeatInches', label: 'Pattern Repeat Match', type: 'number', defaultValue: 21, min: 0, max: 40, step: 1, suffix: 'Inches', helperText: '0 for solid or random match' },
    ],
    calculate: (inputs): CalculatorResult => {
      const perimeter = Number(inputs.roomPerimeterFeet) || 44;
      const height = Number(inputs.wallHeightFeet) || 9;
      const rollWidthIn = Number(inputs.rollWidthInches) || 20.5;
      const rollLengthFt = Number(inputs.rollLengthFeet) || 33;
      const patternIn = Number(inputs.patternRepeatInches) || 0;

      const perimeterInches = perimeter * 12;
      const totalStripsNeeded = Math.ceil(perimeterInches / rollWidthIn);

      // Height per strip adjusted for pattern repeat waste
      const heightInches = height * 12;
      let effectiveCutInches = heightInches;
      if (patternIn > 0) {
        effectiveCutInches += patternIn;
      }
      const effectiveCutFeet = effectiveCutInches / 12;

      const stripsPerRoll = Math.floor(rollLengthFt / effectiveCutFeet);
      const usableStripsPerRoll = Math.max(1, stripsPerRoll);
      const rollsNeeded = Math.ceil(totalStripsNeeded / usableStripsPerRoll);

      const wallArea = perimeter * height;
      const rollCoverageArea = (rollWidthIn / 12) * rollLengthFt;

      return {
        success: true,
        primary: { label: 'Wallpaper Rolls to Buy', value: `${rollsNeeded} Single Rolls`, unit: `(${totalStripsNeeded} wall strips)` },
        metrics: [
          { label: 'Strips per Roll', value: `${usableStripsPerRoll} Strips`, subtext: `At ${effectiveCutFeet.toFixed(1)}' cut length`, isHighlight: true },
          { label: 'Total Wall Surface', value: `${wallArea} sq ft`, subtext: `${perimeter}' perimeter` },
          { label: 'Roll Coverage', value: `${rollCoverageArea.toFixed(1)} sq ft/roll`, subtext: `${rollWidthIn}" × ${rollLengthFt}'` },
          { label: 'Pattern Match Waste', value: patternIn > 0 ? `+${patternIn}" per drop` : 'Zero match (No drop)', subtext: 'Drop repeat' },
        ],
        breakdownTitle: 'Wallpaper Layout Specs',
        breakdownRows: [
          { label: 'Total Wall Strips Needed', value: `${totalStripsNeeded} vertical drops` },
          { label: 'Usable Drops per Roll', value: `${usableStripsPerRoll} drops` },
          { label: 'Total Rolls Required', value: `${rollsNeeded} rolls` },
          { label: 'Extra Reserve Strips', value: `${rollsNeeded * usableStripsPerRoll - totalStripsNeeded} extra drops` },
        ],
        interpretation: `Covering a ${perimeter} ft perimeter room with ${height} ft walls requires ${totalStripsNeeded} strips of wallpaper. Each roll provides ${usableStripsPerRoll} full drops, requiring ${rollsNeeded} rolls total.`,
        formulaExplanation: 'Strips = ⌈(Perimeter × 12) / Roll Width⌉. Drops per Roll = ⌊Roll Length / (Wall Height + Pattern Repeat)⌋. Rolls = ⌈Strips / Drops per Roll⌉.',
        exampleCalculation: '44 ft perimeter with 20.5" rolls = 26 strips. 9 ft height + 21" repeat = 10.75 ft per drop. 33 ft roll yields 3 drops. 26 ÷ 3 = 9 rolls.',
      };
    },
    seo: {
      title: 'Wallpaper Calculator - How Many Wallpaper Rolls Needed',
      metaDescription: 'Free wallpaper roll calculator. Accurately calculate wallpaper rolls factoring in wall perimeter, ceiling height, and pattern repeat drop.',
      keywords: ['wallpaper calculator', 'wallpaper rolls', 'how much wallpaper', 'pattern repeat calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Room Perimeter', description: 'Add the widths of all walls to be wallpapered.' },
      { step: 2, title: 'Enter Wall Height', description: 'Measure from baseboard to crown moulding or ceiling.' },
      { step: 3, title: 'Check Wallpaper Label', description: 'Input roll width, roll length, and pattern repeat match stated on the manufacturer packaging.' },
    ],
  },
];
