import React, { useState, useRef, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  Music,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Sliders,
  Activity,
  Download,
  Upload,
  Mic,
  Sparkles,
  Zap,
  Clock,
  Radio,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const AudioStudioWorkspace: React.FC = () => {
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [volume, setVolume] = useState(0.3);

  // BPM Tap
  const [bpm, setBpm] = useState(120);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Toggle tone generator
  const toggleTone = () => {
    if (isPlayingTone) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingTone(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;

        osc.type = waveform;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);

        osc.connect(gain);
        gain.connect(analyser);
        analyser.connect(ctx.destination);

        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
        analyserRef.current = analyser;

        setIsPlayingTone(true);
        drawWaveform();

        storageEngine.addHistoryItem({
          toolId: 'audio-studio',
          toolName: 'Audio Studio Pro',
          category: 'audio',
          status: 'completed',
          outputSummary: `Generated ${frequency}Hz ${waveform} tone`,
        });
      } catch (err) {
        console.error('Audio start error:', err);
      }
    }
  };

  // Live frequency updates
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    }
  }, [frequency]);

  // Live volume updates
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Draw real-time canvas waveform
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  // BPM Tap detector
  const handleTap = () => {
    const now = performance.now();
    const newTimes = [...tapTimes.slice(-4), now];
    setTapTimes(newTimes);

    if (newTimes.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < newTimes.length; i++) {
        diffs.push(newTimes[i] - newTimes[i - 1]);
      }
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const calculatedBpm = Math.round(60000 / avgDiff);
      if (calculatedBpm >= 40 && calculatedBpm <= 280) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Audio Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Web Audio Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time oscilloscope, frequency synthesizer, BPM tap counter, and audio utility suite.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Oscilloscope & Synth (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-500" />
                Live Web Audio Oscilloscope
              </span>
              <span className="text-xs font-mono font-bold text-red-400">
                {isPlayingTone ? `${frequency} Hz (${waveform.toUpperCase()})` : 'Idle'}
              </span>
            </div>

            <div className="h-56 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <canvas ref={canvasRef} width={640} height={224} className="w-full h-full block" />
            </div>

            {/* Main Play Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={toggleTone}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
                  isPlayingTone
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                }`}
              >
                {isPlayingTone ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                <span>{isPlayingTone ? 'Stop Synthesizer' : 'Start Audio Synthesizer'}</span>
              </button>

              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-28 accent-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls & BPM Tap (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Synthesizer Settings
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Frequency: {frequency} Hz
              </label>
              <input
                type="range"
                min={20}
                max={2000}
                step={1}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>20 Hz (Sub)</span>
                <span>440 Hz (A4)</span>
                <span>2 kHz (High)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Waveform Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((wf) => (
                  <button
                    key={wf}
                    type="button"
                    onClick={() => setWaveform(wf)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      waveform === wf
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BPM Tap Tool */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 text-left">
              BPM Tap Tempo Counter
            </h3>
            <div className="text-3xl font-black text-slate-900 font-mono py-2">{bpm} BPM</div>
            <button
              type="button"
              onClick={handleTap}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer active:scale-98"
            >
              TAP TEMPO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const audioStudioToolDef: ToolDefinition = {
  id: 'audio-studio',
  name: 'Audio Studio Pro',
  category: 'audio',
  subcategory: 'generator',
  description: 'Interactive audio workspace with real-time oscilloscope, frequency synthesizer, and BPM tap tempo counter.',
  iconName: 'Music',
  version: '2.0.0',
  tags: ['audio', 'music', 'synth', 'frequency', 'waveform', 'bpm', 'tempo', 'sound'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: AudioStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Audio Studio Ready' };
  },
};
