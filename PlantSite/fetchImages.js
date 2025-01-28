// fetchImages.js

require('dotenv').config(); // Load environment variables from .env
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander'); // Import commander

// Configure command-line options
program
  .option('--only-placeholder', 'Update images only for plants using the placeholder image')
  .parse(process.argv);

const options = program.opts();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plantsdb';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Define Plant Schema
const plantSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }, // Common Name
    scientificName: { type: String }, // Scientific Name
    sunlight: { type: String, required: true },
    watering: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: 'images/placeholder.jpg' }, // Image URL
});

const Plant = mongoose.model('Plant', plantSchema, 'plants'); // Replace 'plants' if your collection name is different

// Trefle API Configuration
const TREFLE_API_KEY = process.env.TREFLE_API_KEY;
const TREFLE_FILTER_URL = 'https://trefle.io/api/v1/plants';

// Ensure API Key is present
if (!TREFLE_API_KEY) {
    console.error('❌ TREFLE_API_KEY is not defined in the .env file.');
    process.exit(1);
}

// Function to Clean Scientific Name by Removing Cultivar and Parenthetical Information
function cleanScientificName(scientificName) {
    // Removes any text in single quotes, parentheses, or square brackets
    return scientificName.replace(/['\(\[].*?['\)\]]/g, '').trim();
}

// Function to Sleep for a Given Duration (in ms)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to Download Image from URL and Save Locally
async function downloadImage(imageUrl, savePath) {
    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
        });

        await fs.ensureDir(path.dirname(savePath));

        const writer = fs.createWriteStream(savePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Error downloading image from "${imageUrl}":`, error.message);
        throw error;
    }
}

// Function to Fetch Image URL from Trefle Filter Plants API with Enhanced Error Logging
async function fetchImageUrl(scientificName, retries = 3, backoff = 2000) {
    try {
        const response = await axios.get(TREFLE_FILTER_URL, {
            params: {
                token: TREFLE_API_KEY,
                'filter[scientific_name]': scientificName,
                page: 1, // First page
                page_size: 1, // Fetch only the top result
            },
        });

        // Check if data exists and has at least one result
        if (response.data && response.data.data && response.data.data.length > 0) {
            const plantData = response.data.data[0];

            if (plantData.image_url) {
                console.log(`🖼️ Found image for "${scientificName}": ${plantData.image_url}`);
                return plantData.image_url;
            } else {
                console.warn(`⚠️ No image_url found for "${scientificName}". Using placeholder.`);
                return 'images/placeholder.jpg';
            }
        } else {
            console.warn(`⚠️ No results found for "${scientificName}". Using placeholder.`);
            return 'images/placeholder.jpg';
        }
    } catch (error) {
        if (retries > 0) {
            console.error(`❌ Error fetching image for "${scientificName}": ${error.message}. Retrying in ${backoff / 1000} seconds... (${retries} retries left)`);
            await sleep(backoff);
            return fetchImageUrl(scientificName, retries - 1, backoff * 2); // Exponential backoff
        } else {
            if (error.response) {
                console.error(`❌ Failed to fetch image for "${scientificName}" after multiple attempts:`, `Status Code: ${error.response.status}`);
                console.error('📄 Response Data:', JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.error(`❌ No response received for "${scientificName}" after multiple attempts:`, error.request);
            } else {
                console.error(`❌ Error in request setup for "${scientificName}":`, error.message);
            }
            console.warn(`⚠️ Using placeholder image for "${scientificName}".`);
            return 'images/placeholder.jpg';
        }
    }
}

// Main Function to Update Plants with Image URLs
async function updatePlantImages() {
    try {
        let query = {};

        if (options.onlyPlaceholder) {
            // If --only-placeholder flag is set, fetch only plants using the placeholder image
            query = { image: 'images/placeholder.jpg' };
            console.log('🔍 Mode: Only updating plants using the placeholder image.');
        } else {
            // Otherwise, fetch all plants
            console.log('🔍 Mode: Updating images for all plants.');
        }

        // Fetch plants based on the query
        const plants = await Plant.find(query);
        console.log(`🔍 Found ${plants.length} plant(s) to update.`);

        for (let i = 0; i < plants.length; i++) {
            const plant = plants[i];

            // Ensure scientificName is available
            if (!plant.scientificName || plant.scientificName.trim() === "") {
                console.warn(`⚠️ Scientific name missing for "${plant.name}". Skipping image fetch.`);
                continue;
            }

            // Clean the scientific name by removing cultivar and parenthetical information
            const cleanedScientificName = cleanScientificName(plant.scientificName);
            console.log(`🔄 [${i + 1}/${plants.length}] Fetching image for "${cleanedScientificName}"...`);

            const imageUrl = await fetchImageUrl(cleanedScientificName);

            if (imageUrl !== 'images/placeholder.jpg') {
                // Define local path to save the image
                const sanitizedScientificName = cleanedScientificName.replace(/\s+/g, '_'); // Replace spaces with underscores
                const imageExtension = path.extname(imageUrl).split('?')[0] || '.jpg'; // Handle URLs with query params
                const localImagePath = path.join('images', sanitizedScientificName, `image${imageExtension}`);

                try {
                    await downloadImage(imageUrl, localImagePath);
                    console.log(`✅ Downloaded and saved image for "${plant.name}" at "${localImagePath}".`);

                    // Update the plant's image field with the new local path
                    plant.image = localImagePath;
                } catch (downloadError) {
                    console.error(`❌ Failed to download image for "${plant.name}". Using placeholder.`);
                    plant.image = 'images/placeholder.jpg';
                }
            } else {
                // Image URL is placeholder; no action needed
                console.log(`✅ "${plant.name}" is already using the placeholder image.`);
            }

            // Save the updated plant document
            await plant.save();
            console.log(`✅ [${i + 1}/${plants.length}] Updated "${plant.name}" with image URL.`);

            // Optional: Sleep to respect API rate limits if using concurrency
            await sleep(500); // Adjust sleep time as needed
        }

        console.log('🎉 All plants have been processed.');
    } catch (err) {
        console.error('❌ An error occurred while updating plant images:', err);
    } finally {
        mongoose.disconnect();
    }
}

// Execute the Main Function
updatePlantImages();
