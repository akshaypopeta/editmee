import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Clock,
  Globe,
  Calendar,
  ArrowRightLeft,
  Sun,
  Moon,
  Copy,
  Download,
  Check,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

interface TimezoneOption {
  city: string;
  country: string;
  tz: string;
  offset: number; // in hours from UTC
  flag: string;
}

const POPULAR_TIMEZONES: TimezoneOption[] = [
  { city: 'New York (EDT/EST)', country: 'USA', tz: 'America/New_York', offset: -4, flag: '🇺🇸' },
  { city: 'San Francisco (PDT/PST)', country: 'USA', tz: 'America/Los_Angeles', offset: -7, flag: '🇺🇸' },
  { city: 'Chicago (CDT/CST)', country: 'USA', tz: 'America/Chicago', offset: -5, flag: '🇺🇸' },
  { city: 'London (BST/GMT)', country: 'UK', tz: 'Europe/London', offset: 1, flag: '🇬🇧' },
  { city: 'Paris / Berlin (CEST)', country: 'Europe', tz: 'Europe/Paris', offset: 2, flag: '🇪🇺' },
  { city: 'Dubai (GST)', country: 'UAE', tz: 'Asia/Dubai', offset: 4, flag: '🇦🇪' },
  { city: 'Mumbai / Delhi (IST)', country: 'India', tz: 'Asia/Kolkata', offset: 5.5, flag: '🇮🇳' },
  { city: 'Singapore (SGT)', country: 'Singapore', tz: 'Asia/Singapore', offset: 8, flag: '🇸🇬' },
  { city: 'Tokyo (JST)', country: 'Japan', tz: 'Asia/Tokyo', offset: 9, flag: '🇯🇵' },
  { city: 'Sydney (AEST)', country: 'Australia', tz: 'Australia/Sydney', offset: 10, flag: '🇦🇺' },
  { city: 'Auckland (NZST)', country: 'New Zealand', tz: 'Pacific/Auckland', offset: 12, flag: '🇳🇿' },
  { city: 'UTC / GMT (Universal)', country: 'Global', tz: 'UTC', offset: 0, flag: '🌐' },
];

