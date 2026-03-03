const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'agrismart';

async function checkDatabase() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Connecté à MongoDB\n');
        
        const db = client.db(DB_NAME);
        const collections = await db.listCollections().toArray();
        
        console.log('📊 État actuel de la base de données:\n');
        
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            if (count > 0) {
                console.log(`✓ ${collection.name}: ${count} documents`);
            }
        }
        
        console.log('\n');
        
        // Vérifier spécifiquement users
        const usersCount = await db.collection('users').countDocuments();
        console.log(`\n🔍 Total utilisateurs: ${usersCount}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.close();
    }
}

checkDatabase();
