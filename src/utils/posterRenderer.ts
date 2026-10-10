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

export function getDefaultThemeConfig(themeIdx: number = 0): any {
  if (themeIdx === 0) {
    return {
      titleColor: '#A94029',
      winnerColor: '#482722',
      unitColor: '#B36A50',
      titleSize: 36,
      resultLabelText: '',
      resultLabelX: -9999,
      resultLabelY: -9999,
      resultLabelSize: 0,
      resultLabelColor: '#ffffff',
      resultNumX: 350,
      resultNumY: 414,
      resultNumSize: 76,
      resultNumColor: '#8D3020',
      resultNumFont: '600 "Sora", sans-serif',
      categorySize: 26,
      categoryColor: '#916C63',
      categoryX: 450,
      categoryY: 348,
      categoryFont: '300 "Sora", sans-serif',
      compNameX: 450,
      compNameY: 414,
      compNameSize: 52,
      compNameColor: '#A94029',
      compNameFont: '600 "Sora", sans-serif',
      winnerSize: 34,
      unitSize: 22,
      rankSize: 32,
      titleX: 540,
      titleY: 110,
      rankBadgeShape: 'none',
      rankBadgeShapeSize: 20,
      rankFont: '500 "Fractul Alt", sans-serif',
      rankTextColor: '#482722',
      rank1Color: '#8D3020',
      rank2Color: '#8D3020',
      rank3Color: '#8D3020',
      rank1Text: 'I',
      rank2Text: 'II',
      rank3Text: 'III',
      winnerFont: '500 "Fractul Alt", sans-serif',
      unitFont: '500 "Fractul Alt", sans-serif',
      rank1BadgeX: 416,
      rank1BadgeY: 512,
      rank1NameX: 450,
      rank1NameY: 512,
      rank1UnitX: 450,
      rank1UnitY: 538,
      rank2BadgeX: 416,
      rank2BadgeY: 590,
      rank2NameX: 450,
      rank2NameY: 590,
      rank2UnitX: 450,
      rank2UnitY: 618,
      rank3BadgeX: 416,
      rank3BadgeY: 680,
      rank3NameX: 450,
      rank3NameY: 680,
      rank3UnitX: 450,
      rank3UnitY: 708,
      fontFamily: '500 "Fractul Alt", sans-serif',
      uppercaseNames: false,
      showCampusName: false,
      showFestName: false,
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
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي',
      },
    };
  }

  if (themeIdx === 1) {
    return {
      titleColor: '#1268B0',
      winnerColor: '#173C60',
      unitColor: '#4689BC',
      titleSize: 36,
      resultLabelText: '',
      resultLabelX: -9999,
      resultLabelY: -9999,
      resultLabelSize: 0,
      resultLabelColor: '#ffffff',
      resultNumX: 350,
      resultNumY: 414,
      resultNumSize: 76,
      resultNumColor: '#07519C',
      resultNumFont: '600 "Sora", sans-serif',
      categorySize: 26,
      categoryColor: '#637C94',
      categoryX: 450,
      categoryY: 348,
      categoryFont: '300 "Sora", sans-serif',
      compNameX: 450,
      compNameY: 414,
      compNameSize: 52,
      compNameColor: '#1268B0',
      compNameFont: '600 "Sora", sans-serif',
      winnerSize: 34,
      unitSize: 22,
      rankSize: 32,
      titleX: 540,
      titleY: 110,
      rankBadgeShape: 'none',
      rankBadgeShapeSize: 20,
      rankFont: '500 "Fractul Alt", sans-serif',
      rankTextColor: '#173C60',
      rank1Color: '#07519C',
      rank2Color: '#07519C',
      rank3Color: '#07519C',
      rank1Text: 'I',
      rank2Text: 'II',
      rank3Text: 'III',
      winnerFont: '500 "Fractul Alt", sans-serif',
      unitFont: '500 "Fractul Alt", sans-serif',
      rank1BadgeX: 416,
      rank1BadgeY: 512,
      rank1NameX: 450,
      rank1NameY: 512,
      rank1UnitX: 450,
      rank1UnitY: 538,
      rank2BadgeX: 416,
      rank2BadgeY: 590,
      rank2NameX: 450,
      rank2NameY: 590,
      rank2UnitX: 450,
      rank2UnitY: 618,
      rank3BadgeX: 416,
      rank3BadgeY: 680,
      rank3NameX: 450,
      rank3NameY: 680,
      rank3UnitX: 450,
      rank3UnitY: 708,
      fontFamily: '500 "Fractul Alt", sans-serif',
      uppercaseNames: false,
      showCampusName: false,
      showFestName: false,
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
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي',
      },
    };
  }

  // Theme 3 (Index 2) - Golden Yellow
  if (themeIdx === 2) {
    return {
      titleColor: '#A07816',
      winnerColor: '#4A3030',
      unitColor: '#B18B42',
      titleSize: 36,
      resultLabelText: '',
      resultLabelX: -9999,
      resultLabelY: -9999,
      resultLabelSize: 0,
      resultLabelColor: '#ffffff',
      resultNumX: 174,
      resultNumY: 368,
      resultNumSize: 76,
      resultNumColor: '#956B12',
      resultNumFont: '600 "Sora", sans-serif',
      categorySize: 26,
      categoryColor: '#80645B',
      categoryX: 274,
      categoryY: 304,
      categoryFont: '300 "Sora", sans-serif',
      compNameX: 274,
      compNameY: 368,
      compNameSize: 52,
      compNameColor: '#A07816',
      compNameFont: '600 "Sora", sans-serif',
      winnerSize: 34,
      unitSize: 22,
      rankSize: 32,
      titleX: 540,
      titleY: 110,
      rankBadgeShape: 'none',
      rankBadgeShapeSize: 20,
      rankFont: '500 "Fractul Alt", sans-serif',
      rankTextColor: '#4A3030',
      rank1Color: '#956B12',
      rank2Color: '#956B12',
      rank3Color: '#956B12',
      rank1Text: 'I',
      rank2Text: 'II',
      rank3Text: 'III',
      winnerFont: '500 "Fractul Alt", sans-serif',
      unitFont: '500 "Fractul Alt", sans-serif',
      rank1BadgeX: 244,
      rank1BadgeY: 468,
      rank1NameX: 274,
      rank1NameY: 468,
      rank1UnitX: 274,
      rank1UnitY: 494,
      rank2BadgeX: 244,
      rank2BadgeY: 548,
      rank2NameX: 274,
      rank2NameY: 548,
      rank2UnitX: 274,
      rank2UnitY: 574,
      rank3BadgeX: 244,
      rank3BadgeY: 636,
      rank3NameX: 274,
      rank3NameY: 636,
      rank3UnitX: 274,
      rank3UnitY: 662,
      fontFamily: '500 "Fractul Alt", sans-serif',
      uppercaseNames: false,
      showCampusName: false,
      showFestName: false,
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
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي',
      },
    };
  }

  // Theme 4 (Index 3) - Royal Purple
  if (themeIdx === 3) {
    return {
      titleColor: '#7920C6',
      winnerColor: '#39224F',
      unitColor: '#9564B9',
      titleSize: 36,
      resultLabelText: '',
      resultLabelX: -9999,
      resultLabelY: -9999,
      resultLabelSize: 0,
      resultLabelColor: '#ffffff',
      resultNumX: 449,
      resultNumY: 425,
      resultNumSize: 76,
      resultNumColor: '#7012B9',
      resultNumFont: '600 "Sora", sans-serif',
      categorySize: 26,
      categoryColor: '#806C94',
      categoryX: 539,
      categoryY: 365,
      categoryFont: '300 "Sora", sans-serif',
      compNameX: 539,
      compNameY: 425,
      compNameSize: 52,
      compNameColor: '#7920C6',
      compNameFont: '600 "Sora", sans-serif',
      winnerSize: 34,
      unitSize: 22,
      rankSize: 32,
      titleX: 540,
      titleY: 110,
      rankBadgeShape: 'none',
      rankBadgeShapeSize: 20,
      rankFont: '500 "Fractul Alt", sans-serif',
      rankTextColor: '#39224F',
      rank1Color: '#7012B9',
      rank2Color: '#7012B9',
      rank3Color: '#7012B9',
      rank1Text: 'I',
      rank2Text: 'II',
      rank3Text: 'III',
      winnerFont: '500 "Fractul Alt", sans-serif',
      unitFont: '500 "Fractul Alt", sans-serif',
      rank1BadgeX: 510,
      rank1BadgeY: 512,
      rank1NameX: 539,
      rank1NameY: 512,
      rank1UnitX: 539,
      rank1UnitY: 538,
      rank2BadgeX: 510,
      rank2BadgeY: 585,
      rank2NameX: 539,
      rank2NameY: 585,
      rank2UnitX: 539,
      rank2UnitY: 611,
      rank3BadgeX: 510,
      rank3BadgeY: 665,
      rank3NameX: 539,
      rank3NameY: 665,
      rank3UnitX: 539,
      rank3UnitY: 691,
      fontFamily: '500 "Fractul Alt", sans-serif',
      uppercaseNames: false,
      showCampusName: false,
      showFestName: false,
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
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي',
      },
    };
  }

  // Theme 5 (Index 4) - Dark Phytolore Modern (Thunder ExtraLight 01, Sora & Fractul Alt, Pink accents)
  if (themeIdx === 4) {
    return {
      titleColor: '#ef066a',
      winnerColor: '#ffffff',
      unitColor: '#ef066a',
      titleSize: 36,
      resultLabelText: '',
      resultLabelX: -9999,
      resultLabelY: -9999,
      resultLabelSize: 0,
      resultLabelColor: '#ffffff',
      resultNumX: 138,
      resultNumY: 408,
      resultNumSize: 105,
      resultNumColor: '#ef066a',
      resultNumFont: '200 "Thunder ExtraLight LC", "Thunder", sans-serif',
      categorySize: 28,
      categoryColor: '#ffffff',
      categoryX: 240,
      categoryY: 340,
      categoryFont: '500 "Sora", sans-serif',
      compNameX: 240,
      compNameY: 405,
      compNameSize: 68,
      compNameColor: '#ef066a',
      compNameFont: '600 "Sora", sans-serif',
      campusNameX: 540,
      campusNameY: 70,
      campusNameSize: 28,
      campusNameColor: '#ffffff',
      campusNameFont: 'sans-serif',
      showCampusName: false,
      festNameX: 540,
      festNameY: 120,
      festNameSize: 36,
      festNameColor: '#fbbf24',
      festNameFont: 'sans-serif',
      showFestName: false,
      winnerSize: 34,
      unitSize: 22,
      rankSize: 30,
      titleX: 540,
      titleY: 110,
      rank1BadgeX: 210,
      rank1BadgeY: 498,
      rank1NameX: 240,
      rank1NameY: 498,
      rank1UnitX: 240,
      rank1UnitY: 524,
      rank2BadgeX: 210,
      rank2BadgeY: 578,
      rank2NameX: 240,
      rank2NameY: 578,
      rank2UnitX: 240,
      rank2UnitY: 604,
      rank3BadgeX: 210,
      rank3BadgeY: 663,
      rank3NameX: 240,
      rank3NameY: 663,
      rank3UnitX: 240,
      rank3UnitY: 689,
      titleFont: '500 "Fractul Alt", sans-serif',
      resultLabelFont: '500 "Fractul Alt", sans-serif',
      winnerFont: '500 "Fractul Alt", sans-serif',
      unitFont: '500 "Fractul Alt", sans-serif',
      rankFont: '500 "Fractul Alt", sans-serif',
      fontFamily: '500 "Fractul Alt", sans-serif',
      uppercaseNames: false,
      rankBadgeShape: 'none' as 'pill' | 'circle' | 'rectangle' | 'none',
      rankBadgeShapeSize: 20,
      rank1Color: '#ffffff',
      rank2Color: '#ffffff',
      rank3Color: '#ffffff',
      rankTextColor: '#ffffff',
      rank1Text: 'I',
      rank2Text: 'II',
      rank3Text: 'III',
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
        'Sirafi Seafarers': 'TEAM السِّيرَافِي',
        'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
        'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي'
      } as Record<string, string>,
    };
  }

  return {
    titleColor: '#fbbf24',
    winnerColor: '#ffffff',
    unitColor: '#34d399',
    titleSize: 36,
    resultLabelText: 'RESULT',
    resultLabelX: 470,
    resultLabelY: 180,
    resultLabelSize: 28,
    resultLabelColor: '#ffffff',
    resultNumX: 600,
    resultNumY: 180,
    resultNumSize: 28,
    resultNumColor: '#ffffff',
    categorySize: 32,
    compNameSize: 52,
    winnerSize: 44,
    unitSize: 30,
    rankSize: 38,
    titleX: 540,
    titleY: 110,
    categoryX: 540,
    categoryY: 260,
    compNameX: 540,
    compNameY: 330,
    rank1BadgeX: 140,
    rank1BadgeY: 460,
    rank1NameX: 260,
    rank1NameY: 448,
    rank1UnitX: 260,
    rank1UnitY: 483,
    rank2BadgeX: 140,
    rank2BadgeY: 640,
    rank2NameX: 260,
    rank2NameY: 628,
    rank2UnitX: 260,
    rank2UnitY: 663,
    rank3BadgeX: 140,
    rank3BadgeY: 820,
    rank3NameX: 260,
    rank3NameY: 808,
    rank3UnitX: 260,
    rank3UnitY: 843,
    fontFamily: 'sans-serif',
    uppercaseNames: false,
    rankBadgeShape: 'pill',
    rankBadgeShapeSize: 40,
    rank1Color: '#fbbf24',
    rank2Color: '#e2e8f0',
    rank3Color: '#d97706',
    rankTextColor: '#000000',
    rank1Text: 'Rank 1',
    rank2Text: 'Rank 2',
    rank3Text: 'Rank 3',
    showFooter: true,
    showFooterBg: false,
    footerLine1: '',
    footerLine2: '',

    // Block Letters (Uppercase) options
    campusNameUppercase: true,
    festNameUppercase: true,
    resultLabelUppercase: true,
    resultNumUppercase: false,
    categoryUppercase: true,
    compNameUppercase: false,
    winnerUppercase: false,
    unitUppercase: true,

    // Language / Arabic options for Units/Teams
    useTeamColors: false,
    unitColors: {} as Record<string, string>,
    unitLanguage: 'ar', // 'en' | 'ar'
    unitArabicNames: {
      'Sirafi Seafarers': 'TEAM السِّيرَافِي',
      'Tabrizi Taraz': 'TEAM التَّبْرِيزِي',
      'Zanzibari Souqs': 'TEAM الزَّنْجَبَارِي',
    },
  };
}

