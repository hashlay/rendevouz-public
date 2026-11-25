import { parseFontForCanvas } from './fontHelper';

function getBgHash(url: string): string {
  if (!url) return '';
  return `hash_${url.length}_${url.slice(-30)}`;
}

const posterImageCache = new Map<string, HTMLImageElement>();

/**
 * Fixed team font colors for Posters Section:
 * - Ash-shukr: Dark Blue (#2b2bc3)
 * - As-sabr: Dark Green (#1b5e20)
 * Applies across all themes by default.
 */
export const getPosterTeamColor = (unitOrTeamName?: string, defaultColor: string = '#34d399', config?: any): string => {
  if (!unitOrTeamName) return defaultColor;
  // If team colors are explicitly disabled, always use default/theme unitColor
  if (config && config.useTeamColors === false) {
    return defaultColor;
  }

  const raw = unitOrTeamName.toString().trim();
  const cleanStr = raw.replace(/[\u064B-\u065F\u0670\u0671]/g, '').replace(/ٱ/g, 'ا');
  const normalized = cleanStr.toLowerCase().replace(/[\s\-_]/g, '');

  // Check custom per-unit colors saved in config
  if (config?.unitColors) {
    if (config.unitColors[raw]) return config.unitColors[raw];
    if (config.unitColors[cleanStr]) return config.unitColors[cleanStr];
    for (const [k, v] of Object.entries(config.unitColors)) {
      const kNorm = k.replace(/[\u064B-\u065F\u0670\u0671]/g, '').replace(/ٱ/g, 'ا').toLowerCase().replace(/[\s\-_]/g, '');
      if (kNorm === normalized) return v as string;
    }
  }

  // Built-in palettes if useTeamColors is active
  if (config?.useTeamColors === true) {
    if (normalized.includes('sirafi') || normalized.includes('seafarer') || normalized.includes('سيرافي')) return '#0284c7';
    if (normalized.includes('tabrizi') || normalized.includes('taraz') || normalized.includes('تبريزي')) return '#d97706';
    if (normalized.includes('zanzibari') || normalized.includes('souq') || normalized.includes('زنجباري')) return '#16a34a';

    // Legacy support
    if (normalized.includes('shukr') || normalized.includes('شكر')) return '#2b2bc3';
    if (normalized.includes('sabr') || normalized.includes('صبر')) return '#1b5e20';
  }

  return defaultColor;
};

export const getPosterDisplayUnitName = (unitOrTeamName?: string, config?: any): string => {
  if (!unitOrTeamName) return '';
  if (!config || config.unitLanguage !== 'ar') return unitOrTeamName;

  const raw = unitOrTeamName.toString().trim();
  const cleanRaw = raw.replace(/[\u064B-\u065F\u0670\u0671]/g, '').replace(/ٱ/g, 'ا');
  const normalized = cleanRaw.toLowerCase().replace(/[\s\-_]/g, '');

  const customNames = config.unitArabicNames || {};

  // Exact custom override match
  if (customNames[raw]) return customNames[raw];
  if (customNames[cleanRaw]) return customNames[cleanRaw];

  // Match Rendezvous Silver Edition teams
  if (normalized.includes('sirafi') || normalized.includes('seafarer') || normalized === 'sir') {
    return customNames['Sirafi Seafarers'] || customNames['sirafi'] || 'TEAM السِّيرَافِي';
  }
  if (normalized.includes('tabrizi') || normalized.includes('taraz') || normalized === 'tab') {
    return customNames['Tabrizi Taraz'] || customNames['tabrizi'] || 'TEAM التَّبْرِيزِي';
  }
  if (normalized.includes('zanzibari') || normalized.includes('souq') || normalized === 'zan') {
    return customNames['Zanzibari Souqs'] || customNames['zanzibari'] || 'TEAM الزَّنْجَبَارِي';
  }

  // Legacy Ash-Shukr / As-Sabr
  if (normalized.includes('shukr') || normalized.includes('شكر') || normalized === 'shk') {
    return customNames['Ash-Shukr'] || customNames['ash-shukr'] || 'TEAM الشُّكْر';
  }
  if (normalized.includes('sabr') || normalized.includes('صبر') || normalized === 'sbr') {
    return customNames['As-Sabr'] || customNames['as-sabr'] || 'TEAM الصَّبْر';
  }

  // Fuzzy lookup in keys
  for (const [k, v] of Object.entries(customNames)) {
    const kClean = k.replace(/[\u064B-\u065F\u0670\u0671]/g, '').replace(/ٱ/g, 'ا');
    if (kClean.toLowerCase().replace(/[\s\-_]/g, '') === normalized) {
      return v as string;
    }
  }

  return raw;
};

export const DEFAULT_POSTER_THEMES = [
  '/themes/theme_green_waves.jpg',
  '/themes/theme_green_cards.jpg',
  '/themes/theme_red_star.jpg'
];

const OLD_THEME_PATTERNS = [
  'theme_brown', 'theme_blue', 'theme_yellow', 'theme_purple',
  'theme_green.jpg', 'theme_phytolore', 'theme_white_brown', 'theme_yellow_scroll'
];

export function isOldDefaultTheme(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  return OLD_THEME_PATTERNS.some(pat => url.includes(pat));
}

