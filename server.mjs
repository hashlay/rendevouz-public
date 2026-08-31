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

// Enable CORS & HTTP caching headers for optimized asset delivery
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'GET') {
    if (req.url.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|webm|woff2)$/i)) {
      res.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.startsWith('/api/')) {
      res.header('Cache-Control', 'no-cache');
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

// Helper to fetch full database state from MongoDB
async function getDbState() {
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
    gallery: [],
    videoHighlights: [],
    dragBlocks: [],
    heroMedia: [],
    cmsSettings: {}
  };

  if (!db) return state;

  try {
    const globalStateDoc = await db.collection('app_state').findOne({ _id: 'global_state' }).catch(() => null);
    if (globalStateDoc) {
      const { _id, ...rest } = globalStateDoc;
      state = { ...state, ...rest };
    }

    // Overlay dedicated collections for 100% real-time accuracy
    const [
      settingsDocs, unitsDocs, categoriesDocs, competitionsDocs,
      participantsDocs, teamsDocs, resultsDocs, chestDocs,
      galleryDocs, videoDocs
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
      db.collection('videoHighlights').find({}).toArray().catch(() => [])
    ]);

    settingsDocs.forEach(s => {
      if (s._id === 'eventSettings') state.eventSettings = { ...state.eventSettings, ...s };
      if (s._id === 'cmsSettings') state.cmsSettings = { ...state.cmsSettings, ...s };
      if (s._id === 'posterTemplateConfig') state.posterTemplateConfig = s;
      if (s._id === 'certificateTemplateConfig') state.certificateTemplateConfig = s;
    });

    if (unitsDocs.length > 0) state.units = unitsDocs.map(u => ({ id: u.id || u._id, ...u }));
    if (categoriesDocs.length > 0) state.categories = categoriesDocs.map(c => ({ id: c.id || c._id, ...c }));
    if (competitionsDocs.length > 0) state.competitions = competitionsDocs.map(c => ({ id: c.id || c._id, ...c }));
    if (participantsDocs.length > 0) state.participants = participantsDocs.map(p => ({ id: p.id || p._id, ...p }));
    if (teamsDocs.length > 0) state.teams = teamsDocs.map(t => ({ id: t.id || t._id, ...t }));
    if (resultsDocs.length > 0) state.results = resultsDocs.map(r => ({ id: r.id || r._id, ...r }));
    if (chestDocs.length > 0) state.chestNumbers = chestDocs.map(ch => ({ id: ch.id || ch._id, ...ch }));
    if (galleryDocs.length > 0) state.gallery = galleryDocs.map(g => ({ id: g.id || g._id, ...g }));
    if (videoDocs.length > 0) state.videoHighlights = videoDocs.map(v => ({ id: v.id || v._id, ...v }));

  } catch (err) {
    console.error('Error assembling DB state from MongoDB:', err.message);
  }

  return state;
}

const DEFAULT_DRAG_BLOCKS = [
  { id: '1', title: 'Hero Section', type: 'hero', enabled: true, order: 1 },
  { id: '2', title: 'About & Concept', type: 'about', enabled: true, order: 2 },
  { id: '3', title: 'Live Team Standings', type: 'results', enabled: true, order: 3 },
  { id: '4', title: 'Announced Results & Placements', type: 'announcements', enabled: true, order: 4 },
  { id: '5', title: 'Photo Hub (Drive & QR)', type: 'smile', enabled: true, order: 5 },
  { id: '6', title: 'Media Gallery (Photo Uploads)', type: 'gallery', enabled: true, order: 6 },
  { id: '7', title: 'Live Broadcast Streams', type: 'live_stages', enabled: true, order: 7 },
  { id: '8', title: 'Video Highlights & Stage Clips', type: 'highlights', enabled: true, order: 8 }
];

// =========================================================================
// 🌐 PUBLIC WEBSITE API ENDPOINTS
// =========================================================================