// Migrate old flat config to per-theme (same logic as PosterSettingsView)

export function migrateOldConfig(templateConfig: any, defaultThemes: string[]): any {
  if (templateConfig.themeConfigs) {
    return templateConfig;
  }
  const oldConf = { ...templateConfig };
  const customThemes = oldConf.customThemes || defaultThemes;
  const themeRules = oldConf.themeRules || [];
  delete oldConf.customThemes;
  delete oldConf.themeRules;

  if (oldConf.badgeX !== undefined) {
    oldConf.resultLabelX = oldConf.resultLabelX ?? (oldConf.badgeX - 60);
    oldConf.resultLabelY = oldConf.resultLabelY ?? oldConf.badgeY;
    oldConf.resultLabelSize = oldConf.resultLabelSize ?? (oldConf.badgeSize ?? 28);
    oldConf.resultNumX = oldConf.resultNumX ?? (oldConf.badgeX + 60);
    oldConf.resultNumY = oldConf.resultNumY ?? oldConf.badgeY;
    oldConf.resultNumSize = oldConf.resultNumSize ?? (oldConf.badgeSize ?? 28);
  }

  const wsx = oldConf.winnersStartX ?? 140;
  const wsy = oldConf.winnersStartY ?? 460;
  oldConf.rank1BadgeX = oldConf.rank1BadgeX ?? wsx;
  oldConf.rank1BadgeY = oldConf.rank1BadgeY ?? wsy;
  oldConf.rank1NameX = oldConf.rank1NameX ?? (wsx + 120);
  oldConf.rank1NameY = oldConf.rank1NameY ?? (wsy - 12);
  oldConf.rank1UnitX = oldConf.rank1UnitX ?? (wsx + 120);
  oldConf.rank1UnitY = oldConf.rank1UnitY ?? (wsy + 23);
  oldConf.rank2BadgeX = oldConf.rank2BadgeX ?? wsx;
  oldConf.rank2BadgeY = oldConf.rank2BadgeY ?? (wsy + 180);
  oldConf.rank2NameX = oldConf.rank2NameX ?? (wsx + 120);
  oldConf.rank2NameY = oldConf.rank2NameY ?? (wsy + 168);
  oldConf.rank2UnitX = oldConf.rank2UnitX ?? (wsx + 120);
  oldConf.rank2UnitY = oldConf.rank2UnitY ?? (wsy + 203);
  oldConf.rank3BadgeX = oldConf.rank3BadgeX ?? wsx;
  oldConf.rank3BadgeY = oldConf.rank3BadgeY ?? (wsy + 360);
  oldConf.rank3NameX = oldConf.rank3NameX ?? (wsx + 120);
  oldConf.rank3NameY = oldConf.rank3NameY ?? (wsy + 348);
  oldConf.rank3UnitX = oldConf.rank3UnitX ?? (wsx + 120);
  oldConf.rank3UnitY = oldConf.rank3UnitY ?? (wsy + 383);
  oldConf.rank1Text = oldConf.rank1Text ?? ((oldConf.rankPrefix ?? 'Rank ') + '1');
  oldConf.rank2Text = oldConf.rank2Text ?? ((oldConf.rankPrefix ?? 'Rank ') + '2');
  oldConf.rank3Text = oldConf.rank3Text ?? ((oldConf.rankPrefix ?? 'Rank ') + '3');

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
  const defaultThemes = [
    '/themes/theme_brown.jpg',
    '/themes/theme_blue.jpg',
    '/themes/theme_yellow.jpg',
    '/themes/theme_purple.jpg'
  ];
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
    ctx.fillText(rLblText, rx, ry);
    addRegion('resultLabel', rx - 10, ry - (c.resultLabelSize || 28) - 5, rLblMetrics.width + 20, (c.resultLabelSize || 28) + 20);

    // Result Number (e.g. "01", "10", "105")
    ctx.textAlign = 'left';
    ctx.font = parseFontForCanvas(c.resultNumFont || c.fontFamily, c.resultNumSize || 28, '800');
    ctx.fillStyle = c.resultNumColor || '#ffffff';
    const rNumX = c.resultNumX ?? 600;
    const rNumY = c.resultNumY ?? 180;
    ctx.fillText(formattedNum, rNumX, rNumY);
    const rNumMetrics = ctx.measureText(formattedNum);
    addRegion('resultNum', rNumX - 10, rNumY - (c.resultNumSize || 28) - 5, rNumMetrics.width + 20, (c.resultNumSize || 28) + 20);

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
    ctx.textAlign = 'left';
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
        ctx.textAlign = 'left';
        let winnerFontSize = c.winnerSize || 34;
        const nameLines = winnerName.split('\n').filter(Boolean);
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
  const festivalTitle = (eventSettings?.festivalName || 'RENDEZVOUS 26').toUpperCase();
  const formattedNum = String(compIndex || 1).padStart(2, '0');
  const slogan = eventSettings?.festivalTagline || eventSettings?.slogan || 'Meelad Fest';
  const campus = eventSettings?.campusName || eventSettings?.sectorName || 'Swalahul Huda Academy';
  const hashtags = eventSettings?.shareHashtags || '#Fanous2K26 #SwalahulHudaAcademy #MeeladFest #Results #Muchila';

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
${hashtags}`;
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