export function getDefaultThemeConfig(themeIdx: number = 0): any {
  // Theme 1 (Index 0) - Green Waves
  if (themeIdx === 0) {
    return {
      titleColor: '#ffffff',
      winnerColor: '#ffffff',
      unitColor: '#ffffff',
      titleSize: 36,
      resultLabelText: 'RESULT',
      resultLabelX: 183,
      resultLabelY: 284,
      resultLabelSize: 13,
      resultLabelColor: '#84C75D',
      resultLabelFont: '600 "Sora", sans-serif',
      resultLabelVertical: true,
      resultLabelLineGap: 14,
      resultNumX: 135,
      resultNumY: 375,
      resultNumSize: 145,
      resultNumColor: '#84C75D',
      resultNumFont: '700 "Sora", sans-serif',
      resultNumStyle: 'stroke',
      resultNumStrokeWidth: 3.5,
      categorySize: 28,
      categoryColor: '#ffffff',
      categoryX: 296,
      categoryY: 340,
      categoryFont: '600 "Sora", sans-serif',
      compNameX: 296,
      compNameY: 382,
      compNameSize: 42,
      compNameColor: '#FFAD03',
      compNameFont: '700 "Sora", sans-serif',
      compNameAlign: 'left',
      scriptText: 'mid zone',
      scriptX: 296,
      scriptY: 308,
      scriptSize: 48,
      scriptColor: '#ffffff',
      scriptFont: '"SignPainter", cursive',
      showScriptText: true,
      campusNameX: 540,
      campusNameY: 70,
      campusNameSize: 28,
      campusNameColor: '#ffffff',
      campusNameFont: '600 "Sora", sans-serif',
      showCampusName: false,
      festNameX: 540,
      festNameY: 120,
      festNameSize: 36,
      festNameColor: '#fbbf24',
      festNameFont: '700 "Sora", sans-serif',
      showFestName: false,
      winnerSize: 28,
      unitSize: 18,
      rankSize: 40,
      titleX: 540,
      titleY: 110,
      rank1BadgeX: 180,
      rank1BadgeY: 465,
      rank1NameX: 252,
      rank1NameY: 452,
      rank1UnitX: 252,
      rank1UnitY: 476,
      rank2BadgeX: 180,
      rank2BadgeY: 535,
      rank2NameX: 252,
      rank2NameY: 522,
      rank2UnitX: 252,
      rank2UnitY: 546,
      rank3BadgeX: 180,
      rank3BadgeY: 605,
      rank3NameX: 252,
      rank3NameY: 592,
      rank3UnitX: 252,
      rank3UnitY: 616,
      titleFont: '600 "Sora", sans-serif',
      winnerFont: '600 "Sora", sans-serif',
      unitFont: '400 "Sora", sans-serif',
      rankFont: '600 "Sora", sans-serif',
      fontFamily: '500 "Sora", sans-serif',
      uppercaseNames: false,
      rankBadgeShape: 'none' as 'pill' | 'circle' | 'rectangle' | 'none',
      rankBadgeShapeSize: 20,
      rank1Color: '#ffffff',
      rank2Color: '#ffffff',
      rank3Color: '#ffffff',
      rankTextColor: '#ffffff',
      rank1Text: '01.',
      rank2Text: '02.',
      rank3Text: '03.',
      showDividers: true,
      dividerColor: 'rgba(255, 255, 255, 0.35)',
      dividerStartX: 252,
      dividerEndX: 530,
      showFooter: false,
      showFooterBg: false,
      footerLine1: '',
      footerLine2: '',
      campusNameUppercase: true,
      festNameUppercase: true,
      resultLabelUppercase: true,
      resultNumUppercase: false,
      categoryUppercase: false,
      compNameUppercase: false,
      winnerUppercase: false,
      unitUppercase: false,
      useTeamColors: false,
      unitColors: {} as Record<string, string>,
      unitLanguage: 'en',
      unitArabicNames: {
        'Nexa Mirath': 'NEXA MIRATH',
        'Nexa Faylas': 'NEXA FAYLAS',
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي'
      } as Record<string, string>,
    };
  }

  // Theme 2 (Index 1) - Green 3D Block with 3 Horizontal Cards
  if (themeIdx === 1) {
    return {
      titleColor: '#ffffff',
      winnerColor: '#ffffff',
      unitColor: '#ffffff',
      titleSize: 36,
      resultLabelText: '#Result',
      resultLabelX: 370,
      resultLabelY: 282,
      resultLabelSize: 32,
      resultLabelColor: '#ffffff',
      resultLabelFont: '"SignPainter", cursive',
      resultLabelVertical: false,
      resultNumX: 450,
      resultNumY: 282,
      resultNumSize: 28,
      resultNumColor: '#ffffff',
      resultNumFont: '700 "Sora", sans-serif',
      resultNumStyle: 'fill',
      categorySize: 0,
      categoryColor: '#ffffff',
      categoryX: -9999,
      categoryY: -9999,
      categoryFont: '600 "Sora", sans-serif',
      compNameX: 438,
      compNameY: 315,
      compNameSize: 34,
      compNameColor: '#FFAD03',
      compNameFont: '700 "Sora", sans-serif',
      compNameAlign: 'center',
      scriptText: '',
      scriptX: -9999,
      scriptY: -9999,
      scriptSize: 0,
      scriptColor: '#ffffff',
      scriptFont: '"SignPainter", cursive',
      showScriptText: false,
      campusNameX: 540,
      campusNameY: 70,
      campusNameSize: 28,
      campusNameColor: '#ffffff',
      campusNameFont: '600 "Sora", sans-serif',
      showCampusName: false,
      festNameX: 540,
      festNameY: 120,
      festNameSize: 36,
      festNameColor: '#fbbf24',
      festNameFont: '700 "Sora", sans-serif',
      showFestName: false,
      winnerSize: 30,
      unitSize: 18,
      rankSize: 26,
      titleX: 540,
      titleY: 110,
      rank1BadgeX: 220,
      rank1BadgeY: 366,
      rank1NameX: 220,
      rank1NameY: 412,
      rank1UnitX: 220,
      rank1UnitY: 468,
      rank2BadgeX: 440,
      rank2BadgeY: 366,
      rank2NameX: 440,
      rank2NameY: 412,
      rank2UnitX: 440,
      rank2UnitY: 468,
      rank3BadgeX: 660,
      rank3BadgeY: 366,
      rank3NameX: 660,
      rank3NameY: 412,
      rank3UnitX: 660,
      rank3UnitY: 468,
      titleFont: '600 "Sora", sans-serif',
      winnerFont: '700 "Sora", sans-serif',
      unitFont: '400 "Sora", sans-serif',
      rankFont: '600 "Sora", sans-serif',
      fontFamily: '500 "Sora", sans-serif',
      uppercaseNames: false,
      rankBadgeShape: 'none' as 'pill' | 'circle' | 'rectangle' | 'none',
      rankBadgeShapeSize: 20,
      rank1Color: '#ffffff',
      rank2Color: '#ffffff',
      rank3Color: '#ffffff',
      rankTextColor: '#ffffff',
      rank1Text: '01',
      rank2Text: '02',
      rank3Text: '03',
      winnerAlign: 'center',
      unitAlign: 'center',
      winnerWrap: true,
      showDividers: false,
      showFooter: false,
      showFooterBg: false,
      footerLine1: '',
      footerLine2: '',
      campusNameUppercase: true,
      festNameUppercase: true,
      resultLabelUppercase: false,
      resultNumUppercase: false,
      categoryUppercase: false,
      compNameUppercase: false,
      winnerUppercase: false,
      unitUppercase: false,
      useTeamColors: false,
      unitColors: {} as Record<string, string>,
      unitLanguage: 'en',
      unitArabicNames: {
        'Nexa Mirath': 'NEXA MIRATH',
        'Nexa Faylas': 'NEXA FAYLAS',
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي'
      } as Record<string, string>,
    };
  }

  // Theme 3 (Index 2) - Red 3D Star
  if (themeIdx === 2) {
    const base = getDefaultThemeConfig(0);
    return {
      ...base,
      resultLabelColor: '#C4020B',
      resultNumColor: '#C4020B',
    };
  }

  return getDefaultThemeConfig(themeIdx % 3);
}

