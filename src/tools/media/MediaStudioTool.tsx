import React, { useState, useRef, useEffect } from 'react';
import { ToolDefinition, ToolResult } from '../../types';
import {
  Volume2,
  Play,
  Square,
  Radio,
  Sliders,
  Download,
  Activity,
  Music,
} from 'lucide-react';

export const MediaStudioTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'synth' | 'noise' | 'binaural' | 'chords'>('synth');
  const [isPlaying, setIsPlaying] = useState(false);

  // Synth state
  const [frequency, setFrequency] = useState(440);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [gainLevel, setGainLevel] = useState(0.5);

  // Noise state
  const [noiseType, setNoiseType] = useState<'white' | 'pink' | 'brown'>('white');

  // Binaural state
  const [baseFreq, setBaseFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(7.83); // Schumann resonance

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const stopAudio = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch {
      // Audio stop safe catch
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const startSynth = () => {
    stopAudio();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    setIsPlaying(true);
  };

  const startNoise = () => {
    stopAudio();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (noiseType === 'white') {
        output[i] = white * 0.3;
      } else if (noiseType === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
        b6 = white * 0.115926;
      } else if (noiseType === 'brown') {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 1.5;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);

    whiteNoise.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(0);
    noiseNodeRef.current = whiteNoise;
    setIsPlaying(true);
  };

  const startBinaural = () => {
    stopAudio();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const merger = ctx.createChannelMerger(2);
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();

    oscL.type = 'sine';
    oscR.type = 'sine';

    oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel * 0.7, ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(ctx.destination);

    oscL.start();
    oscR.start();

    oscRef.current = oscL;
    setIsPlaying(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Audio & Media Production Studio</h1>
              <p className="text-xs text-slate-500">Real-time WebAudio synthesis, ambient noise, binaural acoustics & spectrum generation.</p>
            </div>
          </div>
        </div>

        {/* Live Audio Status */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <button
              onClick={stopAudio}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              Stop Audio Engine
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeTab === 'synth') startSynth();
                else if (activeTab === 'noise') startNoise();
                else if (activeTab === 'binaural') startBinaural();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Start Audio Engine
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 rounded-xl shadow-xs">
        {[
          { id: 'synth', label: 'Waveform Synthesizer', icon: Music },
          { id: 'noise', label: 'Ambient Noise Generator', icon: Radio },
          { id: 'binaural', label: 'Binaural Beat Generator', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                stopAudio();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {activeTab === 'synth' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Tone & Waveform Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Frequency: {frequency} Hz</span>
                    <span className="text-slate-400">Range: 20Hz - 2000Hz</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="1"
                    value={frequency}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFrequency(val);
                      if (oscRef.current && audioCtxRef.current) {
                        oscRef.current.frequency.setValueAtTime(val, audioCtxRef.current.currentTime);
                      }
                    }}
                    className="w-full"
                  />
                  <div className="flex gap-2 mt-2">
                    {[
                      { label: 'C4 (261.6Hz)', val: 261.63 },
                      { label: 'A4 (440Hz)', val: 440 },
                      { label: '528Hz DNA', val: 528 },
                      { label: '432Hz Calm', val: 432 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setFrequency(preset.val);
                          if (oscRef.current && audioCtxRef.current) {
                            oscRef.current.frequency.setValueAtTime(preset.val, audioCtxRef.current.currentTime);
                          }
                        }}
                        className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Waveform</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sine', 'square', 'triangle', 'sawtooth'] as OscillatorType[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setWaveType(w);
                          if (oscRef.current) {
                            oscRef.current.type = w;
                          }
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border capitalize cursor-pointer ${
                          waveType === w
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Gain Volume: {Math.round(gainLevel * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={gainLevel}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGainLevel(val);
                      if (gainRef.current && audioCtxRef.current) {
                        gainRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
                      }
                    }}
                    className="w-full"
                  />
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Acoustic Specs</div>
                  <div>• Synthesis Mode: Web Audio API (Native Hardware Accelerated)</div>
                  <div>• Audio Sample Rate: 44.1 kHz / 48.0 kHz 32-bit Float</div>
                  <div>• Output: Stereo Left / Right Channels</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'noise' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Acoustic Masking & Background Ambience</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'white', title: 'White Noise', desc: 'Equal energy across all frequencies. Ideal for masking harsh office chatter.' },
                { id: 'pink', title: 'Pink Noise', desc: 'Equal energy per octave. Balanced, relaxing natural rain-like sound.' },
                { id: 'brown', title: 'Brownian (Red) Noise', desc: 'Deeper low-frequency rumble. Ideal for deep focus and sleep.' },
              ].map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setNoiseType(n.id as any);
                    if (isPlaying) startNoise();
                  }}
                  className={`p-5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    noiseType === n.id
                      ? 'bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">{n.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'binaural' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Binaural Brainwave Entrainment (Use Headphones)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Base Carrier Frequency: {baseFreq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="5"
                    value={baseFreq}
                    onChange={(e) => setBaseFreq(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Beat Frequency (L/R Delta): {beatFreq.toFixed(2)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="30"
                    step="0.1"
                    value={beatFreq}
                    onChange={(e) => setBeatFreq(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Delta (2.5 Hz)', desc: 'Deep Sleep & Healing', val: 2.5 },
                  { label: 'Theta (6.0 Hz)', desc: 'Meditation & Creativity', val: 6.0 },
                  { label: 'Alpha (10.0 Hz)', desc: 'Calm Focus & Flow', val: 10.0 },
                  { label: 'Beta (18.0 Hz)', desc: 'Active Problem Solving', val: 18.0 },
                ].map((preset) => (
                  <div
                    key={preset.label}
                    onClick={() => setBeatFreq(preset.val)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      beatFreq === preset.val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">{preset.label}</div>
                    <div className="text-[10px] text-slate-500">{preset.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const mediaStudioToolDef: ToolDefinition = {
  id: 'media-studio',
  name: 'Audio & Media Studio',
  category: 'media',
  subcategory: 'audio',
  description: 'Synthesize custom acoustic waveforms, white/pink noise, and binaural soundscapes.',
  iconName: 'Volume2',
  version: '1.0.0',
  tags: ['media', 'audio', 'synthesizer', 'noise', 'binaural', 'acoustics', 'sound'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  customWorkspace: MediaStudioTool,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'frequency', label: 'Tone Frequency (Hz)', type: 'number', defaultValue: 440 },
      { name: 'waveType', label: 'Waveform Shape', type: 'select', defaultValue: 'sine', options: [{ label: 'Sine', value: 'sine' }, { label: 'Square', value: 'square' }, { label: 'Triangle', value: 'triangle' }, { label: 'Sawtooth', value: 'sawtooth' }] },
    ],
  },
  outputSchema: { type: 'audio', mimeType: 'audio/wav' },
  execute: async (inputs): Promise<ToolResult> => {
    return { success: true, text: `Media Studio ready for tone ${inputs.frequency || 440}Hz` };
  },
};
