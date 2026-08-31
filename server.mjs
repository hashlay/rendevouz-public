import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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

// SSF Ninthikal Master Dataset
const ssfDataset = {
  settings: {
    eventTitle: 'Rendezvous Silver Edition',
    sectorName: 'Imam Rabbani Festival',
    eventYear: '2026',
    cutoffDate: '2026-05-01',
    maxIndividualEvents: 3,
    maxGroupEvents: 2,
    registrationOpen: true,
    ssfLogoUrl: '',
    sahityotsavLogoUrl: '',
    primaryColor: '#002B1D',
    accentColor: '#00FF87',
    numJudges: 2,
    markDecimalPrecision: 2,
    autoRankingEnabled: true,
    maxMarksPerJudge: 100
  },
  categories: [
    { id: 'cat_senior', name: 'Senior', dobStart: '2005-01-01', dobEnd: '2008-12-31', active: true },
    { id: 'cat_junior', name: 'Junior', dobStart: '2009-01-01', dobEnd: '2011-12-31', active: true },
    { id: 'cat_subjunior', name: 'Sub-Junior', dobStart: '2012-01-01', dobEnd: '2015-12-31', active: true },
    { id: 'cat_general', name: 'General', dobStart: '2000-01-01', dobEnd: '2026-12-31', active: true }
  ],
  units: [
    { id: 'unit_nekkila', name: 'Nekkila', code: 'NEK', active: true },
    { id: 'unit_muchila', name: 'Muchila', code: 'MCH', active: true },
    { id: 'unit_ninthikal', name: 'Ninthikal', code: 'NIN', active: true },
    { id: 'unit_kamblabettu', name: 'Kamblabettu', code: 'KMB', active: true }
  ],
  competitions: [],
  participants: [],
  teams: [],
  results: [],
  users: [
    { id: 'usr_admin', fullName: 'Dr. Rashid Ahmad', username: 'admin', role: 'super_admin', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  auditLogs: []
};

// SSF Sector Endpoints
app.get('/api/dashboard-stats', (req, res) => {
  const totalParticipants = ssfDataset.participants.length;
  const totalCompetitions = ssfDataset.competitions.length;
  const resultsEntered = ssfDataset.results.length;

  res.json({
    totalParticipants,
    totalCompetitions,
    individualRegistrations: totalParticipants,
    groupTeamsCount: ssfDataset.teams.length,
    resultsEntered,
    resultsPending: Math.max(0, totalCompetitions - resultsEntered),
    leadingUnit: null,
    topIndividual: null,
    topIndividualOnStage: null,
    topIndividualOffStage: null,
    participantsByUnit: ssfDataset.units.map(u => ({
      unitId: u.id,
      unitName: u.name,
      count: ssfDataset.participants.filter(p => p.unitId === u.id).length
    })),
    participantsByCategory: ssfDataset.categories.map(c => ({
      categoryId: c.id,
      categoryName: c.name,
      count: ssfDataset.participants.filter(p => p.selectedCategoryId === c.id).length
    })),
    recentRegistrations: [],
    recentResults: []
  });
});

app.get('/api/categories', (req, res) => res.json(ssfDataset.categories));
app.get('/api/units', (req, res) => res.json(ssfDataset.units));
app.get('/api/competitions', (req, res) => res.json(ssfDataset.competitions));
app.get('/api/participants', (req, res) => res.json(ssfDataset.participants));
app.get('/api/teams', (req, res) => res.json(ssfDataset.teams));
app.get('/api/results', (req, res) => res.json(ssfDataset.results));
app.get('/api/settings', (req, res) => res.json(ssfDataset.settings));
app.get('/api/users', (req, res) => res.json(ssfDataset.users));
app.get('/api/audit-logs', (req, res) => res.json(ssfDataset.auditLogs));
app.get('/api/registrations', (req, res) => res.json([]));

// PUBLIC ALIAS ENDPOINTS
app.get('/api/public/results', (req, res) => res.json(ssfDataset.results));
app.get('/api/public/settings', (req, res) => res.json(ssfDataset.settings));
app.get('/api/public/categories', (req, res) => res.json(ssfDataset.categories));
app.get('/api/public/units', (req, res) => res.json(ssfDataset.units));
app.get('/api/public/competitions', (req, res) => res.json(ssfDataset.competitions));
app.get('/api/public/standings', (req, res) => res.json([]));

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  res.json({
    message: 'Logged in successfully',
    token: `jwt-token-${Date.now()}`,
    user: {
      id: 'usr_admin',
      fullName: 'Dr. Rashid Ahmad',
      username: username || 'admin',
      role: 'super_admin'
    }
  });
});

app.get('/api/auth/session', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 'usr_admin',
      fullName: 'Dr. Rashid Ahmad',
      username: 'admin',
      role: 'super_admin'
    }
  });
});

// REST API v1 ROUTES FOR OTHER WORKSPACE MODULES
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ONLINE', version: '2.5.0-Enterprise', timestamp: new Date().toISOString() });
});

app.get('/api/v1/participants', (req, res) => {
  res.json({ success: true, count: ssfDataset.participants.length, data: ssfDataset.participants });
});

app.get('/api/v1/programs', (req, res) => {
  res.json({ success: true, count: ssfDataset.competitions.length, data: ssfDataset.competitions });
});

app.get('/api/v1/results', (req, res) => {
  res.json({ success: true, count: ssfDataset.results.length, data: ssfDataset.results });
});

// CLOUDINARY MEDIA UPLOAD ENDPOINTS
app.post('/api/gallery/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'image',
      folder: 'sahityotsav_gallery'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary gallery upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

app.post('/api/highlights/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No video file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'sahityotsav_videos'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary video upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    configureCloudinary();
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'sahityotsav_uploads'
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message || String(err) });
  }
});

// Start Express Backend Server
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`  HASHLAY FESTIVAL BACKEND ENGINE RUNNING ON PORT ${PORT}`);
    console.log(`=================================================`);
  });
}

export default app;
