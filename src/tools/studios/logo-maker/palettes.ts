import { CanvasPreset } from './types';

export interface LogoColorPalette {
  id: string;
  name: string;
  category: 'Corporate' | 'Modern' | 'Luxury' | 'Nature' | 'Creative' | 'Food' | 'Monochrome';
  colors: string[]; // [Primary, Secondary, Accent, DarkNeutral, LightNeutral]
  gradient: {
    start: string;
    end: string;
    type?: 'linear' | 'radial';
  };
}

export const LOGO_PALETTES: LogoColorPalette[] = [
  {
    id: 'pal-corp-blue',
    name: 'Corporate Blue',
    category: 'Corporate',
    colors: ['#1e40af', '#3b82f6', '#60a5fa', '#0f172a', '#f8fafc'],
    gradient: { start: '#1e3a8a', end: '#3b82f6' },
  },
  {
    id: 'pal-imperial-gold',
    name: 'Imperial Gold & Onyx',
    category: 'Luxury',
    colors: ['#ca8a04', '#eab308', '#fef08a', '#18181b', '#fafaf9'],
    gradient: { start: '#eab308', end: '#a16207' },
  },
  {
    id: 'pal-modern-tech',
    name: 'Modern Cybertech',
    category: 'Modern',
    colors: ['#0284c7', '#06b6d4', '#6366f1', '#090d16', '#f0fdf4'],
    gradient: { start: '#0284c7', end: '#06b6d4' },
  },
  {
    id: 'pal-minimalist-noir',
    name: 'Minimalist Noir',
    category: 'Monochrome',
    colors: ['#09090b', '#27272a', '#71717a', '#000000', '#ffffff'],
    gradient: { start: '#18181b', end: '#27272a' },
  },
  {
    id: 'pal-solar-energy',
    name: 'Solar Crimson Flame',
    category: 'Creative',
    colors: ['#dc2626', '#ea580c', '#f59e0b', '#450a0a', '#fff7ed'],
    gradient: { start: '#dc2626', end: '#ea580c' },
  },
  {
    id: 'pal-emerald-canopy',
    name: 'Emerald Forest',
    category: 'Nature',
    colors: ['#15803d', '#22c55e', '#86efac', '#052e16', '#f0fdf4'],
    gradient: { start: '#15803d', end: '#22c55e' },
  },
  {
    id: 'pal-neon-violet',
    name: 'Neon Cyberpunk',
    category: 'Creative',
    colors: ['#9333ea', '#c084fc', '#06b6d4', '#0f051d', '#fae8ff'],
    gradient: { start: '#9333ea', end: '#3b82f6' },
  },
  {
    id: 'pal-artisan-roast',
    name: 'Artisan Espresso',
    category: 'Food',
    colors: ['#78350f', '#b45309', '#d97706', '#291809', '#fef3c7'],
    gradient: { start: '#78350f', end: '#b45309' },
  },
  {
    id: 'pal-pacific-teal',
    name: 'Pacific Coral Teal',
    category: 'Nature',
    colors: ['#0d9488', '#14b8a6', '#2dd4bf', '#042f2e', '#f0fdfa'],
    gradient: { start: '#0f766e', end: '#14b8a6' },
  },
  {
    id: 'pal-rose-couture',
    name: 'Rose Gold Atelier',
    category: 'Luxury',
    colors: ['#e11d48', '#fb7185', '#fda4af', '#4c0519', '#fff1f2'],
    gradient: { start: '#be123c', end: '#fb7185' },
  },
  {
    id: 'pal-slate-titanium',
    name: 'Titanium Industrial',
    category: 'Corporate',
    colors: ['#475569', '#64748b', '#94a3b8', '#0f172a', '#f1f5f9'],
    gradient: { start: '#334155', end: '#64748b' },
  },
];

export interface FontDefinition {
  name: string;
  family: string;
  label: string;
  category: 'Sans Serif' | 'Serif' | 'Display' | 'Monospace' | 'Curved/Vintage';
  weight: string;
}

