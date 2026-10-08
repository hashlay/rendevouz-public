const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGODB_URI || 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';

async function resetToFreshFestival() {
  console.log('Connecting to NEW MongoDB cluster...');
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db('rendezvous_2026');

  console.log('--- PURGING OLD FESTIVAL DATA FROM NEW MONGODB ---');

  // 1. Collections to completely empty (0 documents)
  const emptyCollections = [
    'competitions',
    'results',
    'judgeScores',
    'greenRoomAssignments',
    'judgmentSheets',
    'chestNumbers',
    'participants',
    'registrations',
    'teams',
    'categories',
    'counters',
    'gallery',
    'videoHighlights',
    'heroMedia',
    'auditLogs',
    'loginAudits',
    'app_state'
  ];

  for (const colName of emptyCollections) {
    const col = db.collection(colName);
    const deleteResult = await col.deleteMany({});
    console.log(`🧹 Purged collection '${colName}': deleted ${deleteResult.deletedCount} documents.`);
  }

  // 2. Units: remove all 3 old units, keep ONLY 2 fresh units
  const unitsCol = db.collection('units');
  await unitsCol.deleteMany({});
  const freshUnits = [
    { _id: 'unit_1', id: 'unit_1', name: 'Unit 1', code: 'U1', active: true },
    { _id: 'unit_2', id: 'unit_2', name: 'Unit 2', code: 'U2', active: true }
  ];
  await unitsCol.insertMany(freshUnits);
  console.log('✅ Units reset to exactly 2 placeholder units (Unit 1, Unit 2).');

  // 3. Users: keep ONLY Super Admin user, remove judges
  const usersCol = db.collection('users');
  const allUsers = await usersCol.find({}).toArray();
  const superAdmin = allUsers.find(u => u.role === 'super_admin' || u.username === 'admin');

  await usersCol.deleteMany({});
  if (superAdmin) {
    await usersCol.insertOne(superAdmin);
    console.log(`✅ Kept Super Admin user '${superAdmin.username}', removed judges.`);
  } else {
    // Fallback seed admin
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    await usersCol.insertOne({
      _id: 'usr_admin',
      id: 'usr_admin',
      fullName: 'Super Administrator',
      username: 'admin',
      email: 'admin@ssf.org',
      passwordHash,
      role: 'super_admin',
      active: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Created fresh default Super Admin user (admin / admin123).');
  }

  // 4. Settings: Clean old festival specific documents
  const settingsCol = db.collection('settings');
  // Remove publishedTeamStandings
  await settingsCol.deleteOne({ _id: 'publishedTeamStandings' });
  // Remove legacy old doc
  await settingsCol.deleteOne({ _id: '6ab2ca97c93d15e80a6aa7f4' });

  // Reset posterOverrides
  await settingsCol.replaceOne(
    { _id: 'posterOverrides' },
    { _id: 'posterOverrides', id: 'posterOverrides', overrides: {} },
    { upsert: true }
  );

  // Clean eventSettings of old festival hardcoding
  const currentEventSettings = await settingsCol.findOne({ _id: 'eventSettings' }) || {};
  const cleanedEventSettings = {
    _id: 'eventSettings',
    id: 'eventSettings',
    eventTitle: 'NEW FESTIVAL 2026',
    festivalName: 'NEW FESTIVAL',
    campusName: 'Campus Name',
    sectorName: 'Sector Name',
    eventYear: '2026',
    cutoffDate: '2026-01-01',
    eventDate: '2026-01-01',
    venue: 'Venue',
    contactInfo: 'contact@festival.com',
    maxIndividualEvents: currentEventSettings.maxIndividualEvents || 10,
    maxGroupEvents: currentEventSettings.maxGroupEvents || 10,
    maxOnStageEvents: null,
    maxOffStageEvents: null,
    registrationOpen: true,
    fillLogo: true,
    autoRemoveLogoBg: false,
    ssfLogoUrl: '/logo.png',
    sahityotsavLogoUrl: '/logo.png',
    primaryColor: '#10b981',
    accentColor: '#10b981',
    numJudges: currentEventSettings.numJudges || 2,
    markDecimalPrecision: currentEventSettings.markDecimalPrecision || 2,
    autoRankingEnabled: true,
    entityMode: 'team',
    gradeSystemEnabled: true,
    participantLoginCriteria: 'chest_number',
    globalPointsRank1: currentEventSettings.globalPointsRank1 || 20,
    globalPointsRank2: currentEventSettings.globalPointsRank2 || 14,
    globalPointsRank3: currentEventSettings.globalPointsRank3 || 7,
    globalPointsRank4: 0,
    globalPointsRank5: 0
  };
  await settingsCol.replaceOne({ _id: 'eventSettings' }, cleanedEventSettings, { upsert: true });

  // Clean cmsSettings of old festival hardcoding
  const currentCms = await settingsCol.findOne({ _id: 'cmsSettings' }) || {};
  const cleanedCms = {
    ...currentCms,
    _id: 'cmsSettings',
    id: 'cmsSettings',
    headerLogoTitle: 'FESTIVAL',
    headerLogoSubtitle: '2026',
    heroLogoTitle: 'FESTIVAL 2026',
    heroLogoSubtitle: '',
    heroLogoBadge: '',
    heroTitle: 'FESTIVAL 2026',
    heroSubtitle: 'Annual Arts & Cultural Festival',
    heroDate: '2026',
    heroLocation: 'Main Campus',
    themeTitle: '',
    themeDescription: '',
    aboutTitle: 'About The Festival',
    aboutDescription: 'Official Festival Portal',
    publishedTeamStandings: null
  };
  await settingsCol.replaceOne({ _id: 'cmsSettings' }, cleanedCms, { upsert: true });

  // Update state_version
  await settingsCol.replaceOne(
    { _id: 'state_version' },
    { _id: 'state_version', version: Date.now(), updatedAt: new Date().toISOString() },
    { upsert: true }
  );

  console.log('✅ Settings cleaned: publishedTeamStandings removed, posterOverrides reset, eventSettings & cmsSettings generalized.');

  // 5. Verify final counts
  console.log('\n=== FINAL VERIFICATION OF NEW MONGODB ===');
  const allCols = await db.listCollections().toArray();
  for (const c of allCols) {
    const count = await db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} docs`);
  }

  await client.close();
  console.log('\n🎉 Fresh database setup complete! All old data purged, ready for new festival.');
}

resetToFreshFestival().catch(err => {
  console.error('Error during reset:', err);
  process.exit(1);
});
