import { CalculatorDefinition, CalculatorResult } from '../types';

export const healthCalculators: CalculatorDefinition[] = [
  // 26. Body Mass Index (BMI) & Category Calculator
  {
    id: 'bmi-category-calculator',
    name: 'Body Mass Index (BMI) Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate your BMI score, World Health Organization weight classification, and healthy target weight range.',
    iconName: 'Activity',
    tags: ['bmi calculator', 'body mass index', 'weight category', 'healthy weight', 'obesity chart'],
    inputs: [
      { id: 'unitSystem', label: 'Unit System', type: 'select', defaultValue: 'imperial', options: [{ label: 'Imperial (lbs & inches)', value: 'imperial' }, { label: 'Metric (kg & cm)', value: 'metric' }] },
      { id: 'weight', label: 'Weight (lbs or kg)', type: 'number', defaultValue: 165, min: 20, max: 800, step: 1 },
      { id: 'height', label: 'Height (Total inches or cm)', type: 'number', defaultValue: 70, min: 30, max: 280, step: 0.5, helperText: 'e.g. 5 ft 10 in = 70 inches' },
    ],
    calculate: (inputs): CalculatorResult => {
      const isMetric = inputs.unitSystem === 'metric';
      const weight = Number(inputs.weight) || (isMetric ? 75 : 165);
      const height = Number(inputs.height) || (isMetric ? 178 : 70);

      let bmi = 0;
      let minHealthyWeight = 0;
      let maxHealthyWeight = 0;

      if (isMetric) {
        const heightMeters = height / 100;
        bmi = weight / (heightMeters * heightMeters);
        minHealthyWeight = 18.5 * heightMeters * heightMeters;
        maxHealthyWeight = 24.9 * heightMeters * heightMeters;
      } else {
        bmi = (703 * weight) / (height * height);
        minHealthyWeight = (18.5 * height * height) / 703;
        maxHealthyWeight = (24.9 * height * height) / 703;
      }

      let category = 'Normal Weight';
      let badge = 'Healthy';
      if (bmi < 18.5) {
        category = 'Underweight';
        badge = 'Below Standard';
      } else if (bmi < 25.0) {
        category = 'Normal / Healthy Weight';
        badge = 'Normal Range';
      } else if (bmi < 30.0) {
        category = 'Overweight';
        badge = 'Above Standard';
      } else {
        category = 'Obesity Category';
        badge = 'Elevated Risk';
      }

      const unitWeightStr = isMetric ? 'kg' : 'lbs';

      return {
        success: true,
        primary: { label: 'Your BMI Score', value: bmi.toFixed(1), unit: `kg/m² (${category})` },
        metrics: [
          { label: 'WHO Weight Category', value: category, badge, isHighlight: true },
          { label: 'Healthy Weight Range (18.5 - 24.9)', value: `${Math.round(minHealthyWeight)} - ${Math.round(maxHealthyWeight)} ${unitWeightStr}`, subtext: 'Normal BMI benchmark' },
          { label: 'Your Current Weight', value: `${weight} ${unitWeightStr}`, subtext: `Height: ${height} ${isMetric ? 'cm' : 'in'}` },
          { label: 'Prime Metric', value: (bmi / 25).toFixed(2), subtext: 'Ratio to upper normal limit' },
        ],
        breakdownTitle: 'WHO BMI Reference Chart',
        breakdownRows: [
          { label: 'Underweight', value: '< 18.5' },
          { label: 'Normal / Healthy', value: '18.5 – 24.9' },
          { label: 'Overweight', value: '25.0 – 29.9' },
          { label: 'Obese (Class 1+)', value: '≥ 30.0' },
        ],
        interpretation: `Your calculated BMI is ${bmi.toFixed(1)}, placing you in the ${category} category. The standard recommended healthy weight range for your height is ${Math.round(minHealthyWeight)} to ${Math.round(maxHealthyWeight)} ${unitWeightStr}.`,
        formulaExplanation: 'Imperial: BMI = 703 × Weight (lbs) / Height (in)². Metric: BMI = Weight (kg) / Height (m)².',
        exampleCalculation: '165 lbs at 70 inches (5\'10"): 703 × 165 / (70)² = 115,995 / 4900 = 23.7 (Normal weight).',
      };
    },
    seo: {
      title: 'BMI Calculator - Body Mass Index & Weight Classification',
      metaDescription: 'Free online BMI calculator. Calculate your body mass index, ideal healthy weight range, and WHO weight classifications.',
      keywords: ['bmi calculator', 'body mass index', 'ideal weight', 'healthy bmi range'],
    },
    howTo: [
      { step: 1, title: 'Select Units', description: 'Choose between imperial (lbs/inches) or metric (kg/cm).' },
      { step: 2, title: 'Input Measurements', description: 'Enter current body weight and total height.' },
      { step: 3, title: 'Examine Weight Bracket', description: 'View your BMI score, health classification, and healthy target weight bracket.' },
    ],
  },

  // 27. Basal Metabolic Rate (BMR) & TDEE Calculator
  {
    id: 'bmr-tdee-calculator',
    name: 'BMR & Daily Calorie (TDEE) Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor formula.',
    iconName: 'Flame',
    tags: ['bmr calculator', 'tdee calculator', 'daily calories', 'metabolism', 'mifflin st jeor', 'calorie burn'],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'age', label: 'Age', type: 'number', defaultValue: 30, min: 14, max: 100, step: 1, suffix: 'Years' },
      { id: 'weightKg', label: 'Weight', type: 'number', defaultValue: 75, min: 30, max: 300, step: 1, suffix: 'kg' },
      { id: 'heightCm', label: 'Height', type: 'number', defaultValue: 178, min: 100, max: 250, step: 1, suffix: 'cm' },
      { id: 'activityLevel', label: 'Daily Activity Level', type: 'select', defaultValue: 1.375, options: [
        { label: 'Sedentary (Little or no exercise)', value: 1.2 },
        { label: 'Lightly Active (Exercise 1-3 days/week)', value: 1.375 },
        { label: 'Moderately Active (Exercise 3-5 days/week)', value: 1.55 },
        { label: 'Very Active (Intense exercise 6-7 days/week)', value: 1.725 },
        { label: 'Extra Active (Labor job & heavy training)', value: 1.9 },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const isMale = inputs.gender === 'male';
      const age = Number(inputs.age) || 30;
      const weight = Number(inputs.weightKg) || 75;
      const height = Number(inputs.heightCm) || 178;
      const multiplier = Number(inputs.activityLevel) || 1.375;

      // Mifflin-St Jeor Formula
      let bmr = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161);
      const tdee = bmr * multiplier;

      const weightLossCalories = tdee - 500; // ~1 lb / 0.5kg fat loss per week
      const mildLossCalories = tdee - 250;
      const muscleGainCalories = tdee + 300;

      return {
        success: true,
        primary: { label: 'Maintenance Calories (TDEE)', value: `${Math.round(tdee).toLocaleString()}`, unit: 'kcal / day' },
        metrics: [
          { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr).toLocaleString()} kcal`, subtext: 'Calories burned at rest', isHighlight: true },
          { label: 'Fat Loss Target (-500 kcal)', value: `${Math.round(weightLossCalories).toLocaleString()} kcal`, subtext: '~1 lb / 0.5kg fat loss/wk' },
          { label: 'Lean Muscle Bulk (+300 kcal)', value: `${Math.round(muscleGainCalories).toLocaleString()} kcal`, subtext: 'Clean surplus' },
          { label: 'Activity Multiplier', value: `${multiplier}x`, subtext: 'Factor above resting BMR' },
        ],
        breakdownTitle: 'Goal Calorie Targets',
        breakdownRows: [
          { label: 'Basal Metabolism (BMR)', value: `${Math.round(bmr)} kcal/day` },
          { label: 'Maintenance (TDEE)', value: `${Math.round(tdee)} kcal/day` },
          { label: 'Moderate Deficit (-250)', value: `${Math.round(mildLossCalories)} kcal/day` },
          { label: 'Aggressive Fat Loss (-500)', value: `${Math.round(weightLossCalories)} kcal/day` },
          { label: 'Hypertrophy Surplus (+300)', value: `${Math.round(muscleGainCalories)} kcal/day` },
        ],
        interpretation: `Your body burns ${Math.round(bmr)} kcal at rest. With your activity level, your Total Daily Energy Expenditure (TDEE) is ${Math.round(tdee)} kcal/day. Consuming ${Math.round(weightLossCalories)} kcal/day will produce roughly 1 pound of fat loss per week.`,
        formulaExplanation: 'Mifflin-St Jeor: BMR = 10W + 6.25H - 5A + (5 for men, -161 for women). TDEE = BMR × Activity Factor.',
        exampleCalculation: '30yo male, 75kg, 178cm: BMR = 750 + 1112.5 - 150 + 5 = 1,717.5 kcal. Light active (1.375x) = 2,361 kcal/day.',
      };
    },
    seo: {
      title: 'BMR & TDEE Calculator - Daily Caloric Needs & Metabolism',
      metaDescription: 'Free BMR and TDEE calculator using Mifflin-St Jeor formula. Find your maintenance, fat loss, and muscle gain calorie targets.',
      keywords: ['bmr calculator', 'tdee calculator', 'calorie calculator', 'daily calorie burn', 'mifflin st jeor'],
    },
    howTo: [
      { step: 1, title: 'Enter Demographics', description: 'Input biological sex, age, current weight, and height.' },
      { step: 2, title: 'Select Activity Factor', description: 'Choose your weekly exercise schedule.' },
      { step: 3, title: 'Choose Calorie Target', description: 'Compare maintenance calories with fat-loss deficit or muscle-gain surplus tiers.' },
    ],
  },

  // 28. Target Heart Rate & Training Zones Calculator
  {
    id: 'target-heart-rate-calculator',
    name: 'Target Heart Rate & Training Zones Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate your maximum heart rate and 5 cardiovascular training zones (Warm-up, Fat Burn, Aerobic, Anaerobic, VO2 Max).',
    iconName: 'HeartPulse',
    tags: ['target heart rate', 'heart rate zones', 'cardio zones', 'fat burn zone', 'vo2 max', 'karvonen'],
    inputs: [
      { id: 'age', label: 'Age', type: 'number', defaultValue: 35, min: 15, max: 95, step: 1, suffix: 'Years' },
      { id: 'restingHeartRate', label: 'Resting Heart Rate (RHR)', type: 'number', defaultValue: 65, min: 35, max: 120, step: 1, suffix: 'BPM' },
    ],
    calculate: (inputs): CalculatorResult => {
      const age = Number(inputs.age) || 35;
      const rhr = Number(inputs.restingHeartRate) || 65;

      // Gellish Formula for Max HR: 207 - (0.7 * age)
      const maxHr = Math.round(207 - 0.7 * age);
      // Heart Rate Reserve (HRR) for Karvonen formula
      const hrr = maxHr - rhr;

      const zoneCalc = (lowPct: number, highPct: number) => {
        const low = Math.round(rhr + hrr * lowPct);
        const high = Math.round(rhr + hrr * highPct);
        return `${low} – ${high} BPM`;
      };

      const z1 = zoneCalc(0.5, 0.6); // Warm-up / Recovery
      const z2 = zoneCalc(0.6, 0.7); // Fat Burn / Aerobic base
      const z3 = zoneCalc(0.7, 0.8); // Aerobic Endurance
      const z4 = zoneCalc(0.8, 0.9); // Anaerobic Threshold
      const z5 = zoneCalc(0.9, 1.0); // VO2 Max / Neuromuscular

      return {
        success: true,
        primary: { label: 'Aerobic Target Zone (Zone 3)', value: z3 },
        metrics: [
          { label: 'Estimated Max Heart Rate (MHR)', value: `${maxHr} BPM`, subtext: 'Gellish formula', isHighlight: true },
          { label: 'Fat Burning Zone (Zone 2)', value: z2, subtext: '60% – 70% HRR' },
          { label: 'Anaerobic Threshold (Zone 4)', value: z4, subtext: '80% – 90% HRR' },
          { label: 'Resting Heart Rate (RHR)', value: `${rhr} BPM`, subtext: 'Basal pulse' },
        ],
        breakdownTitle: '5-Zone Training Spectrum',
        breakdownRows: [
          { label: 'Zone 1: Active Recovery (50-60%)', value: z1 },
          { label: 'Zone 2: Fat Burn / Base (60-70%)', value: z2 },
          { label: 'Zone 3: Aerobic Cardio (70-80%)', value: z3 },
          { label: 'Zone 4: Anaerobic Threshold (80-90%)', value: z4 },
          { label: 'Zone 5: VO2 Max Sprints (90-100%)', value: z5 },
        ],
        interpretation: `For a ${age}-year-old with ${rhr} BPM resting pulse, max heart rate is ~${maxHr} BPM. Zone 2 aerobic base training is ${z2}, while high-intensity intervals reach ${z4}.`,
        formulaExplanation: 'Karvonen Method: Target HR = Resting HR + (HR Reserve × Intensity %), where HR Reserve = Max HR - Resting HR.',
        exampleCalculation: 'Age 35 (Max HR = 182 BPM), RHR = 65. HRR = 117. 60% = 65 + (117 × 0.6) = 135 BPM.',
      };
    },
    seo: {
      title: 'Target Heart Rate Calculator - 5 Heart Rate Training Zones',
      metaDescription: 'Calculate your maximum heart rate and target cardio training zones using the Karvonen formula and resting pulse.',
      keywords: ['target heart rate calculator', 'heart rate training zones', 'fat burn zone', 'cardio zones'],
    },
    howTo: [
      { step: 1, title: 'Enter Age', description: 'Input current age in years.' },
      { step: 2, title: 'Enter Resting Heart Rate', description: 'Measure your resting pulse upon waking in the morning.' },
      { step: 3, title: 'Train in Target Zones', description: 'Match your cardio workouts (Zone 2 long runs vs Zone 4 tempo intervals) to specific BPM ranges.' },
    ],
  },

  // 29. Daily Water Intake Calculator
  {
    id: 'daily-water-intake-calculator',
    name: 'Daily Water Intake & Hydration Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate your recommended daily water consumption based on body weight, climate temperature, and daily exercise duration.',
    iconName: 'Droplets',
    tags: ['water intake calculator', 'hydration calculator', 'daily water needs', 'fluid intake', 'health'],
    inputs: [
      { id: 'bodyWeightLbs', label: 'Body Weight', type: 'number', defaultValue: 160, min: 60, max: 450, step: 1, suffix: 'lbs' },
      { id: 'exerciseMinutes', label: 'Daily Exercise / Workout Time', type: 'number', defaultValue: 45, min: 0, max: 300, step: 15, suffix: 'Minutes' },
      { id: 'climate', label: 'Climate / Environment', type: 'select', defaultValue: 'moderate', options: [
        { label: 'Moderate / Temperate', value: 'moderate' },
        { label: 'Hot / Humid', value: 'hot' },
        { label: 'Cold / Dry', value: 'cold' },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const weightLbs = Number(inputs.bodyWeightLbs) || 160;
      const workoutMins = Number(inputs.exerciseMinutes) || 45;
      const climate = inputs.climate || 'moderate';

      // Base hydration rule: 0.5 oz of water per pound of body weight
      let baseOz = weightLbs * 0.5;

      // Exercise addition: 12 oz for every 30 minutes of exercise
      const exerciseOz = (workoutMins / 30) * 12;

      // Climate adjustment
      let climateOz = 0;
      if (climate === 'hot') climateOz = 16;
      else if (climate === 'cold') climateOz = 4;

      const totalOz = baseOz + exerciseOz + climateOz;
      const totalLiters = totalOz * 0.0295735;
      const totalGlasses = totalOz / 8;

      return {
        success: true,
        primary: { label: 'Recommended Daily Water', value: `${totalLiters.toFixed(2)} Liters`, unit: `(~${Math.round(totalOz)} fl oz)` },
        metrics: [
          { label: 'Standard 8-oz Glasses', value: `${totalGlasses.toFixed(1)} Glasses`, subtext: '8 fl oz each', isHighlight: true },
          { label: 'Base Fluid Requirement', value: `${Math.round(baseOz)} oz`, subtext: '0.5 oz per lb body weight' },
          { label: 'Exercise Hydration Added', value: `+${Math.round(exerciseOz)} oz`, subtext: `${workoutMins} mins physical activity` },
          { label: 'Water Bottles (500ml)', value: `${(totalLiters / 0.5).toFixed(1)} Bottles`, subtext: 'Standard commercial bottles' },
        ],
        breakdownTitle: 'Hydration Intake Breakdown',
        breakdownRows: [
          { label: 'Base Weight Baseline', value: `${Math.round(baseOz)} fl oz` },
          { label: 'Exercise Sweat Replacement', value: `+${Math.round(exerciseOz)} fl oz` },
          ...(climateOz > 0 ? [{ label: 'Climate Environment Addition', value: `+${climateOz} fl oz` }] : []),
          { label: 'Total Daily Goal', value: `${totalLiters.toFixed(2)} L (${Math.round(totalOz)} oz)` },
        ],
        interpretation: `For your weight of ${weightLbs} lbs and ${workoutMins} minutes of daily exercise in a ${climate} environment, aim for ${totalLiters.toFixed(2)} Liters (${Math.round(totalGlasses)} eight-ounce glasses) of fluids daily.`,
        formulaExplanation: 'Water (oz) = (Weight × 0.5) + (Workout Mins / 30 × 12) + Climate Adjustment.',
        exampleCalculation: '160 lbs = 80 oz base + (45 mins = 18 oz exercise) = 98 oz = 2.90 Liters (~12 glasses).',
      };
    },
    seo: {
      title: 'Daily Water Intake Calculator - Hydration by Weight & Exercise',
      metaDescription: 'Free hydration calculator. Find how much water you should drink each day based on weight, workout duration, and climate.',
      keywords: ['water intake calculator', 'hydration calculator', 'how much water to drink', 'daily water needs'],
    },
    howTo: [
      { step: 1, title: 'Enter Body Weight', description: 'Input your current weight in pounds.' },
      { step: 2, title: 'Specify Daily Workout Time', description: 'Enter how many minutes of moderate or intense exercise you perform.' },
      { step: 3, title: 'Select Climate', description: 'Adjust for hot weather or high humidity perspiration.' },
    ],
  },

  // 30. Body Fat Percentage Calculator (US Navy Method)
  {
    id: 'body-fat-percentage-calculator',
    name: 'Body Fat Percentage Calculator (US Navy)',
    category: 'calculators',
    subcategory: 'health',
    description: 'Estimate body fat percentage, lean body mass, and fat mass using the standardized US Navy circumference method.',
    iconName: 'Gauge',
    tags: ['body fat calculator', 'us navy method', 'lean body mass', 'body composition', 'fitness'],
    inputs: [
      { id: 'gender', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weightLbs', label: 'Weight', type: 'number', defaultValue: 175, min: 60, max: 450, step: 1, suffix: 'lbs' },
      { id: 'heightInches', label: 'Height', type: 'number', defaultValue: 70, min: 40, max: 90, step: 0.5, suffix: 'inches' },
      { id: 'neckInches', label: 'Neck Circumference', type: 'number', defaultValue: 15.5, min: 8, max: 30, step: 0.25, suffix: 'inches' },
      { id: 'waistInches', label: 'Waist Circumference (at navel)', type: 'number', defaultValue: 34, min: 15, max: 70, step: 0.25, suffix: 'inches' },
      { id: 'hipInches', label: 'Hip Circumference (Females Only)', type: 'number', defaultValue: 38, min: 15, max: 70, step: 0.25, suffix: 'inches' },
    ],
    calculate: (inputs): CalculatorResult => {
      const isMale = inputs.gender === 'male';
      const weight = Number(inputs.weightLbs) || 175;
      const height = Number(inputs.heightInches) || 70;
      const neck = Number(inputs.neckInches) || 15.5;
      const waist = Number(inputs.waistInches) || 34;
      const hip = Number(inputs.hipInches) || 38;

      let bodyFat = 0;
      if (isMale) {
        const diff = waist - neck;
        if (diff <= 0) {
          return {
            success: false,
            error: 'Waist circumference must exceed neck circumference.',
            primary: { label: 'Body Fat', value: 'Invalid' },
            metrics: [],
          };
        }
        bodyFat = 86.01 * Math.log10(diff) - 70.041 * Math.log10(height) + 36.76;
      } else {
        const diff = waist + hip - neck;
        if (diff <= 0) {
          return {
            success: false,
            error: 'Waist + Hip must exceed neck circumference.',
            primary: { label: 'Body Fat', value: 'Invalid' },
            metrics: [],
          };
        }
        bodyFat = 163.205 * Math.log10(diff) - 97.684 * Math.log10(height) - 78.387;
      }

      bodyFat = Math.max(2, Math.min(60, bodyFat));
      const fatMass = weight * (bodyFat / 100);
      const leanMass = weight - fatMass;

      let category = 'Fitness';
      if (isMale) {
        if (bodyFat < 6) category = 'Essential Fat';
        else if (bodyFat <= 13) category = 'Athletes';
        else if (bodyFat <= 17) category = 'Fitness';
        else if (bodyFat <= 24) category = 'Average';
        else category = 'Obese';
      } else {
        if (bodyFat < 14) category = 'Essential Fat';
        else if (bodyFat <= 20) category = 'Athletes';
        else if (bodyFat <= 24) category = 'Fitness';
        else if (bodyFat <= 31) category = 'Average';
        else category = 'Obese';
      }

      return {
        success: true,
        primary: { label: 'Estimated Body Fat', value: `${bodyFat.toFixed(1)}%`, unit: `(${category})` },
        metrics: [
          { label: 'Lean Body Mass', value: `${leanMass.toFixed(1)} lbs`, subtext: `${(100 - bodyFat).toFixed(1)}% lean muscle & bone`, isHighlight: true },
          { label: 'Fat Mass', value: `${fatMass.toFixed(1)} lbs`, subtext: 'Total adipose tissue' },
          { label: 'Fitness Classification', value: category, subtext: isMale ? 'Male guidelines' : 'Female guidelines' },
          { label: 'Total Weight', value: `${weight} lbs`, subtext: 'Current scale weight' },
        ],
        breakdownTitle: 'Body Composition Analysis',
        breakdownRows: [
          { label: 'Lean Body Mass', value: `${leanMass.toFixed(1)} lbs`, percentage: Math.round(100 - bodyFat) },
          { label: 'Body Fat Mass', value: `${fatMass.toFixed(1)} lbs`, percentage: Math.round(bodyFat) },
        ],
        interpretation: `Your estimated body fat is ${bodyFat.toFixed(1)}% (${category}). Out of ${weight} lbs, you carry ${leanMass.toFixed(1)} lbs of lean mass and ${fatMass.toFixed(1)} lbs of body fat.`,
        formulaExplanation: 'US Navy Body Fat Formula using logarithmic ratios of waist, neck, and height circumferences.',
        exampleCalculation: 'Male 175 lbs, 70" height, 34" waist, 15.5" neck = ~16.8% body fat (Fitness category).',
      };
    },
    seo: {
      title: 'Body Fat Calculator - US Navy Circumference Method',
      metaDescription: 'Free body fat percentage calculator using the US Navy tape measure method. Measure lean mass vs fat mass accurately.',
      keywords: ['body fat calculator', 'us navy body fat', 'body composition', 'lean body mass calculator'],
    },
    howTo: [
      { step: 1, title: 'Select Sex & Weight', description: 'Input sex, weight, and height.' },
      { step: 2, title: 'Take Circumference Measurements', description: 'Measure neck at narrowest point and waist at naval horizontally.' },
      { step: 3, title: 'Read Body Composition', description: 'View body fat percentage, lean muscle mass, and fat mass.' },
    ],
  },

  // 31. Macronutrient Split Calculator
  {
    id: 'macro-split-calculator',
    name: 'Macronutrient Split (Protein/Carb/Fat) Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate daily gram targets and calorie splits for Protein, Carbohydrates, and Fats according to your fitness goal.',
    iconName: 'Apple',
    tags: ['macro calculator', 'macronutrient split', 'protein carbs fat', 'iifym', 'keto', 'cutting diet'],
    inputs: [
      { id: 'targetCalories', label: 'Daily Calorie Goal', type: 'number', defaultValue: 2200, min: 1000, max: 7000, step: 50, suffix: 'kcal' },
      { id: 'dietStyle', label: 'Dietary Macro Ratio', type: 'select', defaultValue: 'balanced', options: [
        { label: 'Balanced (30% Protein / 40% Carbs / 30% Fat)', value: 'balanced' },
        { label: 'High Protein / Cutting (40% Protein / 35% Carbs / 25% Fat)', value: 'highProtein' },
        { label: 'Low-Carb / High Fat (30% Protein / 20% Carbs / 50% Fat)', value: 'lowCarb' },
        { label: 'Ketogenic (25% Protein / 5% Carbs / 70% Fat)', value: 'keto' },
        { label: 'Endurance Athlete (20% Protein / 55% Carbs / 25% Fat)', value: 'endurance' },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const calories = Number(inputs.targetCalories) || 2200;
      const style = inputs.dietStyle || 'balanced';

      let pPct = 0.3;
      let cPct = 0.4;
      let fPct = 0.3;

      if (style === 'highProtein') {
        pPct = 0.4;
        cPct = 0.35;
        fPct = 0.25;
      } else if (style === 'lowCarb') {
        pPct = 0.3;
        cPct = 0.2;
        fPct = 0.5;
      } else if (style === 'keto') {
        pPct = 0.25;
        cPct = 0.05;
        fPct = 0.7;
      } else if (style === 'endurance') {
        pPct = 0.2;
        cPct = 0.55;
        fPct = 0.25;
      }

      // Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
      const proteinCalories = calories * pPct;
      const carbCalories = calories * cPct;
      const fatCalories = calories * fPct;

      const proteinGrams = proteinCalories / 4;
      const carbGrams = carbCalories / 4;
      const fatGrams = fatCalories / 9;

      return {
        success: true,
        primary: { label: 'Daily Protein Target', value: `${Math.round(proteinGrams)}g Protein`, unit: `(${Math.round(pPct * 100)}%)` },
        metrics: [
          { label: 'Daily Carbohydrates', value: `${Math.round(carbGrams)}g Carbs`, subtext: `${Math.round(cPct * 100)}% of calories`, isHighlight: true },
          { label: 'Daily Dietary Fats', value: `${Math.round(fatGrams)}g Fats`, subtext: `${Math.round(fPct * 100)}% of calories` },
          { label: 'Total Calorie Budget', value: `${calories.toLocaleString()} kcal`, subtext: 'Target daily intake' },
          { label: 'Macro Ratio (P/C/F)', value: `${Math.round(pPct * 100)} / ${Math.round(cPct * 100)} / ${Math.round(fPct * 100)}`, subtext: 'Percentage split' },
        ],
        breakdownTitle: 'Macronutrient Energy Distribution',
        breakdownRows: [
          { label: `Protein (${Math.round(proteinGrams)}g)`, value: `${Math.round(proteinCalories)} kcal`, percentage: Math.round(pPct * 100) },
          { label: `Carbohydrates (${Math.round(carbGrams)}g)`, value: `${Math.round(carbCalories)} kcal`, percentage: Math.round(cPct * 100) },
          { label: `Dietary Fats (${Math.round(fatGrams)}g)`, value: `${Math.round(fatCalories)} kcal`, percentage: Math.round(fPct * 100) },
        ],
        interpretation: `For a ${calories} kcal diet, consume ${Math.round(proteinGrams)}g of protein, ${Math.round(carbGrams)}g of carbs, and ${Math.round(fatGrams)}g of fats each day.`,
        formulaExplanation: 'Protein (g) = (kcal × %P) / 4. Carbs (g) = (kcal × %C) / 4. Fat (g) = (kcal × %F) / 9.',
        exampleCalculation: '2,200 kcal balanced (30/40/30) = 165g protein (660 kcal), 220g carbs (880 kcal), 73g fat (660 kcal).',
      };
    },
    seo: {
      title: 'Macro Calculator - Daily Protein, Carb & Fat Grams',
      metaDescription: 'Free macronutrient calculator. Convert daily calories into precise grams of protein, carbohydrates, and healthy fats for your fitness goal.',
      keywords: ['macro calculator', 'iifym calculator', 'protein intake calculator', 'carb calculator', 'keto macros'],
    },
    howTo: [
      { step: 1, title: 'Enter Target Calories', description: 'Provide your daily energy intake goal (from your TDEE calculation).' },
      { step: 2, title: 'Select Diet Protocol', description: 'Choose balanced, high protein for cutting, low-carb, keto, or endurance.' },
      { step: 3, title: 'Track in Grams', description: 'Use the resulting gram targets in your nutrition or meal tracking log.' },
    ],
  },
];