export const POPULAR_FONTS: FontDefinition[] = [
  // Sans-Serif
  { name: 'Inter', family: 'Inter, sans-serif', label: 'Inter', category: 'Sans Serif', weight: '400, 600, 700, 900' },
  { name: 'Roboto', family: 'Roboto, sans-serif', label: 'Roboto', category: 'Sans Serif', weight: '400, 500, 700, 900' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', label: 'Montserrat', category: 'Sans Serif', weight: '500, 700, 900' },
  { name: 'Poppins', family: 'Poppins, sans-serif', label: 'Poppins', category: 'Sans Serif', weight: '400, 600, 800' },
  { name: 'Outfit', family: 'Outfit, sans-serif', label: 'Outfit', category: 'Sans Serif', weight: '600, 800, 900' },
  
  // Serif & Luxury
  { name: 'Playfair Display', family: 'Playfair Display, serif', label: 'Playfair Display', category: 'Serif', weight: '600, 700, 900' },
  { name: 'Cinzel', family: 'Cinzel, serif', label: 'Cinzel Roman', category: 'Serif', weight: '600, 700, 900' },
  { name: 'Merriweather', family: 'Merriweather, serif', label: 'Merriweather', category: 'Serif', weight: '400, 700, 900' },

  // Display & Bold
  { name: 'Oswald', family: 'Oswald, sans-serif', label: 'Oswald Condensed', category: 'Display', weight: '600, 700' },
  { name: 'Space Grotesk', family: 'Space Grotesk, sans-serif', label: 'Space Grotesk', category: 'Display', weight: '600, 700' },

  // Monospace
  { name: 'Fira Code', family: 'Fira Code, monospace', label: 'Fira Code', category: 'Monospace', weight: '500, 700' },
];

export const CANVAS_PRESETS: CanvasPreset[] = [
  // BRANDING
  { id: 'p-brand-sq-800', name: 'Primary Logo (Square)', category: 'Branding', width: 800, height: 800, ratio: '1:1', description: 'Standard high-res square logo master' },
  { id: 'p-brand-sq-1024', name: 'High-Res Master (1024)', category: 'Branding', width: 1024, height: 1024, ratio: '1:1', description: 'Ultra crisp vector layout' },
  { id: 'p-brand-sq-2048', name: 'Ultra-HD Master (2048)', category: 'Branding', width: 2048, height: 2048, ratio: '1:1', description: 'Production print quality' },
  { id: 'p-brand-horizontal', name: 'Horizontal Lockup', category: 'Branding', width: 1200, height: 400, ratio: '3:1', description: 'Logo symbol alongside brand wordmark' },
  { id: 'p-brand-vertical', name: 'Vertical Stacked Logo', category: 'Branding', width: 600, height: 800, ratio: '3:4', description: 'Centered symbol atop bold text' },
  { id: 'p-brand-iconmark', name: 'Icon Mark / Monogram', category: 'Branding', width: 512, height: 512, ratio: '1:1', description: 'Standalone symbol or lettermark' },
  { id: 'p-brand-favicon', name: 'Favicon / Web Icon', category: 'Branding', width: 256, height: 256, ratio: '1:1', description: 'Browser tab and bookmark icon' },
  { id: 'p-brand-badge', name: 'Badge / Circular Seal', category: 'Branding', width: 900, height: 900, ratio: '1:1', description: 'Vintage emblem and certification stamp' },

  // SOCIAL MEDIA
  { id: 'p-soc-ig-profile', name: 'Instagram Profile', category: 'Social Media', width: 320, height: 320, ratio: '1:1', description: 'Circular cropped profile avatar' },
  { id: 'p-soc-ig-post', name: 'Instagram Post (Square)', category: 'Social Media', width: 1080, height: 1080, ratio: '1:1', description: 'Feed announcement graphic' },
  { id: 'p-soc-ig-story', name: 'Instagram / TikTok Story', category: 'Social Media', width: 1080, height: 1920, ratio: '9:16', description: 'Vertical full-screen splash' },
  { id: 'p-soc-fb-profile', name: 'Facebook Profile Picture', category: 'Social Media', width: 720, height: 720, ratio: '1:1', description: 'Page and group avatar' },
  { id: 'p-soc-fb-cover', name: 'Facebook Cover Banner', category: 'Social Media', width: 1200, height: 630, ratio: '1.91:1', description: 'Page header banner' },
  { id: 'p-soc-yt-icon', name: 'YouTube Channel Icon', category: 'Social Media', width: 800, height: 800, ratio: '1:1', description: 'Channel avatar' },
  { id: 'p-soc-yt-banner', name: 'YouTube Channel Banner', category: 'Social Media', width: 2560, height: 1440, ratio: '16:9', description: 'Channel top artwork' },
  { id: 'p-soc-li-profile', name: 'LinkedIn Company Logo', category: 'Social Media', width: 400, height: 400, ratio: '1:1', description: 'Company page square avatar' },
  { id: 'p-soc-li-banner', name: 'LinkedIn Cover Banner', category: 'Social Media', width: 1584, height: 396, ratio: '4:1', description: 'Professional background cover' },
  { id: 'p-soc-x-profile', name: 'X / Twitter Profile', category: 'Social Media', width: 400, height: 400, ratio: '1:1', description: 'Square avatar' },
  { id: 'p-soc-wa-biz', name: 'WhatsApp Business Profile', category: 'Social Media', width: 500, height: 500, ratio: '1:1', description: 'WhatsApp Business avatar' },

  // BUSINESS
  { id: 'p-biz-website-header', name: 'Website Nav Header', category: 'Business', width: 900, height: 250, ratio: '3.6:1', description: 'Top navigation bar transparent logo' },
  { id: 'p-biz-email-sig', name: 'Email Signature Logo', category: 'Business', width: 600, height: 200, ratio: '3:1', description: 'Corporate email footer mark' },
  { id: 'p-biz-card', name: 'Business Card (Horizontal)', category: 'Business', width: 1050, height: 600, ratio: '7:4', description: '3.5 x 2 inch print standard @ 300dpi' },
  { id: 'p-biz-letterhead', name: 'Letterhead Banner', category: 'Business', width: 1200, height: 350, ratio: '3.4:1', description: 'A4 / US Letter document header' },
  { id: 'p-biz-invoice', name: 'Invoice / Receipt Stamp', category: 'Business', width: 450, height: 200, ratio: '2.25:1', description: 'Clean printable billing mark' },
  { id: 'p-biz-app-icon', name: 'iOS / Android App Icon', category: 'Business', width: 1024, height: 1024, ratio: '1:1', description: 'App Store & Play Store master icon' },
];

/**
 * Converts real-world units (in, cm, mm) to pixels based on standard print DPI (300)
 */
export function convertUnitToPx(val: number, unit: 'px' | 'in' | 'cm' | 'mm', dpi = 300): number {
  switch (unit) {
    case 'in':
      return Math.round(val * dpi);
    case 'cm':
      return Math.round((val / 2.54) * dpi);
    case 'mm':
      return Math.round((val / 25.4) * dpi);
    case 'px':
    default:
      return Math.round(val);
  }
}
