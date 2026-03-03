const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { BSON } = require('bson');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'agrismart';
const BACKUP_DIR = path.join(__dirname, 'backup', 'agrismart');

async function importBackup() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        console.log('🔗 Connexion à MongoDB...');
        await client.connect();
        console.log('✅ Connecté à MongoDB');
        
        const db = client.db(DB_NAME);
        
        // Lire tous les fichiers .bson du backup
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.bson'));
        
        console.log(`📦 ${files.length} collections trouvées dans le backup`);
        
        for (const file of files) {
            const collectionName = file.replace('.bson', '');
            const filePath = path.join(BACKUP_DIR, file);
            
            console.log(`\n📥 Import de ${collectionName}...`);
            
            try {
                // Lire le fichier BSON
                const bsonData = fs.readFileSync(filePath);
                
                // Parser les documents BSON
                const documents = [];
                let offset = 0;
                
                while (offset < bsonData.length) {
                    try {
                        const docSize = bsonData.readInt32LE(offset);
                        if (docSize <= 0 || offset + docSize > bsonData.length) {
                            break;
                        }
                        
                        const docBuffer = bsonData.slice(offset, offset + docSize);
                        const doc = BSON.deserialize(docBuffer);
                        documents.push(doc);
                        offset += docSize;
                    } catch (err) {
                        console.warn(`⚠️  Erreur de parsing à l'offset ${offset}:`, err.message);
                        break;
                    }
                }
                
                if (documents.length > 0) {
                    // Supprimer la collection complètement pour éviter les validations
                    try {
                        await db.collection(collectionName).drop();
                        console.log(`   Collection ${collectionName} supprimée`);
                    } catch (e) {
                        // Collection n'existe pas, c'est ok
                    }
                    
                    // Insérer avec bypassDocumentValidation
                    await db.collection(collectionName).insertMany(documents, {
                        bypassDocumentValidation: true,
                        ordered: false
                    });
                    console.log(`✅ ${documents.length} documents importés dans ${collectionName}`);
                } else {
                    console.log(`⚠️  Aucun document trouvé dans ${file}`);
                }
            } catch (err) {
                console.error(`❌ Erreur lors de l'import de ${collectionName}:`, err.message);
            }
        }
        
        console.log('\n\n🎉 Import terminé avec succès !');
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

importBackup();
