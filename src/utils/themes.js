// ─── LIFE OS THEME SYSTEM ───────────────────────────────────
// 5 themes: Midnight (default), Ocean, Forest, Sunset, Blossom (pink)

export const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    preview: ['#080810', '#8b5cf6', '#06b6d4'],
    vars: {
      '--bg-primary': '#080810',
      '--bg-secondary': '#0e0e1a',
      '--bg-card': 'rgba(255,255,255,0.04)',
      '--border': 'rgba(255,255,255,0.08)',
      '--text-primary': '#f0f0ff',
      '--text-muted': 'rgba(240,240,255,0.45)',
      '--accent': '#7c3aed',
      '--accent-light': '#a78bfa',
      '--btn-primary-bg': 'linear-gradient(135deg, #7c3aed, #5b21b6)',
      '--btn-primary-color': '#ffffff',
      '--btn-primary-border': 'rgba(139,92,246,0.4)',
      '--card-hover-border': 'rgba(139,92,246,0.25)',
      '--xp-bar': 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
      '--nav-active-bg': 'rgba(139,92,246,0.12)',
      '--nav-active-color': '#a78bfa',
      '--nav-active-border': 'rgba(139,92,246,0.2)',
      '--scrollbar': 'rgba(139,92,246,0.4)',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    preview: ['#030d1a', '#0ea5e9', '#06b6d4'],
    vars: {
      '--bg-primary': '#030d1a',
      '--bg-secondary': '#071525',
      '--bg-card': 'rgba(14,165,233,0.06)',
      '--border': 'rgba(14,165,233,0.12)',
      '--text-primary': '#e0f2fe',
      '--text-muted': 'rgba(224,242,254,0.45)',
      '--accent': '#0284c7',
      '--accent-light': '#38bdf8',
      '--btn-primary-bg': 'linear-gradient(135deg, #0284c7, #0369a1)',
      '--btn-primary-color': '#ffffff',
      '--btn-primary-border': 'rgba(14,165,233,0.4)',
      '--card-hover-border': 'rgba(14,165,233,0.3)',
      '--xp-bar': 'linear-gradient(90deg, #06b6d4, #0ea5e9)',
      '--nav-active-bg': 'rgba(14,165,233,0.12)',
      '--nav-active-color': '#38bdf8',
      '--nav-active-border': 'rgba(14,165,233,0.2)',
      '--scrollbar': 'rgba(14,165,233,0.4)',
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    preview: ['#041a0a', '#16a34a', '#4ade80'],
    vars: {
      '--bg-primary': '#041a0a',
      '--bg-secondary': '#071f0e',
      '--bg-card': 'rgba(22,163,74,0.06)',
      '--border': 'rgba(22,163,74,0.12)',
      '--text-primary': '#dcfce7',
      '--text-muted': 'rgba(220,252,231,0.45)',
      '--accent': '#16a34a',
      '--accent-light': '#4ade80',
      '--btn-primary-bg': 'linear-gradient(135deg, #16a34a, #15803d)',
      '--btn-primary-color': '#ffffff',
      '--btn-primary-border': 'rgba(22,163,74,0.4)',
      '--card-hover-border': 'rgba(22,163,74,0.3)',
      '--xp-bar': 'linear-gradient(90deg, #4ade80, #16a34a)',
      '--nav-active-bg': 'rgba(22,163,74,0.12)',
      '--nav-active-color': '#4ade80',
      '--nav-active-border': 'rgba(22,163,74,0.2)',
      '--scrollbar': 'rgba(22,163,74,0.4)',
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    preview: ['#1a0a03', '#ea580c', '#f59e0b'],
    vars: {
      '--bg-primary': '#1a0a03',
      '--bg-secondary': '#1f1007',
      '--bg-card': 'rgba(234,88,12,0.06)',
      '--border': 'rgba(234,88,12,0.12)',
      '--text-primary': '#fff7ed',
      '--text-muted': 'rgba(255,247,237,0.45)',
      '--accent': '#ea580c',
      '--accent-light': '#fb923c',
      '--btn-primary-bg': 'linear-gradient(135deg, #ea580c, #c2410c)',
      '--btn-primary-color': '#ffffff',
      '--btn-primary-border': 'rgba(234,88,12,0.4)',
      '--card-hover-border': 'rgba(234,88,12,0.3)',
      '--xp-bar': 'linear-gradient(90deg, #f59e0b, #ea580c)',
      '--nav-active-bg': 'rgba(234,88,12,0.12)',
      '--nav-active-color': '#fb923c',
      '--nav-active-border': 'rgba(234,88,12,0.2)',
      '--scrollbar': 'rgba(234,88,12,0.4)',
    }
  },
  blossom: {
    id: 'blossom',
    name: 'Blossom',
    emoji: '🌸',
    preview: ['#fff0f5', '#f9a8d4', '#fb7185'],
    vars: {
      '--bg-primary': '#fff5f7',
      '--bg-secondary': '#ffffff',
      '--bg-card': 'rgba(255,255,255,0.9)',
      '--border': 'rgba(251,113,133,0.15)',
      '--text-primary': '#1f0a10',
      '--text-muted': 'rgba(31,10,16,0.45)',
      '--accent': '#e11d48',
      '--accent-light': '#fb7185',
      '--btn-primary-bg': 'linear-gradient(135deg, #f43f5e, #e11d48)',
      '--btn-primary-color': '#ffffff',
      '--btn-primary-border': 'rgba(244,63,94,0.4)',
      '--card-hover-border': 'rgba(244,63,94,0.2)',
      '--xp-bar': 'linear-gradient(90deg, #f9a8d4, #f43f5e)',
      '--nav-active-bg': 'rgba(244,63,94,0.08)',
      '--nav-active-color': '#e11d48',
      '--nav-active-border': 'rgba(244,63,94,0.2)',
      '--scrollbar': 'rgba(244,63,94,0.3)',
    }
  },
};

export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.midnight;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  // Toggle blossom class for light mode overrides
  document.documentElement.classList.toggle('blossom', themeId === 'blossom');
  document.documentElement.classList.toggle('dark', themeId !== 'blossom');
}