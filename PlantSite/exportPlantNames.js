// exportPlantNames.js

require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
    // Add other fields if necessary
});

// Create Plant Model
const Plant = mongoose.model('Plant', plantSchema);

// Function to Export Plant Names
async function exportPlantNames() {
    try {
        const plants = await Plant.find({}, 'name').lean(); // Fetch only the 'name' field

        if (plants.length === 0) {
            console.log('📄 No plant names found in the database.');
            return;
        }

        // Option 1: Export to JSON
        fs.writeFileSync('plant_names.json', JSON.stringify(plants, null, 2));
        console.log('✅ Plant names exported to plant_names.json');

        // Option 2: Export to CSV
        const csvWriter = createCsvWriter({
            path: 'plant_names.csv',
            header: [
                { id: 'name', title: 'Plant Name' },
            ]
        });

        await csvWriter.writeRecords(plants);
        console.log('✅ Plant names exported to plant_names.csv');

    } catch (err) {
        console.error('❌ Error exporting plant names:', err);
    } finally {
        mongoose.disconnect();
    }
}

// Execute the Function
exportPlantNames();