// Migrate old flat config to per-theme (same logic as PosterSettingsView)
export function migrateOldConfig(templateConfig: any, defaultThemes: string[]): any {
  let customThemes = Array.isArray(templateConfig.customThemes) && templateConfig.customThemes.length > 0
    ? templateConfig.customThemes
    : defaultThemes;

  if (customThemes.some(isOldDefaultTheme) || customThemes.length === 4) {
    customThemes = defaultThemes.map((dt, idx) => {
      const existing = customThemes[idx];
      return existing && !isOldDefaultTheme(existing) ? existing : dt;
    });
  }

  if (templateConfig.themeConfigs) {
    return {
      ...templateConfig,
      customThemes
    };
  }

  const oldConf = { ...templateConfig };
  const themeRules = oldConf.themeRules || [];
  delete oldConf.customThemes;
  delete oldConf.themeRules;

  const themeConfigs: any = {};
  customThemes.forEach((_: any, idx: number) => {
    themeConfigs[idx] = { ...getDefaultThemeConfig(idx), ...oldConf };
  });

  return { customThemes, themeRules, themeConfigs };
}

export const renderPosterToCanvas = async (
  canvas: HTMLCanvasElement,
  compResults: any[],
  eventSettings: any,
  compName: string,
  categoryName: string,
  compIdx: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if ((document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch (_) {}
  }

  const rawTemplateConfig = eventSettings?.posterTemplateConfig || {};
  const defaultThemes = DEFAULT_POSTER_THEMES;
  let inputThemes = rawTemplateConfig.customThemes;
  if (Array.isArray(inputThemes) && inputThemes.length > 0) {
    inputThemes = defaultThemes.map((dt, idx) => inputThemes[idx] || dt);
  } else {
    inputThemes = defaultThemes;
  }
  const migratedConfig = migrateOldConfig({
    ...rawTemplateConfig,
    customThemes: inputThemes
  }, defaultThemes);

  const customThemes: string[] = migratedConfig.customThemes || defaultThemes;
  const themeRules: any[] = migratedConfig.themeRules || [];
  const themeConfigs: any = migratedConfig.themeConfigs || {};

  const getThemeIndexForResult = (resultNum: number, catName?: string, catId?: string): number => {
    const rule = themeRules.find((r: any) => {
      if (r.type === 'singleResult' || r.type === 'single') {
        const targetNum = Number(r.resultNumber ?? r.startResult);
        return resultNum === targetNum;
      }
      if (r.type === 'category' || r.categoryId || r.categoryName) {
        if (catId && r.categoryId && r.categoryId === catId) return true;
        if (catName && (r.categoryName || r.category)) {
          const rCat = (r.categoryName || r.category || '').toString().trim().toLowerCase();
          if (rCat === (catName || '').toString().trim().toLowerCase()) return true;
        }
        return false;
      }
      return resultNum >= r.startResult && resultNum <= r.endResult;
    });
    if (rule && rule.themeIndex !== undefined && rule.themeIndex < customThemes.length) {
      return rule.themeIndex;
    }
    if (rule && rule.themeUrl) {
      const idx = customThemes.indexOf(rule.themeUrl);
      if (idx >= 0) return idx;
    }
    return 0;
  };

  const themeIdx = getThemeIndexForResult(compIdx, categoryName);
  const defaultConf = getDefaultThemeConfig(themeIdx);
  const userConf = { ...(themeConfigs[themeIdx] || {}) };
  
  // Theme 0 default color fallback
  if (themeIdx === 0) {
    if (userConf.compNameColor === '#48205D') {
      userConf.compNameColor = defaultConf.compNameColor;
      userConf.resultNumColor = defaultConf.resultNumColor;
      userConf.unitColor = defaultConf.unitColor;
      userConf.rank1Color = defaultConf.rank1Color;
      userConf.rank2Color = defaultConf.rank2Color;
      userConf.rank3Color = defaultConf.rank3Color;
    }
    if (!userConf.resultNumFont || userConf.resultNumFont.includes('bold "Fractul Alt"')) {
      userConf.resultNumFont = defaultConf.resultNumFont;
    }
    if (!userConf.categoryFont || userConf.categoryFont.includes('bold "Fractul Alt"')) {
      userConf.categoryFont = defaultConf.categoryFont;
    }
    if (!userConf.compNameFont || userConf.compNameFont.includes('bold "Fractul Alt"')) {
      userConf.compNameFont = defaultConf.compNameFont;
    }
    if (!userConf.winnerFont || userConf.winnerFont.includes('bold "Fractul Alt"')) {
      userConf.winnerFont = defaultConf.winnerFont;
    }
    if (!userConf.rankFont || userConf.rankFont.includes('bold "Fractul Alt"')) {
      userConf.rankFont = defaultConf.rankFont;
    }
    if (!userConf.unitFont || userConf.unitFont.includes('bold "Fractul Alt"')) {
      userConf.unitFont = defaultConf.unitFont;
    }
    if (userConf.resultNumX === 140) {
      userConf.resultNumX = defaultConf.resultNumX;
      userConf.resultNumY = defaultConf.resultNumY;
      userConf.resultNumSize = defaultConf.resultNumSize;
      userConf.categoryX = defaultConf.categoryX;
      userConf.categoryY = defaultConf.categoryY;
      userConf.compNameX = defaultConf.compNameX;
      userConf.compNameY = defaultConf.compNameY;
      userConf.rank1BadgeX = defaultConf.rank1BadgeX;
      userConf.rank1BadgeY = defaultConf.rank1BadgeY;
      userConf.rank1NameX = defaultConf.rank1NameX;
      userConf.rank1NameY = defaultConf.rank1NameY;
      userConf.rank1UnitX = defaultConf.rank1UnitX;
      userConf.rank1UnitY = defaultConf.rank1UnitY;
      userConf.rank2BadgeX = defaultConf.rank2BadgeX;
      userConf.rank2BadgeY = defaultConf.rank2BadgeY;
      userConf.rank2NameX = defaultConf.rank2NameX;
      userConf.rank2NameY = defaultConf.rank2NameY;
      userConf.rank2UnitX = defaultConf.rank2UnitX;
      userConf.rank2UnitY = defaultConf.rank2UnitY;
      userConf.rank3BadgeX = defaultConf.rank3BadgeX;
      userConf.rank3BadgeY = defaultConf.rank3BadgeY;
      userConf.rank3NameX = defaultConf.rank3NameX;
      userConf.rank3NameY = defaultConf.rank3NameY;
      userConf.rank3UnitX = defaultConf.rank3UnitX;
      userConf.rank3UnitY = defaultConf.rank3UnitY;
    }
  }

  const baseConf = { ...defaultConf, ...userConf };
  // Theme configs must NEVER supply winner name or unit overrides across all posters
  Object.keys(baseConf).forEach((k) => {
    if (k.toLowerCase().includes('override') && (k.toLowerCase().includes('name') || k.toLowerCase().includes('unit'))) {
      delete (baseConf as any)[k];
    }
  });
  delete (baseConf as any).compNameOverride;
  
  const backgroundSource = customThemes[themeIdx] || customThemes[0];
  
  // Merge individual poster position overrides if saved for this specific poster/competition
  const compId = compResults && compResults[0] ? (compResults[0].competitionId || compResults[0].id) : null;
  const overrides = eventSettings?.posterOverrides || {};
  let compOverride = null;
  if (compId && overrides[compId]) {
    compOverride = overrides[compId];
  } else if (categoryName && compName && overrides[`${categoryName}_${compName}`]) {
    compOverride = overrides[`${categoryName}_${compName}`];
  }

  // Cross-theme protection: If override was saved for a DIFFERENT theme, do NOT apply its colors/coordinates!
  if (compOverride && compOverride._savedThemeIndex !== undefined && compOverride._savedThemeIndex !== themeIdx) {
    const textOnly: any = {};
    Object.keys(compOverride).forEach(k => {
      if (k.includes('Override') || k.includes('Tie') || k.includes('customText')) {
        textOnly[k] = compOverride[k];
      }
    });
    compOverride = Object.keys(textOnly).length > 0 ? textOnly : null;
  }
  
  const isOverrideValid = !!compOverride;
  const c = isOverrideValid ? { ...baseConf, ...compOverride } : baseConf;


  
  const festivalName = eventSettings?.festivalName || 'Sahityotsav';
  const campusName = eventSettings?.campusName || eventSettings?.sectorName || 'Campus';
  
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;

  const drawOverlay = (W: number, H: number) => {
    const activeCategory = { name: categoryName };
    const activeComp = { name: compName };
    // Removed dummy addRegion
    let hoveredElement = null;
    let dragging = null;
    
    
    if (!activeComp) return;

    const regions: { id: string, x: number, y: number, w: number, h: number }[] = [];
    const addRegion = (id: string, x: number, y: number, w: number, h: number) => {
      regions.push({ id, x, y, w, h });
      if (hoveredElement === id || dragging === id) {
        ctx.save();
        ctx.strokeStyle = dragging === id ? '#22d3ee' : 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = dragging === id ? 4 : 2;
        ctx.setLineDash(dragging === id ? [] : [8, 4]);
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }
    };

    // Campus Name
    if (c.showCampusName !== false) {
      ctx.textAlign = 'left';
      ctx.font = parseFontForCanvas(c.campusNameFont || c.fontFamily, c.campusNameSize ?? 28, '900');
      ctx.fillStyle = c.campusNameColor || c.titleColor || '#ffffff';
      const campusText = c.campusNameUppercase !== false ? campusName.toUpperCase() : campusName;
      const campusMetrics = ctx.measureText(campusText);
      const cx = c.campusNameX ?? c.titleX ?? 540;
      const cy = c.campusNameY ?? (c.titleY ? Math.max(c.titleY - 30, 30) : 70);
      ctx.fillText(campusText, cx, cy);
      addRegion('campusName', cx - 10, cy - (c.campusNameSize ?? 28) - 5, campusMetrics.width + 20, (c.campusNameSize ?? 28) + 20);
    }

    // Fest Name
    if (c.showFestName !== false) {
      ctx.textAlign = 'left';
      ctx.font = parseFontForCanvas(c.festNameFont || c.fontFamily, c.festNameSize ?? 36, '900');
      ctx.fillStyle = c.festNameColor || c.titleColor || '#fbbf24';
      const festText = c.festNameUppercase !== false ? festivalName.toUpperCase() : festivalName;
      const festMetrics = ctx.measureText(festText);
      const fx = c.festNameX ?? c.titleX ?? 540;
      const fy = c.festNameY ?? (c.titleY ? c.titleY + 20 : 120);
      ctx.fillText(festText, fx, fy);
      addRegion('festName', fx - 10, fy - (c.festNameSize ?? 36) - 5, festMetrics.width + 20, (c.festNameSize ?? 36) + 20);
    }

    // Formatted result number: 1 -> 01, 9 -> 09, 10 -> 10, 105 -> 105 (without #)
    const formattedNum = compIdx < 10 ? compIdx.toString().padStart(2, '0') : compIdx.toString();

    // Result Label Word (e.g. "RESULT")
    ctx.textAlign = 'left';
    ctx.font = parseFontForCanvas(c.resultLabelFont || c.fontFamily, c.resultLabelSize || 28, '800');
    ctx.fillStyle = c.resultLabelColor || '#ffffff';
    const rawLbl = c.resultLabelText || 'RESULT';
    const rLblText = c.resultLabelUppercase !== false ? rawLbl.toUpperCase() : rawLbl;
    const rLblMetrics = ctx.measureText(rLblText);
    const rx = c.resultLabelX ?? 470;
    const ry = c.resultLabelY ?? 180;
    if (c.resultLabelVertical) {
      const chars = rLblText.split('');
      const gap = c.resultLabelLineGap || ((c.resultLabelSize || 13) * 1.15);
      chars.forEach((ch: string, i: number) => {
        ctx.fillText(ch, rx, ry + i * gap);
      });
    } else {
      ctx.fillText(rLblText, rx, ry);
    }
    addRegion('resultLabel', rx - 10, ry - (c.resultLabelSize || 28) - 5, rLblMetrics.width + 20, (c.resultLabelSize || 28) + 20);

    // Result Number (e.g. "01", "10", "105")
    ctx.textAlign = 'left';
    ctx.font = parseFontForCanvas(c.resultNumFont || c.fontFamily, c.resultNumSize || 28, '800');
    const rNumX = c.resultNumX ?? 600;
    const rNumY = c.resultNumY ?? 180;
    if (c.resultNumStyle === 'stroke') {
      ctx.save();
      ctx.strokeStyle = c.resultNumColor || '#84C75D';
      ctx.lineWidth = c.resultNumStrokeWidth || 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(formattedNum, rNumX, rNumY);
      ctx.restore();
    } else {
      ctx.fillStyle = c.resultNumColor || '#ffffff';
      ctx.fillText(formattedNum, rNumX, rNumY);
    }
    const rNumMetrics = ctx.measureText(formattedNum);
    addRegion('resultNum', rNumX - 10, rNumY - (c.resultNumSize || 28) - 5, rNumMetrics.width + 20, (c.resultNumSize || 28) + 20);

    
    // Cursive Script Text (SignPainter) e.g. "mid zone"
    if (c.showScriptText !== false && (c.scriptSize ?? 0) > 0) {
      const sText = c.scriptTextOverride !== undefined && c.scriptTextOverride !== '' 
        ? c.scriptTextOverride 
        : (c.scriptText || (activeComp?.stage ? activeComp.stage : 'mid zone'));
      if (sText) {
        ctx.save();
        ctx.textAlign = (c.scriptAlign || 'left') as CanvasTextAlign;
        ctx.font = parseFontForCanvas(c.scriptFont || '"SignPainter", cursive', c.scriptSize ?? 48, '400');
        ctx.fillStyle = c.scriptColor || '#ffffff';
        const sx = c.scriptX ?? 296;
        const sy = c.scriptY ?? 308;
        ctx.fillText(sText, sx, sy);
        const sMetrics = ctx.measureText(sText);
        addRegion('scriptText', sx - 10, sy - (c.scriptSize ?? 48) - 5, sMetrics.width + 20, (c.scriptSize ?? 48) + 20);
        ctx.restore();
      }
    }

// Category
    ctx.textAlign = 'left';
    ctx.font = parseFontForCanvas(c.categoryFont || c.fontFamily, c.categorySize ?? 32, '800');
    ctx.fillStyle = c.categoryColor || 'rgba(255, 255, 255, 0.7)';
    const rawCat = activeCategory?.name || categoryName || 'GENERAL';
    const catText = (c.categoryUppercase !== false ? rawCat.toUpperCase() : rawCat) || 'GENERAL';
    const catMetrics = ctx.measureText(catText);
    const catX = c.categoryX ?? 540;
    const catY = c.categoryY ?? 260;
    ctx.fillText(catText, catX, catY);
    addRegion('category', catX - 10, catY - (c.categorySize ?? 32) - 5, catMetrics.width + 20, (c.categorySize ?? 32) + 20);

    // Competition Name with Generic Auto-Fit
    ctx.textAlign = (c.compNameAlign || 'left') as CanvasTextAlign;
    const rawComp = c.compNameOverride !== undefined && c.compNameOverride !== '' ? c.compNameOverride : (activeComp.name || compName || 'Competition');
    const compText = (c.compNameUppercase ? rawComp.toUpperCase() : rawComp) || 'COMPETITION';
    const compLines = (compText ? compText.split('\n') : []).filter(Boolean);
    const compX = c.compNameX ?? 540;
    const compY = c.compNameY ?? 330;
    
    // Auto-fit competition name so long multi-word or 2-line titles scale down cleanly
    let compNameSize = c.compNameSize ?? 52;
    const maxCompAllowedWidth = c.compNameMaxWidth || Math.max(W - compX - 60, 420);
    ctx.font = parseFontForCanvas(c.compNameFont || c.fontFamily, compNameSize, '900');
    let longestCompLine = compLines.length > 0 ? Math.max(...compLines.map((l: string) => ctx.measureText(l).width)) : 0;
    while (longestCompLine > maxCompAllowedWidth && compNameSize > 18) {
      compNameSize -= 1;
      ctx.font = parseFontForCanvas(c.compNameFont || c.fontFamily, compNameSize, '900');
      longestCompLine = Math.max(...compLines.map((l: string) => ctx.measureText(l).width));
    }
    const compGap = compNameSize * 1.15;
    ctx.fillStyle = c.compNameColor || '#ffffff';
    let maxCompW = 0;
    compLines.forEach((line: string, i: number) => {
      ctx.fillText(line, compX, compY + i * compGap);
      const w = ctx.measureText(line).width;
      if (w > maxCompW) maxCompW = w;
    });
    addRegion('compName', compX - 10, compY - compNameSize - 5, maxCompW + 20, (compLines.length * compGap) + 10);

    // Dynamic vertical shift to prevent tied winners from overlapping downstream ranks
    let cumulativeShiftY = 0;
    // Generic max width for winner names and unit names to prevent artwork collisions
    const maxWinnerAllowedWidth = c.winnerMaxWidth || Math.max(Math.min(W - (c.rank1NameX ?? 260) - 60, 520), 380);

    // Draw each rank with per-rank positions (supports multiple tied winners per rank)
    [1, 2, 3].forEach((rank) => {
      const rankWinners = (compResults || []).filter(r => r.rank === rank);
      const hasRank1Override = !!(c[`rank${rank}NameOverride`] || c[`rank${rank}UnitOverride`]);
      const hasRank2Override = !!(c[`rank${rank}_2_NameOverride`] || c[`rank${rank}_2_UnitOverride`]);

      const winnerCount = Math.max(rankWinners.length, hasRank2Override ? 2 : hasRank1Override ? 1 : 0);
      if (winnerCount === 0) return;

      const hasTie = winnerCount > 1;

      for (let wIdx = 0; wIdx < Math.max(winnerCount, 1); wIdx++) {
        const res = rankWinners[wIdx];
        const isSecond = wIdx === 1;
        const nameOverrideKey = isSecond ? `rank${rank}_2_NameOverride` : `rank${rank}NameOverride`;
        const unitOverrideKey = isSecond ? `rank${rank}_2_UnitOverride` : `rank${rank}UnitOverride`;

        const overrideName = c[nameOverrideKey];
        const hasNameOverride = overrideName !== undefined && overrideName !== '';
        
        const overrideUnit = c[unitOverrideKey];
        const hasUnitOverride = overrideUnit !== undefined && overrideUnit !== '';

        if (!res && !hasNameOverride && !hasUnitOverride && wIdx > 0) continue;

        const rawWinnerName = hasNameOverride ? overrideName : (res?.participantName || 'Participant Name');
        const winnerName = c.winnerUppercase === false && !c.uppercaseNames ? rawWinnerName : rawWinnerName.toUpperCase();

        const rawWinnerUnit = hasUnitOverride ? overrideUnit : (res?.department || res?.unitName || res?.team || res?.teamName || 'Unit Name');
        const winnerUnit = c.unitUppercase !== false ? rawWinnerUnit.toUpperCase() : rawWinnerUnit;

        const baseBadgeY = c[`rank${rank}BadgeY`] ?? (460 + (rank - 1) * 180);
        const baseNameY = c[`rank${rank}NameY`] ?? (448 + (rank - 1) * 180);
        const baseUnitY = c[`rank${rank}UnitY`] ?? (483 + (rank - 1) * 180);

        const tieOffset = 68;
        const bx = isSecond ? (c[`rank${rank}_2_BadgeX`] ?? (c[`rank${rank}BadgeX`] ?? 140)) : (c[`rank${rank}BadgeX`] ?? 140);
        const by = isSecond 
          ? (c[`rank${rank}_2_BadgeY`] !== undefined ? c[`rank${rank}_2_BadgeY`] : (baseBadgeY + cumulativeShiftY + tieOffset)) 
          : (baseBadgeY + cumulativeShiftY);

        const nx = isSecond ? (c[`rank${rank}_2_NameX`] ?? (c[`rank${rank}NameX`] ?? 260)) : (c[`rank${rank}NameX`] ?? 260);
        const ny = isSecond 
          ? (c[`rank${rank}_2_NameY`] !== undefined ? c[`rank${rank}_2_NameY`] : (baseNameY + cumulativeShiftY + tieOffset)) 
          : (baseNameY + cumulativeShiftY);

        const ux = isSecond ? (c[`rank${rank}_2_UnitX`] ?? (c[`rank${rank}UnitX`] ?? 260)) : (c[`rank${rank}UnitX`] ?? 260);
        const uy = isSecond 
          ? (c[`rank${rank}_2_UnitY`] !== undefined ? c[`rank${rank}_2_UnitY`] : (baseUnitY + cumulativeShiftY + tieOffset)) 
          : (baseUnitY + cumulativeShiftY);

        const rColor = rank === 1 ? c.rank1Color : rank === 2 ? c.rank2Color : c.rank3Color;
        const rankText = rank === 1 ? c.rank1Text : rank === 2 ? c.rank2Text : c.rank3Text;

        const badgeRegionId = isSecond ? `rank${rank}_2_Badge` : `rank${rank}Badge`;
        const nameRegionId = isSecond ? `rank${rank}_2_Name` : `rank${rank}Name`;
        const unitRegionId = isSecond ? `rank${rank}_2_Unit` : `rank${rank}Unit`;

        // Rank badge
        const rankFontSize = c.rankSize || 38;
        ctx.font = parseFontForCanvas(c.rankFont || c.fontFamily, rankFontSize, '900');
        const textWidth = ctx.measureText(rankText).width;
        const badgeShapeSize = c.rankBadgeShapeSize ?? 40;
        const badgeCenterY = by - (rankFontSize * 0.32);

        let badgeW = textWidth + 40;
        let badgeH = 50;

        if (c.rankBadgeShape !== 'none') {
          ctx.fillStyle = rColor;
          ctx.beginPath();
          if (c.rankBadgeShape === 'pill') {
            badgeH = Math.max(badgeShapeSize * 1.25, rankFontSize * 1.25);
            const pillPadX = Math.max(badgeShapeSize * 0.5, 16);
            badgeW = textWidth + pillPadX * 2;
            ctx.roundRect(bx - badgeW / 2, badgeCenterY - badgeH / 2, badgeW, badgeH, badgeH / 2);
          } else if (c.rankBadgeShape === 'circle') {
            const radius = badgeShapeSize;
            badgeW = radius * 2;
            badgeH = radius * 2;
            ctx.arc(bx, badgeCenterY, radius, 0, 2 * Math.PI);
          } else {
            badgeH = Math.max(badgeShapeSize * 1.25, rankFontSize * 1.25);
            const rectPadX = Math.max(badgeShapeSize * 0.5, 16);
            badgeW = textWidth + rectPadX * 2;
            ctx.rect(bx - badgeW / 2, badgeCenterY - badgeH / 2, badgeW, badgeH);
          }
          ctx.fill();
        }

        const rankFill = c.rankTextColor || '#ffffff';
        ctx.fillStyle = rankFill;
        ctx.textAlign = 'center';
        const isRankHairline = (c.rankFont || c.fontFamily || '').includes('200') || (c.rankFont || c.fontFamily || '').includes('Hairline');
        if (isRankHairline) {
          ctx.save();
          ctx.strokeStyle = rankFill;
          ctx.lineWidth = 0.5;
          ctx.lineJoin = 'round';
          ctx.strokeText(rankText, bx, by);
          ctx.fillText(rankText, bx, by);
          ctx.restore();
        } else {
          ctx.fillText(rankText, bx, by);
        }
        addRegion(badgeRegionId, bx - badgeW / 2 - 5, badgeCenterY - badgeH / 2 - 5, badgeW + 10, badgeH + 10);

        // Winner name (supports multi-line \n and Auto-Fit scaling for long names)
        ctx.textAlign = (c.winnerAlign || 'left') as CanvasTextAlign;
        let winnerFontSize = c.winnerSize || 34;
        let nameLines = winnerName.split('\n').filter(Boolean);
        if (c.winnerWrap && nameLines.length === 1 && winnerName.includes(' ')) {
          const words = winnerName.split(' ');
          if (words.length >= 2) {
            const mid = Math.ceil(words.length / 2);
            nameLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
          }
        }
        ctx.font = parseFontForCanvas(c.winnerFont || c.fontFamily, winnerFontSize, '500');
        let longestNameLine = nameLines.length > 0 ? Math.max(...nameLines.map((l: string) => ctx.measureText(l).width)) : 0;
        while (longestNameLine > maxWinnerAllowedWidth && winnerFontSize > 14) {
          winnerFontSize -= 1;
          ctx.font = parseFontForCanvas(c.winnerFont || c.fontFamily, winnerFontSize, '500');
          longestNameLine = Math.max(...nameLines.map((l: string) => ctx.measureText(l).width));
        }

        const nameGap = winnerFontSize * 1.15;
        const winnerFill = c.winnerColor || '#ffffff';
        ctx.fillStyle = winnerFill;
        let maxNameW = 0;
        const isWinnerHairline = (c.winnerFont || c.fontFamily || '').includes('200') || (c.winnerFont || c.fontFamily || '').includes('Hairline');
        nameLines.forEach((line: string, i: number) => {
          if (isWinnerHairline) {
            ctx.save();
            ctx.strokeStyle = winnerFill;
            ctx.lineWidth = 0.5;
            ctx.lineJoin = 'round';
            ctx.strokeText(line, nx, ny + i * nameGap);
            ctx.fillText(line, nx, ny + i * nameGap);
            ctx.restore();
          } else {
            ctx.fillText(line, nx, ny + i * nameGap);
          }
          const w = ctx.measureText(line).width;
          if (w > maxNameW) maxNameW = w;
        });
        addRegion(nameRegionId, nx - 5, ny - winnerFontSize - 5, maxNameW + 10, (nameLines.length * nameGap) + 10);

        // Unit name (supports multi-line \n and Auto-Fit scaling)
        const isArabic = c.unitLanguage === 'ar';
        const arabicFont = (c.unitFont && c.unitFont !== 'monospace') ? c.unitFont : "'Cairo', 'Amiri', sans-serif";
        const unitFontFamily = isArabic ? arabicFont : (c.unitFont || 'monospace');
        let unitFontSize = c.unitSize || 22;
        const displayUnitName = getPosterDisplayUnitName(rawWinnerUnit || winnerUnit, c);
        const unitText = isArabic ? displayUnitName : (c.unitUppercase !== false ? displayUnitName.toUpperCase() : displayUnitName);
        const unitLines = unitText.split('\n').filter(Boolean);
        ctx.textAlign = (c.unitAlign || c.winnerAlign || 'left') as CanvasTextAlign;

        ctx.font = parseFontForCanvas(unitFontFamily, unitFontSize, '500');
        let longestUnitLine = unitLines.length > 0 ? Math.max(...unitLines.map((l: string) => ctx.measureText(l).width)) : 0;
        while (longestUnitLine > maxWinnerAllowedWidth && unitFontSize > 12) {
          unitFontSize -= 1;
          ctx.font = parseFontForCanvas(unitFontFamily, unitFontSize, '500');
          longestUnitLine = Math.max(...unitLines.map((l: string) => ctx.measureText(l).width));
        }

        const unitGap = unitFontSize * 1.15;
        const calcUx = nx; 
        const calcUy = ny + (nameLines.length * nameGap) + 5;
        const unitFill = getPosterTeamColor(rawWinnerUnit || winnerUnit, c.unitColor, c);
        ctx.fillStyle = unitFill;
        let maxUnitW = 0;
        const isUnitHairline = (c.unitFont || c.fontFamily || '').includes('200') || (c.unitFont || c.fontFamily || '').includes('Hairline');
        unitLines.forEach((line: string, i: number) => {
          if (isUnitHairline) {
            ctx.save();
            ctx.strokeStyle = unitFill;
            ctx.lineWidth = 0.5;
            ctx.lineJoin = 'round';
            ctx.strokeText(line, ux ?? calcUx, (uy ?? calcUy) + i * unitGap);
            ctx.fillText(line, ux ?? calcUx, (uy ?? calcUy) + i * unitGap);
            ctx.restore();
          } else {
            ctx.fillText(line, ux ?? calcUx, (uy ?? calcUy) + i * unitGap);
          }
          const w = ctx.measureText(line).width;
          if (w > maxUnitW) maxUnitW = w;
        });
        addRegion(unitRegionId, (ux ?? calcUx) - 5, (uy ?? calcUy) - unitFontSize - 5, maxUnitW + 10, (unitLines.length * unitGap) + 10);

        // Horizontal divider line under winner row (for stacked themes like Theme 0 & Theme 2)
        if (c.showDividers && rank < 3) {
          const divY = (uy ?? calcUy) + (unitLines.length * unitGap) + 8;
          ctx.save();
          ctx.strokeStyle = c.dividerColor || 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = c.dividerWidth || 1;
          ctx.beginPath();
          ctx.moveTo(c.dividerStartX ?? nx, divY);
          ctx.lineTo(c.dividerEndX ?? (nx + 280), divY);
          ctx.stroke();
          ctx.restore();
        }
      }


      // Smoothly shift down subsequent ranks if there was a tie
      if (hasTie) {
        cumulativeShiftY += (c.tiedWinnerRowGap || 72);
      }
    });

    // Footer
    if (c.showFooter !== false) {
      if (c.showFooterBg) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, H - 180, W, 180);
      }
      const line1 = c.footerLine1 || `OFFICIAL WINNERS ANNOUNCEMENT \u2022 ${festivalName.toUpperCase()}`;
      const line2 = c.footerLine2 || `Generated live by ${campusName} ${festivalName} Management Portal`;

      ctx.textAlign = 'center';
      ctx.font = parseFontForCanvas(c.fontFamily, 28, '800');
      ctx.fillStyle = c.titleColor || '#fbbf24';
      ctx.fillText(line1, W / 2, H - 100);

      ctx.font = '600 20px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(line2, W / 2, H - 55);
    }
  };

  return new Promise((resolve) => {
    const drawBackgroundAndOverlay = async (bgImg?: HTMLImageElement) => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await document.fonts.ready;
        }
        const W = bgImg ? (bgImg.naturalWidth || bgImg.width || 1080) : 1080;
        const H = bgImg ? (bgImg.naturalHeight || bgImg.height || 1350) : 1350;
        canvas.width = W;
        canvas.height = H;

        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, W, H);
        } else {
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, '#020617');
          grad.addColorStop(0.5, '#0f172a');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
        drawOverlay(W, H);
        resolve(true);
      } catch (e) {
        console.error("Error drawing poster overlay:", e);
        resolve(false);
      }
    };

    if (backgroundSource) {
      const cached = posterImageCache.get(backgroundSource);
      if (cached && cached.complete && cached.naturalWidth > 0) {
        drawBackgroundAndOverlay(cached);
        return;
      }

      const img = new Image();
      if (backgroundSource.startsWith('http://') || backgroundSource.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        posterImageCache.set(backgroundSource, img);
        drawBackgroundAndOverlay(img);
      };
      img.onerror = () => drawBackgroundAndOverlay();
      img.src = backgroundSource;
    } else {
      drawBackgroundAndOverlay();
    }
  });
};

