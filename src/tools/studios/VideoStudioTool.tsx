import React, { useState, useRef, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  Video,
  Play,
  Pause,
  Scissors,
  Volume2,
  VolumeX,
  Gauge,
  Camera,
  Download,
  Upload,
  Sparkles,
  Maximize2,
  RotateCw,
  Clock,
  Film,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const VideoStudioWorkspace: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('sample-video.mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'original' | '16:9' | '9:16' | '1:1'>('original');
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>('Load a video to begin studio editing');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setStatusMsg(`Loaded ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 10;
    setDuration(dur);
    setTrimStart(0);
    setTrimEnd(dur);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.currentTime >= trimEnd) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = trimStart;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setExtractedFrames((prev) => [dataUrl, ...prev.slice(0, 5)]);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `frame-${Math.round(currentTime * 1000)}ms.png`;
    link.click();

    storageEngine.addHistoryItem({
      toolId: 'video-studio',
      toolName: 'Video Studio Pro',
      category: 'video',
      status: 'completed',
      outputSummary: `Captured high-res frame at ${currentTime.toFixed(2)}s`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Video Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Timeline Suite
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Trim, cut, crop, adjust audio, change playback speed, and extract high-definition frames in your browser.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Open Video</span>
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Video Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
                className="max-h-[400px] w-auto rounded-xl shadow-lg"
              />
            ) : (
              <div className="text-center py-16 px-6 space-y-3">
                <Video className="w-16 h-16 text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-400">
                  Select a video file to access the timeline editor
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Timeline & Scrubber */}
          {videoSrc && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-white">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <span>{currentTime.toFixed(2)}s</span>
                <span>Trim: {trimStart.toFixed(2)}s - {trimEnd.toFixed(2)}s</span>
                <span>{duration.toFixed(2)}s</span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={0}
                max={duration || 10}
                step={0.05}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-red-600 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Playback Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      isMuted ? 'bg-red-950 border-red-800 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={captureFrame}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Capture HD Frame</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Tools & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Playback & Video Controls
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Playback Speed: {playbackSpeed}x
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Trim Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Start (sec)</span>
                  <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => setTrimStart(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">End (sec)</span>
                  <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Captured Frames Gallery */}
          {extractedFrames.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                Captured Frames ({extractedFrames.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {extractedFrames.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} alt={`Frame ${i + 1}`} className="w-full h-20 object-cover" />
                    <a
                      href={url}
                      download={`frame-${i + 1}.png`}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const videoStudioToolDef: ToolDefinition = {
  id: 'video-studio',
  name: 'Video Studio Pro',
  category: 'video',
  subcategory: 'editor',
  description: 'Browser-based video workspace to trim, cut, crop, adjust audio, change speed, and extract HD frames.',
  iconName: 'Film',
  version: '2.0.0',
  tags: ['video', 'trim', 'cut', 'audio', 'speed', 'frame', 'editor', 'studio'],
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
  customWorkspace: VideoStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Video Studio Ready' };
  },
};
