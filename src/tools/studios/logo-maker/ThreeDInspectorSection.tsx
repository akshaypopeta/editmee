import React, { useState } from 'react';
import {
  Box,
  Sun,
  Layers,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Compass,
  Zap,
} from 'lucide-react';
import { LogoElement, ThreeDOptions, MaterialPreset, LightingPreset, BevelStyle } from './types';
import { MATERIAL_DEFINITIONS, LIGHTING_PRESETS, BEVEL_STYLES } from './threeDMaterials';

interface ThreeDInspectorSectionProps {
  element: LogoElement;
  onChange: (updates: Partial<LogoElement>) => void;
}

const DEFAULT_3D_OPTIONS: ThreeDOptions = {
  enabled: true,
  depth: 25,
  perspective: 0.35,
  rotX: 12,
  rotY: -15,
  rotZ: 0,
  lightAngle: 315,
  lightElevation: 45,
  lightIntensity: 1.2,
  ambientLight: 0.4,
  specular: 0.85,
  material: 'gold',
  roughness: 0.2,
  reflectivity: 0.85,
  bevelSize: 3,
  bevelStyle: 'sharp',
  shadowType: 'extrusion',
  shadowAngle: 315,
  shadowDistance: 22,
  shadowBlur: 18,
  shadowOpacity: 0.6,
  shadowColor: '#000000',
};

export const ThreeDInspectorSection: React.FC<ThreeDInspectorSectionProps> = ({
  element,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'material' | 'geometry' | 'lighting' | 'bevel'>('material');

  const threeD: ThreeDOptions = element.threeD || {
    ...DEFAULT_3D_OPTIONS,
    enabled: false,
  };

  const update3D = (partial: Partial<ThreeDOptions>) => {
    onChange({
      threeD: {
        ...threeD,
        ...partial,
      },
    });
  };

  const toggle3D = (enabled: boolean) => {
    if (enabled && !element.threeD) {
      onChange({
        threeD: { ...DEFAULT_3D_OPTIONS, enabled: true },
      });
    } else {
      update3D({ enabled });
    }
  };

  const currentMat = MATERIAL_DEFINITIONS[threeD.material] || MATERIAL_DEFINITIONS.gold;

  return (
    <div className="pt-3 border-t border-slate-800/90 space-y-3">
      {/* Header Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-lg ${threeD.enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <Box className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            3D Studio Mode
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={threeD.enabled}
            onChange={(e) => toggle3D(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {threeD.enabled && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Sub-tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            {(['material', 'geometry', 'lighting', 'bevel'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: MATERIAL PRESETS */}
          {activeTab === 'material' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Selected Material</span>
                <span className="font-bold text-amber-400">{currentMat.name}</span>
              </div>

              {/* Material Grid */}
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {(Object.keys(MATERIAL_DEFINITIONS) as MaterialPreset[]).map((matKey) => {
                  const m = MATERIAL_DEFINITIONS[matKey];
                  const isSelected = threeD.material === matKey;
                  return (
                    <button
                      key={matKey}
                      type="button"
                      onClick={() => update3D({ material: matKey })}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-full h-4 rounded-md mb-1.5 shadow-inner"
                        style={{
                          background: `linear-gradient(135deg, ${m.faceGradient[0]?.color || '#ffffff'}, ${m.faceGradient[m.faceGradient.length - 1]?.color || '#000000'})`,
                        }}
                      />
                      <span className="text-[10px] font-bold truncate">{m.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reflectivity & Roughness Sliders */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Metal Reflectivity</span>
                    <span>{Math.round((threeD.reflectivity ?? 0.8) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={threeD.reflectivity ?? 0.8}
                    onChange={(e) => update3D({ reflectivity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Surface Roughness</span>
                    <span>{Math.round((threeD.roughness ?? 0.2) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={threeD.roughness ?? 0.2}
                    onChange={(e) => update3D({ roughness: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOMETRY & ANGLES */}
          {activeTab === 'geometry' && (
            <div className="space-y-3">
              {/* Depth Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Extrusion Depth</span>
                  <span className="font-mono text-amber-400">{threeD.depth}px</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={80}
                  step={1}
                  value={threeD.depth}
                  onChange={(e) => update3D({ depth: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 3D Pitch (Rot X) */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Pitch (Tilt Vertical)</span>
                  <span className="font-mono text-amber-400">{threeD.rotX}°</span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={threeD.rotX}
                  onChange={(e) => update3D({ rotX: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 3D Yaw (Rot Y) */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Yaw (Turn Horizontal)</span>
                  <span className="font-mono text-amber-400">{threeD.rotY}°</span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={threeD.rotY}
                  onChange={(e) => update3D({ rotY: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Angle Quick Presets */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1.5">Isometric Angle Presets</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Front Flush', rx: 0, ry: 0 },
                    { label: 'Classic Iso', rx: 15, ry: -20 },
                    { label: 'Right Tilt', rx: 10, ry: 25 },
                    { label: 'Top View', rx: 35, ry: 0 },
                    { label: 'Dramatic', rx: 22, ry: -35 },
                    { label: 'Subtle', rx: 8, ry: -10 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => update3D({ rotX: preset.rx, rotY: preset.ry })}
                      className="py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-slate-700 text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIGHTING */}
          {activeTab === 'lighting' && (
            <div className="space-y-3">
              {/* Lighting Presets */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1.5">Studio Light Rig</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(LIGHTING_PRESETS) as LightingPreset[]).map((lpKey) => {
                    const lp = LIGHTING_PRESETS[lpKey];
                    return (
                      <button
                        key={lpKey}
                        type="button"
                        onClick={() =>
                          update3D({
                            lightAngle: lp.angle,
                            lightElevation: lp.elevation,
                            lightIntensity: lp.intensity,
                            ambientLight: lp.ambient,
                            lightingPreset: lpKey,
                          })
                        }
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-amber-500 transition-colors"
                      >
                        <div className="text-[10px] font-bold text-slate-200">{lp.name}</div>
                        <div className="text-[9px] text-slate-500">{lp.angle}° Angle</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light Angle Dial Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Light Direction</span>
                  <span className="font-mono text-amber-400">{threeD.lightAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={threeD.lightAngle}
                  onChange={(e) => update3D({ lightAngle: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Intensity */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Light Power / Intensity</span>
                  <span>{Math.round((threeD.lightIntensity || 1.2) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  value={threeD.lightIntensity || 1.2}
                  onChange={(e) => update3D({ lightIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BEVEL & SHADOW */}
          {activeTab === 'bevel' && (
            <div className="space-y-3">
              {/* Bevel Style */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Bevel Profile</span>
                <div className="grid grid-cols-3 gap-1">
                  {(Object.keys(BEVEL_STYLES) as BevelStyle[]).map((bs) => (
                    <button
                      key={bs}
                      type="button"
                      onClick={() => update3D({ bevelStyle: bs })}
                      className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                        threeD.bevelStyle === bs
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bevel Size Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Bevel Width</span>
                  <span className="font-mono text-amber-400">{threeD.bevelSize}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={threeD.bevelSize}
                  onChange={(e) => update3D({ bevelSize: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Shadow Distance Slider */}
              <div className="pt-1 border-t border-slate-800/80">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>3D Cast Shadow Blur</span>
                  <span className="font-mono text-amber-400">{threeD.shadowBlur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={2}
                  value={threeD.shadowBlur || 18}
                  onChange={(e) => update3D({ shadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
