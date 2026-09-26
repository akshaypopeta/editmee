export type FontCategory =
  | 'All'
  | 'Sans Serif'
  | 'Serif'
  | 'Display'
  | 'Luxury & Elegant'
  | 'Geometric & Minimal'
  | 'Bold & Heavy'
  | 'Futuristic & Tech'
  | 'Gaming & Sports'
  | 'Script & Handwritten'
  | 'Vintage & Retro'
  | 'Monospace';

export interface LogoFont {
  name: string;
  family: string;
  category: FontCategory;
  subcategory?: string;
  weights: string;
  tags: string[];
  sampleText?: string;
  googleFontQuery?: string; // e.g. "Cinzel:wght@400;700;900"
}

export const LOGO_FONTS: LogoFont[] = [
  // --- LUXURY & ELEGANT ---
  {
    name: 'Cinzel',
    family: "'Cinzel', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Roman Classic',
    weights: '400, 600, 700, 900',
    tags: ['luxury', 'roman', 'chiseled', 'regal', 'heritage', 'monogram'],
    sampleText: 'AUREUS',
    googleFontQuery: 'Cinzel:wght@400;600;700;900',
  },
  {
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Editorial',
    weights: '400, 600, 700, 900',
    tags: ['fashion', 'haute', 'editorial', 'vogue', 'boutique', 'serif'],
    sampleText: 'VOGUE',
    googleFontQuery: 'Playfair+Display:wght@400;600;700;900',
  },
  {
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Traditional Serif',
    weights: '400, 600, 700',
    tags: ['literary', 'refined', 'royal', 'jewelry', 'delicate'],
    sampleText: 'ATELIER',
    googleFontQuery: 'Cormorant+Garamond:wght@400;600;700',
  },
  {
    name: 'Bodoni Moda',
    family: "'Bodoni Moda', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Didone',
    weights: '500, 700, 900',
    tags: ['high-contrast', 'italian', 'couture', 'perfume', 'luxury'],
    sampleText: 'MODA',
    googleFontQuery: 'Bodoni+Moda:wght@500;700;900',
  },
  {
    name: 'Prata',
    family: "'Prata', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Didone Modern',
    weights: '400',
    tags: ['elegance', 'clean', 'fashion', 'cosmetics', 'chic'],
    sampleText: 'LUMEN',
    googleFontQuery: 'Prata',
  },
  {
    name: 'Marcellus',
    family: "'Marcellus', serif",
    category: 'Luxury & Elegant',
    subcategory: 'Roman Classical',
    weights: '400',
    tags: ['flair', 'sculpted', 'monumental', 'architecture', 'clean'],
    sampleText: 'MARCELLUS',
    googleFontQuery: 'Marcellus',
  },

  // --- SANS SERIF & MODERN ---
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Neo-Grotesque',
    weights: '400, 600, 700, 900',
    tags: ['ui', 'clean', 'swiss', 'modern', 'neutral', 'tech'],
    sampleText: 'INTER',
    googleFontQuery: 'Inter:wght@400;600;700;900',
  },
  {
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Geometric Sans',
    weights: '400, 600, 800, 900',
    tags: ['urban', 'versatile', 'bold', 'branding', 'geometric'],
    sampleText: 'MONTSERRAT',
    googleFontQuery: 'Montserrat:wght@400;600;800;900',
  },
  {
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Modern Geometric',
    weights: '400, 600, 800, 900',
    tags: ['fintech', 'minimal', 'startup', 'clean', 'app'],
    sampleText: 'OUTFIT',
    googleFontQuery: 'Outfit:wght@400;600;800;900',
  },
  {
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Warm Geometric',
    weights: '500, 700, 800',
    tags: ['friendly', 'corporate', 'modern', 'clarity'],
    sampleText: 'JAKARTA',
    googleFontQuery: 'Plus+Jakarta+Sans:wght@500;700;800',
  },
  {
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Circular Geometric',
    weights: '400, 600, 700, 800',
    tags: ['circular', 'open', 'friendly', 'digital', 'consumer'],
    sampleText: 'POPPINS',
    googleFontQuery: 'Poppins:wght@400;600;700;800',
  },
  {
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Low Contrast',
    weights: '500, 700, 900',
    tags: ['editorial', 'sharp', 'tech', 'clean'],
    sampleText: 'DMSANS',
    googleFontQuery: 'DM+Sans:wght@500;700;900',
  },
  {
    name: 'Manrope',
    family: "'Manrope', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Semi-Geometric',
    weights: '500, 700, 800',
    tags: ['balanced', 'modern', 'bold', 'tech', 'software'],
    sampleText: 'MANROPE',
    googleFontQuery: 'Manrope:wght@500;700;800',
  },
  {
    name: 'Raleway',
    family: "'Raleway', sans-serif",
    category: 'Sans Serif',
    subcategory: 'Neo-Grotesque',
    weights: '400, 600, 800, 900',
    tags: ['stylish', 'w-crossing', 'fashion', 'hotel', 'dining'],
    sampleText: 'RALEWAY',
    googleFontQuery: 'Raleway:wght@400;600;800;900',
  },

  // --- GEOMETRIC & MINIMAL ---
  {
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'Geometric & Minimal',
    subcategory: 'Tech Monospaced Flavour',
    weights: '500, 700',
    tags: ['crypto', 'web3', 'raw', 'experimental', 'brutalist'],
    sampleText: 'SPACE',
    googleFontQuery: 'Space+Grotesk:wght@500;700',
  },
  {
    name: 'Syne',
    family: "'Syne', sans-serif",
    category: 'Geometric & Minimal',
    subcategory: 'Expansive Display',
    weights: '600, 700, 800',
    tags: ['wide', 'art', 'curator', 'studio', 'brutalist', 'ultra-bold'],
    sampleText: 'SYNE',
    googleFontQuery: 'Syne:wght@600;700;800',
  },
  {
    name: 'Comfortaa',
    family: "'Comfortaa', cursive",
    category: 'Geometric & Minimal',
    subcategory: 'Rounded Minimal',
    weights: '500, 700',
    tags: ['soft', 'smooth', 'wellness', 'childcare', 'organic'],
    sampleText: 'COMFORT',
    googleFontQuery: 'Comfortaa:wght@500;700',
  },
  {
    name: 'Quicksand',
    family: "'Quicksand', sans-serif",
    category: 'Geometric & Minimal',
    subcategory: 'Rounded Sans',
    weights: '500, 700',
    tags: ['modern', 'friendly', 'round', 'clean', 'app'],
    sampleText: 'QUICK',
    googleFontQuery: 'Quicksand:wght@500;700',
  },
  {
    name: 'Josefin Sans',
    family: "'Josefin Sans', sans-serif",
    category: 'Geometric & Minimal',
    subcategory: 'Vintage Geometric',
    weights: '400, 600, 700',
    tags: ['scandinavian', 'tall', 'light', 'nordic', 'interior'],
    sampleText: 'JOSEFIN',
    googleFontQuery: 'Josefin+Sans:wght@400;600;700',
  },
  {
    name: 'Tenor Sans',
    family: "'Tenor Sans', sans-serif",
    category: 'Geometric & Minimal',
    subcategory: 'Humanist Minimal',
    weights: '400',
    tags: ['cosmetic', 'spa', 'skincare', 'quiet', 'chic'],
    sampleText: 'TENOR',
    googleFontQuery: 'Tenor+Sans',
  },

  // --- FUTURISTIC & TECH ---
  {
    name: 'Orbitron',
    family: "'Orbitron', sans-serif",
    category: 'Futuristic & Tech',
    subcategory: 'Sci-Fi Display',
    weights: '600, 800, 900',
    tags: ['cyberpunk', 'aerospace', 'robotics', 'ai', 'angular'],
    sampleText: 'ORBITRON',
    googleFontQuery: 'Orbitron:wght@600;800;900',
  },
  {
    name: 'Exo 2',
    family: "'Exo 2', sans-serif",
    category: 'Futuristic & Tech',
    subcategory: 'Techno Geometric',
    weights: '500, 700, 900',
    tags: ['streamlined', 'automotive', 'speed', 'cyber', 'tech'],
    sampleText: 'EXO',
    googleFontQuery: 'Exo+2:wght@500;700;900',
  },
  {
    name: 'Michroma',
    family: "'Michroma', sans-serif",
    category: 'Futuristic & Tech',
    subcategory: 'Microgramma Style',
    weights: '400',
    tags: ['wide', 'squircle', 'motorsport', 'aerospace', 'retro-future'],
    sampleText: 'MICHROMA',
    googleFontQuery: 'Michroma',
  },
  {
    name: 'Audiowide',
    family: "'Audiowide', cursive",
    category: 'Futuristic & Tech',
    subcategory: 'Cyberpunk',
    weights: '400',
    tags: ['gaming', 'synthwave', 'techno', 'electric', 'arcade'],
    sampleText: 'AUDIO',
    googleFontQuery: 'Audiowide',
  },
  {
    name: 'Chakra Petch',
    family: "'Chakra Petch', sans-serif",
    category: 'Futuristic & Tech',
    subcategory: 'Mechanical',
    weights: '500, 700',
    tags: ['mech', 'industrial', 'hardware', 'gaming', 'angular'],
    sampleText: 'CHAKRA',
    googleFontQuery: 'Chakra+Petch:wght@500;700',
  },
  {
    name: 'Rajdhani',
    family: "'Rajdhani', sans-serif",
    category: 'Futuristic & Tech',
    subcategory: 'Condensed Square',
    weights: '600, 700',
    tags: ['military', 'esports', 'hud', 'interface', 'compact'],
    sampleText: 'RAJDHANI',
    googleFontQuery: 'Rajdhani:wght@600;700',
  },

  // --- BOLD & HEAVY / DISPLAY ---
  {
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    category: 'Bold & Heavy',
    subcategory: 'Condensed Gothic',
    weights: '500, 600, 700',
    tags: ['compact', 'impact', 'news', 'athletic', 'bold', 'heavy'],
    sampleText: 'OSWALD',
    googleFontQuery: 'Oswald:wght@500;600;700',
  },
  {
    name: 'Bebas Neue',
    family: "'Bebas Neue', cursive",
    category: 'Bold & Heavy',
    subcategory: 'Headline Condensed',
    weights: '400',
    tags: ['poster', 'powerful', 'gym', 'apparel', 'tall'],
    sampleText: 'BEBAS',
    googleFontQuery: 'Bebas+Neue',
  },
  {
    name: 'Anton',
    family: "'Anton', sans-serif",
    category: 'Bold & Heavy',
    subcategory: 'Grotesque Heavy',
    weights: '400',
    tags: ['punchy', 'heavy', 'industrial', 'construction', 'loud'],
    sampleText: 'ANTON',
    googleFontQuery: 'Anton',
  },
  {
    name: 'Black Han Sans',
    family: "'Black Han Sans', sans-serif",
    category: 'Bold & Heavy',
    subcategory: 'Ultra Heavy Black',
    weights: '400',
    tags: ['massive', 'solid', 'blackweight', 'block', 'power'],
    sampleText: 'BLOCK',
    googleFontQuery: 'Black+Han+Sans',
  },
  {
    name: 'Archivo Black',
    family: "'Archivo Black', sans-serif",
    category: 'Bold & Heavy',
    subcategory: 'Chunky Grotesque',
    weights: '400',
    tags: ['advertising', 'bold', 'automotive', 'strong', 'solid'],
    sampleText: 'ARCHIVO',
    googleFontQuery: 'Archivo+Black',
  },
  {
    name: 'Teko',
    family: "'Teko', sans-serif",
    category: 'Bold & Heavy',
    subcategory: 'Ultra Condensed',
    weights: '600, 700',
    tags: ['tall', 'narrow', 'extreme', 'streetwear', 'impact'],
    sampleText: 'TEKO',
    googleFontQuery: 'Teko:wght@600;700',
  },

  // --- GAMING & SPORTS ---
  {
    name: 'Russo One',
    family: "'Russo One', sans-serif",
    category: 'Gaming & Sports',
    subcategory: 'Chunky Athletic',
    weights: '400',
    tags: ['esports', 'stadium', 'mascot', 'heavy', 'angular'],
    sampleText: 'RUSSO',
    googleFontQuery: 'Russo+One',
  },
  {
    name: 'Righteous',
    family: "'Righteous', cursive",
    category: 'Gaming & Sports',
    subcategory: 'Speed Curved',
    weights: '400',
    tags: ['retro-gaming', 'streamer', 'dynamic', 'racing'],
    sampleText: 'RIGHTEOUS',
    googleFontQuery: 'Righteous',
  },
  {
    name: 'Kanit',
    family: "'Kanit', sans-serif",
    category: 'Gaming & Sports',
    subcategory: 'Speed Slanted',
    weights: '600, 700, 800',
    tags: ['motorsport', 'fast', 'athletic', 'modern-sport', 'bold'],
    sampleText: 'KANIT',
    googleFontQuery: 'Kanit:wght@600;700;800',
  },
  {
    name: 'Black Ops One',
    family: "'Black Ops One', cursive",
    category: 'Gaming & Sports',
    subcategory: 'Stencil Military',
    weights: '400',
    tags: ['combat', 'shooter', 'survival', 'tactical', 'heavy'],
    sampleText: 'COMMANDO',
    googleFontQuery: 'Black+Ops+One',
  },
  {
    name: 'Bungee',
    family: "'Bungee', cursive",
    category: 'Gaming & Sports',
    subcategory: 'Urban Signage',
    weights: '400',
    tags: ['street', 'skate', 'blocky', 'pop', 'arcade'],
    sampleText: 'BUNGEE',
    googleFontQuery: 'Bungee',
  },

  // --- SERIF & EDITORIAL ---
  {
    name: 'Merriweather',
    family: "'Merriweather', serif",
    category: 'Serif',
    subcategory: 'Book Serif',
    weights: '400, 700, 900',
    tags: ['trust', 'heritage', 'consulting', 'banking', 'solid'],
    sampleText: 'MERRIWEATHER',
    googleFontQuery: 'Merriweather:wght@400;700;900',
  },
  {
    name: 'Lora',
    family: "'Lora', serif",
    category: 'Serif',
    subcategory: 'Contemporary Serif',
    weights: '500, 600, 700',
    tags: ['organic', 'calligraphic', 'magazine', 'poetry', 'winery'],
    sampleText: 'LORA',
    googleFontQuery: 'Lora:wght@500;600;700',
  },
  {
    name: 'Abril Fatface',
    family: "'Abril Fatface', cursive",
    category: 'Serif',
    subcategory: 'Didone Fat Face',
    weights: '400',
    tags: ['heavy-contrast', 'vintage-titling', 'bistro', 'restaurant'],
    sampleText: 'ABRIL',
    googleFontQuery: 'Abril+Fatface',
  },
  {
    name: 'Castoro Titling',
    family: "'Castoro Titling', serif",
    category: 'Serif',
    subcategory: 'Classical Titling',
    weights: '400',
    tags: ['statuesque', 'formal', 'law', 'diplomacy', 'roman'],
    sampleText: 'CASTORO',
    googleFontQuery: 'Castoro+Titling',
  },
  {
    name: 'Domine',
    family: "'Domine', serif",
    category: 'Serif',
    subcategory: 'Robust Antiqua',
    weights: '500, 700',
    tags: ['sturdy', 'reliable', 'publishing', 'classic'],
    sampleText: 'DOMINE',
    googleFontQuery: 'Domine:wght@500;700',
  },

  // --- SCRIPT & HANDWRITTEN ---
  {
    name: 'Great Vibes',
    family: "'Great Vibes', cursive",
    category: 'Script & Handwritten',
    subcategory: 'Calligraphic Script',
    weights: '400',
    tags: ['wedding', 'luxury', 'signature', 'flowing', 'flourish'],
    sampleText: 'Elegance',
    googleFontQuery: 'Great+Vibes',
  },
  {
    name: 'Satisfy',
    family: "'Satisfy', cursive",
    category: 'Script & Handwritten',
    subcategory: 'Brush Casual',
    weights: '400',
    tags: ['café', 'bakery', 'handcrafted', 'warm', 'friendly'],
    sampleText: 'Satisfy',
    googleFontQuery: 'Satisfy',
  },
  {
    name: 'Alex Brush',
    family: "'Alex Brush', cursive",
    category: 'Script & Handwritten',
    subcategory: 'Formal Penmanship',
    weights: '400',
    tags: ['monogram', 'artisan', 'jewelry', 'parfum', 'chic'],
    sampleText: 'Monogram',
    googleFontQuery: 'Alex+Brush',
  },
  {
    name: 'Sacramento',
    family: "'Sacramento', cursive",
    category: 'Script & Handwritten',
    subcategory: 'Monoline Script',
    weights: '400',
    tags: ['retro-sign', 'diner', 'light', 'clean-script', 'personal'],
    sampleText: 'Sacramento',
    googleFontQuery: 'Sacramento',
  },
  {
    name: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
    category: 'Script & Handwritten',
    subcategory: 'Raw Marker',
    weights: '400',
    tags: ['grunge', 'streetwear', 'festival', 'graffiti', 'bold'],
    sampleText: 'MARKER',
    googleFontQuery: 'Permanent+Marker',
  },

  // --- VINTAGE & RETRO ---
  {
    name: 'Rye',
    family: "'Rye', cursive",
    category: 'Vintage & Retro',
    subcategory: 'Western Slab',
    weights: '400',
    tags: ['saloon', 'distillery', 'whiskey', 'western', 'heritage'],
    sampleText: 'DISTILLERY',
    googleFontQuery: 'Rye',
  },
  {
    name: 'Monoton',
    family: "'Monoton', cursive",
    category: 'Vintage & Retro',
    subcategory: 'Disco Multiline',
    weights: '400',
    tags: ['70s', 'neon-lines', 'retro', 'vinyl', 'funk'],
    sampleText: 'MONOTON',
    googleFontQuery: 'Monoton',
  },
  {
    name: 'Lobster',
    family: "'Lobster', cursive",
    category: 'Vintage & Retro',
    subcategory: 'Vintage Script',
    weights: '400',
    tags: ['diner', 'food-truck', 'seafood', 'classic-bold'],
    sampleText: 'Lobster',
    googleFontQuery: 'Lobster',
  },
  {
    name: 'Shrikhand',
    family: "'Shrikhand', cursive",
    category: 'Vintage & Retro',
    subcategory: 'Retro Display Fat',
    weights: '400',
    tags: ['groovy', 'psychedelic', '60s', 'bold', 'warm'],
    sampleText: 'GROOVY',
    googleFontQuery: 'Shrikhand',
  },
  {
    name: 'UnifrakturMaguntia',
    family: "'UnifrakturMaguntia', cursive",
    category: 'Vintage & Retro',
    subcategory: 'Blackletter Gothic',
    weights: '400',
    tags: ['tattoo', 'gothic', 'beer', 'brewery', 'medieval'],
    sampleText: 'BREWERY',
    googleFontQuery: 'UnifrakturMaguntia',
  },

  // --- MONOSPACE & CODE ---
  {
    name: 'Fira Code',
    family: "'Fira Code', monospace",
    category: 'Monospace',
    subcategory: 'Programming Mono',
    weights: '500, 700',
    tags: ['developer', 'terminal', 'coding', 'data', 'technical'],
    sampleText: 'CODE',
    googleFontQuery: 'Fira+Code:wght@500;700',
  },
  {
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'Monospace',
    subcategory: 'Engineered Mono',
    weights: '500, 700, 800',
    tags: ['cybersecurity', 'analytics', 'fintech', 'modern'],
    sampleText: 'TERMINAL',
    googleFontQuery: 'JetBrains+Mono:wght@500;700;800',
  },
  {
    name: 'Share Tech Mono',
    family: "'Share Tech Mono', monospace",
    category: 'Monospace',
    subcategory: 'Military HUD',
    weights: '400',
    tags: ['radar', 'sensor', 'defense', 'cyber', 'matrix'],
    sampleText: 'SYSTEM',
    googleFontQuery: 'Share+Tech+Mono',
  },
];

export const FONT_CATEGORIES: FontCategory[] = [
  'All',
  'Luxury & Elegant',
  'Sans Serif',
  'Geometric & Minimal',
  'Futuristic & Tech',
  'Bold & Heavy',
  'Gaming & Sports',
  'Serif',
  'Script & Handwritten',
  'Vintage & Retro',
  'Monospace',
];

const loadedFontsSet = new Set<string>();

/**
 * Dynamically loads Google Font on demand so canvas rendering and export
 * render the typography crisply.
 */
export function loadGoogleFont(font: LogoFont) {
  if (!font.googleFontQuery || loadedFontsSet.has(font.name)) return;
  loadedFontsSet.add(font.name);

  if (typeof document === 'undefined') return;

  const fontId = `gfont-${font.name.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFontQuery}&display=swap`;
  document.head.appendChild(link);
}

export const EXPANDED_FONT_LIBRARY = LOGO_FONTS;