/**
 * Generates the official social media announcement caption for a Result Poster or Certificate.
 * Follows the exact festival format with rank emojis, team tags, congratulations, and hashtags.
 */
export const generatePosterShareCaption = (
  eventName: string,
  category: string,
  compIndex: number,
  results: any[],
  eventSettings?: any
): string => {
  const festivalTitle = (eventSettings?.festivalName || 'QUERENCIA').toUpperCase();
  const formattedNum = String(compIndex || 1).padStart(2, '0');
  const slogan = eventSettings?.tagline || eventSettings?.festivalTagline || eventSettings?.slogan || 'Decoding a Century of Wisdom';
  const campus = eventSettings?.campusName || eventSettings?.sectorName || 'Thwaiba Valliyad';

  // Enforce strictly 3 to 4 hashtags
  let hashtagList: string[] = [];
  if (eventSettings?.shareHashtags && typeof eventSettings.shareHashtags === 'string') {
    hashtagList = eventSettings.shareHashtags
      .trim()
      .split(/\s+/)
      .filter((tag: string) => Boolean(tag && tag.startsWith('#')))
      .slice(0, 4);
  }
  if (hashtagList.length === 0) {
    const cleanTag = festivalTitle.replace(/[^a-zA-Z0-9]/g, '');
    hashtagList = [`#${cleanTag}`, '#MeeladFest', '#Results', '#Winners'];
  }
  const hashtags = hashtagList.slice(0, 4).join(' ');

  const rank1List = (results || []).filter((r: any) => r.rank === 1);
  const rank2List = (results || []).filter((r: any) => r.rank === 2);
  const rank3List = (results || []).filter((r: any) => r.rank === 3);

  const getWinnerTeam = (res: any) => {
    const rawUnit = res?.department || res?.unitName || res?.raw?.unitName || '';
    if (!rawUnit) return '';
    const cleanUnit = rawUnit.replace(/^team\s*[:\-]?\s*/i, '').trim();
    const displayUnit = getPosterDisplayUnitName(cleanUnit, eventSettings?.posterTemplateConfig) || cleanUnit;
    const finalUnit = displayUnit.replace(/^team\s*[:\-]?\s*/i, '').trim();
    return finalUnit ? `Team ${finalUnit}` : '';
  };

  const formatRankLine = (emoji: string, rankStr: string, list: any[]) => {
    if (list.length === 0) return '';
    return list
      .map((r: any) => {
        const pName = r.participantName || r.name || 'Participant';
        const team = getWinnerTeam(r);
        return `${emoji} ${rankStr} — ${pName}${team ? `    ${team}` : ''}`;
      })
      .join('\n');
  };

  const rankLines = [
    formatRankLine('🥇', '1st', rank1List),
    formatRankLine('🥈', '2nd', rank2List),
    formatRankLine('🥉', '3rd', rank3List)
  ]
    .filter(Boolean)
    .join('\n');

  return `🏆 ${festivalTitle} — RESULT ${formattedNum}
✨ ${slogan}

${eventName}
${category}

${rankLines}

🌿 Congratulations to all the winners and participants!
May your talents continue to shine. ✨
${campus}

${hashtags}

© Zenith Software`;
};

