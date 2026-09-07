import React, { useState } from 'react';
import {
  FileText,
  Upload,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Camera,
  Calendar,
  Layers,
  Download,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine, ExifData } from '../../core/image-engine/ImageEngine';

export const ExifViewerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [strippedBlob, setStrippedBlob] = useState<Blob | null>(null);

  const handleFileUpload = async (f: File) => {
    try {
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);
      setStrippedBlob(null);

      const metadata = await ImageEngine.extractExifMetadata(f);
      setExif(metadata);
    } catch (err) {
      console.error('Error loading file for EXIF:', err);
    }
  };

  // Strip EXIF metadata completely by re-encoding clean canvas
  const handleStripMetadata = async () => {
    if (!file) return;
    setIsStripping(true);
    try {
      const img = await FileEngine.loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (b) => {
            if (b) {
              setStrippedBlob(b);
              const base = file.name.replace(/\.[^/.]+$/, '');
              FileEngine.downloadBlob(b, `${base}_privacy_clean.jpg`);

              storageEngine.addHistoryItem({
                toolId: 'exif-viewer',
                toolName: 'EXIF Viewer & Privacy Sanitizer',
                category: 'images',
                status: 'completed',
                outputFilename: `${base}_privacy_clean.jpg`,
                outputSummary: 'Stripped all GPS location, camera serials, and device metadata',
              });
            }
            setIsStripping(false);
          },
          'image/jpeg',
          0.96
        );
      }
    } catch (err) {
      console.error('Error stripping metadata:', err);
      setIsStripping(false);
    }
  };

  return (
    <div id="exif-viewer-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </span>
            EXIF Metadata Inspector & Privacy Stripper
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit hidden camera hardware data, GPS location coordinates, exposure settings, and strip metadata before public sharing.
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleStripMetadata}
            disabled={isStripping}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {isStripping ? 'Sanitizing...' : 'Strip All EXIF & Download Clean Image'}
          </button>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-emerald-500 transition-colors">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to inspect EXIF metadata</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Inspect camera model, shutter speed, ISO, lens specs, and GPS coordinates embedded inside photos.
          </p>
          <label
            htmlFor="exif-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" /> Choose Photo File
            <input
              id="exif-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Metadata Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Privacy Alert Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Privacy & Metadata Notice</h4>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Photos often contain exact GPS home coordinates, device serial numbers, and capture timestamps. Use our 1-click sanitizer above to securely strip this data before posting to public forums.
                </p>
              </div>
            </div>

            {/* Hardware & Camera Specs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" /> Device & Camera Info
                </span>
                <label
                  htmlFor="change-exif-file"
                  className="text-xs text-emerald-600 hover:underline cursor-pointer font-semibold"
                >
                  Change Photo
                  <input
                    id="change-exif-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Camera Make</span>
                  <span className="font-semibold text-slate-800">{exif?.make || 'Unknown'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Camera Model</span>
                  <span className="font-semibold text-slate-800">{exif?.model || 'Unknown'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Software / Firmware</span>
                  <span className="font-semibold text-slate-800">{exif?.software || 'Standard Engine'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-semibold text-slate-800">{exif?.dateTime || 'Not Recorded'}</span>
                </div>
              </div>
            </div>

            {/* Exposure Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">
                Photographic Exposure Parameters
              </span>

              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Shutter</span>
                  <span className="font-mono font-bold text-slate-800">{exif?.exposureTime || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Aperture</span>
                  <span className="font-mono font-bold text-slate-800">{exif?.fNumber || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">ISO</span>
                  <span className="font-mono font-bold text-slate-800">{exif?.iso || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Focal Length</span>
                  <span className="font-mono font-bold text-slate-800">{exif?.focalLength || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* GPS Location (if detected) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-red-500" /> GPS Coordinates
              </span>

              {exif?.gps?.latitude && exif?.gps?.longitude ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">
                      {exif.gps.latitude.toFixed(6)}, {exif.gps.longitude.toFixed(6)}
                    </span>
                    <span className="text-[10px] text-slate-400">Embedded Geolocation Coordinates</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${exif.gps.latitude},${exif.gps.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg flex items-center gap-1 transition-colors text-xs"
                  >
                    View Map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No GPS coordinates found in this image (Location data was stripped or camera had location services turned off).
                </p>
              )}
            </div>
          </div>

          {/* Image Stage Preview (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">
              Photo Preview
            </span>

            <div className="min-h-[380px] bg-slate-950 rounded-xl p-4 flex items-center justify-center border border-slate-800">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Inspected File"
                  className="max-h-[50vh] max-w-full object-contain rounded shadow-2xl"
                />
              )}
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>File Name:</span>
                <span className="font-mono text-slate-700">{file.name}</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="font-mono text-slate-700">{FileEngine.formatBytes(file.size)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
