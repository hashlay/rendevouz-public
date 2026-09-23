import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    
    const projCompId = 'comp_1789119512608_nsgfn';
    const existingTeams = await db.collection('teams').find({ competitionId: projCompId }).toArray();
    if (existingTeams.length === 0) {
      const totalTeams = await db.collection('teams').countDocuments();
      const newTeams = [
        {
          id: 'team_' + Date.now() + '_sirafi_proj',
          teamNumber: 'T-' + String(totalTeams + 1).padStart(3, '0'),
          teamName: 'Mufarrij Ibrahim & Team',
          unitId: 'unit_sirafi_seafarers',
          categoryId: 'cat_junior',
          competitionId: projCompId,
          memberIds: ['part_1789119369622_qtsyn'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'team_' + Date.now() + '_tabrizi_proj',
          teamNumber: 'T-' + String(totalTeams + 2).padStart(3, '0'),
          teamName: 'Salman Nazeer & Team',
          unitId: 'unit_tabrizi_taraz',
          categoryId: 'cat_junior',
          competitionId: projCompId,
          memberIds: ['part_1789119369622_7c6y7', 'part_1789119369623_z98lf'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'team_' + Date.now() + '_zanzibari_proj',
          teamNumber: 'T-' + String(totalTeams + 3).padStart(3, '0'),
          teamName: 'Zanzibari Souqs Team',
          unitId: 'unit_zanzibari_souqs',
          categoryId: 'cat_junior',
          competitionId: projCompId,
          memberIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await db.collection('teams').insertMany(newTeams);
      console.log('Inserted 3 teams for Project!');
    } else {
      console.log('Teams already exist for Project:', existingTeams.length);
    }

    await db.collection('settings').updateOne(
      { _id: 'state_version' },
      { $set: { _id: 'state_version', version: Date.now() } },
      { upsert: true }
    );
    console.log('State version bumped.');
  } finally {
    await client.close();
  }
}

run();
