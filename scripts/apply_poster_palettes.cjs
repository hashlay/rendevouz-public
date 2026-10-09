const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

const PALETTES = {
  // Theme 0: Brown Theme -> 02 — Coral Red
  '0': {
    resultNumColor: '#8D3020',
    categoryColor: '#916C63',
    compNameColor: '#A94029',
    titleColor: '#A94029',
    winnerColor: '#482722',
    unitColor: '#B36A50',
    rankTextColor: '#482722',
    rank1Color: '#8D3020',
    rank2Color: '#8D3020',
    rank3Color: '#8D3020'
  },
  // Theme 1: Blue Theme -> 03 — Ocean Blue
  '1': {
    resultNumColor: '#07519C',
    categoryColor: '#637C94',
    compNameColor: '#1268B0',
    titleColor: '#1268B0',
    winnerColor: '#173C60',
    unitColor: '#4689BC',
    rankTextColor: '#173C60',
    rank1Color: '#07519C',
    rank2Color: '#07519C',
    rank3Color: '#07519C'
  },
  // Theme 2: Yellow Theme -> 01 — Golden Yellow
  '2': {
    resultNumColor: '#956B12',
    categoryColor: '#80645B',
    compNameColor: '#A07816',
    titleColor: '#A07816',
    winnerColor: '#4A3030',
    unitColor: '#B18B42',
    rankTextColor: '#4A3030',
    rank1Color: '#956B12',
    rank2Color: '#956B12',
    rank3Color: '#956B12'
  },
  // Theme 3: Purple Theme -> 04 — Royal Purple
  '3': {
    resultNumColor: '#7012B9',
    categoryColor: '#806C94',
    compNameColor: '#7920C6',
    titleColor: '#7920C6',
    winnerColor: '#39224F',
    unitColor: '#9564B9',
    rankTextColor: '#39224F',
    rank1Color: '#7012B9',
    rank2Color: '#7012B9',
    rank3Color: '#7012B9'
  }
};

async function applyPaletteColors() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rendezvous_2026');

  const existing = await db.collection('settings').findOne({ _id: 'posterTemplateConfig' }) || {};
  const themeConfigs = existing.themeConfigs || {};

  for (const [idx, palette] of Object.entries(PALETTES)) {
    themeConfigs[idx] = {
      ...(themeConfigs[idx] || {}),
      ...palette
    };
  }

  const updatedConfig = {
    ...existing,
    _id: 'posterTemplateConfig',
    id: 'posterTemplateConfig',
    themeConfigs
  };

  await db.collection('settings').updateOne(
    { _id: 'posterTemplateConfig' },
    { $set: updatedConfig },
    { upsert: true }
  );

  console.log('MongoDB posterTemplateConfig colors successfully updated!');
  for (const [idx, palette] of Object.entries(PALETTES)) {
    console.log(`Theme ${idx}:`, {
      resultNumColor: themeConfigs[idx].resultNumColor,
      categoryColor: themeConfigs[idx].categoryColor,
      compNameColor: themeConfigs[idx].compNameColor,
      winnerColor: themeConfigs[idx].winnerColor,
      unitColor: themeConfigs[idx].unitColor
    });
  }

  // Update local db.json files
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

applyPaletteColors().catch(console.error);
