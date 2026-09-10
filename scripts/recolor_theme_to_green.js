const fs = require('fs');
const path = require('path');

console.log('🌿 Redesigning theme colors: Transforming from Navy Blue to Luxury Imperial Emerald & 24K Gold...');

// 1. Process assets/css/style.css
let css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.css'), 'utf8');

// Color map replacements
const replacements = [
  // Primary brand background tokens
  ['--bg-main: #071426;', '--bg-main: #04170e;'],
  ['--bg-secondary: #0b1f3a;', '--bg-secondary: #082517;'],
  ['--bg-card: rgba(11, 31, 58, 0.85);', '--bg-card: rgba(8, 37, 23, 0.84);'],
  ['--bg-card-hover: rgba(16, 44, 82, 0.94);', '--bg-card-hover: rgba(12, 51, 32, 0.94);'],
  ['--navy-deep: #050e1b;', '--navy-deep: #020f09;'],
  ['--navy-dark: #071426;', '--navy-dark: #04170e;'],
  ['--navy-mid: #0b1f3a;', '--navy-mid: #082517;'],
  ['--navy-light: #13335e;', '--navy-light: #0d3823;'],
  ['--navy-accent: #1e4985;', '--navy-accent: #134e32;'],
  
  // Hex color transformations across stylesheets
  [/#071426\b/gi, '#04170e'],
  [/#050e1b\b/gi, '#020f09'],
  [/#0b1f3a\b/gi, '#082517'],
  [/#09182d\b/gi, '#062013'],
  [/#0d274a\b/gi, '#0a2d1c'],
  [/#102c52\b/gi, '#0c3521'],
  [/#13335e\b/gi, '#0e3e27'],
  [/#163b6d\b/gi, '#10492e'],
  [/#1e4985\b/gi, '#145737'],
  [/#2563eb\b/gi, '#16a34a'],
  [/#1d4ed8\b/gi, '#15803d'],
  [/#0284c7\b/gi, '#059669'],
  [/#0369a1\b/gi, '#047857'],
  
  // Translucent RGBA replacements
  [/rgba\(\s*7\s*,\s*20\s*,\s*38\s*,/gi, 'rgba(4, 23, 14,'],
  [/rgba\(\s*5\s*,\s*14\s*,\s*27\s*,/gi, 'rgba(2, 15, 9,'],
  [/rgba\(\s*11\s*,\s*31\s*,\s*58\s*,/gi, 'rgba(8, 37, 23,'],
  [/rgba\(\s*16\s*,\s*44\s*,\s*82\s*,/gi, 'rgba(12, 51, 32,'],
  [/rgba\(\s*19\s*,\s*51\s*,\s*94\s*,/gi, 'rgba(14, 60, 37,'],
  [/rgba\(\s*30\s*,\s*73\s*,\s*133\s*,/gi, 'rgba(20, 87, 55,'],
  [/rgba\(\s*56\s*,\s*189\s*,\s*248\s*,/gi, 'rgba(52, 211, 153,'], // Blue glow to luminous mint-emerald glow
  
  // Specific body background gradient
  [
    /radial-gradient\(circle at 85% 35%, rgba\(19, 51, 94, 0\.5\) 0%, transparent 60%\)/g,
    'radial-gradient(circle at 85% 35%, rgba(16, 185, 129, 0.22) 0%, transparent 60%)'
  ],
  [
    /radial-gradient\(circle at 20% 90%, rgba\(19, 51, 94, 0\.45\) 0%, transparent 50%\)/g,
    'radial-gradient(circle at 20% 90%, rgba(34, 197, 94, 0.18) 0%, transparent 50%)'
  ]
];

replacements.forEach(([from, to]) => {
  if (typeof from === 'string') {
    css = css.split(from).join(to);
  } else if (from instanceof RegExp) {
    css = css.replace(from, to);
  }
});

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.css'), css, 'utf8');
console.log('✅ Updated assets/css/style.css with Emerald & 24K Gold design system');

// 2. Process admin/admin.css
let adminCss = fs.readFileSync(path.join(__dirname, '..', 'admin', 'admin.css'), 'utf8');

const adminReplacements = [
  ['--adm-bg: #071426;', '--adm-bg: #04170e;'],
  ['--adm-bg-secondary: #0b1f3a;', '--adm-bg-secondary: #082517;'],
  ['--adm-sidebar: #050e1b;', '--adm-sidebar: #020f09;'],
  ['--adm-sidebar-hover: #0b1f3a;', '--adm-sidebar-hover: #082517;'],
  ['--adm-header: rgba(7, 20, 38, 0.88);', '--adm-header: rgba(4, 23, 14, 0.88);'],
  ['--adm-card: rgba(11, 31, 58, 0.8);', '--adm-card: rgba(8, 37, 23, 0.8);'],
  ['--adm-card-hover: rgba(16, 44, 82, 0.92);', '--adm-card-hover: rgba(12, 51, 32, 0.92);'],
  ['--adm-modal-bg: #09182d;', '--adm-modal-bg: #062013;'],
  ['--adm-input-bg: rgba(5, 14, 27, 0.65);', '--adm-input-bg: rgba(2, 15, 9, 0.65);'],
  ['--adm-blue: #38bdf8;', '--adm-blue: #34d399;'],
  ['--adm-blue-dark: #0284c7;', '--adm-blue-dark: #059669;'],
  ['--adm-blue-glow: 0 0 20px rgba(56, 189, 248, 0.35);', '--adm-blue-glow: 0 0 20px rgba(52, 211, 153, 0.35);'],
  ['--adm-border-blue: rgba(56, 189, 248, 0.3);', '--adm-border-blue: rgba(52, 211, 153, 0.3);'],
  
  [/#071426\b/gi, '#04170e'],
  [/#050e1b\b/gi, '#020f09'],
  [/#0b1f3a\b/gi, '#082517'],
  [/#09182d\b/gi, '#062013'],
  [/#102c52\b/gi, '#0c3521'],
  [/#13335e\b/gi, '#0e3e27'],
  [/#1e4985\b/gi, '#145737'],
  [/rgba\(\s*7\s*,\s*20\s*,\s*38\s*,/gi, 'rgba(4, 23, 14,'],
  [/rgba\(\s*5\s*,\s*14\s*,\s*27\s*,/gi, 'rgba(2, 15, 9,'],
  [/rgba\(\s*11\s*,\s*31\s*,\s*58\s*,/gi, 'rgba(8, 37, 23,'],
  [/rgba\(\s*16\s*,\s*44\s*,\s*82\s*,/gi, 'rgba(12, 51, 32,'],
  [/rgba\(\s*56\s*,\s*189\s*,\s*248\s*,/gi, 'rgba(52, 211, 153,']
];

adminReplacements.forEach(([from, to]) => {
  if (typeof from === 'string') {
    adminCss = adminCss.split(from).join(to);
  } else if (from instanceof RegExp) {
    adminCss = adminCss.replace(from, to);
  }
});

fs.writeFileSync(path.join(__dirname, '..', 'admin', 'admin.css'), adminCss, 'utf8');
console.log('✅ Updated admin/admin.css with Emerald & Gold theme');

// 3. Process index.html theme-color meta tag
let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
html = html.replace(/<meta name="theme-color" content="#[0-9a-fA-F]+">/g, '<meta name="theme-color" content="#04170e">');
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
console.log('✅ Updated index.html theme-color');

console.log('✨ Full color redesign completed successfully!');
