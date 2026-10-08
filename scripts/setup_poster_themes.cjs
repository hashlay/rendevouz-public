const { MongoClient } = require('mongodb');
const fs = require('fs');

async function updatePosterConfig() {
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rendezvous_2026');

  const customThemes = [
    '/themes/theme_brown.jpg',
    '/themes/theme_blue.jpg',
    '/themes/theme_yellow.jpg',
    '/themes/theme_purple.jpg'
  ];

  const themeRules = [
    {
      id: 1,
      type: 'resultRange',
      startResult: 1,
      endResult: 10,
      themeIndex: 0
    },
    {
      id: 2,
      type: 'resultRange',
      startResult: 11,
      endResult: 20,
      themeIndex: 1
    },
    {
      id: 3,
      type: 'resultRange',
      startResult: 21,
      endResult: 30,
      themeIndex: 2
    },
    {
      id: 4,
      type: 'resultRange',
      startResult: 31,
      endResult: 40,
      themeIndex: 3
    }
  ];

  // Retrieve existing config
  const existing = await db.collection('settings').findOne({ _id: 'posterTemplateConfig' }) || {};
  const currentConfigs = existing.themeConfigs || {};

  // Ensure 4 themeConfigs exist, preserving coordinates and font styles
  const newThemeConfigs = {
    '0': currentConfigs['0'] || currentConfigs[0] || {},
    '1': currentConfigs['1'] || currentConfigs[1] || {},
    '2': currentConfigs['2'] || currentConfigs[2] || {},
    '3': currentConfigs['3'] || currentConfigs[3] || {}
  };

  const updatedConfig = {
    _id: 'posterTemplateConfig',
    id: 'posterTemplateConfig',
    customThemes,
    themeRules,
    themeConfigs: newThemeConfigs
  };

  await db.collection('settings').updateOne(
    { _id: 'posterTemplateConfig' },
    { $set: updatedConfig },
    { upsert: true }
  );

  console.log('MongoDB posterTemplateConfig updated successfully!');

  // Sync to db.json files
  const files = ['data/db.json', 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/data/db.json'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        content.posterTemplateConfig = updatedConfig;
        if (content.eventSettings) {
          content.eventSettings.posterTemplateConfig = updatedConfig;
        }
        fs.writeFileSync(f, JSON.stringify(content, null, 2), 'utf8');
        console.log('Updated ' + f);
      } catch (err) {
        console.error('Error updating ' + f, err);
      }
    }
  }

  await client.close();
}

updatePosterConfig().catch(console.error);
