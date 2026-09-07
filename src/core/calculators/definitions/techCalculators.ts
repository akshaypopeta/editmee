import { CalculatorDefinition, CalculatorResult } from '../types';

export const techCalculators: CalculatorDefinition[] = [
  // 41. Bandwidth & Data File Transfer Time Calculator
  {
    id: 'bandwidth-transfer-time-calculator',
    name: 'Bandwidth & File Download Time Calculator',
    category: 'calculators',
    subcategory: 'technology',
    description: 'Calculate how long it takes to download or upload a file given file size and internet connection bandwidth.',
    iconName: 'DownloadCloud',
    tags: ['download time calculator', 'bandwidth calculator', 'file transfer speed', 'internet speed', 'upload time'],
    inputs: [
      { id: 'fileSize', label: 'File Size', type: 'number', defaultValue: 25, min: 0.1, step: 1 },
      { id: 'fileUnit', label: 'File Unit', type: 'select', defaultValue: 'GB', options: [{ label: 'Megabytes (MB)', value: 'MB' }, { label: 'Gigabytes (GB)', value: 'GB' }, { label: 'Terabytes (TB)', value: 'TB' }] },
      { id: 'networkSpeed', label: 'Internet Connection Speed', type: 'number', defaultValue: 100, min: 0.1, step: 10 },
      { id: 'speedUnit', label: 'Speed Unit', type: 'select', defaultValue: 'Mbps', options: [{ label: 'Megabits per second (Mbps)', value: 'Mbps' }, { label: 'Gigabits per second (Gbps)', value: 'Gbps' }, { label: 'Megabytes per second (MB/s)', value: 'MBps' }] },
      { id: 'networkEfficiency', label: 'Real-World Network Overhead', type: 'select', defaultValue: 0.9, options: [{ label: '100% (Theoretical Maximum)', value: 1.0 }, { label: '90% (Normal Wi-Fi / Cable)', value: 0.9 }, { label: '75% (Congested / Cellular)', value: 0.75 }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const sizeVal = Number(inputs.fileSize) || 25;
      const fileUnit = inputs.fileUnit || 'GB';
      const speedVal = Number(inputs.networkSpeed) || 100;
      const speedUnit = inputs.speedUnit || 'Mbps';
      const efficiency = Number(inputs.networkEfficiency) || 0.9;

      // Convert file size to Bytes
      let sizeInBytes = 0;
      if (fileUnit === 'MB') sizeInBytes = sizeVal * 1e6;
      else if (fileUnit === 'GB') sizeInBytes = sizeVal * 1e9;
      else if (fileUnit === 'TB') sizeInBytes = sizeVal * 1e12;

      // Convert speed to Bytes per second
      let speedBytesPerSec = 0;
      if (speedUnit === 'Mbps') speedBytesPerSec = (speedVal * 1e6) / 8;
      else if (speedUnit === 'Gbps') speedBytesPerSec = (speedVal * 1e9) / 8;
      else if (speedUnit === 'MBps') speedBytesPerSec = speedVal * 1e6;

      const effectiveSpeed = speedBytesPerSec * efficiency;
      const seconds = sizeInBytes / Math.max(1, effectiveSpeed);

      const d = Math.floor(seconds / (24 * 3600));
      const h = Math.floor((seconds % (24 * 3600)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);

      let formattedTime = '';
      if (d > 0) formattedTime = `${d}d ${h}h ${m}m ${s}s`;
      else if (h > 0) formattedTime = `${h}h ${m}m ${s}s`;
      else if (m > 0) formattedTime = `${m}m ${s}s`;
      else formattedTime = `${s} seconds`;

      const effectiveMBps = (effectiveSpeed / 1e6).toFixed(2);

      return {
        success: true,
        primary: { label: 'Estimated Transfer Time', value: formattedTime },
        metrics: [
          { label: 'Effective Transfer Speed', value: `${effectiveMBps} MB/s`, subtext: `${Math.round(efficiency * 100)}% protocol efficiency`, isHighlight: true },
          { label: 'Total File Size', value: `${sizeVal} ${fileUnit}`, subtext: `${(sizeInBytes / 1e9).toFixed(2)} GB` },
          { label: 'Total Seconds', value: `${Math.round(seconds).toLocaleString()} s`, subtext: 'Exact duration' },
          { label: 'Connection Bandwidth', value: `${speedVal} ${speedUnit}`, subtext: 'Rated ISP throughput' },
        ],
        breakdownTitle: 'Speed & Time Estimates',
        breakdownRows: [
          { label: 'Theoretical Max Speed', value: `${(speedBytesPerSec / 1e6).toFixed(2)} MB/s` },
          { label: 'Real-World Network Speed', value: `${effectiveMBps} MB/s` },
          { label: 'Full Transfer Duration', value: formattedTime },
        ],
        interpretation: `Downloading a ${sizeVal} ${fileUnit} file at ${speedVal} ${speedUnit} with ${Math.round(efficiency * 100)}% network efficiency takes approximately ${formattedTime}.`,
        formulaExplanation: 'Transfer Time = (File Size in Bits) / (Bandwidth in Bits per Second × Network Efficiency).',
        exampleCalculation: '25 GB file over 100 Mbps connection: 25,000 MB ÷ (12.5 MB/s × 0.9 = 11.25 MB/s) = 2,222 seconds ≈ 37 minutes.',
      };
    },
    seo: {
      title: 'File Download Time Calculator - Bandwidth & Speed Estimator',
      metaDescription: 'Calculate file download and upload times based on file size (MB, GB, TB) and internet speed (Mbps, Gbps).',
      keywords: ['download time calculator', 'file transfer speed', 'bandwidth calculator', 'how long to download'],
    },
    howTo: [
      { step: 1, title: 'Enter File Size', description: 'Input total file or game installation size in MB, GB, or TB.' },
      { step: 2, title: 'Enter Internet Speed', description: 'Input your ISP download or upload speed test result.' },
      { step: 3, title: 'Check Duration', description: 'View elapsed hours, minutes, and real-world MB/s throughput.' },
    ],
  },

  // 42. Ohm's Law & Electrical Power Calculator
  {
    id: 'ohms-law-calculator',
    name: "Ohm's Law & Electrical Power Calculator",
    category: 'calculators',
    subcategory: 'technology',
    description: 'Solve Voltage (V), Current (I), Resistance (R), and Power (P) in DC or single-phase AC electrical circuits.',
    iconName: 'Zap',
    tags: ['ohms law calculator', 'voltage current resistance', 'electrical power', 'watts calculator', 'circuit analysis', 'engineering'],
    inputs: [
      { id: 'given1Type', label: 'First Known Value', type: 'select', defaultValue: 'V', options: [{ label: 'Voltage (V in Volts)', value: 'V' }, { label: 'Current (I in Amperes)', value: 'I' }, { label: 'Resistance (R in Ohms)', value: 'R' }, { label: 'Power (P in Watts)', value: 'P' }] },
      { id: 'given1Val', label: 'First Value', type: 'number', defaultValue: 120, min: 0.001, step: 1 },
      { id: 'given2Type', label: 'Second Known Value', type: 'select', defaultValue: 'R', options: [{ label: 'Voltage (V in Volts)', value: 'V' }, { label: 'Current (I in Amperes)', value: 'I' }, { label: 'Resistance (R in Ohms)', value: 'R' }, { label: 'Power (P in Watts)', value: 'P' }] },
      { id: 'given2Val', label: 'Second Value', type: 'number', defaultValue: 24, min: 0.001, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const g1 = inputs.given1Type || 'V';
      const v1 = Number(inputs.given1Val) || 120;
      const g2 = inputs.given2Type || 'R';
      const v2 = Number(inputs.given2Val) || 24;

      if (g1 === g2) {
        return {
          success: false,
          error: 'Please choose two different electrical parameters.',
          primary: { label: 'Values', value: 'Invalid Inputs' },
          metrics: [],
        };
      }

      let V = 0;
      let I = 0;
      let R = 0;
      let P = 0;

      const pairs: Record<string, number> = { [g1]: v1, [g2]: v2 };

      if ('V' in pairs && 'I' in pairs) {
        V = pairs['V']!;
        I = pairs['I']!;
        R = V / I;
        P = V * I;
      } else if ('V' in pairs && 'R' in pairs) {
        V = pairs['V']!;
        R = pairs['R']!;
        I = V / R;
        P = (V * V) / R;
      } else if ('V' in pairs && 'P' in pairs) {
        V = pairs['V']!;
        P = pairs['P']!;
        I = P / V;
        R = (V * V) / P;
      } else if ('I' in pairs && 'R' in pairs) {
        I = pairs['I']!;
        R = pairs['R']!;
        V = I * R;
        P = I * I * R;
      } else if ('I' in pairs && 'P' in pairs) {
        I = pairs['I']!;
        P = pairs['P']!;
        V = P / I;
        R = P / (I * I);
      } else if ('R' in pairs && 'P' in pairs) {
        R = pairs['R']!;
        P = pairs['P']!;
        V = Math.sqrt(P * R);
        I = Math.sqrt(P / R);
      }

      return {
        success: true,
        primary: { label: 'Electrical Power (P)', value: `${P.toFixed(2)} Watts`, unit: `(${ (P / 1000).toFixed(3) } kW)` },
        metrics: [
          { label: 'Voltage (V)', value: `${V.toFixed(2)} V`, subtext: 'Potential difference', isHighlight: true },
          { label: 'Current (I)', value: `${I.toFixed(2)} A`, subtext: 'Electric current flow' },
          { label: 'Resistance (R)', value: `${R.toFixed(2)} Ω`, subtext: 'Ohmic load' },
          { label: 'Energy per Hour', value: `${(P / 1000).toFixed(3)} kWh`, subtext: 'One hour consumption' },
        ],
        breakdownTitle: 'Complete Circuit State',
        breakdownRows: [
          { label: 'Voltage (Potential)', value: `${V.toFixed(4)} Volts (V)` },
          { label: 'Current (Amperage)', value: `${I.toFixed(4)} Amperes (A)` },
          { label: 'Resistance (Impedance)', value: `${R.toFixed(4)} Ohms (Ω)` },
          { label: 'Power (Wattage)', value: `${P.toFixed(4)} Watts (W)` },
        ],
        interpretation: `With ${V.toFixed(1)}V across a ${R.toFixed(1)}Ω load, the circuit draws ${I.toFixed(2)} Amps of current and consumes ${P.toFixed(1)} Watts of electrical power.`,
        formulaExplanation: 'V = I × R, P = V × I, P = I² × R, P = V² / R.',
        exampleCalculation: '120 Volts across 24 Ohms resistance: Current = 120 / 24 = 5 Amps. Power = 120 × 5 = 600 Watts.',
      };
    },
    seo: {
      title: "Ohm's Law Calculator - Voltage, Current, Resistance & Power (Watts)",
      metaDescription: "Free Ohm's Law calculator. Solve for voltage (V), current (I), resistance (R), and power (P) in watts for any circuit.",
      keywords: ['ohms law calculator', 'voltage calculator', 'watts calculator', 'current resistance calculator'],
    },
    howTo: [
      { step: 1, title: 'Choose Two Known Variables', description: 'Select any two: Voltage (V), Current (I), Resistance (R), or Power (P).' },
      { step: 2, title: 'Input Their Values', description: 'Enter the known electrical quantities.' },
      { step: 3, title: 'View Complete Circuit Solution', description: 'Instantly get the other two unknown variables and energy consumption.' },
    ],
  },

  // 43. Aspect Ratio & Screen Dimension Calculator
  {
    id: 'aspect-ratio-calculator',
    name: 'Aspect Ratio & Screen Dimension Calculator',
    category: 'calculators',
    subcategory: 'technology',
    description: 'Calculate proportional image and video display dimensions, aspect ratios (16:9, 4:3, 21:9), total pixels, and screen diagonal.',
    iconName: 'Tv',
    tags: ['aspect ratio calculator', 'screen resolution', '16:9', '4:3', 'display dimensions', 'pixels'],
    inputs: [
      { id: 'originalWidth', label: 'Known Width (px or inches)', type: 'number', defaultValue: 1920, min: 1, step: 1 },
      { id: 'originalHeight', label: 'Known Height (px or inches)', type: 'number', defaultValue: 1080, min: 1, step: 1 },
      { id: 'targetWidth', label: 'New Target Width (to solve Height)', type: 'number', defaultValue: 3840, min: 1, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const w = Number(inputs.originalWidth) || 1920;
      const h = Number(inputs.originalHeight) || 1080;
      const targetW = Number(inputs.targetWidth) || 3840;

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(Math.round(w), Math.round(h));
      const ratioW = Math.round(w / divisor);
      const ratioH = Math.round(h / divisor);

      const targetH = Math.round((targetW * h) / w);
      const decimalRatio = w / h;
      const totalPixelsOrig = w * h;
      const totalPixelsTarget = targetW * targetH;

      // Common named ratio detection
      let commonName = `${ratioW}:${ratioH}`;
      if (Math.abs(decimalRatio - 16 / 9) < 0.01) commonName = '16:9 (Standard Widescreen)';
      else if (Math.abs(decimalRatio - 4 / 3) < 0.01) commonName = '4:3 (Classic TV)';
      else if (Math.abs(decimalRatio - 21 / 9) < 0.05) commonName = '21:9 (Ultrawide Cinema)';
      else if (Math.abs(decimalRatio - 1) < 0.01) commonName = '1:1 (Square)';
      else if (Math.abs(decimalRatio - 9 / 16) < 0.01) commonName = '9:16 (Vertical Story/Reel)';

      return {
        success: true,
        primary: { label: 'Scaled Dimensions', value: `${targetW} × ${targetH}`, unit: 'px' },
        metrics: [
          { label: 'Aspect Ratio', value: `${ratioW}:${ratioH}`, subtext: commonName, isHighlight: true },
          { label: 'Decimal Ratio', value: `${decimalRatio.toFixed(3)}:1`, subtext: 'Width to height factor' },
          { label: 'Original Resolution', value: `${w} × ${h}`, subtext: `${(totalPixelsOrig / 1e6).toFixed(1)} Megapixels` },
          { label: 'Scaled Resolution', value: `${targetW} × ${targetH}`, subtext: `${(totalPixelsTarget / 1e6).toFixed(1)} Megapixels` },
        ],
        breakdownTitle: 'Resolution Standards',
        breakdownRows: [
          { label: 'Standard Ratio', value: commonName },
          { label: 'Normalized Aspect', value: `${decimalRatio.toFixed(4)} : 1` },
          { label: 'Scaled Pixel Area', value: `${(totalPixelsTarget / 1e6).toFixed(2)} MP (${totalPixelsTarget.toLocaleString()} pixels)` },
        ],
        interpretation: `An image of ${w}×${h} has a ${ratioW}:${ratioH} aspect ratio (${decimalRatio.toFixed(2)}:1). Scaled to a width of ${targetW}, the height is exactly ${targetH}.`,
        formulaExplanation: 'New Height = (New Width × Original Height) / Original Width. Aspect Ratio = (Width / GCD) : (Height / GCD).',
        exampleCalculation: '1920×1080 (16:9) scaled to 3840 width gives 3840 × 2160 (4K UHD).',
      };
    },
    seo: {
      title: 'Aspect Ratio Calculator - Image, Video & Screen Resizing',
      metaDescription: 'Free aspect ratio calculator. Resize images and video dimensions proportionally while maintaining 16:9, 4:3, 21:9, and custom ratios.',
      keywords: ['aspect ratio calculator', 'image resize calculator', '16:9 ratio calculator', 'screen resolution calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Original Dimensions', description: 'Input the original width and height in pixels or inches.' },
      { step: 2, title: 'Enter New Width', description: 'Input your desired new width.' },
      { step: 3, title: 'Get Proportional Height', description: 'View the exact scaled height without image distortion or letterboxing.' },
    ],
  },

  // 44. Digital Storage & Capacity Converter Calculator
  {
    id: 'digital-storage-calculator',
    name: 'Digital Storage & Capacity Converter',
    category: 'calculators',
    subcategory: 'technology',
    description: 'Convert between Bytes, KB, MB, GB, TB, PB and calculate true usable operating system hard drive capacity (Decimal vs Binary GiB).',
    iconName: 'HardDrive',
    tags: ['digital storage calculator', 'gb to mb', 'tb to gb', 'binary to decimal', 'hard drive capacity', 'gib to gb'],
    inputs: [
      { id: 'storageValue', label: 'Storage Value', type: 'number', defaultValue: 1, min: 0.001, step: 0.5 },
      { id: 'storageUnit', label: 'Unit', type: 'select', defaultValue: 'TB', options: [{ label: 'Gigabytes (GB)', value: 'GB' }, { label: 'Terabytes (TB)', value: 'TB' }, { label: 'Megabytes (MB)', value: 'MB' }, { label: 'Petabytes (PB)', value: 'PB' }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const val = Number(inputs.storageValue) || 1;
      const unit = inputs.storageUnit || 'TB';

      // Decimal base (1000)
      let bytesDecimal = 0;
      if (unit === 'MB') bytesDecimal = val * Math.pow(10, 6);
      else if (unit === 'GB') bytesDecimal = val * Math.pow(10, 9);
      else if (unit === 'TB') bytesDecimal = val * Math.pow(10, 12);
      else if (unit === 'PB') bytesDecimal = val * Math.pow(10, 15);

      // Usable OS capacity in binary (1024)
      const gibBinary = bytesDecimal / Math.pow(1024, 3);
      const tibBinary = bytesDecimal / Math.pow(1024, 4);

      const mbDecimal = bytesDecimal / Math.pow(10, 6);
      const gbDecimal = bytesDecimal / Math.pow(10, 9);
      const tbDecimal = bytesDecimal / Math.pow(10, 12);

      const usableWindowsPct = ((gibBinary / (gbDecimal || 1)) * 100).toFixed(1);

      return {
        success: true,
        primary: { label: 'Usable Windows OS Capacity', value: tibBinary >= 1 ? `${tibBinary.toFixed(2)} TiB` : `${gibBinary.toFixed(2)} GiB`, unit: `(~${usableWindowsPct}% of advertised)` },
        metrics: [
          { label: 'Decimal Gigabytes (GB)', value: `${gbDecimal.toLocaleString()} GB`, subtext: 'Advertised manufacturer storage', isHighlight: true },
          { label: 'Decimal Terabytes (TB)', value: `${tbDecimal.toFixed(3)} TB`, subtext: 'Base-10 standard' },
          { label: 'Total Bytes', value: `${bytesDecimal.toExponential(3)} Bytes`, subtext: 'Raw byte count' },
          { label: 'OS Formatting Discrepancy', value: `-${(100 - parseFloat(usableWindowsPct)).toFixed(1)}%`, subtext: '1000 vs 1024 binary deficit' },
        ],
        breakdownTitle: 'Storage Unit Equivalencies',
        breakdownRows: [
          { label: 'Megabytes (MB)', value: `${mbDecimal.toLocaleString()} MB` },
          { label: 'Gigabytes (GB)', value: `${gbDecimal.toLocaleString()} GB` },
          { label: 'Terabytes (TB)', value: `${tbDecimal.toFixed(3)} TB` },
          { label: 'Binary Gibibytes (GiB)', value: `${gibBinary.toFixed(2)} GiB` },
          { label: 'Binary Tebibytes (TiB)', value: `${tibBinary.toFixed(3)} TiB` },
        ],
        interpretation: `A manufacturer-advertised ${val} ${unit} drive contains ${bytesDecimal.toLocaleString()} bytes. Windows displays this as ${gibBinary.toFixed(1)} GiB (${tibBinary.toFixed(2)} TiB) because operating systems count in base-2 (1024) rather than base-10 (1000).`,
        formulaExplanation: 'Decimal: 1 GB = 10⁹ bytes. Binary: 1 GiB = 2³⁰ (1,073,741,824) bytes. Usable GiB = Bytes / 1024³.',
        exampleCalculation: '1 TB advertised = 1,000,000,000,000 bytes ÷ 1024⁴ = 0.909 TiB (931.32 GiB usable in Windows).',
      };
    },
    seo: {
      title: 'Digital Storage Converter - GB to TB & Usable Hard Drive Capacity',
      metaDescription: 'Free digital storage calculator. Convert MB, GB, TB and see why your hard drive has less usable capacity in Windows (Binary GiB vs Decimal GB).',
      keywords: ['storage calculator', 'gb to tb converter', 'hard drive capacity calculator', 'usable hard drive space'],
    },
    howTo: [
      { step: 1, title: 'Enter Storage Number', description: 'Input the drive capacity or file size.' },
      { step: 2, title: 'Select Unit', description: 'Choose GB, TB, or MB.' },
      { step: 3, title: 'Compare Operating System Readout', description: 'Inspect the difference between manufacturer decimal packaging and Windows binary storage.' },
    ],
  },

  // 45. Server Uptime & SLA Downtime Calculator
  {
    id: 'uptime-sla-calculator',
    name: 'Server Uptime & SLA Downtime Calculator',
    category: 'calculators',
    subcategory: 'technology',
    description: 'Calculate allowed service downtime per year, month, week, and day for any Service Level Agreement (SLA) percentage.',
    iconName: 'Server',
    tags: ['uptime calculator', 'sla calculator', 'downtime calculator', 'high availability', 'devops', 'nine nines'],
    inputs: [
      { id: 'slaPercent', label: 'SLA Availability Target', type: 'select', defaultValue: 99.9, options: [
        { label: '99% ("Two Nines")', value: 99.0 },
        { label: '99.5%', value: 99.5 },
        { label: '99.9% ("Three Nines" - Cloud Standard)', value: 99.9 },
        { label: '99.95% (High Availability)', value: 99.95 },
        { label: '99.99% ("Four Nines")', value: 99.99 },
        { label: '99.999% ("Five Nines" - Carrier Grade)', value: 99.999 },
      ]},
    ],
    calculate: (inputs): CalculatorResult => {
      const sla = Number(inputs.slaPercent) || 99.9;
      const downtimeRatio = (100 - sla) / 100;

      const formatDuration = (totalSeconds: number): string => {
        if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} seconds`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.round(totalSeconds % 60);
        if (mins < 60) return `${mins}m ${secs}s`;
        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;
        if (hours < 24) return `${hours}h ${remMins}m ${secs}s`;
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        return `${days}d ${remHours}h ${remMins}m`;
      };

      const yearSecs = 365.25 * 24 * 3600;
      const monthSecs = (yearSecs / 12);
      const weekSecs = 7 * 24 * 3600;
      const daySecs = 24 * 3600;

      const downYear = formatDuration(yearSecs * downtimeRatio);
      const downMonth = formatDuration(monthSecs * downtimeRatio);
      const downWeek = formatDuration(weekSecs * downtimeRatio);
      const downDay = formatDuration(daySecs * downtimeRatio);

      return {
        success: true,
        primary: { label: 'Allowed Downtime per Year', value: downYear, unit: `at ${sla}% SLA` },
        metrics: [
          { label: 'Monthly Downtime Limit', value: downMonth, subtext: 'Per 30.4 days', isHighlight: true },
          { label: 'Weekly Downtime Limit', value: downWeek, subtext: 'Per 7 days' },
          { label: 'Daily Downtime Limit', value: downDay, subtext: 'Per 24 hours' },
          { label: 'Availability Ratio', value: `${sla}%`, subtext: `${(100 - sla).toFixed(3)}% max downtime` },
        ],
        breakdownTitle: 'SLA Downtime Tolerances',
        breakdownRows: [
          { label: 'Daily Allowance (24 hrs)', value: downDay },
          { label: 'Weekly Allowance (7 days)', value: downWeek },
          { label: 'Monthly Allowance (30 days)', value: downMonth },
          { label: 'Annual Allowance (365 days)', value: downYear },
        ],
        interpretation: `An SLA of ${sla}% permits a maximum of ${downYear} of total outage per year (${downMonth} per month). Exceeding this breaches vendor contractual guarantees.`,
        formulaExplanation: 'Downtime = Time Interval × (1 - SLA / 100).',
        exampleCalculation: 'At 99.9% uptime (Three Nines): Allowed downtime is 8h 45m per year, or 43m 49s per month.',
      };
    },
    seo: {
      title: 'Uptime & SLA Calculator - Downtime per Year, Month & Day',
      metaDescription: 'Calculate allowed SLA downtime per day, week, month, and year for 99%, 99.9%, 99.99%, and 99.999% cloud availability targets.',
      keywords: ['uptime calculator', 'sla downtime calculator', 'nine nines uptime', 'high availability calculator'],
    },
    howTo: [
      { step: 1, title: 'Select SLA Tier', description: 'Choose your target uptime percentage (e.g. 99.9% or 99.99%).' },
      { step: 2, title: 'Review Time Tolerances', description: 'See how many hours or minutes of downtime are permitted before violating SLA.' },
    ],
  },
];
