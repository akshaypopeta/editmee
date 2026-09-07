import { CalculatorDefinition, CalculatorResult } from '../types';

export const dateCalculators: CalculatorDefinition[] = [
  // 32. Date Difference & Duration Calculator
  {
    id: 'date-difference-calculator',
    name: 'Date Difference & Duration Calculator',
    category: 'calculators',
    subcategory: 'datetime',
    description: 'Calculate exact number of days, weeks, months, years, and working business days between two calendar dates.',
    iconName: 'CalendarRange',
    tags: ['date difference', 'days between dates', 'business days', 'calendar calculator', 'duration'],
    inputs: [
      { id: 'startDate', label: 'Start Date', type: 'date', defaultValue: '2025-01-01' },
      { id: 'endDate', label: 'End Date', type: 'date', defaultValue: '2025-12-31' },
      { id: 'includeEndDay', label: 'Include End Day in Count', type: 'select', defaultValue: 'yes', options: [{ label: 'Yes (Inclusive)', value: 'yes' }, { label: 'No (Exclusive)', value: 'no' }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const startStr = String(inputs.startDate || '2025-01-01');
      const endStr = String(inputs.endDate || '2025-12-31');
      const inclusive = inputs.includeEndDay === 'yes';

      const d1 = new Date(startStr);
      const d2 = new Date(endStr);

      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return {
          success: false,
          error: 'Please enter valid calendar dates.',
          primary: { label: 'Difference', value: 'Invalid' },
          metrics: [],
        };
      }

      const isReversed = d2 < d1;
      const early = isReversed ? d2 : d1;
      const late = isReversed ? d1 : d2;

      // Calculate total calendar days
      const msDiff = Math.abs(late.getTime() - early.getTime());
      let totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
      if (inclusive) totalDays += 1;

      // Working business days (Monday-Friday)
      let businessDays = 0;
      let weekendDays = 0;
      const cur = new Date(early);
      const limit = new Date(late);
      if (!inclusive) {
        limit.setDate(limit.getDate() - 1);
      }

      while (cur <= limit) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendDays++;
        } else {
          businessDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }

      const totalWeeks = (totalDays / 7).toFixed(1);
      const approxMonths = (totalDays / 30.4375).toFixed(1);
      const approxYears = (totalDays / 365.25).toFixed(2);

      return {
        success: true,
        primary: { label: 'Total Calendar Days', value: `${totalDays.toLocaleString()} Days`, unit: `(~${totalWeeks} wks)` },
        metrics: [
          { label: 'Working Business Days', value: `${businessDays.toLocaleString()} Days`, subtext: 'Excluding Saturdays & Sundays', isHighlight: true },
          { label: 'Weekend Days', value: `${weekendDays.toLocaleString()} Days`, subtext: 'Saturdays & Sundays' },
          { label: 'Approximate Months', value: `${approxMonths} Months`, subtext: `${approxYears} years` },
          { label: 'Total Hours', value: `${(totalDays * 24).toLocaleString()} Hours`, subtext: `${(totalDays * 1440).toLocaleString()} mins` },
        ],
        breakdownTitle: 'Duration Breakdown',
        breakdownRows: [
          { label: 'Calendar Days', value: `${totalDays} days` },
          { label: 'Full Weeks', value: `${Math.floor(totalDays / 7)} weeks + ${totalDays % 7} days` },
          { label: 'Business Days (Mon-Fri)', value: `${businessDays} workdays` },
          { label: 'Weekend Days', value: `${weekendDays} weekend days` },
        ],
        interpretation: `Between ${startStr} and ${endStr} there are ${totalDays.toLocaleString()} calendar days, including ${businessDays.toLocaleString()} business workdays.`,
        formulaExplanation: 'Calendar Days = (|End Date - Start Date| in ms) / 86,400,000. Business days count weekdays Monday through Friday.',
        exampleCalculation: 'From Jan 1, 2025 to Dec 31, 2025 inclusive is 365 calendar days and 261 working days.',
      };
    },
    seo: {
      title: 'Date Difference Calculator - Days Between Dates & Business Days',
      metaDescription: 'Calculate the exact number of days, weeks, months, and business working days between two calendar dates.',
      keywords: ['date difference calculator', 'days between dates', 'business day calculator', 'calendar days'],
    },
    howTo: [
      { step: 1, title: 'Pick Start Date', description: 'Select the initial starting calendar date.' },
      { step: 2, title: 'Pick End Date', description: 'Select the target ending date.' },
      { step: 3, title: 'Set Inclusivity', description: 'Choose whether or not to include the final day in the total count.' },
    ],
  },

  // 33. Age Calculator & Milestone Tracker
  {
    id: 'age-calculator',
    name: 'Chronological Age & Birthday Calculator',
    category: 'calculators',
    subcategory: 'datetime',
    description: 'Calculate your exact age in years, months, days, total days lived, day of the week born, and countdown to your next birthday.',
    iconName: 'Cake',
    tags: ['age calculator', 'chronological age', 'birthday calculator', 'how old am i', 'next birthday countdown'],
    inputs: [
      { id: 'birthDate', label: 'Date of Birth', type: 'date', defaultValue: '1995-06-15' },
      { id: 'asOfDate', label: 'Age as of Date (Default Today)', type: 'date', defaultValue: new Date().toISOString().split('T')[0] },
    ],
    calculate: (inputs): CalculatorResult => {
      const dobStr = String(inputs.birthDate || '1995-06-15');
      const asOfStr = String(inputs.asOfDate || new Date().toISOString().split('T')[0]);

      const birth = new Date(dobStr);
      const asOf = new Date(asOfStr);

      if (isNaN(birth.getTime()) || isNaN(asOf.getTime())) {
        return {
          success: false,
          error: 'Please enter valid dates.',
          primary: { label: 'Age', value: 'Invalid' },
          metrics: [],
        };
      }

      if (asOf < birth) {
        return {
          success: false,
          error: 'Date of birth must be prior to the as-of reference date.',
          primary: { label: 'Age', value: 'Not Born Yet' },
          metrics: [],
        };
      }

      let years = asOf.getFullYear() - birth.getFullYear();
      let months = asOf.getMonth() - birth.getMonth();
      let days = asOf.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      const totalDaysLived = Math.floor((asOf.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      const totalHoursLived = totalDaysLived * 24;

      // Next birthday countdown
      let nextBirthdayYear = asOf.getFullYear();
      const thisYearBday = new Date(nextBirthdayYear, birth.getMonth(), birth.getDate());
      if (asOf >= thisYearBday) {
        nextBirthdayYear++;
      }
      const nextBday = new Date(nextBirthdayYear, birth.getMonth(), birth.getDate());
      const daysUntilNextBday = Math.ceil((nextBday.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bornDayOfWeek = daysOfWeek[birth.getDay()];

      return {
        success: true,
        primary: { label: 'Exact Age', value: `${years} Years, ${months} Months, ${days} Days` },
        metrics: [
          { label: 'Next Birthday Countdown', value: `${daysUntilNextBday} Days`, subtext: `Turns ${years + 1}`, isHighlight: true },
          { label: 'Total Days Lived', value: `${totalDaysLived.toLocaleString()} Days`, subtext: `${(totalDaysLived / 7).toFixed(0)} weeks` },
          { label: 'Day of Week Born', value: bornDayOfWeek, subtext: dobStr },
          { label: 'Total Hours Lived', value: `${totalHoursLived.toLocaleString()} Hours`, subtext: `${(totalHoursLived * 60).toLocaleString()} mins` },
        ],
        breakdownTitle: 'Life Span Breakdown',
        breakdownRows: [
          { label: 'Years', value: `${years} years` },
          { label: 'Months', value: `${years * 12 + months} months` },
          { label: 'Weeks', value: `${Math.floor(totalDaysLived / 7)} weeks` },
          { label: 'Days', value: `${totalDaysLived.toLocaleString()} days` },
        ],
        interpretation: `Born on a ${bornDayOfWeek} (${dobStr}), you are ${years} years, ${months} months, and ${days} days old (${totalDaysLived.toLocaleString()} days lived). Your next birthday is in ${daysUntilNextBday} days.`,
        formulaExplanation: 'Calculates elapsed calendar intervals in Gregorian date system, handling leap years and variable month lengths.',
        exampleCalculation: 'Born June 15, 1995: On July 1, 2025, exact age is 30 years, 0 months, 16 days.',
      };
    },
    seo: {
      title: 'Age Calculator - Exact Chronological Age & Birthday Countdown',
      metaDescription: 'Free age calculator. Find your exact age in years, months, days, total days lived, and countdown to your next birthday.',
      keywords: ['age calculator', 'birthday calculator', 'how old am i', 'chronological age'],
    },
    howTo: [
      { step: 1, title: 'Enter Date of Birth', description: 'Input your birth date.' },
      { step: 2, title: 'Specify As-Of Date', description: 'Leave as today or pick any historical or future date.' },
      { step: 3, title: 'View Lifespan Stats', description: 'Review your exact age, total days lived, and countdown to next birthday.' },
    ],
  },

  // 34. Time Duration & Work Hours Calculator
  {
    id: 'time-duration-calculator',
    name: 'Time Duration & Shift Work Hours Calculator',
    category: 'calculators',
    subcategory: 'datetime',
    description: 'Calculate elapsed hours and minutes between clock times, deducting unpaid breaks, and computing gross shift pay.',
    iconName: 'Clock',
    tags: ['time duration', 'work hours calculator', 'timesheet calculator', 'shift pay', 'payroll calculator'],
    inputs: [
      { id: 'startTime', label: 'Shift Start Time', type: 'text', defaultValue: '08:30', placeholder: 'HH:MM (24-hr)' },
      { id: 'endTime', label: 'Shift End Time', type: 'text', defaultValue: '17:00', placeholder: 'HH:MM (24-hr)' },
      { id: 'unpaidBreakMinutes', label: 'Unpaid Lunch / Break', type: 'number', defaultValue: 45, min: 0, max: 240, step: 15, suffix: 'Minutes' },
      { id: 'hourlyWage', label: 'Hourly Wage Rate', type: 'number', defaultValue: 28.5, min: 0, step: 0.5, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const parseTime = (str: string): number => {
        const parts = str.trim().split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
      };

      const startMins = parseTime(String(inputs.startTime || '08:30'));
      const endMins = parseTime(String(inputs.endTime || '17:00'));
      const breakMins = Number(inputs.unpaidBreakMinutes) || 0;
      const wage = Number(inputs.hourlyWage) || 0;

      let elapsedMins = endMins - startMins;
      if (elapsedMins < 0) {
        // Overnight shift passing midnight
        elapsedMins += 24 * 60;
      }

      const netMins = Math.max(0, elapsedMins - breakMins);
      const grossHours = Math.floor(elapsedMins / 60);
      const grossRemMins = elapsedMins % 60;

      const netHours = Math.floor(netMins / 60);
      const netRemMins = netMins % 60;
      const decimalWorkHours = netMins / 60;
      const shiftPay = decimalWorkHours * wage;

      return {
        success: true,
        primary: { label: 'Net Billable Work Hours', value: `${netHours}h ${netRemMins}m`, unit: `(${decimalWorkHours.toFixed(2)} decimal hrs)` },
        metrics: [
          { label: 'Gross Shift Earnings', value: `$${shiftPay.toFixed(2)}`, subtext: `@ $${wage.toFixed(2)}/hr`, isHighlight: true },
          { label: 'Total Elapsed Span', value: `${grossHours}h ${grossRemMins}m`, subtext: 'Clock in to clock out' },
          { label: 'Unpaid Break Deducted', value: `${breakMins} mins`, subtext: 'Meal / rest' },
          { label: 'Overnight Shift', value: endMins < startMins ? 'Yes (Passes Midnight)' : 'No (Same Day)' },
        ],
        breakdownTitle: 'Shift Time Breakdown',
        breakdownRows: [
          { label: 'Total Elapsed Time', value: `${grossHours} hours, ${grossRemMins} minutes` },
          { label: 'Unpaid Meal Break', value: `-${breakMins} minutes` },
          { label: 'Net Paid Hours', value: `${decimalWorkHours.toFixed(2)} hours` },
          { label: 'Total Shift Pay', value: `$${shiftPay.toFixed(2)}` },
        ],
        interpretation: `Working from ${inputs.startTime} to ${inputs.endTime} with a ${breakMins}-minute break yields ${netHours}h ${netRemMins}m of payable work (${decimalWorkHours.toFixed(2)} hours). Gross earnings: $${shiftPay.toFixed(2)}.`,
        formulaExplanation: 'Net Hours = (Clock Out - Clock In - Unpaid Break) / 60. Shift Pay = Net Hours × Hourly Wage.',
        exampleCalculation: '08:30 to 17:00 is 8h 30m. Deducting 45m lunch leaves 7h 45m (7.75 hrs). At $28.50/hr, pay = $220.88.',
      };
    },
    seo: {
      title: 'Work Hours & Time Duration Calculator - Timesheet & Shift Pay',
      metaDescription: 'Free work hours calculator. Calculate elapsed hours between times, deduct unpaid lunch breaks, and calculate total shift earnings.',
      keywords: ['work hours calculator', 'time duration calculator', 'timesheet calculator', 'shift pay calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Start & End Times', description: 'Input shift start and finish times (24-hour HH:MM format).' },
      { step: 2, title: 'Deduct Unpaid Break', description: 'Enter unpaid lunch or meal break duration in minutes.' },
      { step: 3, title: 'Calculate Wages', description: 'Add your hourly rate to compute total gross shift pay.' },
    ],
  },

  // 35. Add / Subtract Days from Date Calculator
  {
    id: 'date-add-subtract-calculator',
    name: 'Add or Subtract Days from Date Calculator',
    category: 'calculators',
    subcategory: 'datetime',
    description: 'Add or subtract days, weeks, months, or business working days from any starting calendar date.',
    iconName: 'CalendarPlus',
    tags: ['add days to date', 'subtract days from date', 'date projection', 'business day calculator', 'deadline calculator'],
    inputs: [
      { id: 'startDate', label: 'Start Date', type: 'date', defaultValue: '2025-06-01' },
      { id: 'operation', label: 'Operation', type: 'select', defaultValue: 'add', options: [{ label: 'Add (+)', value: 'add' }, { label: 'Subtract (-)', value: 'subtract' }] },
      { id: 'unitType', label: 'Time Unit', type: 'select', defaultValue: 'days', options: [
        { label: 'Calendar Days', value: 'days' },
        { label: 'Business Days (Mon-Fri only)', value: 'businessDays' },
        { label: 'Weeks', value: 'weeks' },
        { label: 'Months', value: 'months' },
      ]},
      { id: 'quantity', label: 'Quantity to Add / Subtract', type: 'number', defaultValue: 45, min: 1, max: 5000, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const startStr = String(inputs.startDate || '2025-06-01');
      const op = inputs.operation || 'add';
      const unit = inputs.unitType || 'days';
      const qty = Math.abs(Math.round(Number(inputs.quantity) || 45));

      const dt = new Date(startStr);
      if (isNaN(dt.getTime())) {
        return {
          success: false,
          error: 'Please enter a valid starting calendar date.',
          primary: { label: 'Resulting Date', value: 'Invalid' },
          metrics: [],
        };
      }

      const factor = op === 'add' ? 1 : -1;

      if (unit === 'days') {
        dt.setDate(dt.getDate() + qty * factor);
      } else if (unit === 'weeks') {
        dt.setDate(dt.getDate() + qty * 7 * factor);
      } else if (unit === 'months') {
        dt.setMonth(dt.getMonth() + qty * factor);
      } else if (unit === 'businessDays') {
        let added = 0;
        while (added < qty) {
          dt.setDate(dt.getDate() + 1 * factor);
          const dow = dt.getDay();
          if (dow !== 0 && dow !== 6) {
            added++;
          }
        }
      }

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayName = daysOfWeek[dt.getDay()];
      const targetDateStr = dt.toISOString().split('T')[0];

      return {
        success: true,
        primary: { label: 'Resulting Target Date', value: `${targetDateStr}`, unit: `(${targetDayName})` },
        metrics: [
          { label: 'Day of Week', value: targetDayName, isHighlight: true },
          { label: 'Original Starting Date', value: startStr, subtext: 'Base date' },
          { label: 'Action Applied', value: `${op.toUpperCase()} ${qty} ${unit}`, subtext: 'Projection offset' },
          { label: 'ISO Standard', value: targetDateStr, subtext: 'YYYY-MM-DD' },
        ],
        breakdownTitle: 'Date Projection Profile',
        breakdownRows: [
          { label: 'Start Date', value: startStr },
          { label: `Adjustment (${op})`, value: `${qty} ${unit}` },
          { label: 'Calculated Date', value: `${targetDayName}, ${targetDateStr}` },
        ],
        interpretation: `${op === 'add' ? 'Adding' : 'Subtracting'} ${qty} ${unit} to/from ${startStr} results in ${targetDayName}, ${targetDateStr}.`,
        formulaExplanation: 'Projects calendar boundaries while respecting leap years, month length variations, and business day weekend exclusions.',
        exampleCalculation: 'Adding 45 calendar days to June 1, 2025 gives Wednesday, July 16, 2025.',
      };
    },
    seo: {
      title: 'Date Calculator - Add or Subtract Days, Weeks & Business Days',
      metaDescription: 'Free date calculator. Add or subtract days, weeks, months, or working business days from any calendar date to project deadlines.',
      keywords: ['add days to date', 'subtract days from date', 'business days calculator', 'deadline date calculator'],
    },
    howTo: [
      { step: 1, title: 'Pick Starting Date', description: 'Input your project start or milestone date.' },
      { step: 2, title: 'Select Add or Subtract', description: 'Choose whether you are looking forward into the future or backwards.' },
      { step: 3, title: 'Choose Unit & Quantity', description: 'Select calendar days, business workdays, weeks, or months.' },
    ],
  },
];
