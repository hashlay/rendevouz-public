import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    
    const participants = await db.collection('participants').find({}).toArray();
    const registrations = await db.collection('registrations').find({}).toArray();
    const competitions = await db.collection('competitions').find({}).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    const results = await db.collection('results').find({}).toArray();
    
    const compMap = new Map(competitions.map(c => [c.id, c]));
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    
    console.log("=== STEP 1: FIX ORPHAN 301 RESULTS ===");
    const orphan301Ids = ['res_1790036957839_ebel0', 'res_1790037017914_d2kv3', 'res_1790086898953_9pccy'];
    const delRes = await db.collection('results').deleteMany({ id: { $in: orphan301Ids } });
    console.log(`Deleted ${delRes.deletedCount} orphan results from deleted 301.`);

    console.log("\n=== STEP 2: REMOVE CROSS-CATEGORY HIFZUL MUTHOON FROM 7 PREMIER PARTICIPANTS ===");
    const juniorHifzId = 'comp_1789119512608_x652x';
    let premierFixed = 0;
    for (const p of participants) {
      if (p.selectedCategoryId === 'cat_premier') {
        let partChanged = false;
        if (p.registeredEvents && p.registeredEvents.includes(juniorHifzId)) {
          p.registeredEvents = p.registeredEvents.filter(id => id !== juniorHifzId);
          partChanged = true;
        }
        const reg = registrations.find(r => r.participantId === p.id);
        let regChanged = false;
        if (reg && reg.selectedIndividualCompetitionIds && reg.selectedIndividualCompetitionIds.includes(juniorHifzId)) {
          reg.selectedIndividualCompetitionIds = reg.selectedIndividualCompetitionIds.filter(id => id !== juniorHifzId);
          regChanged = true;
        }
        if (partChanged) {
          await db.collection('participants').updateOne({ id: p.id }, { $set: { registeredEvents: p.registeredEvents } });
        }
        if (regChanged && reg) {
          await db.collection('registrations').updateOne({ id: reg.id }, { $set: { selectedIndividualCompetitionIds: reg.selectedIndividualCompetitionIds } });
        }
        if (partChanged || regChanged) premierFixed++;
      }
    }
    console.log(`Removed Junior Hifzul Muthoon from ${premierFixed} Premier participants.`);

    console.log("\n=== STEP 3: SYNC OUT-OF-SYNC EVENTS (MERGE registeredEvents -> registrations) ===");
    let syncedCount = 0;
    for (const p of participants) {
      if (p.deletedAt) continue;
      let reg = registrations.find(r => r.participantId === p.id && !r.deletedAt);
      if (!reg) {
        reg = {
          id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          participantId: p.id,
          categoryId: p.selectedCategoryId,
          selectedIndividualCompetitionIds: [],
          selectedGroupCompetitionIds: [],
          registrationStatus: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await db.collection('registrations').insertOne(reg);
        registrations.push(reg);
      }
      
      const pEvents = p.registeredEvents || [];
      const rInd = reg.selectedIndividualCompetitionIds || [];
      const rGrp = reg.selectedGroupCompetitionIds || [];
      
      // Determine which events in p.registeredEvents are valid active competitions
      const validPEvents = pEvents.filter(cId => {
        const comp = compMap.get(cId);
        if (!comp || comp.deletedAt) return false;
        // Competition must match participant's category or General
        const compCat = comp.categoryId;
        const compCatName = catMap.get(compCat);
        return compCat === p.selectedCategoryId || compCatName?.toLowerCase() === 'general';
      });
      
      // Separate validPEvents into individual and group
      const newInd = validPEvents.filter(cId => {
        const comp = compMap.get(cId);
        return comp && comp.participationType !== 'group';
      });
      const newGrp = validPEvents.filter(cId => {
        const comp = compMap.get(cId);
        return comp && comp.participationType === 'group';
      });
      
      // Merge into registration
      const mergedInd = Array.from(new Set([...rInd, ...newInd]));
      const mergedGrp = Array.from(new Set([...rGrp, ...newGrp]));
      const allMerged = [...mergedInd, ...mergedGrp];
      
      let pNeedsUpdate = false;
      let rNeedsUpdate = false;
      
      if (mergedInd.length !== rInd.length || mergedGrp.length !== rGrp.length) {
        rNeedsUpdate = true;
      }
      
      const pSet = new Set(pEvents);
      if (allMerged.some(id => !pSet.has(id)) || pEvents.length !== allMerged.length) {
        pNeedsUpdate = true;
      }
      
      if (rNeedsUpdate) {
        await db.collection('registrations').updateOne(
          { id: reg.id },
          { $set: {
            selectedIndividualCompetitionIds: mergedInd,
            selectedGroupCompetitionIds: mergedGrp,
            updatedAt: new Date().toISOString()
          }}
        );
        reg.selectedIndividualCompetitionIds = mergedInd;
        reg.selectedGroupCompetitionIds = mergedGrp;
      }
      
      if (pNeedsUpdate) {
        await db.collection('participants').updateOne(
          { id: p.id },
          { $set: {
            registeredEvents: allMerged,
            updatedAt: new Date().toISOString()
          }}
        );
        p.registeredEvents = allMerged;
      }
      
      if (rNeedsUpdate || pNeedsUpdate) {
        syncedCount++;
        console.log(`Synced ${p.fullName} (${p.chestNumber || p.profilePhoto}): Ind=${mergedInd.length}, Grp=${mergedGrp.length}`);
      }
    }
    console.log(`\nSuccessfully synchronized ${syncedCount} participants!`);

    // Bump state_version so all active instances reload from MongoDB
    await db.collection('settings').updateOne(
      { _id: 'state_version' },
      { $set: { _id: 'state_version', version: Date.now() } },
      { upsert: true }
    );
    console.log("Bumped state_version to force instant cache reload.");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
