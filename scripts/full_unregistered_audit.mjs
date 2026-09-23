import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function runAudit() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');
    const resCol = db.collection('results');
    const unitCol = db.collection('units');
    const catCol = db.collection('categories');

    console.log("=== FULL FESTIVAL AUDIT ===");

    // 1. Categories
    const categories = await catCol.find().toArray();
    console.log(`\nCategories (${categories.length}):`);
    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = c.name;
      console.log(`  - [${c.id}] ${c.name}`);
    });

    // 2. Units
    const units = await unitCol.find().toArray();
    console.log(`\nUnits (${units.length}):`);
    units.forEach(u => console.log(`  - [${u.id}] ${u.name}`));

    // 3. Competitions
    const competitions = await compCol.find().toArray();
    console.log(`\nTotal Competitions in DB: ${competitions.length}`);

    // Map competitions
    const compMap = {};
    competitions.forEach(c => {
      compMap[c.id] = {
        ...c,
        regCount: 0,
        participants: [],
        teams: []
      };
    });

    // 4. Participants
    const participants = await partCol.find().toArray();
    console.log(`Total Participants in DB: ${participants.length}`);

    const zeroEventParticipants = [];
    const crossCategoryAssignments = [];

    participants.forEach(p => {
      const events = p.registeredEvents || [];
      if (events.length === 0) {
        zeroEventParticipants.push(p);
      }
      events.forEach(compId => {
        if (compMap[compId]) {
          compMap[compId].regCount++;
          compMap[compId].participants.push({
            chestNumber: p.chestNumber,
            fullName: p.fullName,
            category: p.selectedCategoryId
          });

          // Check if cross-category (unless competition is General or belongs to participant's category)
          const compCat = compMap[compId].categoryId;
          if (compCat && compCat !== 'cat_general' && compCat !== p.selectedCategoryId) {
            crossCategoryAssignments.push({
              participant: p.chestNumber + " (" + p.fullName + ")",
              partCat: catMap[p.selectedCategoryId] || p.selectedCategoryId,
              comp: compMap[compId].code + " - " + compMap[compId].name,
              compCat: catMap[compCat] || compCat
            });
          }
        }
      });
    });

    // Also check group registrations / teams in registrations collection
    const registrations = await regCol.find().toArray();
    console.log(`Total Registration Documents: ${registrations.length}`);

    registrations.forEach(r => {
      // Group registrations
      if (r.groupTeams && Array.isArray(r.groupTeams)) {
        r.groupTeams.forEach(t => {
          if (compMap[t.competitionId]) {
            compMap[t.competitionId].teams.push(t);
          }
        });
      }
      if (r.selectedGroupCompetitionIds && Array.isArray(r.selectedGroupCompetitionIds)) {
        r.selectedGroupCompetitionIds.forEach(cId => {
          if (compMap[cId] && !compMap[cId].teams.some(t => t.unitId === r.unitId)) {
            compMap[cId].teams.push({ unitId: r.unitId, source: 'selectedGroupCompetitionIds' });
          }
        });
      }
    });

    // Categorize competitions into With Registrations vs Zero Registrations
    const compsWithRegistrations = [];
    const compsWithZeroRegistrations = [];

    competitions.forEach(c => {
      const info = compMap[c.id];
      const totalCount = info.regCount + info.teams.length;
      if (totalCount > 0) {
        compsWithRegistrations.push({ ...info, totalRegistrations: totalCount });
      } else {
        compsWithZeroRegistrations.push(info);
      }
    });

    console.log(`\n--- COMPETITION REGISTRATION STATUS ---`);
    console.log(`Competitions with Registrations: ${compsWithRegistrations.length}`);
    console.log(`Competitions with 0 Registrations (UNREGISTERED): ${compsWithZeroRegistrations.length}`);

    if (compsWithZeroRegistrations.length > 0) {
      console.log(`\nUNREGISTERED COMPETITIONS LIST:`);
      compsWithZeroRegistrations.forEach(c => {
        console.log(`  - [${c.code || 'NO_CODE'}] ${c.name} (${catMap[c.categoryId] || c.categoryId || 'No Cat'}) [Type: ${c.participationType || c.type}] [ID: ${c.id}]`);
      });
    }

    console.log(`\n--- COMPETITIONS BREAKDOWN BY CATEGORY ---`);
    const byCategory = {};
    competitions.forEach(c => {
      const cat = catMap[c.categoryId] || c.categoryId || 'Unassigned';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, registered: 0, unregistered: [] };
      byCategory[cat].total++;
      const totalCount = compMap[c.id].regCount + compMap[c.id].teams.length;
      if (totalCount > 0) {
        byCategory[cat].registered++;
      } else {
        byCategory[cat].unregistered.push({ code: c.code, name: c.name, id: c.id });
      }
    });

    for (const [catName, stats] of Object.entries(byCategory)) {
      console.log(`* ${catName}: ${stats.registered} / ${stats.total} registered (Unregistered: ${stats.unregistered.length})`);
      if (stats.unregistered.length > 0) {
        stats.unregistered.forEach(u => console.log(`    - ${u.code}: ${u.name}`));
      }
    }

    // 5. Participants with 0 events
    console.log(`\n--- PARTICIPANTS AUDIT ---`);
    console.log(`Participants with 0 events: ${zeroEventParticipants.length}`);
    if (zeroEventParticipants.length > 0) {
      zeroEventParticipants.forEach(p => console.log(`  - Chest: ${p.chestNumber}, Name: ${p.fullName}, Category: ${p.selectedCategoryId}`));
    }

    // 6. Cross-category assignment check
    console.log(`\nCross-category mismatches found: ${crossCategoryAssignments.length}`);
    if (crossCategoryAssignments.length > 0) {
      crossCategoryAssignments.forEach(m => console.log(`  - ${m.participant} (${m.partCat}) is registered in ${m.comp} (${m.compCat})`));
    }

    // 7. Results check
    const totalResults = await resCol.countDocuments();
    console.log(`\n--- RESULTS AUDIT ---`);
    console.log(`Total result documents in DB: ${totalResults}`);

    // Check results for any deleted or unknown competitions
    const allResults = await resCol.find().toArray();
    const orphanResults = [];
    allResults.forEach(r => {
      if (!compMap[r.competitionId]) {
        orphanResults.push(r);
      }
    });
    console.log(`Orphan results pointing to non-existent competitions: ${orphanResults.length}`);

  } finally {
    await client.close();
  }
}

runAudit();
