import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Activity,
  Sliders,
  Sparkles,
  Zap,
  Music,
  Clock,
  Radio,
  Download,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  FileText,
  Calculator,
  Grid,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const MediaAudioArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  // Determine specific operational media mode
  const mode = useMemo(() => {
    if (name.includes('dtmf') || toolId.includes('dtmf') || name.includes('telephone keypad')) return 'dtmf';
    if (name.includes('piano') || toolId.includes('piano') || name.includes('keyboard')) return 'piano';
    if (name.includes('drum') || toolId.includes('drum') || name.includes('sequencer')) return 'drum-machine';
    if (name.includes('delay') || toolId.includes('delay')) return 'delay-calculator';
    if (name.includes('hertz') || toolId.includes('hertz') || name.includes('midi note') || name.includes('transcoder')) return 'hz-to-note';
    if (name.includes('bpm') || toolId.includes('bpm') || name.includes('metronome') || name.includes('tap tempo')) return 'bpm-metronome';
    if (name.includes('bitrate') || toolId.includes('bitrate') || name.includes('file size calculator')) return 'file-size-calc';
    if (name.includes('decibel') || toolId.includes('decibel') || name.includes('dbfs')) return 'decibel-calc';
    if (name.includes('subtitle') || toolId.includes('srt') || name.includes('time shifter')) return 'srt-shifter';
    if (name.includes('cue') || toolId.includes('cue')) return 'cue-splitter';
    if (name.includes('ambient') || name.includes('noise') || toolId.includes('noise')) return 'noise-gen';
    return 'tone-gen';
  }, [name, toolId]);

  // Tone Generator State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(440); // A4
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [volume, setVolume] = useState<number>(0.25);

  // BPM / Metronome State
  const [bpm, setBpm] = useState<number>(120);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);

  // Hz to MIDI Note State
  const [inputHz, setInputHz] = useState<number>(440);

  // Video / Audio Bitrate Calculator State
  const [videoDurationMin, setVideoDurationMin] = useState<number>(10);
  const [videoBitrateMbps, setVideoBitrateMbps] = useState<number>(8);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(192);

  // SRT Subtitle State
  const [srtInput, setSrtInput] = useState<string>(
    `1\n00:00:01,500 --> 00:00:04,200\nWelcome to EditMee Enterprise Media Studio.\n\n2\n00:00:05,000 --> 00:00:08,800\nAll audio processing is executed client-side in browser memory.`
  );
  const [timeShiftMs, setTimeShiftMs] = useState<number>(1200);

  // Drum Machine State (16 steps)
  const [isDrumPlaying, setIsDrumPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [kickSteps, setKickSteps] = useState<boolean[]>([true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]);
  const [snareSteps, setSnareSteps] = useState<boolean[]>([false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]);
  const [hihatSteps, setHihatSteps] = useState<boolean[]>([true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]);

  const [copied, setCopied] = useState<boolean>(false);

  // Web Audio References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const drumTimerRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play short synthesized tone
  const playTone = (freq: number, duration: number = 0.2, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  // Continuous Tone Start/Stop
  const toggleContinuousTone = () => {
    if (isPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveform;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;

        setIsPlaying(true);
        drawWaveform();

        storageEngine.addHistoryItem({
          toolId: tool.id,
          toolName: tool.name,
          category: 'media',
          status: 'completed',
          outputSummary: `Generated ${frequency}Hz ${waveform} audio tone`,
        });
      } catch (err) {
        console.error('Audio error:', err);
      }
    }
  };

  // Update frequency live
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
  }, [frequency]);

  // Update volume live
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // DTMF Keypad Pairs
  const dtmfFrequencies: Record<string, [number, number]> = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
  };

  const playDtmf = (key: string) => {
    const freqs = dtmfFrequencies[key];
    if (!freqs) return;
    try {
      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.error(e);
    }
  };

  // BPM Tap
  const handleTap = () => {
    const now = performance.now();
    playTone(880, 0.05, 'sine');
    setTapTimes((prev) => {
      const filtered = prev.filter((t) => now - t < 3000);
      const updated = [...filtered, now];
      if (updated.length >= 2) {
        const intervals = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calcBpm = Math.round(60000 / avgInterval);
        if (calcBpm >= 30 && calcBpm <= 300) {
          setBpm(calcBpm);
        }
      }
      return updated;
    });
  };

  // Metronome Click Loop
  useEffect(() => {
    let intervalId: any;
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      intervalId = setInterval(() => {
        playTone(1000, 0.04, 'square');
      }, intervalMs);
    }
    return () => clearInterval(intervalId);
  }, [isMetronomeActive, bpm]);

  // Waveform Visualizer on Canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();

      const sliceWidth = canvas.width / 100;
      let x = 0;

      for (let i = 0; i < 100; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.2 + t) * (volume * 50);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      t += 0.15;
      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  // Hz to Musical Note calculation
  const noteInfo = useMemo(() => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midi = 69 + 12 * Math.log2(inputHz / 440);
    const roundedMidi = Math.round(midi);
    const noteIndex = (roundedMidi % 12 + 12) % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    const cents = Math.round((midi - roundedMidi) * 100);
    return {
      note: `${noteNames[noteIndex]}${octave}`,
      midi: roundedMidi,
      cents: cents > 0 ? `+${cents} cents` : `${cents} cents`,
    };
  }, [inputHz]);

  // Video File Size Math
  const calculatedFileSize = useMemo(() => {
    const totalSeconds = videoDurationMin * 60;
    const totalVideoBits = totalSeconds * (videoBitrateMbps * 1000000);
    const totalAudioBits = totalSeconds * (audioBitrateKbps * 1000);
    const totalBytes = (totalVideoBits + totalAudioBits) / 8;
    const megabytes = totalBytes / (1024 * 1024);
    const gigabytes = megabytes / 1024;
    return {
      mb: megabytes.toFixed(2),
      gb: gigabytes.toFixed(3),
    };
  }, [videoDurationMin, videoBitrateMbps, audioBitrateKbps]);

  // Subtitle Shift Math
  const shiftedSrt = useMemo(() => {
    return srtInput.replace(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/g,
      (match, h1, m1, s1, ms1, h2, m2, s2, ms2) => {
        const toMs = (h: string, m: string, s: string, ms: string) =>
          Number(h) * 3600000 + Number(m) * 60000 + Number(s) * 1000 + Number(ms);
        const formatMs = (totalMs: number) => {
          const clamped = Math.max(0, totalMs);
          const hrs = Math.floor(clamped / 3600000).toString().padStart(2, '0');
          const mins = Math.floor((clamped % 3600000) / 60000).toString().padStart(2, '0');
          const secs = Math.floor((clamped % 60000) / 1000).toString().padStart(2, '0');
          const millis = (clamped % 1000).toString().padStart(3, '0');
          return `${hrs}:${mins}:${secs},${millis}`;
        };
        const t1 = toMs(h1, m1, s1, ms1) + timeShiftMs;
        const t2 = toMs(h2, m2, s2, ms2) + timeShiftMs;
        return `${formatMs(t1)} --> ${formatMs(t2)}`;
      }
    );
  }, [srtInput, timeShiftMs]);

  return (
    <div className="space-y-6">
      {/* 1. DTMF Keypad Mode */}
      {mode === 'dtmf' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 text-red-600 dark:text-red-400" />
              Dual-Tone Multi-Frequency (DTMF) Keypad
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click buttons to emit telecommunication standards-compliant dual frequencies
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => playDtmf(k)}
                className="py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-red-50 dark:active:bg-red-950/40 text-slate-900 dark:text-slate-100 active:text-red-600 dark:active:text-red-400 font-bold text-xl rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
              >
                <span>{k}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-normal">
                  {dtmfFrequencies[k]?.[0]} & {dtmfFrequencies[k]?.[1]}Hz
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. BPM Metronome & Tap Tempo Mode */}
      {mode === 'bpm-metronome' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Tap Tempo Counter
            </h2>
            <div className="text-center py-6 space-y-4">
              <div className="text-6xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">{bpm}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Beats Per Minute</div>
              <button
                type="button"
                onClick={handleTap}
                className="w-full py-6 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-600/25 transition-all cursor-pointer"
              >
                TAP BEAT HERE
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tap repeatedly in rhythm to measure tempo</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Audio Metronome Click Track
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Tempo Control</span>
                <span className="font-mono text-red-600 dark:text-red-400">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isMetronomeActive ? 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isMetronomeActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isMetronomeActive ? 'Stop Metronome' : 'Start Audio Click'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Musical Delay Time Calculator */}
      {mode === 'delay-calculator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Musical Delay Time & Reverb Pre-Delay Calculator
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Track BPM:</span>
              <input
                type="number"
                min="40"
                max="300"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '1/4 Note (Quarter)', mult: 1 },
              { label: '1/8 Note (Eighth)', mult: 0.5 },
              { label: '1/16 Note', mult: 0.25 },
              { label: 'Dotted 1/8 Note', mult: 0.75 },
              { label: 'Triplet 1/8 Note', mult: 0.3333 },
              { label: '1/2 Note (Half)', mult: 2 },
              { label: '1 Bar (4/4)', mult: 4 },
              { label: 'Pre-Delay Small Room', mult: 0.05 },
            ].map((d) => {
              const ms = Math.round((60000 / bpm) * d.mult * 10) / 10;
              const hz = Math.round((1000 / ms) * 100) / 100;
              return (
                <div key={d.label} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{d.label}</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">{ms} ms</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{hz} Hz</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Hertz to Note Transcoder */}
      {mode === 'hz-to-note' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            Frequency (Hz) to Musical Note Transcoder
          </h2>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Audio Frequency (Hz)</label>
            <input
              type="number"
              min="20"
              max="20000"
              value={inputHz}
              onChange={(e) => setInputHz(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="p-6 bg-slate-950 border border-slate-800 text-white rounded-2xl text-center space-y-2">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Equivalent Musical Note</div>
            <div className="text-5xl font-black font-mono text-white">{noteInfo.note}</div>
            <div className="text-xs text-slate-400 font-mono">
              MIDI Note #{noteInfo.midi} • Tuning Offset: {noteInfo.cents}
            </div>
            <button
              type="button"
              onClick={() => playTone(inputHz, 0.4)}
              className="mt-3 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Play {inputHz}Hz Tone
            </button>
          </div>
        </div>
      )}

      {/* 5. Video Bitrate & File Size Calculator */}
      {mode === 'file-size-calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Video & Audio Stream Parameters
            </h2>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Video Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                value={videoDurationMin}
                onChange={(e) => setVideoDurationMin(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Video Bitrate (Mbps)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={videoBitrateMbps}
                onChange={(e) => setVideoBitrateMbps(Math.max(0.1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Audio Bitrate (kbps)</label>
              <input
                type="number"
                value={audioBitrateKbps}
                onChange={(e) => setAudioBitrateKbps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center text-center space-y-4">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Estimated Export Footprint</span>
            <div className="text-5xl font-black font-mono text-white">{calculatedFileSize.gb} GB</div>
            <div className="text-xs text-slate-400 font-mono">({calculatedFileSize.mb} MB uncompressed raw stream)</div>
            <p className="text-xs text-slate-500">
              Suitable for YouTube 1080p60 / 4K standard delivery bitrate recommendations
            </p>
          </div>
        </div>
      )}

      {/* 6. SubRip (SRT) Subtitle Time Shifter */}
      {mode === 'srt-shifter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Original SRT Subtitles
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Offset Delay / Advance (ms)</span>
                <span className="font-mono text-red-600 dark:text-red-400">{timeShiftMs > 0 ? `+${timeShiftMs}` : timeShiftMs} ms</span>
              </div>
              <input
                type="number"
                step="100"
                value={timeShiftMs}
                onChange={(e) => setTimeShiftMs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <textarea
              value={srtInput}
              onChange={(e) => setSrtInput(e.target.value)}
              rows={10}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Adjusted Subtitles Output
              </h2>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shiftedSrt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SRT'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={shiftedSrt}
              rows={13}
              className="w-full p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* 7. Precision Audio Tone Generator (Default Media Mode) */}
      {(mode === 'tone-gen' || mode === 'noise-gen') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Tone Generator Parameters
              </h2>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Frequency (Hz)</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{frequency} Hz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="5000"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Waveform</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWaveform(w)}
                      className={`py-2 text-xs font-bold capitalize rounded-xl border cursor-pointer ${
                        waveform === w
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Master Volume</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={toggleContinuousTone}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isPlaying ? 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Stop Audio Signal' : 'Play Continuous Tone'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Real-time Waveform Oscilloscope
              </span>
              <div className="w-full h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <canvas ref={canvasRef} width={600} height={250} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
