import { CalculatorDefinition, CalculatorResult } from '../types';

export const everydayCalculators: CalculatorDefinition[] = [
  // 46. Restaurant Tip & Bill Split Calculator
  {
    id: 'tip-bill-split-calculator',
    name: 'Restaurant Tip & Bill Split Calculator',
    category: 'calculators',
    subcategory: 'everyday',
    description: 'Calculate restaurant tip amounts, total bill, and split evenly among dinner guests with optional round-up.',
    iconName: 'Utensils',
    tags: ['tip calculator', 'split bill', 'restaurant tip', 'bill divider', 'gratuity calculator'],
    inputs: [
      { id: 'billAmount', label: 'Bill Subtotal', type: 'number', defaultValue: 85.5, min: 0.01, step: 0.5, prefix: '$' },
      { id: 'tipPercent', label: 'Tip Percentage', type: 'select', defaultValue: 18, options: [
        { label: '15% (Standard Service)', value: 15 },
        { label: '18% (Good Service - Popular)', value: 18 },
        { label: '20% (Great Service)', value: 20 },
        { label: '25% (Exceptional Service)', value: 25 },
        { label: '10% (Basic / Buffet)', value: 10 },
      ]},
      { id: 'splitCount', label: 'Split Among (People)', type: 'number', defaultValue: 3, min: 1, max: 50, step: 1 },
      { id: 'roundUp', label: 'Round Total Up to Nearest Dollar', type: 'select', defaultValue: 'no', options: [{ label: 'No (Exact Cents)', value: 'no' }, { label: 'Yes (Round Up)', value: 'yes' }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const bill = Number(inputs.billAmount) || 85.5;
      const tipPct = (Number(inputs.tipPercent) || 18) / 100;
      const people = Math.max(1, Math.round(Number(inputs.splitCount) || 1));
      const shouldRound = inputs.roundUp === 'yes';

      let tipAmount = bill * tipPct;
      let totalBill = bill + tipAmount;

      if (shouldRound) {
        totalBill = Math.ceil(totalBill);
        tipAmount = totalBill - bill;
      }

      const perPersonTotal = totalBill / people;
      const perPersonTip = tipAmount / people;
      const perPersonBase = bill / people;

      return {
        success: true,
        primary: { label: 'Amount per Person', value: `$${perPersonTotal.toFixed(2)}`, unit: `(for ${people} ${people === 1 ? 'person' : 'people'})` },
        metrics: [
          { label: 'Total Tip', value: `$${tipAmount.toFixed(2)}`, subtext: `${((tipAmount / bill) * 100).toFixed(1)}% tip rate`, isHighlight: true },
          { label: 'Total Bill with Tip', value: `$${totalBill.toFixed(2)}`, subtext: 'Full restaurant charge' },
          { label: 'Tip per Person', value: `$${perPersonTip.toFixed(2)}`, subtext: 'Gratuity share' },
          { label: 'Base Bill per Person', value: `$${perPersonBase.toFixed(2)}`, subtext: 'Food & drinks share' },
        ],
        breakdownTitle: 'Guest Payment Breakdown',
        breakdownRows: [
          { label: 'Subtotal (Food & Drinks)', value: `$${bill.toFixed(2)}` },
          { label: 'Gratuity Added', value: `+$${tipAmount.toFixed(2)}` },
          { label: 'Grand Total', value: `$${totalBill.toFixed(2)}` },
          { label: `Each Guest Pays (${people} ways)`, value: `$${perPersonTotal.toFixed(2)}` },
        ],
        interpretation: `For a $${bill.toFixed(2)} check with an ${(tipPct * 100)}% tip ($${tipAmount.toFixed(2)}), the grand total is $${totalBill.toFixed(2)}. Split evenly between ${people} people, each person pays $${perPersonTotal.toFixed(2)}.`,
        formulaExplanation: 'Tip = Subtotal × Tip %. Total = Subtotal + Tip. Per Person = Total / Number of People.',
        exampleCalculation: '$85.50 bill with 18% tip ($15.39) = $100.89 total. Split 3 ways = $33.63 each.',
      };
    },
    seo: {
      title: 'Tip Calculator - Restaurant Bill Splitter & Gratuity',
      metaDescription: 'Free restaurant tip and bill split calculator. Calculate tip amounts, divide checks evenly among friends, and round totals.',
      keywords: ['tip calculator', 'bill split calculator', 'restaurant gratuity calculator', 'divide check'],
    },
    howTo: [
      { step: 1, title: 'Enter Bill Subtotal', description: 'Input total receipt amount before tip.' },
      { step: 2, title: 'Select Tip Percentage', description: 'Choose 15%, 18%, 20%, or 25% based on service quality.' },
      { step: 3, title: 'Split Bill', description: 'Enter number of guests to see each person\'s exact fair share.' },
    ],
  },

  // 47. Gas Mileage & Fuel Cost Calculator
  {
    id: 'fuel-cost-mileage-calculator',
    name: 'Gas Mileage & Trip Fuel Cost Calculator',
    category: 'calculators',
    subcategory: 'everyday',
    description: 'Calculate fuel needed for a road trip, total gas cost, cost per mile, and miles per gallon (MPG).',
    iconName: 'Fuel',
    tags: ['fuel cost calculator', 'gas calculator', 'road trip cost', 'mpg calculator', 'fuel economy', 'cost per mile'],
    inputs: [
      { id: 'distance', label: 'Trip Distance', type: 'number', defaultValue: 350, min: 1, step: 10, suffix: 'Miles' },
      { id: 'fuelEconomy', label: 'Vehicle Fuel Economy (MPG)', type: 'number', defaultValue: 28, min: 5, max: 120, step: 1, suffix: 'MPG' },
      { id: 'fuelPrice', label: 'Gas Price per Gallon', type: 'number', defaultValue: 3.65, min: 0.5, step: 0.05, prefix: '$' },
      { id: 'passengers', label: 'Split Fuel with Passengers', type: 'number', defaultValue: 1, min: 1, max: 10, step: 1, suffix: 'People' },
    ],
    calculate: (inputs): CalculatorResult => {
      const dist = Number(inputs.distance) || 350;
      const mpg = Number(inputs.fuelEconomy) || 28;
      const price = Number(inputs.fuelPrice) || 3.65;
      const passengers = Math.max(1, Math.round(Number(inputs.passengers) || 1));

      const gallons = dist / mpg;
      const totalCost = gallons * price;
      const costPerMile = totalCost / dist;
      const costPerPerson = totalCost / passengers;
      const liters = gallons * 3.78541;

      return {
        success: true,
        primary: { label: 'Estimated Trip Fuel Cost', value: `$${totalCost.toFixed(2)}`, unit: passengers > 1 ? `($${costPerPerson.toFixed(2)} / person)` : '' },
        metrics: [
          { label: 'Gallons of Gas Needed', value: `${gallons.toFixed(1)} Gallons`, subtext: `${liters.toFixed(1)} Liters`, isHighlight: true },
          { label: 'Cost per Mile', value: `$${costPerMile.toFixed(3)} / mile`, subtext: `${dist} miles total` },
          { label: 'Vehicle Efficiency', value: `${mpg} MPG`, subtext: `${(235.214 / mpg).toFixed(1)} L/100km` },
          { label: 'Cost per Person', value: `$${costPerPerson.toFixed(2)}`, subtext: `Split ${passengers} ways` },
        ],
        breakdownTitle: 'Trip Fuel Summary',
        breakdownRows: [
          { label: 'Total Distance', value: `${dist} miles` },
          { label: 'Fuel Volume Consumed', value: `${gallons.toFixed(2)} gallons` },
          { label: 'Fuel Price', value: `$${price.toFixed(2)} / gallon` },
          { label: 'Total Fuel Expense', value: `$${totalCost.toFixed(2)}` },
        ],
        interpretation: `Driving ${dist} miles at ${mpg} MPG requires ${gallons.toFixed(1)} gallons of gas. At $${price.toFixed(2)}/gal, the trip costs $${totalCost.toFixed(2)} ($${costPerMile.toFixed(2)} per mile).`,
        formulaExplanation: 'Gallons = Distance / MPG. Total Cost = Gallons × Price per Gallon. Cost per Mile = Total Cost / Distance.',
        exampleCalculation: '350 miles ÷ 28 MPG = 12.5 gallons. 12.5 gal × $3.65 = $45.63 total trip cost.',
      };
    },
    seo: {
      title: 'Gas Mileage & Fuel Cost Calculator - Road Trip Travel Budget',
      metaDescription: 'Free gas calculator for road trips. Calculate fuel gallons, total fuel cost, and cost per mile based on your car MPG.',
      keywords: ['fuel cost calculator', 'gas calculator for trip', 'road trip gas budget', 'mpg cost calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Trip Distance', description: 'Input planned one-way or round-trip mileage.' },
      { step: 2, title: 'Enter Vehicle MPG', description: 'Input your car average highway or combined miles per gallon.' },
      { step: 3, title: 'Input Current Gas Price', description: 'Enter local price per gallon at the pump.' },
    ],
  },

  // 48. Cooking & Recipe Measurement Converter
  {
    id: 'recipe-converter-calculator',
    name: 'Recipe Portion & Ingredient Scaler',
    category: 'calculators',
    subcategory: 'everyday',
    description: 'Scale cooking and baking recipe ingredients proportionally when changing serving sizes from original yield.',
    iconName: 'CookingPot',
    tags: ['recipe converter', 'scale recipe', 'cooking converter', 'recipe portion calculator', 'baking measurements'],
    inputs: [
      { id: 'originalYield', label: 'Original Recipe Servings', type: 'number', defaultValue: 4, min: 1, step: 1 },
      { id: 'targetYield', label: 'Target Desired Servings', type: 'number', defaultValue: 10, min: 1, step: 1 },
      { id: 'ingredientQty', label: 'Ingredient Quantity', type: 'number', defaultValue: 2.5, min: 0.05, step: 0.25 },
      { id: 'ingredientUnit', label: 'Ingredient Unit', type: 'select', defaultValue: 'cups', options: [
        { label: 'Cups', value: 'cups' },
        { label: 'Tablespoons (tbsp)', value: 'tbsp' },
        { label: 'Teaspoons (tsp)', value: 'tsp' },
        { label: 'Grams (g)', value: 'grams' },
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Pounds (lbs)', value: 'lbs' },
        { label: 'Milliliters (ml)', value: 'ml' },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const origServings = Number(inputs.originalYield) || 4;
      const targetServings = Number(inputs.targetYield) || 10;
      const qty = Number(inputs.ingredientQty) || 2.5;
      const unit = inputs.ingredientUnit || 'cups';

      const scaleFactor = targetServings / origServings;
      const scaledQty = qty * scaleFactor;

      // Fraction formatting for baking (cups/spoons)
      const toFraction = (val: number): string => {
        const whole = Math.floor(val);
        const rem = val - whole;
        if (rem < 0.1) return `${whole}`;
        if (Math.abs(rem - 0.25) < 0.06) return whole > 0 ? `${whole} ¼` : '¼';
        if (Math.abs(rem - 0.33) < 0.06) return whole > 0 ? `${whole} ⅓` : '⅓';
        if (Math.abs(rem - 0.5) < 0.06) return whole > 0 ? `${whole} ½` : '½';
        if (Math.abs(rem - 0.66) < 0.06) return whole > 0 ? `${whole} ⅔` : '⅔';
        if (Math.abs(rem - 0.75) < 0.06) return whole > 0 ? `${whole} ¾` : '¾';
        return val.toFixed(2);
      };

      const fractionDisplay = ['cups', 'tbsp', 'tsp'].includes(unit) ? toFraction(scaledQty) : scaledQty.toFixed(2);

      return {
        success: true,
        primary: { label: 'Scaled Ingredient Quantity', value: `${fractionDisplay} ${unit}`, unit: `(${scaleFactor.toFixed(2)}x scale)` },
        metrics: [
          { label: 'Scaling Multiplier', value: `${scaleFactor.toFixed(2)}x`, subtext: `${origServings} → ${targetServings} servings`, isHighlight: true },
          { label: 'Original Ingredient', value: `${qty} ${unit}`, subtext: `For ${origServings} servings` },
          { label: 'Target Servings', value: `${targetServings} Servings`, subtext: 'Target batch size' },
          { label: 'Precise Decimal', value: scaledQty.toFixed(3), subtext: unit },
        ],
        breakdownTitle: 'Portion Conversion Guide',
        breakdownRows: [
          { label: 'Base Multiplier Factor', value: `${targetServings} ÷ ${origServings} = ${scaleFactor.toFixed(3)}` },
          { label: 'Original Ingredient Amount', value: `${qty} ${unit}` },
          { label: 'Scaled Amount', value: `${fractionDisplay} ${unit} (${scaledQty.toFixed(2)})` },
        ],
        interpretation: `Scaling from ${origServings} to ${targetServings} servings multiplies all ingredients by ${scaleFactor.toFixed(2)}x. Use ${fractionDisplay} ${unit} of this ingredient.`,
        formulaExplanation: 'Scaled Amount = Original Amount × (Target Servings / Original Servings).',
        exampleCalculation: 'Scaling 4 servings to 10 servings: Multiplier = 2.5x. 2.5 cups × 2.5 = 6 ¼ cups (6.25).',
      };
    },
    seo: {
      title: 'Recipe Converter & Ingredient Scaler - Adjust Serving Sizes',
      metaDescription: 'Free recipe scaler calculator. Scale cooking and baking recipes up or down to any number of servings with friendly fractions.',
      keywords: ['recipe converter', 'scale recipe calculator', 'cooking portion calculator', 'double recipe calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Original Servings', description: 'Input how many servings the original recipe yields.' },
      { step: 2, title: 'Enter Desired Servings', description: 'Input how many people you plan to feed.' },
      { step: 3, title: 'Enter Ingredient Measure', description: 'Input the ingredient quantity to get the exact scaled cooking portion.' },
    ],
  },

  // 49. Electricity Cost & Appliance Energy Consumption Calculator
  {
    id: 'appliance-energy-cost-calculator',
    name: 'Electricity Cost & Appliance Energy Calculator',
    category: 'calculators',
    subcategory: 'everyday',
    description: 'Calculate daily, monthly, and annual electrical utility costs for home appliances (AC, heaters, computers, fridges).',
    iconName: 'Power',
    tags: ['electricity cost calculator', 'power consumption', 'kwh cost', 'appliance energy', 'electric bill'],
    inputs: [
      { id: 'applianceWatts', label: 'Appliance Power Rating (Watts)', type: 'number', defaultValue: 1500, min: 1, max: 15000, step: 50, suffix: 'Watts', helperText: 'e.g. Space heater 1500W, TV 100W, PC 400W' },
      { id: 'hoursPerDay', label: 'Hours Used per Day', type: 'number', defaultValue: 5, min: 0.1, max: 24, step: 0.5, suffix: 'Hours/Day' },
      { id: 'costPerKwhCents', label: 'Electricity Rate (Cents per kWh)', type: 'number', defaultValue: 16.5, min: 1, max: 80, step: 0.5, suffix: '¢ / kWh', helperText: 'US average is ~16.5¢/kWh' },
    ],
    calculate: (inputs): CalculatorResult => {
      const watts = Number(inputs.applianceWatts) || 1500;
      const hours = Number(inputs.hoursPerDay) || 5;
      const centsPerKwh = Number(inputs.costPerKwhCents) || 16.5;
      const rateDollars = centsPerKwh / 100;

      const dailyKwh = (watts * hours) / 1000;
      const monthlyKwh = dailyKwh * 30.416;
      const annualKwh = dailyKwh * 365.25;

      const dailyCost = dailyKwh * rateDollars;
      const monthlyCost = monthlyKwh * rateDollars;
      const annualCost = annualKwh * rateDollars;

      return {
        success: true,
        primary: { label: 'Estimated Monthly Cost', value: `$${monthlyCost.toFixed(2)}`, unit: '/month' },
        metrics: [
          { label: 'Annual Energy Cost', value: `$${annualCost.toFixed(2)} / yr`, subtext: `${Math.round(annualKwh)} kWh/year`, isHighlight: true },
          { label: 'Daily Energy Cost', value: `$${dailyCost.toFixed(2)} / day`, subtext: `${dailyKwh.toFixed(1)} kWh/day` },
          { label: 'Daily Electricity Used', value: `${dailyKwh.toFixed(2)} kWh`, subtext: `${watts}W × ${hours}h` },
          { label: 'Utility Rate', value: `${centsPerKwh.toFixed(1)}¢ / kWh`, subtext: `$${rateDollars.toFixed(3)}/kWh` },
        ],
        breakdownTitle: 'Timeframe Cost Projection',
        breakdownRows: [
          { label: 'Daily (24 hrs)', value: `$${dailyCost.toFixed(2)} (${dailyKwh.toFixed(2)} kWh)` },
          { label: 'Weekly (7 days)', value: `$${(dailyCost * 7).toFixed(2)} (${(dailyKwh * 7).toFixed(2)} kWh)` },
          { label: 'Monthly (~30 days)', value: `$${monthlyCost.toFixed(2)} (${Math.round(monthlyKwh)} kWh)` },
          { label: 'Annual (1 year)', value: `$${annualCost.toFixed(2)} (${Math.round(annualKwh)} kWh)` },
        ],
        interpretation: `Running a ${watts}W appliance for ${hours} hours/day at ${centsPerKwh}¢/kWh consumes ${dailyKwh.toFixed(2)} kWh daily, costing $${monthlyCost.toFixed(2)} per month ($${annualCost.toFixed(2)} per year).`,
        formulaExplanation: 'Cost = (Watts × Hours / 1000) × (Rate in Cents / 100).',
        exampleCalculation: '1,500W heater running 5 hrs/day = 7.5 kWh/day. At 16.5¢/kWh: $1.24/day ($37.64/month).',
      };
    },
    seo: {
      title: 'Electricity Cost Calculator - Appliance Energy & Power Usage',
      metaDescription: 'Free electricity cost calculator. Estimate power consumption in kWh and dollar cost to run appliances, heaters, AC, and electronics.',
      keywords: ['electricity cost calculator', 'power consumption calculator', 'kwh cost calculator', 'appliance energy cost'],
    },
    howTo: [
      { step: 1, title: 'Enter Appliance Wattage', description: 'Look up wattage rating on appliance electrical label (e.g. 1500W).' },
      { step: 2, title: 'Set Hours of Daily Use', description: 'Input average number of hours operated per day.' },
      { step: 3, title: 'Input Electricity Rate', description: 'Check your electric bill for your kilowatt-hour (kWh) rate in cents.' },
    ],
  },

  // 50. Unit Price & Best Value Comparator
  {
    id: 'unit-price-comparison-calculator',
    name: 'Unit Price & Best Value Comparison Calculator',
    category: 'calculators',
    subcategory: 'everyday',
    description: 'Compare two packaging options (Package A vs Package B) by cost per ounce, gram, or count to find the true best deal.',
    iconName: 'ShoppingBag',
    tags: ['unit price calculator', 'compare prices', 'best value calculator', 'cost per ounce', 'grocery savings'],
    inputs: [
      { id: 'itemAPrice', label: 'Item A: Price', type: 'number', defaultValue: 4.99, min: 0.01, step: 0.5, prefix: '$' },
      { id: 'itemAQuantity', label: 'Item A: Quantity / Volume', type: 'number', defaultValue: 16, min: 0.1, step: 1 },
      { id: 'itemBPrice', label: 'Item B: Price', type: 'number', defaultValue: 8.49, min: 0.01, step: 0.5, prefix: '$' },
      { id: 'itemBQuantity', label: 'Item B: Quantity / Volume', type: 'number', defaultValue: 32, min: 0.1, step: 1 },
      { id: 'unitName', label: 'Unit of Measure', type: 'select', defaultValue: 'oz', options: [
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Grams (g)', value: 'g' },
        { label: 'Pounds (lbs)', value: 'lbs' },
        { label: 'Milliliters (ml)', value: 'ml' },
        { label: 'Count / Pieces', value: 'count' },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const pA = Number(inputs.itemAPrice) || 4.99;
      const qA = Number(inputs.itemAQuantity) || 16;
      const pB = Number(inputs.itemBPrice) || 8.49;
      const qB = Number(inputs.itemBQuantity) || 32;
      const unit = inputs.unitName || 'oz';

      const unitPriceA = pA / Math.max(0.001, qA);
      const unitPriceB = pB / Math.max(0.001, qB);

      const diff = Math.abs(unitPriceA - unitPriceB);
      let bestItem = '';
      let savingsPct = 0;

      if (unitPriceA < unitPriceB) {
        bestItem = 'Item A is the Better Value';
        savingsPct = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
      } else if (unitPriceB < unitPriceA) {
        bestItem = 'Item B is the Better Value';
        savingsPct = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
      } else {
        bestItem = 'Both Items are Identical Value';
        savingsPct = 0;
      }

      return {
        success: true,
        primary: { label: 'Best Value Deal', value: bestItem, unit: savingsPct > 0 ? `(${savingsPct.toFixed(1)}% cheaper)` : '' },
        metrics: [
          { label: 'Item A Unit Price', value: `$${unitPriceA.toFixed(3)} / ${unit}`, subtext: `$${pA.toFixed(2)} for ${qA} ${unit}` },
          { label: 'Item B Unit Price', value: `$${unitPriceB.toFixed(3)} / ${unit}`, subtext: `$${pB.toFixed(2)} for ${qB} ${unit}` },
          { label: 'Unit Price Difference', value: `$${diff.toFixed(3)} / ${unit}`, subtext: `${savingsPct.toFixed(1)}% price gap`, isHighlight: true },
          { label: 'Recommended Choice', value: unitPriceA <= unitPriceB ? 'Buy Package A' : 'Buy Package B', badge: 'Save Money' },
        ],
        breakdownTitle: 'Price Comparison Head-to-Head',
        breakdownRows: [
          { label: 'Package A', value: `$${unitPriceA.toFixed(4)} per ${unit}` },
          { label: 'Package B', value: `$${unitPriceB.toFixed(4)} per ${unit}` },
          { label: 'Difference per Unit', value: `$${diff.toFixed(4)} per ${unit}` },
          { label: 'Relative Savings', value: `${savingsPct.toFixed(1)}% lower cost` },
        ],
        interpretation: `Item A costs $${unitPriceA.toFixed(3)} per ${unit}, while Item B costs $${unitPriceB.toFixed(3)} per ${unit}. ${bestItem}, offering a ${savingsPct.toFixed(1)}% savings per unit.`,
        formulaExplanation: 'Unit Price = Total Price / Quantity. Savings % = (|Price A - Price B| / Higher Unit Price) × 100.',
        exampleCalculation: '16 oz for $4.99 ($0.312/oz) vs 32 oz for $8.49 ($0.265/oz): Item B is 15.1% cheaper per ounce.',
      };
    },
    seo: {
      title: 'Unit Price Comparison Calculator - Best Value Grocery Shopper',
      metaDescription: 'Free unit price calculator. Compare cost per ounce, gram, or count between two package sizes to instantly find the better shopping deal.',
      keywords: ['unit price calculator', 'compare unit prices', 'best value calculator', 'cost per ounce calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Item A Specs', description: 'Input price and net weight or quantity for the first option.' },
      { step: 2, title: 'Enter Item B Specs', description: 'Input price and quantity for the second size or brand.' },
      { step: 3, title: 'Select Measurement Unit', description: 'Pick ounces, grams, pounds, or unit count to identify the cheapest unit price.' },
    ],
  },
];
