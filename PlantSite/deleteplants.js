// deletePlants.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Retrieve environment variables
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'plantsdb';
const collectionName = process.env.COLLECTION_NAME || 'plants';

// Get the plant names from command-line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a list of plant names in the format: "plant1","plant2","plant3", etc.');
    process.exit(1);
}

// Join all arguments and split by comma to handle cases where plant names contain spaces
const plantsArg = args.join(' ');
const plantNames = plantsArg.split(',').map(name => name.trim().replace(/^"|"$/g, '')).filter(name => name.length > 0);

if (plantNames.length === 0) {
    console.error('No valid plant names provided.');
    process.exit(1);
}

(async () => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected successfully to MongoDB.');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Perform the delete operation
        const result = await collection.deleteMany({ name: { $in: plantNames } });

        console.log(`Deleted ${result.deletedCount} plant(s) from the database.`);
    } catch (err) {
        console.error('An error occurred while deleting plants:', err.message);
    } finally {
        // Close the connection
        await client.close();
        console.log('MongoDB connection closed.');
    }
})();
