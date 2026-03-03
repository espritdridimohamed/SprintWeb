const fs = require('fs');
const path = require('path');
const { BSON } = require('bson');

const filePath = path.join(__dirname, 'backup', 'agrismart', 'users.bson');

console.log('📄 Analyse du fichier users.bson\n');

const bsonData = fs.readFileSync(filePath);
console.log(`Taille totale du fichier: ${bsonData.length} bytes (${(bsonData.length / 1024).toFixed(2)} KB)\n`);

let documentCount = 0;
let offset = 0;
let errors = 0;

while (offset < bsonData.length) {
    try {
        const docSize = bsonData.readInt32LE(offset);
        
        if (docSize <= 0) {
            console.log(`❌ Taille invalide à offset ${offset}: ${docSize}`);
            break;
        }
        
        if (offset + docSize > bsonData.length) {
            console.log(`❌ Document dépasse la fin du fichier à offset ${offset}`);
            console.log(`   Taille doc: ${docSize}, Bytes restants: ${bsonData.length - offset}`);
            break;
        }
        
        const docBuffer = bsonData.slice(offset, offset + docSize);
        try {
            const doc = BSON.deserialize(docBuffer);
            documentCount++;
            
            if (documentCount <= 6) {
                console.log(`Document ${documentCount}:`);
                console.log(`  - Taille: ${docSize} bytes`);
                console.log(`  - ID: ${doc._id}`);
                console.log(`  - Email: ${doc.email || 'N/A'}`);
                console.log(`  - Keys: ${Object.keys(doc).join(', ')}`);
                console.log('');
            }
        } catch (deserErr) {
            errors++;
            console.log(`⚠️  Erreur de désérialisation à offset ${offset}:`, deserErr.message);
            // Essayer de continuer
        }
        
        offset += docSize;
    } catch (err) {
        console.log(`❌ Erreur critique à offset ${offset}:`, err.message);
        break;
    }
}

console.log(`\n📊 Résumé:`);
console.log(`   Total documents parsés: ${documentCount}`);
console.log(`   Erreurs: ${errors}`);
console.log(`   Offset final: ${offset} / ${bsonData.length}`);
console.log(`   Bytes non-lus: ${bsonData.length - offset}`);
