// updateScientificNames.js

require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const fs = require('fs');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plantsdb';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Define Plant Schema
const plantSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    scientificName: { type: String }, // New field for scientific name
    // Add other fields if necessary
});

// Create Plant Model
const Plant = mongoose.model('Plant', plantSchema);

// Function to Update Scientific Names from JSON
async function updateScientificNamesFromJSON(mappingFilePath) {
    try {
        const data = fs.readFileSync(mappingFilePath, 'utf8');
        const mappings = JSON.parse(data);

        for (let mapping of mappings) {
            const { commonName, scientificName } = mapping;

            if (!commonName || !scientificName) {
                console.warn(`⚠️ Missing commonName or scientificName in mapping:`, mapping);
                continue;
            }

            const plant = await Plant.findOne({ name: commonName });
            if (!plant) {
                console.warn(`⚠️ Plant with name "${commonName}" not found in the database.`);
                continue;
            }

            plant.scientificName = scientificName;
            await plant.save();
            console.log(`✅ Updated "${commonName}" with scientific name "${scientificName}".`);
        }

        console.log('🎉 All scientific names have been updated.');
    } catch (err) {
        console.error('❌ Error updating scientific names:', err);
    } finally {
        mongoose.disconnect();
    }
}

// Execute the Function with the Mapping File
const mappingFilePath = 'plant_scientific_names.json'; // Replace with your mapping file path
updateScientificNamesFromJSON(mappingFilePath);
