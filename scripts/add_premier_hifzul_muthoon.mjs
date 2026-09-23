import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');
    const resCol = db.collection('results');
    const setCol = db.collection('settings');

    // 1. Find Junior Hifzul Muthoon
    const jrHifz = await compCol.findOne({ id: 'comp_1789119512608_x652x' }) || 
                   await compCol.findOne({ name: { $regex: /hifzul\s*muthoon/i }, categoryId: 'cat_junior' });
    console.log("Junior Hifzul Muthoon:", jrHifz);

    // 2. Check all competitions in cat_premier to see highest code
    const premierComps = await compCol.find({ categoryId: 'cat_premier' }).toArray();
    console.log(`Found ${premierComps.length} Premier competitions.`);
    premierComps.forEach(c => console.log(`  ${c.code || 'NO_CODE'} - ${c.name} (${c.id})`));

    // 3. Check if Premier Hifzul Muthoon already exists
    let premierHifz = await compCol.findOne({ 
      name: { $regex: /hifzul\s*muthoon/i }, 
      categoryId: 'cat_premier' 
    });

    if (!premierHifz) {
      // Find next code for Premier
      const prCodes = premierComps
        .map(c => c.code)
        .filter(c => c && c.startsWith('PR'))
        .map(c => parseInt(c.replace('PR', ''), 10))
        .filter(n => !isNaN(n));
      const maxCodeNum = prCodes.length > 0 ? Math.max(...prCodes) : 30;
      const nextCode = `PR${String(maxCodeNum + 1).padStart(2, '0')}`;

      const newId = `comp_${Date.now()}_premier_hifzul_muthoon`;
      premierHifz = {
        id: newId,
        name: "Hifzul Muthoon",
        code: nextCode,
        categoryId: "cat_premier",
        section: "premier",
        category: "Premier",
        type: jrHifz?.type || "individual",
        participationType: "individual",
        stageType: jrHifz?.stageType || "off_stage",
        durationMinutes: jrHifz?.durationMinutes || 10,
        maxMarks: jrHifz?.maxMarks || 100,
        criteria: jrHifz?.criteria || [],
        rules: jrHifz?.rules || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await compCol.insertOne(premierHifz);
      console.log(`Created new Premier competition:`, premierHifz);
    } else {
      console.log("Premier Hifzul Muthoon already exists:", premierHifz);
    }

    // 4. Check if any results exist for Junior Hifzul Muthoon OR any competition with name Hifzul Muthoon
    const allHifzComps = await compCol.find({ name: { $regex: /hifzul\s*muthoon/i } }).toArray();
    const hifzCompIds = allHifzComps.map(c => c.id);
    console.log("Hifzul Muthoon competition IDs:", hifzCompIds);

    const resultsForHifz = await resCol.find({ competitionId: { $in: hifzCompIds } }).toArray();
    console.log(`Results found for any Hifzul Muthoon: ${resultsForHifz.length}`);
    if (resultsForHifz.length > 0) {
      console.log(JSON.stringify(resultsForHifz, null, 2));
    }

    // 5. The 7 Premier participants
    const targetChestNos = [
      "2026JM213",
      "2026JM111",
      "2026JM106",
      "2026JM115",
      "2026JM088",
      "2026JM090",
      "2026JM101"
    ];

    const targetParticipants = await partCol.find({ chestNumber: { $in: targetChestNos } }).toArray();
    console.log(`Found ${targetParticipants.length} target participants:`);

    for (const p of targetParticipants) {
      console.log(`- Chest: ${p.chestNumber} | Name: ${p.name} | Category: ${p.category} | Current events: ${p.registeredEvents?.length || 0}`);
      
      // Also check if any result exists for this participant in ANY competition
      const pResults = await resCol.find({ participantId: p.id }).toArray();
      console.log(`   Results count for ${p.name}: ${pResults.length}`);
      pResults.forEach(r => console.log(`     - Comp ID: ${r.competitionId}, Rank: ${r.rank}, Grade: ${r.grade}, Total: ${r.totalScore}`));

      // Update participant.registeredEvents with premierHifz.id
      await partCol.updateOne(
        { id: p.id },
        { $addToSet: { registeredEvents: premierHifz.id } }
      );

      // Update registrations.selectedIndividualCompetitionIds
      // Participant might belong to a unit registration
      await regCol.updateMany(
        { unitId: p.unitId, "participants.participantId": p.id },
        { 
          $addToSet: { 
            "participants.$.individualCompetitions": premierHifz.id,
            selectedIndividualCompetitionIds: premierHifz.id
          } 
        }
      );
      
      // Also direct match in registrations if structured differently
      await regCol.updateMany(
        { participantId: p.id },
        { $addToSet: { selectedIndividualCompetitionIds: premierHifz.id } }
      );
    }

    // 6. Verify registration update
    console.log("\nVerifying updated participants:");
    const updatedParticipants = await partCol.find({ chestNumber: { $in: targetChestNos } }).toArray();
    for (const p of updatedParticipants) {
      console.log(`✓ ${p.chestNumber} (${p.name}): has ${premierHifz.id}? ${p.registeredEvents.includes(premierHifz.id)} (Total events: ${p.registeredEvents.length})`);
    }

    // 7. Bump settings state_version
    await setCol.updateOne(
      { key: "state_version" },
      { $inc: { version: 1 }, $set: { updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    console.log("Settings state_version bumped successfully!");

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
