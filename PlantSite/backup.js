// backup.js

require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');

// Define Backup Directory
const BACKUP_DIR = path.join(__dirname, 'backups');

// Create Backup Directory if It Doesn't Exist
async function createBackupDirectory() {
    try {
        await fs.ensureDir(BACKUP_DIR);
        console.log(`✅ Backup directory ensured at "${BACKUP_DIR}"`);
    } catch (error) {
        console.error(`❌ Error creating backup directory: ${error.message}`);
        process.exit(1);
    }
}

// Define Plant Schema (Ensure it matches your actual schema)
const plantSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    scientificName: { type: String },
    sunlight: { type: String, required: true },
    watering: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    image4: { type: String },
    image5: { type: String },
}, { versionKey: false }); // Disable __v field if not needed

// Create Plant Model
const Plant = mongoose.model('Plant', plantSchema);

// Function to Export Database to JSON
async function exportDatabase() {
    try {
        const plants = await Plant.find().lean(); // Use .lean() for plain JavaScript objects
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format: YYYY-MM-DDTHH-MM-SS-Z
        const backupFileName = `plants_backup_${timestamp}.json`;
        const backupFilePath = path.join(BACKUP_DIR, backupFileName);

        await fs.writeJson(backupFilePath, plants, { spaces: 2 });
        console.log(`✅ Database exported successfully to "${backupFilePath}"`);
        return backupFilePath; // Return path for any further processing if needed
    } catch (error) {
        console.error(`❌ Error exporting database: ${error.message}`);
        throw error; // Rethrow to be caught in main function
    }
}

// Main Backup Function
async function performBackup() {
    try {
        await createBackupDirectory();

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plantsdb';

        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB successfully');

        // Export Database
        const backupFilePath = await exportDatabase();

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');

        console.log('🎉 Backup process completed successfully!');
    } catch (error) {
        console.error('❌ Backup process failed:', error.message);
        process.exit(1);
    }
}

// Execute the Backup
performBackup();
