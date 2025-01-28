// server.js

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/plantsdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Serve images as static files with caching
app.use('/images', express.static(path.join(__dirname, 'images'), {
    maxAge: '30d', // Cache images for 30 days
    etag: false, // Disable ETag to simplify caching
}));

// Serve 'images2' directory as '/images2' path
app.use('/images2', express.static(path.join(__dirname, 'images2'), {
    maxAge: '30d',
    etag: false,
}));

// **Serve frontend static files under '/Plants/'**
app.use('/Plants/', express.static(path.join(__dirname, "frontend"), {
    maxAge: '1d', // Adjust caching as needed
}));

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

// Define Plant Schema
const plantSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    sunlight: { type: String, required: true },
    watering: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Should be a path like "/images/PlantName/image.jpg"
    image1: { type: String, required: true },
    image2: { type: String, required: true },
    image3: { type: String, required: true },
    image4: { type: String, required: true },
    image5: { type: String, required: true },
});

// Create Plant Model
const Plant = mongoose.model("Plant", plantSchema);

// API Endpoints

// 1. Get Plants with Pagination
app.get("/api2/plants", async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    try {
        const plants = await Plant.find()
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Plant.countDocuments();

        res.json({
            plants,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch plants" });
    }
});

// 2. Get All Plants (No Pagination)
app.get("/api2/plants/all", async (req, res) => {
    try {
        const allPlants = await Plant.find().sort({ name: 1 }); // Optional: sort alphabetically
        res.json(allPlants);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all plants" });
    }
});

// 3. Fetch a specific plant by name
app.get("/api2/plants/name/:name", async (req, res) => {
    try {
        // Case-insensitive search
        const plant = await Plant.findOne({ name: { $regex: `^${req.params.name}$`, $options: "i" } });
        if (!plant) {
            return res.status(404).json({ error: "Plant not found" });
        }
        res.json(plant);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch plant" });
    }
});

// 4. Search Plants by Name
app.get("/api2/plants/search", async (req, res) => {
    const { query } = req.query; // e.g., ?query=aloe

    if (!query) {
        return res.status(400).json({ error: "No search query provided" });
    }

    try {
        // Case-insensitive search in the name field
        const plants = await Plant.find({ name: { $regex: query, $options: "i" } }).sort({ name: 1 });
        res.json(plants);
    } catch (err) {
        res.status(500).json({ error: "Failed to search plants" });
    }
});

// 6. Handle /Plants Route
app.get("/Plants", (req, res) => {
    res.json({ message: "Welcome to the Plants endpoint!" });
});

// 7. Handle /Plants/* Routes
app.get("/Plants/*", (req, res) => {
    const subPath = req.params[0];
    res.json({ message: `You accessed /Plants/${subPath}` });
});

// 5. Catch-all to serve the frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