// Public Event Settings
app.get('/api/public/settings', async (req, res) => {
  const dbState = await getDbState();
  const settings = dbState.eventSettings || dbState.settings || {};
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

// Public Published Results
app.get('/api/public/results', async (req, res) => {
  const dbState = await getDbState();
  const { results = [], competitions = [], categories = [], participants = [], teams = [], chestNumbers = [], units = [], eventSettings = {} } = dbState;

  const enrichedResults = results
    .filter(r => !r.deletedAt && (r.publishedStatus || (r.rank !== undefined && r.rank > 0)))
    .map(r => {
      const comp = competitions.find(c => c.id === r.competitionId);
      const cat = categories.find(c => c.id === r.categoryId);

      let participantName = r.participantName || '';
      let codeNumber = r.codeNumber || r.chestNumber || '';
      let department = r.department || r.unitName || '';
      let participationType = comp?.participationType === 'group' ? 'Group' : 'Individual';

      if (r.participantId && !participantName) {
        const p = participants.find(p => p.id === r.participantId);
        if (p) {
          participantName = p.fullName;
          const chest = chestNumbers.find(c => c.entityId === p.id || (c.participantId === p.id && c.categoryId === p.selectedCategoryId));
          codeNumber = chest ? (chest.codeNumber || chest.chestNumber?.toString() || '') : '';
          const unit = units.find(u => u.id === p.unitId);
          department = unit ? unit.name : '';
        }
      } else if (r.teamId && !participantName) {
        const t = teams.find(t => t.id === r.teamId);
        if (t) {
          participantName = t.teamName || t.teamNumber;
          codeNumber = t.teamNumber;
          const unit = units.find(u => u.id === t.unitId);
          department = unit ? unit.name : '';
        }
      }

      let points = r.points || 0;
      if (!points) {
        if (r.rank === 1) points = eventSettings.globalPointsRank1 || 20;
        else if (r.rank === 2) points = eventSettings.globalPointsRank2 || 15;
        else if (r.rank === 3) points = eventSettings.globalPointsRank3 || 10;
      }

      let grade = r.grade || 'A';
      return {
        id: r.id,
        competitionId: r.competitionId,
        eventName: comp ? comp.name : (r.eventName || r.program || 'Competition'),
        category: cat ? cat.name : (r.category || 'General'),
        participationType,
        participantName,
        codeNumber,
        department,
        rank: r.rank || 0,
        grade,
        points,
        raw: r
      };
    });

  res.json(enrichedResults);
});

// Public Standings / House Scores
app.get('/api/public/standings', async (req, res) => {
  const dbState = await getDbState();
  const { units = [], results = [], participants = [], teams = [] } = dbState;
  const activeUnits = units.filter(u => u.active !== false);

  const standings = activeUnits.map(u => {
    let overallPoints = 0;
    let firstPlaceCount = 0;
    let secondPlaceCount = 0;
    let thirdPlaceCount = 0;

    results.forEach(r => {
      if (!r.deletedAt && (r.publishedStatus || (r.rank !== undefined && r.rank > 0))) {
        const p = participants.find(p => p.id === r.participantId);
        const t = teams.find(t => t.id === r.teamId);
        const unitId = p ? p.unitId : (t ? t.unitId : null);

        if (unitId === u.id || r.department === u.name) {
          const pts = r.points || (r.rank === 1 ? 20 : r.rank === 2 ? 15 : r.rank === 3 ? 10 : 0);
          overallPoints += pts;
          if (r.rank === 1) firstPlaceCount++;
          if (r.rank === 2) secondPlaceCount++;
          if (r.rank === 3) thirdPlaceCount++;
        }
      }
    });

    return {
      unitId: u.id,
      unitName: u.name,
      unitCode: u.code,
      overallPoints,
      firstPlaceCount,
      secondPlaceCount,
      thirdPlaceCount
    };
  }).sort((a, b) => b.overallPoints - a.overallPoints);

  res.json(standings);
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

// Participant Auth Routes
app.post('/api/public/auth/participant-login', async (req, res) => {
  const { chestNumber, dob } = req.body;
  const dbState = await getDbState();
  const { chestNumbers = [], participants = [] } = dbState;

  const cNum = chestNumbers.find(c => c.chestNumber?.toString() === chestNumber?.toString() || c.codeNumber === chestNumber);
  if (!cNum) return res.status(401).json({ error: 'Invalid Chest Number' });

  const participant = participants.find(p => (p.id === cNum.participantId || p.id === cNum.entityId) && !p.deletedAt);
  if (!participant) return res.status(401).json({ error: 'Participant not found' });

  if (dob && participant.dob !== dob) return res.status(401).json({ error: 'Incorrect Date of Birth' });

  res.json({ token: `token_${participant.id}_${Date.now()}`, participant });
});

app.get('/api/public/participant/by-chest/:chestNo', async (req, res) => {
  const { chestNo } = req.params;
  const dbState = await getDbState();
  const { chestNumbers = [], participants = [], competitions = [], results = [] } = dbState;

  const cNum = chestNumbers.find(c => c.chestNumber?.toString() === chestNo || c.codeNumber === chestNo);
  if (!cNum) return res.status(404).json({ error: 'Chest number not found' });

  const participant = participants.find(p => (p.id === cNum.participantId || p.id === cNum.entityId) && !p.deletedAt);
  if (!participant) return res.status(404).json({ error: 'Participant details not found' });

  const registeredComps = competitions.filter(c => participant.registeredEvents?.includes(c.id));
  const participantResults = results.filter(r => r.participantId === participant.id && !r.deletedAt);

  res.json({ participant, registeredComps, participantResults });
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

