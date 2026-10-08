const { MongoClient } = require('mongodb');

const OLD_URI = 'mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0';
const NEW_URI = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('Connecting to OLD and NEW MongoDB clusters...');
  const oldClient = new MongoClient(OLD_URI);
  const newClient = new MongoClient(NEW_URI);

  try {
    await Promise.all([oldClient.connect(), newClient.connect()]);
    console.log('Connected to both clusters successfully!');

    const oldDb = oldClient.db('sahityotsav');
    const newDb = newClient.db('rendezvous_2026');

    // Collections to migrate into separate collections (16MB safe)
    const collections = [
      'users',
      'units',
      'categories',
      'competitions',
      'participants',
      'teams',
      'results',
      'registrations',
      'chestNumbers',
      'counters',
      'greenRoomAssignments',
      'judgmentSheets',
      'judgeScores',
      'gallery',
      'videoHighlights',
      'dragBlocks',
      'heroMedia',
      'settings'
    ];

    console.log('\n--- Starting migration of separate collections ---');

    for (const colName of collections) {
      const oldCol = oldDb.collection(colName);
      const newCol = newDb.collection(colName);

      const docs = await oldCol.find({}).toArray();
      console.log(`\nProcessing collection '${colName}': found ${docs.length} documents in source.`);

      if (docs.length > 0) {
        // Prepare clean docs ensuring _id and id are normalized
        const cleanDocs = docs.map(doc => {
          const docId = doc._id || doc.id;
          return {
            ...doc,
            _id: docId,
            ...(doc.id ? { id: doc.id } : { id: docId })
          };
        });

        // Clear existing docs in target collection for clean setup
        await newCol.deleteMany({});

        // Batch insert in chunks of 500 to avoid payload limits
        const chunkSize = 500;
        for (let i = 0; i < cleanDocs.length; i += chunkSize) {
          const chunk = cleanDocs.slice(i, i + chunkSize);
          await newCol.insertMany(chunk, { ordered: false });
        }

        const newCount = await newCol.countDocuments();
        console.log(`✅ Collection '${colName}' successfully migrated: ${newCount} documents.`);

        // Create standard index on 'id' if not settings
        if (colName !== 'settings') {
          await newCol.createIndex({ id: 1 }, { background: true }).catch(() => {});
        }
      } else {
        console.log(`ℹ️ Collection '${colName}' is empty in source, initialized empty in target.`);
      }
    }

    // Set a fresh state_version in settings
    await newDb.collection('settings').updateOne(
      { _id: 'state_version' },
      { $set: { _id: 'state_version', version: Date.now(), updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    console.log('\n======================================================');
    console.log('🎉 Migration to new MongoDB completed successfully!');
    console.log('Database name: rendezvous_2026');
    console.log('All sections stored in completely separate collections.');
    console.log('Safe from MongoDB 16MB document size limit.');
    console.log('======================================================');

  } catch (err) {
    console.error('Migration failed with error:', err);
    process.exit(1);
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

migrate();
