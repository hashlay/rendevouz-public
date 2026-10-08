const { MongoClient } = require('mongodb');
async function check() {
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('festival_database');
  const cms = await db.collection('cmsSettings').findOne({});
  console.log('MongoDB cmsSettings keys:', Object.keys(cms || {}));
  console.log('aboutDescription:', cms?.aboutDescription);
  console.log('aboutTitle:', cms?.aboutTitle);
  console.log('aboutSubtitle:', cms?.aboutSubtitle);
  console.log('themeTitle:', cms?.themeTitle);
  console.log('themeDescription:', cms?.themeDescription);
  await client.close();
}
check();
