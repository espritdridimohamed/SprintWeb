const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'agrismart';

async function fixValidation() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        console.log('🔗 Connexion à MongoDB...');
        await client.connect();
        
        const db = client.db(DB_NAME);
        
        // Désactiver la validation pour users
        console.log('⚙️  Désactivation de la validation pour users...');
        await db.command({
            collMod: 'users',
            validator: {},
            validationLevel: 'off'
        }).catch(err => {
            console.log('Collection users n\'existe pas encore ou pas de validation');
        });
        
        console.log('✅ Validation désactivée');
        console.log('\nMaintenant, réexécute mongorestore pour importer les users.');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.close();
    }
}

fixValidation();