/**
 * Generates a clean share caption for individual participant certificates.
 * Follows 3-4 hashtags and copyright credit to Zenith Software.
 */
export const generateCertificateShareCaption = (
  participantName: string,
  chestNumber: string,
  eventName: string,
  category: string,
  rank: number | string,
  eventSettings?: any
): string => {
  const festivalTitle = (eventSettings?.festivalName || 'QUERENCIA').toUpperCase();
  const slogan = eventSettings?.tagline || eventSettings?.festivalTagline || eventSettings?.slogan || 'Decoding a Century of Wisdom';
  const campus = eventSettings?.campusName || eventSettings?.sectorName || 'Thwaiba Valliyad';
  const rankEmoji = rank === 1 || rank === '1' ? '🥇 1st Place' : rank === 2 || rank === '2' ? '🥈 2nd Place' : rank === 3 || rank === '3' ? '🥉 3rd Place' : `Rank ${rank}`;

  const cleanTag = festivalTitle.replace(/[^a-zA-Z0-9]/g, '');
  const hashtags = `#${cleanTag} #Certificate #Winners #ThwaibaValliyad`;

  return `🎓 ${festivalTitle} — OFFICIAL CERTIFICATE
✨ ${slogan}

Participant: ${participantName} (Chest #${chestNumber})
Competition: ${eventName} (${category})
Award: ${rankEmoji}

Congratulations on this remarkable achievement!
${campus}

${hashtags}

© Zenith Software`;
};

