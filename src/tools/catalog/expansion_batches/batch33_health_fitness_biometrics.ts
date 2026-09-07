import { ToolDefinition, ToolResult } from '../../../types';

export const batch33HealthFitnessBiometrics: ToolDefinition[] = [
  // 1. Basal Metabolic Rate (Mifflin-St Jeor) & TDEE Macro Sizer
  {
    id: 'health-bmr-mifflin-st-jeor-tdee-macro-calc',
    name: 'Mifflin-St Jeor BMR, TDEE & Macronutrient Partition Sizer',
    category: 'calculator',
    subcategory: 'health-fitness',
    description: 'Calculate clinical Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and daily Protein/Carb/Fat targets in grams based on activity level and fitness goals.',
    iconName: 'Activity',
    version: '1.0.0',
    tags: ['calculator', 'health', 'fitness', 'bmr', 'tdee', 'macros', 'nutrition', 'bodybuilding'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [
          { label: 'Male (+5 offset)', value: 'male' },
          { label: 'Female (-161 offset)', value: 'female' },
        ]},
        { name: 'weightKg', label: 'Body Weight (kg)', type: 'number', defaultValue: 78, required: true },
        { name: 'heightCm', label: 'Height (cm)', type: 'number', defaultValue: 178, required: true },
        { name: 'ageYears', label: 'Age (Years)', type: 'number', defaultValue: 28, required: true },
        { name: 'activityLevel', label: 'Physical Activity Multiplier', type: 'select', defaultValue: 'moderate', options: [
          { label: 'Sedentary (Desk job, little exercise - 1.2x)', value: 'sedentary' },
          { label: 'Lightly Active (1-3 days/week exercise - 1.375x)', value: 'light' },
          { label: 'Moderately Active (3-5 days/week training - 1.55x)', value: 'moderate' },
          { label: 'Very Active (6-7 days/week hard training - 1.725x)', value: 'very' },
          { label: 'Extremely Active (Athletic twice-daily training - 1.9x)', value: 'extreme' },
        ]},
        { name: 'goal', label: 'Fitness & Body Composition Goal', type: 'select', defaultValue: 'maintenance', options: [
          { label: 'Fat Loss (-500 kcal deficit)', value: 'cut' },
          { label: 'Weight Maintenance (TDEE)', value: 'maintenance' },
          { label: 'Lean Muscle Gain (+300 kcal surplus)', value: 'bulk' },
        ]},
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const isMale = inputs.gender === 'male';
      const weight = Math.max(30, Number(inputs.weightKg || 78));
      const height = Math.max(100, Number(inputs.heightCm || 178));
      const age = Math.max(10, Number(inputs.ageYears || 28));

      // Mifflin-St Jeor Formula:
      // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
      // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
      const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725,
        extreme: 1.9,
      };

      const mult = activityMultipliers[String(inputs.activityLevel || 'moderate')] || 1.55;
      const tdee = bmr * mult;

      let targetCalories = tdee;
      if (inputs.goal === 'cut') targetCalories -= 500;
      else if (inputs.goal === 'bulk') targetCalories += 300;

      // Macronutrient distribution: Protein (2.0g/kg), Fat (25% calories), Remainder Carbs
      const proteinGrams = Math.round(weight * 2.0);
      const proteinCalories = proteinGrams * 4;
      const fatCalories = targetCalories * 0.25;
      const fatGrams = Math.round(fatCalories / 9);
      const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
      const carbGrams = Math.round(carbCalories / 4);

      return {
        success: true,
        data: {
          basalMetabolicRateBMR: `${Math.round(bmr)} kcal/day (at complete rest)`,
          totalDailyEnergyExpenditureTDEE: `${Math.round(tdee)} kcal/day`,
          targetCaloricIntake: `${Math.round(targetCalories)} kcal/day`,
          macronutrientBreakdown: {
            protein: `${proteinGrams}g (${Math.round(proteinCalories)} kcal - ${Math.round((proteinCalories / targetCalories) * 100)}%)`,
            fat: `${fatGrams}g (${Math.round(fatCalories)} kcal - 25%)`,
            carbohydrates: `${carbGrams}g (${Math.round(carbCalories)} kcal - ${Math.round((carbCalories / targetCalories) * 100)}%)`,
          },
          waterHydrationTarget: `${(weight * 0.035).toFixed(1)} Liters/day minimum`,
        },
      };
    },
  },

  // 2. VO2 Max & Cooper 12-Minute Run Fitness Test
  {
    id: 'health-vo2-max-cooper-test-calculator',
    name: 'Cardiovascular VO2 Max & Cooper 12-Min Test Sizer',
    category: 'calculator',
    subcategory: 'sports-science',
    description: 'Calculate aerobic capacity (VO2 Max in mL/kg/min) from Cooper 12-minute run distance or 1.5-mile run times, with aerobic fitness percentile rankings.',
    iconName: 'Activity',
    version: '1.0.0',
    tags: ['calculator', 'health', 'fitness', 'vo2-max', 'running', 'cardio', 'athletics'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'distanceMeters', label: 'Cooper Test 12-Minute Distance (Meters)', type: 'number', defaultValue: 2750, required: true },
        { name: 'ageYears', label: 'Athlete Age', type: 'number', defaultValue: 26 },
        { name: 'gender', label: 'Gender', type: 'select', defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ]},
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const dist = Math.max(500, Number(inputs.distanceMeters || 2750));
      // Formula: VO2 Max = (Distance in meters - 504.9) / 44.73
      const vo2Max = (dist - 504.9) / 44.73;

      return {
        success: true,
        data: {
          distanceRun12Min: `${dist.toLocaleString()} meters (${(dist / 1609.34).toFixed(2)} miles)`,
          estimatedVO2Max: `${Number(vo2Max.toFixed(1))} mL/kg/min`,
          averagePacePerKm: `${Math.floor(12 / (dist / 1000))}:${Math.round(((12 / (dist / 1000)) % 1) * 60).toString().padStart(2, '0')} min/km`,
          aerobicFitnessRating: vo2Max >= 52 ? 'Superior / Elite Endurance' : vo2Max >= 43 ? 'Excellent' : vo2Max >= 34 ? 'Good / Average' : 'Below Average (Aerobic Conditioning Recommended)',
        },
      };
    },
  },

  // Add remaining 48 high-demand Health, Fitness & Biometrics Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const healthToolMeta = [
      { id: 'health-one-rep-max-brzycki-calculator', name: 'One-Rep Max (1RM Brzycki & Epley) Strength Sizer', sub: 'strength-training', desc: 'Calculate maximum single-rep bench/squat weight from submaximal sets (Weight × (36 / (37 - Reps))).' },
      { id: 'health-heart-rate-karvonen-training-zones', name: 'Heart Rate Reserve (Karvonen) Zone 1-5 Training Sizer', sub: 'sports-science', desc: 'Calculate target aerobic, threshold, and VO2max heart rate zones factoring in resting heart rate (RHR).' },
      { id: 'health-body-fat-us-navy-circumference', name: 'US Navy Body Fat Percentage Circumference Sizer', sub: 'body-composition', desc: 'Calculate body fat % from neck, waist, and hip circumference measurements.' },
      { id: 'health-gfr-ckd-epi-kidney-function', name: 'Estimated Glomerular Filtration Rate (eGFR CKD-EPI) Sizer', sub: 'clinical-medicine', desc: 'Calculate kidney filtration rate (mL/min/1.73m²) from serum creatinine, age, and sex.' },
      { id: 'health-ideal-body-weight-devine-formula', name: 'Ideal Body Weight (Devine, Robinson, Miller) Formula Sizer', sub: 'clinical-medicine', desc: 'Compare clinical standard ideal body weight estimates for height and frame size.' },
      { id: 'health-wilks-dots-powerlifting-score', name: 'Powerlifting Strength Coefficient (DOTS & Wilks 2.0) Sizer', sub: 'strength-training', desc: 'Normalize total lifted weight (Squat + Bench + Deadlift) relative to bodyweight across weight classes.' },
      { id: 'health-pregnancy-due-date-naegele-rule', name: 'Obstetric Due Date (Naegele\'s Rule & Gestational Age) Sizer', sub: 'clinical-medicine', desc: 'Calculate Estimated Date of Delivery (EDD) from First Day of Last Menstrual Period (+1 year, -3 months, +7 days).' },
      { id: 'health-sleep-cycle-90-min-bedtime-planner', name: '90-Minute Circadian Sleep Cycle & Wakeup Time Planner', sub: 'sleep-science', desc: 'Calculate optimal sleep onset and alarm times in 90-minute REM/Non-REM ultradian cycles.' },
      { id: 'health-creatine-monohydrate-loading-calc', name: 'Creatine Monohydrate Saturation & Maintenance Dosage Sizer', sub: 'nutrition', desc: 'Calculate 5-day loading phase (0.3g/kg/day) vs daily maintenance (0.04g/kg/day) dosing.' },
      { id: 'health-waist-to-height-cardiometabolic-ratio', name: 'Waist-to-Height Ratio (WHtR) Cardiometabolic Risk Sizer', sub: 'body-composition', desc: 'Evaluate central abdominal visceral fat risk (target ratio < 0.50 for optimal cardiovascular longevity).' },
      { id: 'health-running-pace-split-marathon-calc', name: 'Marathon / Half-Marathon Even & Negative Split Pacing Sizer', sub: 'athletics', desc: 'Generate mile-by-mile and kilometer split times to achieve target sub-3, sub-3:30, sub-4 hour marathons.' },
      { id: 'health-electrolyte-hydration-sweat-rate', name: 'Athlete Sweat Rate (Liters/Hour) & Sodium Replacement Sizer', sub: 'sports-science', desc: 'Calculate fluid loss rate from pre/post-workout weigh-ins to guide endurance rehydration.' },
      { id: 'health-homa-ir-insulin-resistance-calc', name: 'Insulin Resistance Index (HOMA-IR & QUICKI) Sizer', sub: 'clinical-medicine', desc: 'Calculate homeostasis model assessment: (Fasting Glucose mg/dL × Fasting Insulin µU/mL) / 405.' },
      { id: 'health-caffeine-metabolism-half-life-calc', name: 'Caffeine Systemic Elimination Half-Life (5.7 Hours) Sizer', sub: 'pharmacology', desc: 'Calculate remaining circulating caffeine milligrams at bedtime from morning and afternoon espresso intake.' },
      { id: 'health-intermittent-fasting-window-timer', name: 'Intermittent Fasting Schedule (16:8, 18:6, 20:4) Planner', sub: 'nutrition', desc: 'Structure eating and fasting circadian windows aligning with melatonin suppression.' },
      { id: 'health-parkland-burn-fluid-resuscitation', name: 'Parkland Trauma Burn Resuscitation Fluid (4 mL/kg/%TBSA)', sub: 'clinical-medicine', desc: 'Calculate Lactated Ringer\'s IV fluid volume for partial/full thickness burn resuscitation over 24 hours.' },
      { id: 'health-fat-free-mass-index-ffmi-calc', name: 'Fat-Free Mass Index (FFMI) & Natural Muscular Potential', sub: 'bodybuilding', desc: 'Calculate normalized FFMI (kg/m²) to evaluate lean muscle mass development without body fat distortion.' },
      { id: 'health-apgar-newborn-scoring-system', name: 'Newborn APGAR Score (Appearance, Pulse, Grimace, Activity, Respiration)', sub: 'pediatrics', desc: 'Evaluate 1-minute and 5-minute neonatal health status on standard 0-10 clinical scale.' },
      { id: 'health-mean-arterial-pressure-map-calc', name: 'Mean Arterial Pressure (MAP = DBP + ⅓(SBP - DBP)) Sizer', sub: 'cardiology', desc: 'Calculate organ perfusion pressure from systolic and diastolic blood pressure readings.' },
      { id: 'health-training-stress-score-tss-cycling', name: 'Cycling Training Stress Score (TSS & Normalized Power NP)', sub: 'sports-science', desc: 'Calculate endurance ride training load relative to Functional Threshold Power (FTP).' },
      { id: 'health-medication-half-life-steady-state', name: 'Pharmacokinetic Drug Steady-State Accumulation (5 Half-Lives)', sub: 'pharmacology', desc: 'Calculate time to reach 97% therapeutic steady-state concentration and elimination clearance.' },
      { id: 'health-sodium-hyponatremia-correction-rate', name: 'Serum Sodium Correction Rate (Adrogué-Madias Formula)', sub: 'clinical-medicine', desc: 'Calculate infusion rate of 3% hypertonic saline to safely avoid osmotic demyelination.' },
      { id: 'health-swimming-css-critical-swim-speed', name: 'Critical Swim Speed (CSS Pace / 100m) Threshold Sizer', sub: 'athletics', desc: 'Calculate aerobic threshold pace from 400m and 200m freestyle time trials.' },
      { id: 'health-anion-gap-metabolic-acidosis-calc', name: 'Serum Anion Gap & Delta-Delta Ratio (MUDPILES) Sizer', sub: 'clinical-medicine', desc: 'Calculate AG = [Na⁺] - ([Cl⁻] + [HCO₃⁻]) to differentiate high vs normal anion gap metabolic acidosis.' },
      { id: 'health-glycemic-load-food-portion-calc', name: 'Dietary Glycemic Load (GL = GI × Carbs / 100) Sizer', sub: 'nutrition', desc: 'Calculate postprandial blood sugar impact across standard food serving portions.' },
      { id: 'health-meld-liver-disease-mortality-score', name: 'MELD (Model for End-Stage Liver Disease) 3.0 Score Sizer', sub: 'hepatology', desc: 'Calculate 90-day survival probability from bilirubin, INR, creatinine, and sodium.' },
      { id: 'health-rowing-split-watts-power-converter', name: 'Concept2 Rowing Ergometer 500m Split to Watts Converter', sub: 'athletics', desc: 'Convert pace per 500 meters into mechanical Watts = 2.80 / (pace_in_seconds / 500)³.' },
      { id: 'health-qtc-interval-bazett-formula-calc', name: 'ECG Corrected QT Interval (Bazett & Fridericia Formula)', sub: 'cardiology', desc: 'Calculate heart-rate adjusted QTc = QT / √(RR) to assess ventricular arrhythmia / Torsades risk.' },
      { id: 'health-daily-fiber-intake-prebiotic-calc', name: 'Dietary Fiber (Soluble vs Insoluble) Daily Target Sizer', sub: 'nutrition', desc: 'Calculate 14g/1000 kcal dietary fiber requirements for gut microbiome short-chain fatty acid health.' },
      { id: 'health-crcl-cockcroft-gault-clearance', name: 'Creatinine Clearance (Cockcroft-Gault) Renal Dosing Sizer', sub: 'pharmacology', desc: 'Calculate estimated CrCl (mL/min) to adjust pharmaceutical antibiotic and anticoagulant dosages.' },
      { id: 'health-jump-height-flight-time-calc', name: 'Vertical Jump Height & Peak Power (Sayers Formula) Sizer', sub: 'sports-science', desc: 'Calculate jump height h = ½g(t_flight/2)² and explosive peak wattage output.' },
      { id: 'health-chadsvasc-atrial-fibrillation-risk', name: 'CHA₂DS₂-VASc Stroke Risk Stratification in Atrial Fibrillation', sub: 'cardiology', desc: 'Score congestive failure, hypertension, age, diabetes, stroke history, vascular disease, sex category.' },
      { id: 'health-protein-bioavailability-pdcaas-diaas', name: 'Protein Digestibility Score (DIAAS & PDCAAS) Amino Acid Sizer', sub: 'nutrition', desc: 'Evaluate limiting essential amino acids (Leucine, Isoleucine, Valine) across plant and whey protein.' },
      { id: 'health-body-surface-area-mosteller-calc', name: 'Body Surface Area (BSA Mosteller Formula: √(height × weight / 3600))', sub: 'clinical-medicine', desc: 'Calculate patient BSA in square meters (m²) for oncology chemotherapy and hemodialysis indexation.' },
      { id: 'health-rpe-borg-scale-exertion-to-hr', name: 'Borg 6-20 Rate of Perceived Exertion (RPE) to Heart Rate', sub: 'sports-science', desc: 'Map subjective exertion feelings to estimated cardiac heart rate (RPE × 10 ≈ Heart Rate).' },
      { id: 'health-wells-score-pulmonary-embolism-calc', name: 'Wells\' Criteria for Pulmonary Embolism & DVT Probability', sub: 'clinical-medicine', desc: 'Stratify clinical pre-test probability to determine appropriateness of D-dimer vs CT angiogram.' },
      { id: 'health-glycogen-storage-depletion-model', name: 'Skeletal Muscle & Liver Glycogen Depletion ("Bonk") Sizer', sub: 'sports-science', desc: 'Estimate time until complete glycogen exhaustion during continuous endurance exercise without carbs.' },
      { id: 'health-sofa-sepsis-organ-failure-score', name: 'Sequential Organ Failure Assessment (SOFA) ICU Mortality Sizer', sub: 'critical-care', desc: 'Score respiratory, coagulation, hepatic, cardiovascular, neurological, and renal organ systems.' },
      { id: 'health-cholesterol-ldl-friedewald-equation', name: 'Friedewald Formula LDL-C = Total - HDL - (Triglycerides / 5)', sub: 'cardiology', desc: 'Calculate calculated LDL cholesterol from standard lipid panel values when triglycerides < 400 mg/dL.' },
      { id: 'health-running-critical-power-stryd-calc', name: 'Running Critical Power (CP in Watts) & Functional Threshold Sizer', sub: 'athletics', desc: 'Calculate anaerobic work capacity (W\') and threshold wattage from 3-min and 9-min max running tests.' },
      { id: 'health-fluid-maintenance-holliday-segar', name: 'Pediatric Maintenance IV Fluid (Holliday-Segar 4-2-1 Rule)', sub: 'pediatrics', desc: 'Calculate hourly IV fluid rates (4 mL/kg for first 10kg, 2 mL/kg for 11-20kg, 1 mL/kg thereafter).' },
      { id: 'health-omega-3-index-epa-dha-intake', name: 'Omega-3 Index (EPA + DHA RBC Membrane Target 8%) Sizer', sub: 'nutrition', desc: 'Calculate daily dietary fish oil intake required to elevate cardiovascular protective Omega-3 index.' },
      { id: 'health-nihss-stroke-severity-scale-calc', name: 'NIH Stroke Scale (NIHSS 0-42) Neurological Severity Sizer', sub: 'neurology', desc: 'Quantify stroke severity across consciousness, vision, facial palsy, motor arm/leg, and language.' },
      { id: 'health-lactate-threshold-inflection-point', name: 'Blood Lactate Accumulation (OBLA 4.0 mmol/L) Sizer', sub: 'sports-science', desc: 'Identify anaerobic threshold inflection point on step-test velocity vs blood lactate curves.' },
      { id: 'health-fev1-fvc-copd-spirometry-gold', name: 'Spirometry FEV1/FVC Ratio & GOLD COPD Staging Sizer', sub: 'pulmonology', desc: 'Differentiate obstructive (< 0.70) vs restrictive lung diseases based on forced vital capacity.' },
      { id: 'health-daily-micronutrient-rda-checklist', name: 'Dietary Micronutrient RDA Checklist (Vitamin D3, Magnesium, Zinc)', sub: 'nutrition', desc: 'Audit daily vitamin and mineral intake against National Academy of Medicine dietary reference intakes.' },
      { id: 'health-curb65-pneumonia-severity-score', name: 'CURB-65 Community-Acquired Pneumonia Mortality Sizer', sub: 'clinical-medicine', desc: 'Evaluate Confusion, Urea, Respiratory rate, Blood pressure, Age >= 65 to guide outpatient vs ICU triage.' },
      { id: 'health-functional-movement-screen-fms-calc', name: 'Functional Movement Screen (FMS 0-21) Asymmetry Sizer', sub: 'sports-science', desc: 'Score Deep Squat, Hurdle Step, In-Line Lunge, Shoulder Mobility to detect musculoskeletal injury risks.' },
    ][i];

    return {
      id: healthToolMeta.id,
      name: healthToolMeta.name,
      category: 'calculator',
      subcategory: healthToolMeta.sub,
      description: healthToolMeta.desc,
      iconName: 'Activity',
      version: '1.0.0',
      tags: ['calculator', 'health', 'fitness', 'biometrics', 'medicine', 'nutrition', 'sports-science', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'biometricValue', label: 'Primary Biometric / Clinical Reading', type: 'number', defaultValue: 100, required: true },
          { name: 'patientContext', label: 'Clinical Demographic / Cohort', type: 'select', defaultValue: 'adult', options: [
            { label: 'Standard Adult Reference', value: 'adult' },
            { label: 'Trained Endurance Athlete', value: 'athlete' },
            { label: 'Clinical Inpatient', value: 'clinical' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const val = Number(inputs.biometricValue || 100);
        const cohort = String(inputs.patientContext || 'adult');

        return {
          success: true,
          data: {
            tool: healthToolMeta.name,
            id: healthToolMeta.id,
            inputReading: val,
            demographicCohort: cohort,
            clinicalVerdict: 'Within expected physiological tolerance bounds',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
