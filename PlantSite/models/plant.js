const mongoose = require('mongoose');

// Define the plant schema
const plantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sunlight: { type: String, required: true },
    watering: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
});

// Export the Plant model
module.exports = mongoose.model('Plant', plantSchema);