/**
 * Generates a clean share caption for individual participant winner poster.
 */
export const generateParticipantPosterShareCaption = (
  eventName: string,
  category: string,
  eventSettings?: any
): string => {
  const festivalTitle = (eventSettings?.festivalName || 'QUERENCIA').toUpperCase();
  const slogan = eventSettings?.tagline || eventSettings?.festivalTagline || eventSettings?.slogan || 'Decoding a Century of Wisdom';
  const campus = eventSettings?.campusName || eventSettings?.sectorName || 'Thwaiba Valliyad';

  const cleanTag = festivalTitle.replace(/[^a-zA-Z0-9]/g, '');
  const hashtags = `#${cleanTag} #ResultPoster #Winners #ThwaibaValliyad`;

  return `🏆 ${festivalTitle} — RESULT POSTER
✨ ${slogan}

Competition: ${eventName}
Category: ${category}

Congratulations to all the winners!
${campus}

${hashtags}

© Zenith Software`;
};

/**
 * Offscreen rendering of a full Result Poster directly to a JPEG Blob (0.95 quality).
 */
export const renderPosterToBlob = async (
  results: any[],
  eventSettings: any,
  eventName: string,
  category: string,
  compIndex: number
): Promise<{ blob: Blob; fileName: string }> => {
  const canvas = document.createElement('canvas');
  await renderPosterToCanvas(canvas, results, eventSettings, eventName, category, compIndex);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const cleanCat = category.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
          const cleanEvent = eventName.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
          resolve({ blob, fileName: `Result_Poster_${cleanCat}_${cleanEvent}.jpg` });
        } else {
          reject(new Error('Failed to create poster blob'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
};

