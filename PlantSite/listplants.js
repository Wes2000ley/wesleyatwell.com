// list_plants.js

const { MongoClient } = require('mongodb');

// ------------------- Configuration -------------------

// MongoDB configuration
const MONGO_URI = "mongodb://localhost:27017/"; // Replace with your MongoDB URI if different
const DATABASE_NAME = "plantsdb";                // Your database name
const COLLECTION_NAME = "plants";                // Your collection name

// ------------------- Main Function -------------------

async function listPlantNames() {
    const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("✅ Connected to MongoDB successfully.");

        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Fetch all plant documents, projecting only the 'name' field
        const plants = await collection.find({}, { projection: { name: 1 } }).toArray();

        // Extract plant names and filter out any undefined or null names
        const plantNames = plants
            .map(plant => plant.name)
            .filter(name => typeof name === 'string' && name.trim() !== '');

        // Format plant names as "name1","name2",...
        const formattedNames = plantNames.map(name => `"${name}"`).join(",");

        // Output the formatted list
        console.log(formattedNames);

    } catch (error) {
        console.error("❌ An error occurred:", error.message);
    } finally {
        // Ensure the client will close when you finish/error
        await client.close();
        console.log("🔒 MongoDB connection closed.");
    }
}

// ------------------- Execute -------------------

listPlantNames();
