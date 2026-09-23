import fs from 'fs';

function readFontInfo(filePath) {
  const buf = fs.readFileSync(filePath);
  console.log(`\n=== File: ${filePath} (${buf.length} bytes) ===`);
  
  // Read sfnt header
  const numTables = buf.readUInt16BE(4);
  let nameOffset = 0;
  let os2Offset = 0;

  for (let i = 0; i < numTables; i++) {
    const tag = buf.toString('ascii', 12 + i * 16, 12 + i * 16 + 4);
    const offset = buf.readUInt32BE(12 + i * 16 + 8);
    if (tag === 'name') nameOffset = offset;
    if (tag === 'OS/2') os2Offset = offset;
  }

  if (os2Offset) {
    const usWeightClass = buf.readUInt16BE(os2Offset + 4);
    console.log(`OS/2 usWeightClass: ${usWeightClass}`);
  }

  if (nameOffset) {
    const stringOffset = nameOffset + buf.readUInt16BE(nameOffset + 4);
    const count = buf.readUInt16BE(nameOffset + 2);
    for (let i = 0; i < count; i++) {
      const rec = nameOffset + 6 + i * 12;
      const platformID = buf.readUInt16BE(rec);
      const nameID = buf.readUInt16BE(rec + 6);
      const length = buf.readUInt16BE(rec + 8);
      const offset = buf.readUInt16BE(rec + 10);

      // NameIDs: 1: Family, 2: Subfamily, 4: Full name, 6: PostScript name, 16: Typographic Family, 17: Typographic Subfamily
      if ([1, 2, 4, 6, 16, 17].includes(nameID)) {
        let str = '';
        if (platformID === 3 || platformID === 0) {
          // UTF-16BE
          for (let j = 0; j < length; j += 2) {
            str += String.fromCharCode(buf.readUInt16BE(stringOffset + offset + j));
          }
        } else {
          str = buf.toString('latin1', stringOffset + offset, stringOffset + offset + length);
        }
        console.log(`  NameID ${nameID} (p${platformID}): ${str}`);
      }
    }
  }
}

readFontInfo('public/fonts/FractulAlt.ttf');
readFontInfo('public/fonts/FractulAlt-Hairline.ttf');