export const DateTimeZoneArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Mode identification
  const mode = useMemo<'timezone' | 'datediff' | 'age' | 'timestamp' | 'duration'>(() => {
    if (name.includes('timezone') || name.includes('time zone') || name.includes('world clock') || toolId.includes('timezone') || toolId.includes('time-zone')) {
      return 'timezone';
    }
    if (name.includes('age') || toolId.includes('age')) {
      return 'age';
    }
    if (name.includes('timestamp') || name.includes('epoch') || toolId.includes('timestamp')) {
      return 'timestamp';
    }
    if (name.includes('work') || name.includes('duration') || name.includes('hours') || toolId.includes('work') || toolId.includes('duration')) {
      return 'duration';
    }
    return 'datediff';
  }, [toolId, name]);

  // 1. Timezone state
  const [sourceTzIdx, setSourceTzIdx] = useState<number>(0); // New York
  const [targetTzIdx, setTargetTzIdx] = useState<number>(3); // London
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  // 2. Date diff state
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(false);

  // 3. Age state
  const [birthDate, setBirthDate] = useState<string>('1995-06-15');
  const [targetAgeDate, setTargetAgeDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // 4. Timestamp state
  const [timestampInput, setTimestampInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());

  // 5. Work duration state
  const [workStartTime, setWorkStartTime] = useState<string>('09:00');
  const [workEndTime, setWorkEndTime] = useState<string>('17:30');
  const [breakMinutes, setBreakMinutes] = useState<number>(30);
  const [hourlyWage, setHourlyWage] = useState<number>(35);

  const [copied, setCopied] = useState(false);

  // TIMEZONE CALCULATIONS
  const timezoneResults = useMemo(() => {
    const src = POPULAR_TIMEZONES[sourceTzIdx] || POPULAR_TIMEZONES[0];
    const tgt = POPULAR_TIMEZONES[targetTzIdx] || POPULAR_TIMEZONES[3];

    const diffHours = tgt.offset - src.offset;
    const [hStr, mStr] = selectedTime.split(':');
    const sourceHour = parseInt(hStr || '0', 10);
    const sourceMin = parseInt(mStr || '0', 10);

    const sourceTotalMin = sourceHour * 60 + sourceMin;
    let targetTotalMin = sourceTotalMin + diffHours * 60;

    let dayShift = 0;
    if (targetTotalMin < 0) {
      targetTotalMin += 24 * 60;
      dayShift = -1;
    } else if (targetTotalMin >= 24 * 60) {
      targetTotalMin -= 24 * 60;
      dayShift = 1;
    }

    const targetHour = Math.floor(targetTotalMin / 60);
    const targetMinute = targetTotalMin % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const targetTimeFormatted = `${pad(targetHour)}:${pad(targetMinute)}`;

    // Convert 24h to 12h AM/PM
    const format12h = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${pad(m)} ${period}`;
    };

    // Calculate business overlap (9:00 to 17:00 in both zones)
    const overlapHours: { hourSource: number; hourTarget: number; isWorkingBoth: boolean }[] = [];
    for (let h = 0; h < 24; h++) {
      const tgtH = (h + diffHours + 24) % 24;
      const isSrcWork = h >= 9 && h <= 17;
      const isTgtWork = tgtH >= 9 && tgtH <= 17;
      overlapHours.push({
        hourSource: h,
        hourTarget: tgtH,
        isWorkingBoth: isSrcWork && isTgtWork,
      });
    }

    const overlapCount = overlapHours.filter((x) => x.isWorkingBoth).length;

    return {
      src,
      tgt,
      diffHours,
      sourceTime12: format12h(sourceHour, sourceMin),
      targetTime12: format12h(targetHour, targetMinute),
      targetTimeFormatted,
      dayShiftText: dayShift === 1 ? '(Next Day +1)' : dayShift === -1 ? '(Previous Day -1)' : '(Same Day)',
      diffText: diffHours === 0 ? 'Same Time' : diffHours > 0 ? `${diffHours} hours ahead of ${src.city.split(' ')[0]}` : `${Math.abs(diffHours)} hours behind ${src.city.split(' ')[0]}`,
      overlapCount,
      overlapHours,
    };
  }, [sourceTzIdx, targetTzIdx, selectedTime, selectedDate]);

  // DATE DIFF CALCULATIONS
  const dateDiffResults = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const timeDiffMs = e.getTime() - s.getTime();
    const isFuture = timeDiffMs >= 0;
    const absDiffMs = Math.abs(timeDiffMs);

    const totalDays = Math.round(absDiffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    const months = (totalDays / 30.4375).toFixed(1);
    const years = (totalDays / 365.25).toFixed(2);

    // Business days (Mon-Fri)
    let businessDays = 0;
    let cur = new Date(Math.min(s.getTime(), e.getTime()));
    const max = new Date(Math.max(s.getTime(), e.getTime()));
    while (cur < max) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        businessDays++;
      }
    }

    return {
      totalDays,
      weeks,
      remDays,
      months,
      years,
      businessDays,
      isFuture,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 24 * 60,
    };
  }, [startDate, endDate]);

  // AGE CALCULATIONS
  const ageResults = useMemo(() => {
    const birth = new Date(birthDate);
    const target = new Date(targetAgeDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
      return { years: 0, months: 0, days: 0, totalDays: 0, nextBdayDays: 0 };
    }

    let y = target.getFullYear() - birth.getFullYear();
    let m = target.getMonth() - birth.getMonth();
    let d = target.getDate() - birth.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      d += prevMonth.getDate();
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    // Next birthday calculation
    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(nextBday.getFullYear() + 1);
    }
    const nextBdayDays = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years: Math.max(0, y),
      months: Math.max(0, m),
      days: Math.max(0, d),
      totalDays: Math.max(0, totalDays),
      totalWeeks: Math.max(0, Math.floor(totalDays / 7)),
      totalHours: Math.max(0, totalDays * 24),
      nextBdayDays,
    };
  }, [birthDate, targetAgeDate]);

  // WORK DURATION CALCULATIONS
  const workDurationResults = useMemo(() => {
    const [sh, sm] = workStartTime.split(':').map(Number);
    const [eh, em] = workEndTime.split(':').map(Number);

    const startTotal = sh * 60 + sm;
    let endTotal = eh * 60 + em;
    if (endTotal < startTotal) {
      endTotal += 24 * 60; // overnight
    }

    const totalRawMinutes = endTotal - startTotal;
    const netMinutes = Math.max(0, totalRawMinutes - breakMinutes);
    const netHours = netMinutes / 60;
    const regularHours = Math.min(8, netHours);
    const overtimeHours = Math.max(0, netHours - 8);

    const regularPay = regularHours * hourlyWage;
    const overtimePay = overtimeHours * (hourlyWage * 1.5);
    const totalPay = regularPay + overtimePay;

    return {
      netHoursFormatted: `${Math.floor(netMinutes / 60)} hrs ${netMinutes % 60} mins`,
      decimalHours: netHours.toFixed(2),
      regularHours: regularHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      regularPay: regularPay.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      totalPay: totalPay.toFixed(2),
    };
  }, [workStartTime, workEndTime, breakMinutes, hourlyWage]);

  // Copy handler
  const handleCopySummary = () => {
    let text = `${tool.name} Summary\n`;
    if (mode === 'timezone') {
      text += `From: ${timezoneResults.src.city} (${timezoneResults.sourceTime12})\nTo: ${timezoneResults.tgt.city} (${timezoneResults.targetTime12} ${timezoneResults.dayShiftText})\nDifference: ${timezoneResults.diffText}\nBusiness Overlap: ${timezoneResults.overlapCount} hrs`;
    } else if (mode === 'datediff') {
      text += `From ${startDate} to ${endDate}\nTotal: ${dateDiffResults.totalDays} days (${dateDiffResults.weeks} weeks ${dateDiffResults.remDays} days)\nBusiness Days: ${dateDiffResults.businessDays} days`;
    } else if (mode === 'age') {
      text += `Birthdate: ${birthDate}\nExact Age: ${ageResults.years} years, ${ageResults.months} months, ${ageResults.days} days\nTotal Days: ${ageResults.totalDays.toLocaleString()} days\nNext Birthday in: ${ageResults.nextBdayDays} days`;
    } else {
      text += `Work Hours: ${workDurationResults.netHoursFormatted} (${workDurationResults.decimalHours} hrs)\nTotal Estimated Pay: $${workDurationResults.totalPay} (@ $${hourlyWage}/hr)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: 'calculators',
      status: 'completed',
      outputSummary: text.split('\n')[1] || 'Completed calculation',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TIMEZONE MODE */}
      {mode === 'timezone' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Time Zone Converter
                </h3>
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                  DST Aware
                </span>
              </div>

              {/* Source Timezone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Origin Time Zone / City</label>
                <select
                  value={sourceTzIdx}
                  onChange={(e) => setSourceTzIdx(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {POPULAR_TIMEZONES.map((tz, idx) => (
                    <option key={tz.tz} value={idx}>
                      {tz.flag} {tz.city} (UTC {tz.offset >= 0 ? `+${tz.offset}` : tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = sourceTzIdx;
                    setSourceTzIdx(targetTzIdx);
                    setTargetTzIdx(temp);
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
                  title="Swap Origin & Destination"
                >
                  <ArrowRightLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>

              {/* Target Timezone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Time Zone / City</label>
                <select
                  value={targetTzIdx}
                  onChange={(e) => setTargetTzIdx(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {POPULAR_TIMEZONES.map((tz, idx) => (
                    <option key={tz.tz} value={idx}>
                      {tz.flag} {tz.city} (UTC {tz.offset >= 0 ? `+${tz.offset}` : tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time (Origin)</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Conversion!' : 'Copy Time Difference Summary'}
              </button>
            </div>
          </div>

          {/* Results Display (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Primary Dual Clock Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    {timezoneResults.src.flag} {timezoneResults.src.city.split(' ')[0]}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {timezoneResults.sourceTime12}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">UTC {timezoneResults.src.offset >= 0 ? `+${timezoneResults.src.offset}` : timezoneResults.src.offset}</span>
                </div>

                <div className="p-4 bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    {timezoneResults.tgt.flag} {timezoneResults.tgt.city.split(' ')[0]}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-red-600 dark:text-red-400">
                    {timezoneResults.targetTime12}
                  </div>
                  <span className="text-[11px] font-bold text-red-700 dark:text-red-300">{timezoneResults.dayShiftText}</span>
                </div>
              </div>

              {/* Time Difference Metric Card */}
              <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-xl flex items-center justify-between border border-slate-800 shadow-xs">
                <div>
                  <div className="text-xs font-medium text-slate-400">Total Difference</div>
                  <div className="text-lg font-bold text-white mt-0.5">{timezoneResults.diffText}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-400">Working Overlap</div>
                  <div className="text-lg font-bold text-emerald-400">{timezoneResults.overlapCount} Working Hours</div>
                </div>
              </div>

              {/* 24-Hour Interactive Timeline Visualizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>24-Hour Business Overlap Matrix (9 AM – 5 PM)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Green = Both Online</span>
                </div>
                <div className="grid grid-cols-12 gap-1 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  {timezoneResults.overlapHours.slice(0, 12).map((item) => (
                    <div
                      key={item.hourSource}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-mono transition-colors ${
                        item.isWorkingBoth
                          ? 'bg-emerald-500 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      <div>{item.hourSource}:00</div>
                      <div className="text-[9px] opacity-75">{item.hourTarget}:00</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  {timezoneResults.overlapHours.slice(12, 24).map((item) => (
                    <div
                      key={item.hourSource}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-mono transition-colors ${
                        item.isWorkingBoth
                          ? 'bg-emerald-500 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      <div>{item.hourSource}:00</div>
                      <div className="text-[9px] opacity-75">{item.hourTarget}:00</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DATE DIFFERENCE MODE */}
      {mode === 'datediff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                Date Range Parameters
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Details!' : 'Copy Date Breakdown'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Total Duration</div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                  {dateDiffResults.totalDays.toLocaleString()} <span className="text-xl font-bold text-slate-500 dark:text-slate-400">Days</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                  Equivalent to {dateDiffResults.weeks} Weeks, {dateDiffResults.remDays} Days (~{dateDiffResults.months} Months)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Business Days</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{dateDiffResults.businessDays}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Excludes Mon-Fri</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Hours</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{dateDiffResults.totalHours.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Full 24h cycles</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Years Fraction</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{dateDiffResults.years}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">365.25 day basis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AGE CALCULATOR MODE */}
      {mode === 'age' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                Birth Details
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Age at Date</label>
                <input
                  type="date"
                  value={targetAgeDate}
                  onChange={(e) => setTargetAgeDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Age Stats!' : 'Copy Age Breakdown'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Exact Age</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                  {ageResults.years} <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Years</span> {ageResults.months} <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Months</span> {ageResults.days} <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Days</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                  🎉 Next Birthday in <strong className="text-red-600 dark:text-red-400 font-bold">{ageResults.nextBdayDays} days</strong>!
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Days</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">{ageResults.totalDays.toLocaleString()}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Weeks</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">{ageResults.totalWeeks.toLocaleString()}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Hours</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">{ageResults.totalHours.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WORK HOURS & DURATION MODE */}
      {mode === 'duration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Briefcase className="w-4 h-4 text-red-600 dark:text-red-400" />
                Work Shift Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Unpaid Break (Minutes)</label>
                <input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hourly Wage ($/hr)</label>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Pay Details!' : 'Copy Shift Summary'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Billable Hours</div>
                <div className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                  {workDurationResults.netHoursFormatted}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  ({workDurationResults.decimalHours} decimal hours)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Regular Pay</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">${workDurationResults.regularPay}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{workDurationResults.regularHours} hrs @ 1.0x</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Overtime Pay</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">${workDurationResults.overtimePay}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{workDurationResults.overtimeHours} hrs @ 1.5x</div>
                </div>
                <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400">Total Gross Pay</div>
                  <div className="text-lg font-black text-emerald-400 mt-1 font-mono">${workDurationResults.totalPay}</div>
                  <div className="text-[10px] text-slate-400">Shift Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
