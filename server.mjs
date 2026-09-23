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
    const dbName = (dbPath && dbPath.length > 0) ? dbPath : 'sahityotsav';
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
        if (_id === 'eventSettings') state.eventSettings = { ...state.eventSettings, ...rest };
        if (_id === 'cmsSettings') state.cmsSettings = { ...rest };
        if (_id === 'posterTemplateConfig') {
          state.posterTemplateConfig = { ...rest };
          state.eventSettings.posterTemplateConfig = { ...rest };
        }
        if (_id === 'certificateTemplateConfig') {
          state.certificateTemplateConfig = { ...rest };
          state.eventSettings.certificateTemplateConfig = { ...rest };
        }
      });

      // Ensure Theme 4 exists in posterTemplateConfig
      const ptc = state.posterTemplateConfig || state.eventSettings?.posterTemplateConfig;
      if (ptc && Array.isArray(ptc.customThemes)) {
        if (ptc.customThemes.length === 3) {
          ptc.customThemes.push('/themes/theme_purple.jpg');
        } else if (ptc.customThemes.length >= 4 && (!ptc.customThemes[3] || ptc.customThemes[3].startsWith('data:image/svg'))) {
          ptc.customThemes[3] = '/themes/theme_purple.jpg';
        }
        if (ptc.themeConfigs) {
          const ref = ptc.themeConfigs[0] || ptc.themeConfigs[1] || ptc.themeConfigs[2] || {};
          if (!ptc.themeConfigs[3]) {
            ptc.themeConfigs[3] = { ...ref };
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
  { id: '5', title: 'Photo Hub (Drive & QR)', type: 'smile', enabled: true, order: 5 },
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

// Public Event Settings
app.get('/api/public/settings', async (req, res) => {
  const dbState = await getDbState();
  const raw = dbState.eventSettings || dbState.settings || {};
  const settings = {
    ...raw,
    posterTemplateConfig: dbState.posterTemplateConfig || raw.posterTemplateConfig,
    certificateTemplateConfig: dbState.certificateTemplateConfig || raw.certificateTemplateConfig,
    posterOverrides: raw.posterOverrides || dbState.posterOverrides || {}
  };
  res.json(settings);
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

function calculateGrade(mark, isGroup = false) {
  const m = Number(mark) || 0;
  if (m <= 0) return '';

  if (isGroup) {
    if (m >= 95) return 'A+';
    if (m >= 80) return 'A';
    if (m >= 55) return 'B';
    if (m >= 30) return 'C';
    return '';
  } else {
    if (m >= 95) return 'A+';
    if (m >= 85) return 'A';
    if (m >= 70) return 'B';
    if (m >= 50) return 'C';
    return '';
  }
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

function calculatePoints(r, comp, eventSettings) {
  // Grade Pointing System: enabled by default for this festival
  const isGradePointSystem = eventSettings?.gradeSystemEnabled !== false;
  if (isGradePointSystem) {
    if (r.status === 'absent' || r.isAbsent) return 0;
    const mark = getNormalizedMark(r);
    const m = Number(mark) || 0;
    if (m <= 0) return 0;

    const isGroup = !!r.teamId || comp?.participationType === 'group' || (comp && comp.isGroup === true);
    if (isGroup) {
      if (m >= 95) return 20;
      if (m >= 90) return 19;
      if (m >= 85) return 18;
      if (m >= 80) return 17;
      if (m >= 75) return 16;
      if (m >= 70) return 15;
      if (m >= 65) return 14;
      if (m >= 55) return 13;
      if (m >= 50) return 12;
      if (m >= 40) return 11;
      if (m >= 30) return 10;
      return 5;
    } else {
      if (m >= 95) return 10;
      if (m >= 90) return 9;
      if (m >= 85) return 8;
      if (m >= 80) return 7;
      if (m >= 75) return 6;
      if (m >= 70) return 5;
      if (m >= 65) return 4;
      if (m >= 55) return 3;
      if (m >= 50) return 2;
      if (m >= 40) return 1;
      return 0;
    }
  }

  // Normal rank-based points if grade pointing system is disabled:
  if (r.points !== undefined && r.points !== null && r.points > 0) return Number(r.points);
  if (r.rank === 1) return Number(eventSettings?.globalPointsRank1 ?? 20);
  if (r.rank === 2) return Number(eventSettings?.globalPointsRank2 ?? 14);
  if (r.rank === 3) return Number(eventSettings?.globalPointsRank3 ?? 7);
  return 0;
}

// Public Published Results
app.get('/api/public/results', async (req, res) => {
  const dbState = await getDbState();
  const { results = [], competitions = [], categories = [], participants = [], teams = [], chestNumbers = [], units = [], eventSettings = {}, judgmentSheets = [] } = dbState;

  // Build fixed announcement order for all announced competitions
  const publishedResults = results.filter(r => !r.deletedAt && (r.publishedStatus === true || r.isPublished === true));
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

      if (!department && r.teamId) {
        const t = teams.find(t => t.id === r.teamId) || units.find(u => u.id === r.teamId);
        if (t) department = t.name;
      }

      if (comp?.participationType === 'group') {
        participationType = 'Group';
        if (!participantName && department) {
          participantName = department;
        }
      }

      const totalMarks = getNormalizedMark(r);
      const isGroup = comp?.participationType === 'group' || !!r.teamId;
      const grade = calculateGrade(totalMarks, isGroup);
      const points = calculatePoints(r, comp, eventSettings);
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
        participantName,
        chestNumber: codeNumber,
        codeNumber,
        unitName: department,
        department,
        team: department,
        teamName: department,
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

// Public Unit Standings / Team Points
app.get('/api/public/standings', async (req, res) => {
  const dbState = await getDbState();
  const { units = [], participants = [], results = [], teams = [], competitions = [], eventSettings = {} } = dbState;

  const validUnits = units.filter(u => u.active !== false);

  const standings = validUnits.map(unit => {
    const normTarget = unit.name.toLowerCase().replace(/[-_]/g, '');

    const isUnitMatch = (uId, uName) => {
      if (!uId && !uName) return false;
      const normId = uId ? String(uId).toLowerCase().replace(/[-_]/g, '') : '';
      const normName = uName ? String(uName).toLowerCase().replace(/[-_]/g, '') : '';
      if (normId === normTarget || normName === normTarget) return true;
      if (normTarget.includes('shukr') && (normId.includes('shukr') || normName.includes('shukr'))) return true;
      if (normTarget.includes('sabr') && (normId.includes('sabr') || normName.includes('sabr'))) return true;
      return false;
    };

    const unitParticipants = participants.filter(p => (isUnitMatch(p.unitId) || p.unitId === unit.id) && !p.deletedAt);
    const participantIds = unitParticipants.map(p => p.id);

    const individualResults = results.filter(r => {
      if (r.deletedAt) return false;
      const isPub = r.publishedStatus === true || r.isPublished === true;
      if (!isPub) return false;
      const statusOk = !r.status || r.status === 'participated' || String(r.status).toLowerCase() === 'participated';
      if (!statusOk) return false;

      if (r.participantId && participantIds.includes(r.participantId)) return true;
      if (!r.teamId && isUnitMatch(r.unitId, r.unitName || r.department)) return true;
      return false;
    });

    const unitTeams = teams.filter(t => (isUnitMatch(t.unitId) || t.unitId === unit.id) && !t.deletedAt);
    const teamIds = unitTeams.map(t => t.id);

    const groupResults = results.filter(r => {
      if (r.deletedAt) return false;
      const isPub = r.publishedStatus === true || r.isPublished === true;
      if (!isPub) return false;
      const statusOk = !r.status || r.status === 'participated' || String(r.status).toLowerCase() === 'participated';
      if (!statusOk) return false;

      if (r.teamId && teamIds.includes(r.teamId)) return true;
      if (r.teamId && isUnitMatch(r.unitId, r.unitName || r.department)) return true;
      return false;
    });

    const allUnitResults = [...individualResults, ...groupResults];

    let firstPlaceCount = 0;
    let secondPlaceCount = 0;
    let thirdPlaceCount = 0;
    let fourthToSeventhPlaceCount = 0;

    allUnitResults.forEach(r => {
      if (r.rank === 1) firstPlaceCount++;
      else if (r.rank === 2) secondPlaceCount++;
      else if (r.rank === 3) thirdPlaceCount++;
      else if (r.rank >= 4 && r.rank <= 7) fourthToSeventhPlaceCount++;
    });

    const overallPoints = allUnitResults.reduce((sum, r) => {
      const comp = competitions.find(c => c.id === r.competitionId);
      return sum + calculatePoints(r, comp, eventSettings);
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
  const finalStandings = standings.map((standing, index) => {
    const prev = standings[index - 1];
    if (index > 0 && (standing.overallPoints < prev.overallPoints || (standing.overallPoints === prev.overallPoints && standing.overallMarks < prev.overallMarks))) {
      currentRank++;
    }
    return {
      ...standing,
      rank: currentRank
    };
  });

  res.json(finalStandings);
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
        grade: calculateGrade(normMark, isGroup),
        totalMarks: normMark,
        points: calculatePoints(r, comp, eventSettings),
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
    const val = (candidateClass || classVal || dob || '').toString().trim().toLowerCase().replace(/^class\s*/i, '');
    const pClass = (participant.candidateClass || '').toString().trim().toLowerCase().replace(/^class\s*/i, '');
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

