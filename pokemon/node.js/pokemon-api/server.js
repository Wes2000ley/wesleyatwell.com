// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonDB';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Define Pokémon Schema and Model
const pokemonSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    types: [String],
    height: String,
    weight: String,
    abilities: [String],
    sprite: String,
    art: String,
    totalBaseStats: Number,
    habitat: String,
    color: String,
    legendary: Boolean,
    mythical: Boolean,
    stats: {
        hp: Number,
        attack: Number,
        defense: Number,
        specialAttack: Number,
        specialDefense: Number,
        speed: Number
    },
    typeEffectiveness: {
        no_damage: [String],
        quarter_damage: [String],
        half_damage: [String],
        normal_damage: [String],
        double_damage: [String],
        quadruple_damage: [String]
    },
    previousEvolution: { type: String, default: 'None' },
    upcomingEvolution: { type: String, default: 'None' }
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

// Define Routes
const router = express.Router();

// GET /api/pokemons - Retrieve all Pokémon
router.get('/pokemons', async (req, res) => {
    try {
        const pokemons = await Pokemon.find({});
        res.json(pokemons);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/pokemons/:name - Retrieve a specific Pokémon by name
router.get('/pokemons/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const pokemon = await Pokemon.findOne({ name: name.toLowerCase() });
        if (!pokemon) {
            return res.status(404).json({ message: 'Pokémon not found' });
        }
        res.json(pokemon);
    } catch (error) {
        console.error(`Error fetching Pokémon "${name}":`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Mount the router at /api
app.use('/api', router);

// Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
