import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary Configuration Helper
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim().replace(/^["']|["']$/g, ''),
      api_key: apiKey.trim().replace(/^["']|["']$/g, ''),
      api_secret: apiSecret.trim().replace(/^["']|["']$/g, '')
    });
  }
};

const uploadDir = os.tmpdir();
const upload = multer({ dest: uploadDir, limits: { fileSize: 1024 * 1024 * 500 } });

app.set('etag', false);

// Enable CORS & HTTP caching headers for optimized asset delivery
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'GET') {
    if (req.url.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|webm|woff2)$/i)) {
      res.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.startsWith('/api/')) {
      res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
      res.header('Surrogate-Control', 'no-store');
    }
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =========================================================================
// 🔄 DYNAMIC PROXY MIDDLEWARE FOR ADMIN VERCEL URL
// =========================================================================
app.use('/api', async (req, res, next) => {
  // Never proxy public endpoints - serve them directly from local MongoDB & instant cache!
  if (req.url.startsWith('/public') || req.url.startsWith('/v1/public')) {
    return next();
  }

  const adminUrl = process.env.ADMIN_API_URL || process.env.VITE_API_BASE_URL;
  if (!adminUrl || adminUrl.trim() === '') {
    return next(); // Proceed to local MongoDB/handler logic below
  }

  const cleanAdminUrl = adminUrl.trim().replace(/\/$/, '');
  const targetUrl = `${cleanAdminUrl}/api${req.url}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const proxyRes = await fetch(targetUrl, fetchOptions);
    res.status(proxyRes.status);

    proxyRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
        res.setHeader(key, val);
      }
    });

    const data = await proxyRes.arrayBuffer();
    return res.send(Buffer.from(data));
  } catch (err) {
    console.error(`Vercel Proxy error to ${targetUrl}:`, err.message);
    return next(); // Fallback to direct MongoDB handlers
  }
});

// =========================================================================
// 🍃 MONGODB ATLAS DATABASE CONNECTION ENGINE
// =========================================================================
let cachedClient = null;
let cachedDb = null;

async function getMongoDb() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) return null;

  if (cachedDb) return cachedDb;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(mongoUri, {
        maxPoolSize: 20,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      });
      await cachedClient.connect();
    }
    const dbPath = mongoUri.includes('/') ? mongoUri.split('/').pop()?.split('?')[0] : null;
    const dbName = (dbPath && dbPath.length > 0) ? dbPath : 'rendezvous_2026';
    cachedDb = cachedClient.db(dbName);
    return cachedDb;
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
    return null;
  }
}

// In-memory cache for high performance & instant responses (15-second TTL, invalidated immediately on write)
let cachedDbState = null;
let lastDbStateTime = 0;
const DB_STATE_CACHE_TTL = 4000; // 4-second TTL for instantaneous real-time sync

export function invalidateDbCache() {
  lastDbStateTime = 0;
  cachedDbState = null;
}

// Internal webhook for real-time cache busting from Admin Server
app.post('/api/internal/cache-bust', (req, res) => {
  const secret = req.headers['x-internal-secret'] || req.query.secret || req.body?.secret;
  const expectedSecret = process.env.INTERNAL_CACHE_BUST_SECRET || 'rendezvous_secret_cache_bust_2026';
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized cache bust' });
  }
  invalidateDbCache();
  console.log('⚡ [Real-Time Sync] Public cache invalidated via internal webhook.');
  return res.json({ success: true, timestamp: Date.now() });
});

// Invalidate cache immediately on any write/mutation request so data is never stale
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || req.query.t) {
    if (Date.now() - lastDbStateTime > 2000) {
      lastDbStateTime = 0;
    }
  }
  next();
});

let _dbStatePromise = null;

// Helper to fetch core database state from MongoDB with in-memory caching
async function getDbState(force = false) {
  const now = Date.now();
  if (!force && cachedDbState && (now - lastDbStateTime < DB_STATE_CACHE_TTL)) {
    return cachedDbState;
  }

  if (_dbStatePromise) return _dbStatePromise;

  _dbStatePromise = (async () => {
    const db = await getMongoDb();
    let state = {
      settings: {},
      eventSettings: {},
      units: [],
      categories: [],
      competitions: [],
      participants: [],
      teams: [],
      results: [],
      chestNumbers: [],
      judgmentSheets: [],
      registrations: [],
      gallery: [],
      videoHighlights: [],
      dragBlocks: [],
      heroMedia: [],
      cmsSettings: {}
    };

    if (!db) return cachedDbState || state;

    try {
      // Fetch only core operational collections in parallel
      const [
        settingsDocs, unitsDocs, categoriesDocs, competitionsDocs,
        participantsDocs, teamsDocs, resultsDocs, chestDocs,
        galleryDocs, videoDocs, dragBlocksDocs, heroMediaDocs,
        judgmentSheetsDocs, registrationsDocs
      ] = await Promise.all([
        db.collection('settings').find({}).toArray().catch(() => []),
        db.collection('units').find({}).toArray().catch(() => []),
        db.collection('categories').find({}).toArray().catch(() => []),
        db.collection('competitions').find({}).toArray().catch(() => []),
        db.collection('participants').find({}).toArray().catch(() => []),
        db.collection('teams').find({}).toArray().catch(() => []),
        db.collection('results').find({}).toArray().catch(() => []),
        db.collection('chestNumbers').find({}).toArray().catch(() => []),
        db.collection('gallery').find({}).toArray().catch(() => []),
        db.collection('videoHighlights').find({}).toArray().catch(() => []),
        db.collection('dragBlocks').find({}).toArray().catch(() => []),
        db.collection('heroMedia').find({}).toArray().catch(() => []),
        db.collection('judgmentSheets').find({}).toArray().catch(() => []),
        db.collection('registrations').find({}).toArray().catch(() => [])
      ]);

      settingsDocs.forEach(s => {
        const { _id, ...rest } = s;
        if (_id === 'eventSettings') {
          state.eventSettings = { ...state.eventSettings, ...rest };
          if (rest.publishedTeamStandings) {
            state.settings.publishedTeamStandings = rest.publishedTeamStandings;
          }
        }
        if (_id === 'cmsSettings') {
          state.cmsSettings = { ...rest };
          if (rest.publishedTeamStandings) {
            state.settings.publishedTeamStandings = rest.publishedTeamStandings;
          }
        }
        if (_id === 'publishedTeamStandings') {
          state.settings.publishedTeamStandings = { ...rest };
        }
        if (_id === 'posterOverrides') {
          const loadedOverrides = rest.overrides || rest;
          state.posterOverrides = { ...(state.posterOverrides || {}), ...loadedOverrides };
          state.eventSettings.posterOverrides = { ...(state.eventSettings.posterOverrides || {}), ...loadedOverrides };
        }
        if (_id === 'posterTemplateConfig') {
          state.posterTemplateConfig = { ...rest };
          state.eventSettings.posterTemplateConfig = { ...rest };
        }
        if (_id === 'certificateTemplateConfig') {
          state.certificateTemplateConfig = { ...rest };
          state.eventSettings.certificateTemplateConfig = { ...rest };
        }
      });
      state.db = db;

      // Ensure only the 4 Querencia poster themes are used
      const defaultPosterThemes = [
        '/themes/theme_green_waves.jpg',
        '/themes/theme_green_cards.jpg',
        '/themes/theme_red_star.jpg',
        '/themes/theme_yellow_curve.jpg'
      ];
      const oldThemePatterns = [
        'theme_brown', 'theme_blue', 'theme_yellow.jpg', 'theme_purple',
        'theme_green.jpg', 'theme_phytolore', 'theme_white_brown', 'theme_yellow_scroll'
      ];
      const isOldTheme = (url) => !url || typeof url !== 'string' || oldThemePatterns.some(p => url.includes(p));

      const ptc = state.posterTemplateConfig || state.eventSettings?.posterTemplateConfig;
      if (ptc) {
        if (!Array.isArray(ptc.customThemes) || ptc.customThemes.length === 0 || ptc.customThemes.some(isOldTheme)) {
          ptc.customThemes = [...defaultPosterThemes];
        } else if (ptc.customThemes.length < 4) {
          ptc.customThemes = defaultPosterThemes.map((dt, idx) => ptc.customThemes[idx] || dt);
        } else if (ptc.customThemes.length > 4) {
          ptc.customThemes = ptc.customThemes.filter(t => !isOldTheme(t)).slice(0, 4);
          if (ptc.customThemes.length < 4) {
            ptc.customThemes = [...defaultPosterThemes];
          }
        }
      }

      const dedupeDocs = (docs) => {
        const map = new Map();
        docs.forEach(d => {
          const docId = d.id || d._id;
          if (docId) map.set(docId.toString(), { id: docId, ...d });
        });
        return Array.from(map.values());
      };

      if (unitsDocs && unitsDocs.length > 0) state.units = dedupeDocs(unitsDocs);
      if (categoriesDocs && categoriesDocs.length > 0) state.categories = dedupeDocs(categoriesDocs);
      if (competitionsDocs && competitionsDocs.length > 0) state.competitions = dedupeDocs(competitionsDocs);
      if (participantsDocs && participantsDocs.length > 0) state.participants = dedupeDocs(participantsDocs);
      if (teamsDocs && teamsDocs.length > 0) state.teams = dedupeDocs(teamsDocs);
      if (resultsDocs && resultsDocs.length > 0) state.results = dedupeDocs(resultsDocs);
      if (chestDocs && chestDocs.length > 0) state.chestNumbers = dedupeDocs(chestDocs);
      if (judgmentSheetsDocs && judgmentSheetsDocs.length > 0) state.judgmentSheets = dedupeDocs(judgmentSheetsDocs);
      if (registrationsDocs && registrationsDocs.length > 0) state.registrations = dedupeDocs(registrationsDocs);
      if (galleryDocs && galleryDocs.length > 0) state.gallery = dedupeDocs(galleryDocs);
      if (videoDocs && videoDocs.length > 0) state.videoHighlights = dedupeDocs(videoDocs);
      if (dragBlocksDocs && dragBlocksDocs.length > 0) state.dragBlocks = dedupeDocs(dragBlocksDocs);
      if (heroMediaDocs && heroMediaDocs.length > 0) state.heroMedia = dedupeDocs(heroMediaDocs);

      cachedDbState = state;
      lastDbStateTime = Date.now();
    } catch (err) {
      console.error('Error assembling DB state from MongoDB:', err.message);
    }

    return cachedDbState || state;
  })().finally(() => {
    _dbStatePromise = null;
  });

  return _dbStatePromise;
}

const DEFAULT_DRAG_BLOCKS = [
  { id: '1', title: 'Hero Section', type: 'hero', enabled: true, order: 1 },
  { id: '2', title: 'About & Concept', type: 'about', enabled: true, order: 2 },
  { id: '3', title: 'Live Team Standings', type: 'results', enabled: true, order: 3 },
  { id: '4', title: 'Announced Results & Placements', type: 'announcements', enabled: true, order: 4 },
  { id: '5', title: 'Photo Hub (Drive & QR)', type: 'smile', enabled: false, order: 5 },
  { id: '6', title: 'Media Gallery (Photo Uploads)', type: 'gallery', enabled: false, order: 6 },
  { id: '7', title: 'Live Broadcast Streams', type: 'live_stages', enabled: false, order: 7 },
  { id: '8', title: 'Video Highlights & Stage Clips', type: 'highlights', enabled: false, order: 8 }
];

// =========================================================================
// 🌐 PUBLIC WEBSITE API ENDPOINTS
// =========================================================================

// Smart Edge caching for public endpoints: serves instantly from Edge CDN for 3s while keeping data live
app.use('/api/public', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=1, s-maxage=3, stale-while-revalidate=10');
  next();
});

// Public CMS Layout & Settings Endpoint
app.get('/api/public/cms', async (req, res) => {
  const dbState = await getDbState();
  res.json({
    dragBlocks: dbState.dragBlocks && dbState.dragBlocks.length > 0 ? dbState.dragBlocks : DEFAULT_DRAG_BLOCKS,
    cmsSettings: dbState.cmsSettings || {},
    heroMedia: dbState.heroMedia || []
  });
});

// Settings: GET (both public & authenticated)
app.get(['/api/settings', '/api/public/settings'], async (req, res) => {
  const dbState = await getDbState();
  const raw = dbState.eventSettings || dbState.settings || {};
  const settings = {
    ...raw,
    posterTemplateConfig: dbState.posterTemplateConfig || raw.posterTemplateConfig,
    certificateTemplateConfig: dbState.certificateTemplateConfig || raw.certificateTemplateConfig,
    posterOverrides: raw.posterOverrides || dbState.posterOverrides || {}
  };
  if (!settings.participantLoginCriteria || settings.participantLoginCriteria === 'dob') {
    settings.participantLoginCriteria = 'class';
  }
  if (!settings.availableClasses || settings.availableClasses.length === 0) {
    settings.availableClasses = ['JD1', 'JD2', 'JD3', 'HS1', 'HS2', 'BS1'];
  }
  res.json(settings);
});

// Settings: PUT (save posterOverrides, posterTemplateConfig, eventSettings)
app.put('/api/settings', async (req, res) => {
  try {
    const db = await getMongoDb();
    if (!db) {
      return res.status(500).json({ error: 'Database connection unavailable' });
    }

    const { posterTemplateConfig, certificateTemplateConfig, posterOverrides, ...otherSettings } = req.body;
    const tasks = [];

    // 1. Update eventSettings
    const settingsUpdate = { ...otherSettings };
    if (posterOverrides) {
      settingsUpdate.posterOverrides = posterOverrides;
    }
    if (Object.keys(settingsUpdate).length > 0) {
      tasks.push(db.collection('settings').updateOne(
        { _id: 'eventSettings' },
        { $set: settingsUpdate },
        { upsert: true }
      ));
    }

    // 2. Update posterOverrides specifically in its own doc if provided
    if (posterOverrides) {
      tasks.push(db.collection('settings').updateOne(
        { _id: 'posterOverrides' },
        { $set: { overrides: posterOverrides, ...posterOverrides } },
        { upsert: true }
      ));
    }

    // 3. Update posterTemplateConfig if provided
    if (posterTemplateConfig) {
      tasks.push(db.collection('settings').updateOne(
        { _id: 'posterTemplateConfig' },
        { $set: posterTemplateConfig },
        { upsert: true }
      ));
    }

    // 4. Update certificateTemplateConfig if provided
    if (certificateTemplateConfig) {
      tasks.push(db.collection('settings').updateOne(
        { _id: 'certificateTemplateConfig' },
        { $set: certificateTemplateConfig },
        { upsert: true }
      ));
    }

    await Promise.all(tasks);
    invalidateDbCache();

    console.log('✅ [Settings] Successfully updated settings in MongoDB rendezvous_2026.');
    res.json({ message: 'Settings updated successfully', success: true });
  } catch (err) {
    console.error('❌ Failed to save settings in server.mjs:', err);
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// Public Units
app.get('/api/public/units', async (req, res) => {
  const dbState = await getDbState();
  const units = (dbState.units || []).filter(u => u.active !== false);
  res.json(units);
});

// Public Categories
app.get('/api/public/categories', async (req, res) => {
  const dbState = await getDbState();
  const categories = (dbState.categories || []).filter(c => c.active !== false);
  res.json(categories);
});

// Public Competitions
app.get('/api/public/competitions', async (req, res) => {
  const dbState = await getDbState();
  const competitions = (dbState.competitions || []).filter(c => c.active !== false);
  res.json(competitions);
});

const DEFAULT_TEAM_SIZE_TIERS = [
  { id: 'tier_ind', name: '1 Member', minMembers: 1, maxMembers: 1, pointsAPlus: 6, pointsA: 5, pointsB: 3, pointsC: 1, pointsNoGrade: 0 },
  { id: 'tier_2', name: '2 Members', minMembers: 2, maxMembers: 2, pointsAPlus: 7, pointsA: 6, pointsB: 4, pointsC: 2, pointsNoGrade: 0 },
  { id: 'tier_3', name: '3 Members', minMembers: 3, maxMembers: 3, pointsAPlus: 10, pointsA: 9, pointsB: 6, pointsC: 3, pointsNoGrade: 0 },
  { id: 'tier_4_5', name: '4-5 Members', minMembers: 4, maxMembers: 5, pointsAPlus: 18, pointsA: 15, pointsB: 10, pointsC: 5, pointsNoGrade: 0 },
  { id: 'tier_10', name: '10 Members', minMembers: 10, maxMembers: 10, pointsAPlus: 25, pointsA: 20, pointsB: 12, pointsC: 6, pointsNoGrade: 0 },
  { id: 'tier_project', name: 'Project', minMembers: 1, maxMembers: 99, matchKeywords: ['project', 'പ്രോജക്ട്'], pointsAPlus: 25, pointsA: 20, pointsB: 12, pointsC: 6, pointsNoGrade: 0 },
  { id: 'tier_vlog', name: 'Vlog', minMembers: 1, maxMembers: 99, matchKeywords: ['vlog', 'social story'], pointsAPlus: 25, pointsA: 20, pointsB: 12, pointsC: 6, pointsNoGrade: 0 }
];

const DEFAULT_GRADE_MATRIX = [
  { id: '1', minMark: 90, maxMark: 100, indGrade: 'A+', indPoints: 6, groupGrade: 'A+', groupPoints: 12, group2Points: 7, group3Points: 10, group4_5Points: 18, group10Points: 25 },
  { id: '2', minMark: 70, maxMark: 89, indGrade: 'A', indPoints: 5, groupGrade: 'A', groupPoints: 10, group2Points: 6, group3Points: 9, group4_5Points: 15, group10Points: 20 },
  { id: '3', minMark: 60, maxMark: 69, indGrade: 'B', indPoints: 3, groupGrade: 'B', groupPoints: 6, group2Points: 4, group3Points: 6, group4_5Points: 10, group10Points: 12 },
  { id: '4', minMark: 50, maxMark: 59, indGrade: 'C', indPoints: 1, groupGrade: 'C', groupPoints: 2, group2Points: 2, group3Points: 3, group4_5Points: 5, group10Points: 6 },
  { id: '5', minMark: 0, maxMark: 49, indGrade: '-', indPoints: 0, groupGrade: '-', groupPoints: 0, group2Points: 0, group3Points: 0, group4_5Points: 0, group10Points: 0 }
];

function calculateGrade(mark, isGroup = false, eventSettings = {}, categoryId = null) {
  const m = Math.round(Number(mark) || 0);
  if (m <= 0 || isNaN(m)) return '';

  const settings = eventSettings || {};

  // Custom gradeMatrix if configured in settings
  if (settings?.gradeMatrix && Array.isArray(settings.gradeMatrix) && settings.gradeMatrix.length > 0) {
    let matrix = settings.gradeMatrix;
    if (settings?.categorySpecificGradesEnabled && categoryId && settings?.categoryGradeMatrices?.[categoryId] && Array.isArray(settings.categoryGradeMatrices[categoryId]) && settings.categoryGradeMatrices[categoryId].length > 0) {
      matrix = settings.categoryGradeMatrices[categoryId];
    }
    const sorted = [...matrix].sort((a, b) => Number(b.minMark) - Number(a.minMark));
    for (const row of sorted) {
      if (m >= Number(row.minMark)) {
        const g = isGroup ? row.groupGrade : row.indGrade;
        return (!g || g === '-' || g === 'None') ? '' : g;
      }
    }
  }

  // Official Sahityotsav '26 Scale:
  // A+: 90–100, A: 70–89, B: 60–69, C: 50–59, Below 50: No grade
  if (m >= 90) return 'A+';
  if (m >= 70) return 'A';
  if (m >= 60) return 'B';
  if (m >= 50) return 'C';
  return '';
}

function getNormalizedMark(r) {
  if (!r) return 0;
  if (r.status === 'absent' || r.isAbsent) return 0;
  if (r.averageMark !== undefined && r.averageMark !== null && !isNaN(r.averageMark)) return Number(r.averageMark);
  const j1 = Number(r.judge1Mark) || 0;
  const j2 = Number(r.judge2Mark) || 0;
  if (j1 > 0 || j2 > 0) {
    const activeJudges = (j1 > 0 ? 1 : 0) + (j2 > 0 ? 1 : 0) || 1;
    return Math.round(((j1 + j2) / activeJudges) * 100) / 100;
  }
  if (r.totalMark !== undefined && r.totalMark !== null && !isNaN(r.totalMark)) return Number(r.totalMark);
  if (r.marks !== undefined && r.marks !== null && !isNaN(r.marks)) return Number(r.marks);
  return 0;
}

function calculateResultPoints(r, comp, eventSettings = {}) {
  const settings = eventSettings || {};
  const gradeSystemEnabled = settings?.gradeSystemEnabled !== false;
  const combineGradeAndRankPoints = settings?.combineGradeAndRankPoints === true || (Number(settings?.globalPointsRank1) > 0 && gradeSystemEnabled);
  const pointDistributionMode = settings?.pointDistributionMode || (settings?.categorySpecificGradesEnabled ? 'category_wise' : 'team_size');

  if (r.status === 'absent' || r.isAbsent) return 0;
  const mark = getNormalizedMark(r);
  const m = Math.round(Number(mark) || 0);

  const isGroup = !!r.teamId || comp?.participationType === 'group' || comp?.isGroup === true || String(comp?.participationType).toLowerCase() === 'group';
  const catId = r.categoryId || comp?.categoryId;
  const grade = r.grade || (m > 0 ? calculateGrade(m, isGroup, settings, catId) : '');

  const compName = (comp?.name || r.eventName || r.competitionName || '').toLowerCase();
  let teamSize = Number(comp?.teamSize) || (isGroup ? 2 : 1);
  if (r.teamId && Array.isArray(r.teamMemberIds) && r.teamMemberIds.length > 0) {
    teamSize = r.teamMemberIds.length;
  }

  // 1. Calculate Grade Points based on active Point Distribution Mode
  let gradePoints = 0;
  if (gradeSystemEnabled && m > 0 && grade) {
    if (pointDistributionMode === 'team_size') {
      const tiers = (settings?.teamSizePointTiers && Array.isArray(settings.teamSizePointTiers) && settings.teamSizePointTiers.length > 0)
        ? settings.teamSizePointTiers
        : DEFAULT_TEAM_SIZE_TIERS;

      let matchedTier = tiers.find(t =>
        Array.isArray(t.matchKeywords) && t.matchKeywords.some(kw => compName.includes(kw.toLowerCase()))
      );

      if (!matchedTier) {
        matchedTier = tiers.find(t => teamSize >= t.minMembers && teamSize <= t.maxMembers);
      }

      if (!matchedTier) {
        matchedTier = teamSize === 1 ? tiers[0] : (tiers.find(t => t.minMembers > 1) || tiers[0]);
      }

      if (matchedTier) {
        if (grade === 'A+') gradePoints = matchedTier.pointsAPlus;
        else if (grade === 'A') gradePoints = matchedTier.pointsA;
        else if (grade === 'B+' || grade === 'B') gradePoints = matchedTier.pointsB;
        else if (grade === 'C+' || grade === 'C') gradePoints = matchedTier.pointsC;
        else if (grade === '-' || grade === 'No Grade' || !grade) gradePoints = matchedTier.pointsNoGrade ?? 0;
      }
    } else {
      let matrix = (settings?.gradeMatrix && Array.isArray(settings.gradeMatrix) && settings.gradeMatrix.length > 0)
        ? settings.gradeMatrix
        : DEFAULT_GRADE_MATRIX;
      if (pointDistributionMode === 'category_wise' && catId && settings?.categoryGradeMatrices?.[catId] && Array.isArray(settings.categoryGradeMatrices[catId]) && settings.categoryGradeMatrices[catId].length > 0) {
        matrix = settings.categoryGradeMatrices[catId];
      }

      const sorted = [...matrix].sort((a, b) => Number(b.minMark) - Number(a.minMark));
      for (const row of sorted) {
        if (m >= Number(row.minMark)) {
          if (!isGroup || teamSize === 1) {
            gradePoints = Number(row.indPoints) || 0;
          } else if (teamSize === 2) {
            gradePoints = (row.group2Points !== undefined && row.group2Points !== null) ? Number(row.group2Points) : (Number(row.groupPoints) || 0);
          } else if (teamSize === 3) {
            gradePoints = (row.group3Points !== undefined && row.group3Points !== null) ? Number(row.group3Points) : (Number(row.groupPoints) || 0);
          } else if (teamSize === 4 || teamSize === 5) {
            gradePoints = (row.group4_5Points !== undefined && row.group4_5Points !== null) ? Number(row.group4_5Points) : (Number(row.groupPoints) || 0);
          } else if (teamSize >= 10) {
            gradePoints = (row.group10Points !== undefined && row.group10Points !== null) ? Number(row.group10Points) : (row.group4_5Points !== undefined ? Number(row.group4_5Points) : (Number(row.groupPoints) || 0));
          } else {
            gradePoints = (row.group4_5Points !== undefined && row.group4_5Points !== null) ? Number(row.group4_5Points) : (Number(row.groupPoints) || 0);
          }
          break;
        }
      }
    }
  }

  // 2. Calculate Rank Points
  let rankPoints = 0;
  if (!gradeSystemEnabled || combineGradeAndRankPoints) {
    const numRank = Number(r.rank);
    if (numRank >= 1 && numRank <= 10) {
      const settingsKey = `globalPointsRank${numRank}`;
      const settingsVal = settings?.[settingsKey] ?? settings?.[`pointsRank${numRank}`];
      if (settingsVal !== undefined && settingsVal !== null && !isNaN(Number(settingsVal))) {
        rankPoints = Number(settingsVal);
      } else {
        const defaultMap = { 1: 5, 2: 3, 3: 1 };
        rankPoints = defaultMap[numRank] || 0;
      }
    }
  }

  // 3. Return total points
  if (gradeSystemEnabled && combineGradeAndRankPoints) {
    return gradePoints + rankPoints;
  }
  if (gradeSystemEnabled) {
    return gradePoints;
  }
  return rankPoints;
}

const calculatePoints = calculateResultPoints;

// Public Published Results
app.get('/api/public/results', async (req, res) => {
  const dbState = await getDbState();
  const { results = [], competitions = [], categories = [], participants = [], teams = [], chestNumbers = [], units = [], eventSettings = {}, judgmentSheets = [] } = dbState;

  // Set of competitions that are published via judgment sheets
  const publishedSheetCompIds = new Set(
    (judgmentSheets || [])
      .filter(s => !s.deletedAt && (s.publishedToResults === true || s.status === 'published' || s.isPublished === true))
      .map(s => s.competitionId)
      .filter(Boolean)
  );

  // Build fixed announcement order for all announced competitions (results with publishedStatus flag OR published judgment sheet)
  const publishedResults = results.filter(r => !r.deletedAt && (r.publishedStatus === true || r.isPublished === true || publishedSheetCompIds.has(r.competitionId)));
  const publishedCompIds = Array.from(new Set(publishedResults.map(r => r.competitionId).filter(Boolean)));

  const compTimes = publishedCompIds.map(compId => {
    const sheet = judgmentSheets.find(s => s.competitionId === compId && s.publishedToResults);
    const compResults = publishedResults.filter(r => r.competitionId === compId);
    const dates = [];
    if (sheet?.updatedAt) dates.push(new Date(sheet.updatedAt).getTime());
    if (sheet?.createdAt) dates.push(new Date(sheet.createdAt).getTime());
    compResults.forEach(r => {
      if (r.updatedAt) dates.push(new Date(r.updatedAt).getTime());
      if (r.createdAt) dates.push(new Date(r.createdAt).getTime());
    });
    const validDates = dates.filter(d => !isNaN(d) && d > 0);
    const earliestTime = validDates.length > 0 ? Math.min(...validDates) : 0;
    const sheetUpdateTime = sheet?.updatedAt ? new Date(sheet.updatedAt).getTime() : 0;
    return {
      compId,
      sortTime: sheetUpdateTime || earliestTime || 0
    };
  });

  compTimes.sort((a, b) => a.sortTime - b.sortTime);
  const compAnnouncementMap = new Map();
  compTimes.forEach((c, idx) => {
    compAnnouncementMap.set(c.compId, idx + 1);
  });

  const enrichedResults = publishedResults
    .map(r => {
      const comp = competitions.find(c => c.id === r.competitionId);
      const cat = categories.find(c => c.id === r.categoryId);

      let participantName = r.participantName || '';
      let codeNumber = r.codeNumber || r.chestNumber || '';
      let department = r.department || r.unitName || r.team || '';
      let participationType = comp?.participationType === 'group' ? 'Group' : 'Individual';
      let teamMemberIds = Array.isArray(r.teamMemberIds) ? r.teamMemberIds : [];

      const p = r.participantId ? participants.find(p => p.id === r.participantId) : null;
      if (p) {
        if (!participantName) {
          participantName = p.fullName || p.name || '';
        }
        if (!codeNumber) {
          const chest = chestNumbers.find(c => c.entityId === p.id || (c.participantId === p.id && c.categoryId === p.selectedCategoryId));
          codeNumber = chest ? (chest.chestNumber || chest.codeNumber) : (p.chestNumber || p.codeNumber || '');
        }
        if (!department) {
          const unit = units.find(u => u.id === p.unitId) || teams.find(t => t.id === p.unitId || t.id === p.teamId);
          department = unit ? unit.name : (p.unitName || p.department || p.teamName || '');
        }
      }

      if (r.teamId || comp?.participationType === 'group' || (comp && comp.isGroup === true)) {
        participationType = 'Group';
        const t = r.teamId ? teams.find(t => t.id === r.teamId) : null;
        if (t) {
          if (!department) {
            const unit = units.find(u => u.id === t.unitId || u.name === t.unitId);
            department = unit ? unit.name : (t.unitName || t.unitId || '');
          }

          if (!participantName || participantName === department) {
            let leaderName = '';
            const leaderId = t.leaderId || t.teamLeaderId || t.captainId;
            if (leaderId) {
              const leader = participants.find(p => p.id === leaderId);
              if (leader) leaderName = leader.fullName || leader.name || '';
            }
            const membersList = Array.isArray(t.members) && t.members.length > 0 ? t.members : (Array.isArray(t.memberIds) ? t.memberIds : []);
            if (!leaderName && membersList.length > 0) {
              const firstMemberId = typeof membersList[0] === 'string' ? membersList[0] : (membersList[0]?.id || membersList[0]?.participantId);
              const firstMember = participants.find(p => p.id === firstMemberId);
              if (firstMember) leaderName = firstMember.fullName || firstMember.name || '';
            }

            if (t.teamName) {
              if (t.teamName.includes('& Team') || t.teamName.includes('& team')) {
                participantName = t.teamName;
              } else if (leaderName) {
                participantName = `${leaderName} & Team`;
              } else {
                participantName = `${t.teamName} & Team`;
              }
            } else if (leaderName) {
              participantName = `${leaderName} & Team`;
            } else if (t.teamNumber) {
              participantName = `Team ${t.teamNumber}`;
            } else {
              participantName = department ? `${department} Team` : 'Group Team';
            }
          }

          if (!codeNumber) {
            codeNumber = t.teamNumber || t.codeNumber || t.chestNumber || '';
          }

          if (Array.isArray(t.memberIds) && teamMemberIds.length === 0) {
            teamMemberIds = t.memberIds;
          }
        }
      }

      const totalMarks = getNormalizedMark(r);
      const isGroup = comp?.participationType === 'group' || !!r.teamId;
      const grade = (r.grade && r.grade !== '-' && r.grade !== '') ? r.grade : (totalMarks > 0 ? calculateGrade(totalMarks, isGroup, eventSettings, r.categoryId || comp?.categoryId) : '');
      const points = (r.points !== undefined && r.points !== null && !isNaN(Number(r.points)))
        ? Number(r.points)
        : calculateResultPoints(r, comp, eventSettings);
      const categoryName = cat?.name || r.category || r.categoryName || 'General';
      const eventName = comp?.name || r.eventName || r.competitionName || r.program || 'Competition';

      return {
        id: r.id,
        competitionId: r.competitionId,
        competitionName: eventName,
        eventName,
        program: eventName,
        categoryId: r.categoryId,
        categoryName,
        category: categoryName,
        participantId: r.participantId,
        participantName: participantName || department || 'Participant',
        chestNumber: codeNumber || '',
        codeNumber: codeNumber || '',
        unitName: department || '',
        department: department || '',
        team: department || '',
        teamName: department || '',
        rank: r.rank,
        grade,
        totalMarks,
        totalMark: totalMarks,
        marks: totalMarks,
        averageMark: r.averageMark ?? totalMarks,
        judge1Marks: r.judge1Mark,
        judge2Marks: r.judge2Mark,
        points,
        status: r.status || 'participated',
        remarks: r.remarks || '',
        participationType,
        publishedStatus: !!(r.publishedStatus || r.isPublished),
        isPublished: !!(r.publishedStatus || r.isPublished),
        teamMemberIds,
        announcementNumber: compAnnouncementMap.get(r.competitionId) || 1,
        announcementOrder: compAnnouncementMap.get(r.competitionId) || 1,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
        raw: {
          ...r,
          announcementNumber: compAnnouncementMap.get(r.competitionId) || 1,
          announcementOrder: compAnnouncementMap.get(r.competitionId) || 1,
          updatedAt: r.updatedAt || r.createdAt || new Date().toISOString()
        }
      };
    });

  res.json(enrichedResults);
});

// Helper to calculate live standings for snapshot creation
function computeLiveStandings(dbState) {
  const { units = [], participants = [], results = [], teams = [], competitions = [], eventSettings = {} } = dbState;
  const validUnits = units.filter(u => u.active !== false);

  const publishedSheetCompIds = new Set(
    (dbState.judgmentSheets || [])
      .filter(s => !s.deletedAt && (s.publishedToResults === true || s.status === 'published' || s.isPublished === true))
      .map(s => s.competitionId)
      .filter(Boolean)
  );

  const standings = validUnits.map(unit => {
    const normTarget = unit.id ? unit.id.toLowerCase().replace(/[-_]/g, '') : unit.name.toLowerCase().replace(/[-_]/g, '');
    const normNameTarget = unit.name ? unit.name.toLowerCase().replace(/[-_]/g, '') : normTarget;

    const isUnitMatch = (uId, uName) => {
      if (!uId && !uName) return false;
      const normId = uId ? String(uId).toLowerCase().replace(/[-_]/g, '') : '';
      const normName = uName ? String(uName).toLowerCase().replace(/[-_]/g, '') : '';
      if (normId === normTarget || normName === normTarget || normId === normNameTarget || normName === normNameTarget) return true;
      if (normTarget.includes('shukr') && (normId.includes('shukr') || normName.includes('shukr'))) return true;
      if (normTarget.includes('sabr') && (normId.includes('sabr') || normName.includes('sabr'))) return true;
      return false;
    };

    const unitParticipants = participants.filter(p => (isUnitMatch(p.unitId) || p.unitId === unit.id) && !p.deletedAt);
    const participantIds = unitParticipants.map(p => p.id);

    const rawIndResults = results.filter(r => {
      if (r.deletedAt) return false;
      const isPub = r.publishedStatus === true || r.isPublished === true || publishedSheetCompIds.has(r.competitionId);
      if (!isPub) return false;
      const statusOk = !r.status || r.status === 'participated' || String(r.status).toLowerCase() === 'participated';
      if (!statusOk) return false;

      if (r.participantId && participantIds.includes(r.participantId)) return true;
      if (!r.teamId && isUnitMatch(r.unitId, r.unitName || r.department)) return true;
      return false;
    });

    const uniqueIndMap = new Map();
    rawIndResults.forEach(r => {
      const key = `${r.competitionId}_${r.participantId || r.id}`;
      if (!uniqueIndMap.has(key)) {
        uniqueIndMap.set(key, r);
      }
    });
    const individualResults = Array.from(uniqueIndMap.values());

    const unitTeams = teams.filter(t => (isUnitMatch(t.unitId) || t.unitId === unit.id) && !t.deletedAt);
    const teamIds = unitTeams.map(t => t.id);

    const rawGroupResults = results.filter(r => {
      if (r.deletedAt) return false;
      const isPub = r.publishedStatus === true || r.isPublished === true || publishedSheetCompIds.has(r.competitionId);
      if (!isPub) return false;
      const statusOk = !r.status || r.status === 'participated' || String(r.status).toLowerCase() === 'participated';
      if (!statusOk) return false;

      if (r.teamId && teamIds.includes(r.teamId)) return true;
      if (r.teamId && isUnitMatch(r.unitId, r.unitName || r.department)) return true;
      return false;
    });

    const uniqueGrpMap = new Map();
    rawGroupResults.forEach(r => {
      const key = `${r.competitionId}_${r.teamId || r.id}`;
      if (!uniqueGrpMap.has(key)) {
        uniqueGrpMap.set(key, r);
      }
    });
    const groupResults = Array.from(uniqueGrpMap.values());

    const allUnitResults = [...individualResults, ...groupResults];

    let firstPlaceCount = 0;
    let secondPlaceCount = 0;
    let thirdPlaceCount = 0;
    let fourthToSeventhPlaceCount = 0;

    allUnitResults.forEach(r => {
      const numRank = Number(r.rank);
      if (numRank === 1) firstPlaceCount++;
      else if (numRank === 2) secondPlaceCount++;
      else if (numRank === 3) thirdPlaceCount++;
      else if (numRank >= 4 && numRank <= 7) fourthToSeventhPlaceCount++;
    });

    const overallPoints = allUnitResults.reduce((sum, r) => {
      if (r.points !== undefined && r.points !== null && !isNaN(Number(r.points))) {
        return sum + Number(r.points);
      }
      const comp = competitions.find(c => c.id === r.competitionId);
      return sum + calculateResultPoints(r, comp, eventSettings);
    }, 0);
    const overallMarks = Math.round(allUnitResults.reduce((sum, r) => sum + getNormalizedMark(r), 0) * 100) / 100;

    return {
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code || unit.name.substring(0, 3).toUpperCase(),
      totalParticipants: unitParticipants.length,
      completedResultsCount: allUnitResults.length,
      overallMarks,
      overallPoints,
      firstPlaceCount,
      secondPlaceCount,
      thirdPlaceCount,
      fourthToSeventhPlaceCount
    };
  });

  standings.sort((a, b) => {
    if (b.overallPoints !== a.overallPoints) return b.overallPoints - a.overallPoints;
    return b.overallMarks - a.overallMarks;
  });

  let currentRank = 1;
  return standings.map((standing, index) => {
    const prev = standings[index - 1];
    if (index > 0 && (standing.overallPoints < prev.overallPoints || (standing.overallPoints === prev.overallPoints && standing.overallMarks < prev.overallMarks))) {
      currentRank++;
    }
    return {
      ...standing,
      rank: currentRank
    };
  });
}

// Public Unit Standings / Team Points
app.get('/api/public/standings', async (req, res) => {
  const dbState = await getDbState();

  // Check if admin has published a frozen snapshot of team standings
  let publishedSnapshot = dbState.settings?.publishedTeamStandings;
  if (!publishedSnapshot && dbState.db) {
    try {
      const snapDoc = await dbState.db.collection('settings').findOne({ _id: 'publishedTeamStandings' });
      if (snapDoc && Array.isArray(snapDoc.standings)) {
        publishedSnapshot = snapDoc;
      }
    } catch (_) {}
  }

  // Strictly return published snapshot only. If not published yet, return empty list!
  if (publishedSnapshot && Array.isArray(publishedSnapshot.standings) && publishedSnapshot.standings.length > 0) {
    res.setHeader('x-standings-results-count', String(publishedSnapshot.resultsCount || 0));
    res.setHeader('x-standings-published-at', String(publishedSnapshot.publishedAt || ''));
    return res.json(publishedSnapshot.standings);
  }

  // Strictly snapshot mode: Keep team points hidden until admin explicitly clicks "Publish Standings"
  res.json([]);
});

// Publish Standings snapshot (called from Admin panel)
app.post('/api/standings/publish', async (req, res) => {
  const dbState = await getDbState(true);
  const liveStandings = computeLiveStandings(dbState);

  const publishedSheetCompIds = new Set(
    (dbState.judgmentSheets || [])
      .filter(s => !s.deletedAt && (s.publishedToResults === true || s.status === 'published' || s.isPublished === true))
      .map(s => s.competitionId)
      .filter(Boolean)
  );
  const publishedResults = (dbState.results || []).filter(r => !r.deletedAt && (r.publishedStatus === true || r.isPublished === true || publishedSheetCompIds.has(r.competitionId)));
  const publishedCompIds = new Set(publishedResults.map(r => r.competitionId).filter(Boolean));
  const resultsCount = publishedCompIds.size;

  const snapshot = {
    publishedAt: new Date().toISOString(),
    resultsCount,
    standings: liveStandings
  };

  if (!dbState.settings) dbState.settings = {};
  dbState.settings.publishedTeamStandings = snapshot;
  if (dbState.eventSettings) dbState.eventSettings.publishedTeamStandings = snapshot;

  const mongoDb = await getMongoDb();
  if (mongoDb) {
    try {
      await mongoDb.collection('settings').updateOne(
        { _id: 'publishedTeamStandings' },
        { $set: snapshot },
        { upsert: true }
      );
      await mongoDb.collection('settings').updateOne(
        { _id: 'eventSettings' },
        { $set: { publishedTeamStandings: snapshot, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to persist snapshot in mongo:', err);
    }
  }

  invalidateDbCache();

  res.json({
    success: true,
    publishedTeamStandings: snapshot
  });
});

// Unpublish Standings snapshot
app.post('/api/standings/unpublish', async (req, res) => {
  const dbState = await getDbState();
  if (dbState.settings) {
    delete dbState.settings.publishedTeamStandings;
  }
  if (dbState.eventSettings) {
    delete dbState.eventSettings.publishedTeamStandings;
  }
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    try {
      await mongoDb.collection('settings').deleteOne({ _id: 'publishedTeamStandings' });
      await mongoDb.collection('settings').updateOne(
        { $or: [{ id: 'app_settings' }, { _id: 'cmsSettings' }, { _id: 'eventSettings' }] },
        { $unset: { publishedTeamStandings: "" }, $set: { updatedAt: new Date().toISOString() } }
      );
    } catch (e) {
      console.error('Failed to unpublish standings in mongo:', e);
    }
  }
  invalidateDbCache();
  res.json({ success: true, message: 'Team standings snapshot removed. Public site will now hide team standings until published.' });
});

app.get('/api/public/standings/meta', async (req, res) => {
  const dbState = await getDbState();
  let publishedSnapshot = dbState.settings?.publishedTeamStandings;
  if (!publishedSnapshot && dbState.db) {
    try {
      const snapDoc = await dbState.db.collection('settings').findOne({ _id: 'publishedTeamStandings' });
      if (snapDoc && Array.isArray(snapDoc.standings)) {
        publishedSnapshot = snapDoc;
      }
    } catch (_) {}
  }
  const publishedSheetCompIds = new Set(
    (dbState.judgmentSheets || [])
      .filter(s => !s.deletedAt && (s.publishedToResults === true || s.status === 'published' || s.isPublished === true))
      .map(s => s.competitionId)
      .filter(Boolean)
  );
  const publishedResults = (dbState.results || []).filter(r => !r.deletedAt && (r.publishedStatus === true || r.isPublished === true || publishedSheetCompIds.has(r.competitionId)));
  const publishedCompIds = new Set(publishedResults.map(r => r.competitionId).filter(Boolean));
  res.json({
    resultsCount: publishedSnapshot ? (publishedSnapshot.resultsCount || 0) : 0,
    publishedAt: publishedSnapshot?.publishedAt || null,
    isSnapshot: !!publishedSnapshot,
    liveResultsCount: publishedCompIds.size
  });
});

// Public Gallery
app.get('/api/public/gallery', async (req, res) => {
  const dbState = await getDbState();
  const gallery = (dbState.gallery || []).filter(g => g.imageUrl && !g.imageUrl.startsWith('/data/uploads/'));
  res.json(gallery);
});

// Public Highlights
app.get('/api/public/highlights', async (req, res) => {
  const dbState = await getDbState();
  const highlights = (dbState.videoHighlights || []).filter(v => v.videoUrl && !v.videoUrl.startsWith('/data/uploads/'));
  res.json(highlights);
});

// Public CMS (DragBlocks, HeroMedia, CmsSettings)
app.get('/api/public/cms', async (req, res) => {
  const dbState = await getDbState();
  const dragBlocks = (dbState.dragBlocks && dbState.dragBlocks.length > 0) ? dbState.dragBlocks : DEFAULT_DRAG_BLOCKS;
  res.json({
    dragBlocks,
    heroMedia: dbState.heroMedia || [],
    cmsSettings: dbState.cmsSettings || {}
  });
});

// Helper: Build 100% genuine participant portal data with real programs, teams, and results
function buildParticipantPortalData(participant, cNum, cleanChest, dbState) {
  const { competitions = [], results = [], registrations = [], teams = [], units = [], categories = [], judgmentSheets = [], eventSettings = {} } = dbState;

  // 1. Pre-registered competitions (individual & group)
  const regRecord = registrations.find(r => r.participantId === participant.id && !r.deletedAt);
  const indCompIds = Array.from(new Set([
    ...(regRecord?.selectedIndividualCompetitionIds || []),
    ...(participant.registeredEvents || [])
  ]));
  const groupCompIds = regRecord?.selectedGroupTeamIds ? [...regRecord.selectedGroupTeamIds] : [];

  // 2. Teams where participant is a member
  const candidateTeams = teams.filter(t => Array.isArray(t.memberIds) && t.memberIds.includes(participant.id) && !t.deletedAt);
  candidateTeams.forEach(t => {
    if (t.competitionId && !groupCompIds.includes(t.competitionId)) {
      groupCompIds.push(t.competitionId);
    }
  });

  const candidateTeamIds = candidateTeams.map(t => t.id);

  // 3. Direct result entry competitions (even if pre-registration was skipped!)
  const directResultCompIds = results
    .filter(r => !r.deletedAt && (r.participantId === participant.id || (r.teamId && candidateTeamIds.includes(r.teamId))))
    .map(r => r.competitionId)
    .filter(Boolean);

  const allCompIds = Array.from(new Set([...indCompIds, ...groupCompIds, ...directResultCompIds]));

  const registeredComps = competitions
    .filter(c => allCompIds.includes(c.id))
    .map(c => {
      const cat = categories.find(cat => cat.id === c.categoryId);
      const isCompCompleted = (judgmentSheets || []).some(js => !js.deletedAt && js.competitionId === c.id && (js.status === 'completed' || js.status === 'locked')) ||
        (results || []).some(r => !r.deletedAt && r.competitionId === c.id);

      return {
        id: c.id,
        competitionId: c.id,
        program: c.name,
        name: c.name,
        eventName: c.name,
        category: cat ? cat.name : (c.category || 'General'),
        stage: c.stageType === 'on_stage' ? 'On Stage' : (c.stageType === 'off_stage' ? 'Off Stage' : (c.stage || 'Main Stage')),
        stageType: c.stageType,
        time: c.startTime || '09:00 AM',
        status: isCompCompleted ? 'completed' : 'upcoming',
        participationType: c.participationType === 'group' ? 'group' : 'individual'
      };
    });

  const unit = units.find(u => u.id === participant.unitId);
  const category = categories.find(c => c.id === participant.selectedCategoryId);

  // 4. Candidate's results (both individual & group/team results)
  const participantResults = results
    .filter(r => !r.deletedAt && (r.publishedStatus === true || r.isPublished === true) && (r.participantId === participant.id || (r.teamId && candidateTeamIds.includes(r.teamId))))
    .map(r => {
      const comp = competitions.find(c => c.id === r.competitionId);
      const cat = categories.find(c => c.id === r.categoryId);
      const isGroup = comp?.participationType === 'group' || !!r.teamId;
      const normMark = getNormalizedMark(r);
      return {
        id: r.id,
        competitionId: r.competitionId,
        eventName: comp ? comp.name : (r.eventName || r.program || 'Competition'),
        program: comp ? comp.name : (r.eventName || r.program || 'Competition'),
        category: cat ? cat.name : (r.category || 'General'),
        rank: r.rank,
        grade: (r.grade && r.grade !== '-' && r.grade !== '') ? r.grade : (normMark > 0 ? calculateGrade(normMark, isGroup, eventSettings, r.categoryId || comp?.categoryId) : ''),
        totalMarks: normMark,
        points: (r.points !== undefined && r.points !== null && !isNaN(Number(r.points)))
          ? Number(r.points)
          : calculateResultPoints(r, comp, eventSettings),
        publishedStatus: !!(r.publishedStatus || r.isPublished),
        participantName: participant.fullName,
        codeNumber: cNum ? (cNum.chestNumber || cNum.codeNumber) : (participant.profilePhoto || cleanChest),
        department: unit ? unit.name : (participant.unitName || 'Main Unit'),
        teamName: unit ? unit.name : (participant.unitName || 'Main Unit'),
        participationType: isGroup ? 'group' : 'individual',
        raw: {
          ...r,
          teamMemberIds: isGroup ? [participant.id] : []
        }
      };
    });

  const enrichedParticipant = {
    ...participant,
    chestNumber: cNum ? (cNum.chestNumber || cNum.codeNumber) : (participant.profilePhoto || cleanChest),
    unitName: unit ? unit.name : participant.unitName || 'Main Unit',
    department: unit ? unit.name : participant.unitName || 'Main Unit',
    categoryName: category ? category.name : participant.categoryName || 'General',
    category: category ? category.name : participant.categoryName || 'General',
    candidateTeams,
    registeredPrograms: registeredComps,
    registeredComps,
    schedule: registeredComps,
    results: participantResults
  };

  return { participant: enrichedParticipant, registeredComps, participantResults };
}

// Participant Auth Routes
app.post('/api/public/auth/participant-login', async (req, res) => {
  const { chestNumber, dob, candidateClass, classVal } = req.body;
  const dbState = await getDbState();
  const { chestNumbers = [], participants = [], eventSettings = {} } = dbState;
  const cleanChest = (chestNumber || '').toString().trim();

  const cNum = chestNumbers.find(c => c.chestNumber?.toString() === cleanChest || c.codeNumber === cleanChest);
  let participant = participants.find(p => (cNum && (p.id === cNum.participantId || p.id === cNum.entityId)) || p.profilePhoto === cleanChest || p.id === cleanChest);
  if (participant && participant.deletedAt) participant = null;

  if (!participant) return res.status(401).json({ error: 'Invalid Chest Number' });

  const criteriaMode = eventSettings?.participantLoginCriteria || 'class';
  if (criteriaMode === 'class') {
    const normalizeClass = (s) => {
      let str = (s || '').toString().trim().toLowerCase().replace(/^class\s*/i, '');
      if (str.includes('junior')) return '+1';
      if (str.includes('senior')) return '+2';
      return str.replace(/\s*\(.*?\)/g, '').trim();
    };
    const val = normalizeClass(candidateClass || classVal || dob);
    const pClass = normalizeClass(participant.candidateClass);
    if (val && pClass && val !== pClass) {
      return res.status(401).json({ error: 'Incorrect Class / Grade' });
    }
  } else {
    if (dob && participant.dob && participant.dob !== dob) return res.status(401).json({ error: 'Incorrect Date of Birth' });
  }

  const portalData = buildParticipantPortalData(participant, cNum, cleanChest, dbState);
  res.json({
    token: `token_${participant.id}_${Date.now()}`,
    participant: portalData.participant,
    registeredComps: portalData.registeredComps,
    participantResults: portalData.participantResults
  });
});

app.get('/api/public/participant/by-chest/:chestNo', async (req, res) => {
  const { chestNo } = req.params;
  const cleanChest = (chestNo || '').toString().trim();
  const dbState = await getDbState();
  const { chestNumbers = [], participants = [] } = dbState;

  const cNum = chestNumbers.find(c => c.chestNumber?.toString() === cleanChest || c.codeNumber === cleanChest);
  let participant = participants.find(p => (cNum && (p.id === cNum.participantId || p.id === cNum.entityId)) || p.profilePhoto === cleanChest || p.id === cleanChest);

  if (!participant || participant.deletedAt) {
    return res.status(404).json({ error: 'Participant not found for this chest number' });
  }

  const portalData = buildParticipantPortalData(participant, cNum, cleanChest, dbState);
  res.json({
    participant: portalData.participant,
    registeredComps: portalData.registeredComps,
    participantResults: portalData.participantResults
  });
});

// CLOUDINARY MEDIA UPLOAD ENDPOINTS
app.post('/api/gallery/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image', folder: 'sahityotsav_gallery' });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

app.post('/api/highlights/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No video file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, { resource_type: 'video', folder: 'sahityotsav_videos' });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

// Start Express Backend Server
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 HASHLAY PUBLIC BACKEND ENGINE RUNNING ON PORT ${PORT}`);
    console.log(`=================================================`);
  });
}

export default app;

