const fs = require('fs');
const srcPath = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/PostersView.tsx';
const destPath = 'src/utils/posterRenderer.ts';
const content = fs.readFileSync(srcPath, 'utf8');

const defaultThemeConfigBody = content.split('function getDefaultThemeConfig(): any {')[1].split('function migrateOldConfig')[0];

const body2 = 'export function migrateOldConfig' + content.split('function migrateOldConfig')[1].split('export default function PosterGeneratorView')[0];

const overlayLogicStr = content.split('const drawPosterOverlay = (ctx: CanvasRenderingContext2D, W: number, H: number, compIdx: number, themeIdx: number) => {')[1].split('hitRegions.current = regions;')[0];

const finalFile = `
export const getPosterTeamColor = (unitOrTeamName?: string, defaultColor: string = '#34d399'): string => {
  if (!unitOrTeamName) return defaultColor;
  const str = unitOrTeamName.toString().trim().toLowerCase();
  const normalized = str.replace(/[\\s\\-_]/g, '');

  if (
    normalized.includes('shukr') ||
    normalized.includes('shukur') ||
    normalized.includes('shukoor') ||
    normalized.includes('ശുക്') ||
    normalized.includes('ശുക്കൂർ') ||
    normalized === 'shk' ||
    str === 'shk'
  ) {
    return '#2b2bc3';
  }

  if (
    normalized.includes('sabr') ||
    normalized.includes('sabar') ||
    normalized.includes('സ്വബ്') ||
    normalized.includes('സബ്ർ') ||
    normalized.includes('സ്വബർ') ||
    normalized === 'sbr' ||
    str === 'sbr'
  ) {
    return '#1b5e20';
  }

  return defaultColor;
};

export function getDefaultThemeConfig(): any {
` + defaultThemeConfigBody + '\n' + body2 + `

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

  const rawTemplateConfig = eventSettings?.posterTemplateConfig || {};
  const defaultThemes = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEzNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZzEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDIwNjE3Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTFiNGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiBmaWxsPSJ1cmwoI2cxKSIvPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEzNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZzIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDIyYzIyIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMwNjRlM2IiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNjVmNDYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiBmaWxsPSJ1cmwoI2cyKSIvPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEzNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZzMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDUwYTBhIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiM4ODEzMzciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5ZjEyMzkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiBmaWxsPSJ1cmwoI2czKSIvPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEzNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZzQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDkwOTBiIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMxODE4MWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyNzI3MmEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMzUwIiBmaWxsPSJ1cmwoI2c0KSIvPjwvc3ZnPg=='
  ];
  const migratedConfig = migrateOldConfig({
    ...rawTemplateConfig,
    customThemes: rawTemplateConfig.customThemes || defaultThemes
  }, defaultThemes);

  const customThemes: string[] = migratedConfig.customThemes || defaultThemes;
  const themeRules: any[] = migratedConfig.themeRules || [];
  const themeConfigs: any = migratedConfig.themeConfigs || {};

  const getThemeIndexForResult = (resultNum: number, catName?: string, catId?: string): number => {
    const rule = themeRules.find((r: any) => {
      if (r.type === 'category' || r.categoryId || r.categoryName) {
        if (catId && r.categoryId && r.categoryId === catId) return true;
        if (catName && (r.categoryName || r.category)) {
          const rCat = (r.categoryName || r.category).toString().trim().toLowerCase();
          if (rCat === catName.trim().toLowerCase()) return true;
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
  const c = { ...getDefaultThemeConfig(), ...(themeConfigs[themeIdx] || {}) };
  const backgroundSource = customThemes[themeIdx] || customThemes[0];
  
  const festivalName = eventSettings?.festivalName || 'Sahityotsav';
  const campusName = eventSettings?.campusName || eventSettings?.sectorName || 'Campus';
  
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;

  const drawOverlay = () => {
    const activeCategory = { name: categoryName };
    const activeComp = { name: compName };
    // dummy addRegion
    const addRegion = () => {};
    let hoveredElement = null;
    let dragging = null;
    
    ` + overlayLogicStr.replace(/if \(res.participantId\) \{[\s\S]*?\} else if \(res.teamId\) \{[\s\S]*?\n\s*\}/g, 'winnerName = (c.winnerUppercase || c.uppercaseNames) ? res.participantName.toUpperCase() : res.participantName;\n          winnerUnit = res.department;') + `
  };

  return new Promise((resolve) => {
    if (backgroundSource) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H);
        drawOverlay();
        resolve(true);
      };
      img.onerror = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        drawOverlay();
        resolve(true);
      }
      img.src = backgroundSource;
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      drawOverlay();
      resolve(true);
    }
  });
};
`;

if (!fs.existsSync('src/utils')) fs.mkdirSync('src/utils');
fs.writeFileSync(destPath, finalFile);
console.log('Done rendering utils');
