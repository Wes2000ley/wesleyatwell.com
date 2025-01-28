// populateMongoDB.js



const axios = require('axios');
const mongoose = require('mongoose');
const Pokemon = require('./models/Pokemon'); // Ensure this path is correct
const fs = require('fs');

// --------------------
// MongoDB Connection
// --------------------
// populateMongoDB.js

const cron = require('node-cron');

// Existing imports and code...

// Schedule the script to run every Sunday at midnight
cron.schedule('0 0 * * SUN', () => {
    fetchAndPopulatePokemonData();
});

console.log('🗓️ Scheduled data population to run every Sunday at midnight.');

// Replace with your MongoDB connection string in the .env file
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonDB'; // Default to local MongoDB

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
});

// --------------------
// Logging Setup
// --------------------

// Create a write stream for error logging
const errorLogStream = fs.createWriteStream('error_log.txt', { flags: 'a' });

// Function to log errors to both console and file
function logError(message) {
    console.error(message);
    errorLogStream.write(`${new Date().toISOString()} - ${message}\n`);
}

// --------------------
// Utility Functions
// --------------------

// List of all possible types (for type effectiveness calculation)
const allTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'];

// Function to extract Pokémon ID from URL
function getPokemonId(url) {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
}

// Function to pause execution for a given number of milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch type effectiveness from PokeAPI
async function fetchTypeEffectiveness(typeName) {
    try {
        const typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
        const typeData = typeResponse.data;

        // Extract damage relations
        return {
            no_damage_from: typeData.damage_relations.no_damage_from.map(type => type.name),
            half_damage_from: typeData.damage_relations.half_damage_from.map(type => type.name),
            double_damage_from: typeData.damage_relations.double_damage_from.map(type => type.name)
        };
    } catch (error) {
        logError(`Error fetching type details for "${typeName}": ${error.message}`);
        return null; // Return null to indicate failure
    }
}

// Function to calculate combined type effectiveness
function calculateCombinedEffectiveness(pokemonTypes, typeDataMap) {
    const effectivenessMap = {};

    // Initialize all attacking types with multiplier 1
    allTypes.forEach(attackingType => {
        effectivenessMap[attackingType] = 1;
    });

    // For each Pokémon type, adjust the multiplier
    pokemonTypes.forEach(defendingType => {
        const typeData = typeDataMap[defendingType];
        if (!typeData) return;

        // Attacking types that do no damage
        typeData.no_damage_from.forEach(attackingType => {
            effectivenessMap[attackingType] *= 0;
        });

        // Attacking types that do half damage
        typeData.half_damage_from.forEach(attackingType => {
            effectivenessMap[attackingType] *= 0.5;
        });

        // Attacking types that do double damage
        typeData.double_damage_from.forEach(attackingType => {
            effectivenessMap[attackingType] *= 2;
        });
    });

    return effectivenessMap;
}

// Function to categorize attacking types based on multiplier
function categorizeEffectiveness(effectivenessMap) {
    const categorized = {
        no_damage: [],
        quarter_damage: [],
        half_damage: [],
        normal_damage: [],
        double_damage: [],
        quadruple_damage: []
    };

    for (const [attackingType, multiplier] of Object.entries(effectivenessMap)) {
        if (multiplier === 0) {
            categorized.no_damage.push(attackingType);
        } else if (multiplier === 0.25) {
            categorized.quarter_damage.push(attackingType);
        } else if (multiplier === 0.5) {
            categorized.half_damage.push(attackingType);
        } else if (multiplier === 1) {
            categorized.normal_damage.push(attackingType);
        } else if (multiplier === 2) {
            categorized.double_damage.push(attackingType);
        } else if (multiplier === 4) {
            categorized.quadruple_damage.push(attackingType);
        } else {
            // Handle unexpected multipliers (e.g., 0.125, 8, etc.)
            console.warn(`⚠️ Unexpected multiplier ${multiplier} for type "${attackingType}"`);
            categorized.normal_damage.push(attackingType); // Default to normal damage
        }
    }

    return categorized;
}

// Function to traverse the evolution chain and find immediate previous and next evolutions
function traverseEvolutionChain(chain, currentName, parent = 'None') {
    if (chain.species.name === currentName) {
        const nextEvolutions = chain.evolves_to.map(evolution => evolution.species.name);
        const next = nextEvolutions.length > 0 ? nextEvolutions.join(',') : 'None';
        return { previous: parent, upcoming: next };
    }

    for (const evolution of chain.evolves_to) {
        const result = traverseEvolutionChain(evolution, currentName, chain.species.name);
        if (result) {
            return result;
        }
    }

    return null;
}

// --------------------
// Main Data Population Function
// --------------------

async function fetchAndPopulatePokemonData() {
    try {
        console.log('🔄 Fetching the list of all Pokémon...');
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
        const data = response.data;

        // Sort data.results by Pokémon ID to ensure order
        data.results.sort((a, b) => getPokemonId(a.url) - getPokemonId(b.url));

        console.log(`📦 Processing ${data.results.length} Pokémon...`);

        for (const pokemon of data.results) {
            try {
                await sleep(100); // Pause for 100 milliseconds between requests to respect rate limits

                const pokemonResponse = await axios.get(pokemon.url);
                const pokemonData = pokemonResponse.data;

                const pokemonTypes = pokemonData.types.map(type => type.type.name);
                const height = `${pokemonData.height / 10} m`;
                const weight = `${pokemonData.weight / 10} kg`;
                const abilities = pokemonData.abilities.map(ability => ability.ability.name);
                const spriteLink = pokemonData.sprites.front_default || 'N/A';
                const officialArtLink = (pokemonData.sprites.other['official-artwork'] && pokemonData.sprites.other['official-artwork'].front_default) || 'N/A';

                const totalBaseStats = pokemonData.stats.reduce((total, stat) => total + stat.base_stat, 0);
                const hp = (pokemonData.stats.find(stat => stat.stat.name === 'hp') || {}).base_stat || 0;
                const attack = (pokemonData.stats.find(stat => stat.stat.name === 'attack') || {}).base_stat || 0;
                const defense = (pokemonData.stats.find(stat => stat.stat.name === 'defense') || {}).base_stat || 0;
                const specialAttack = (pokemonData.stats.find(stat => stat.stat.name === 'special-attack') || {}).base_stat || 0;
                const specialDefense = (pokemonData.stats.find(stat => stat.stat.name === 'special-defense') || {}).base_stat || 0;
                const speed = (pokemonData.stats.find(stat => stat.stat.name === 'speed') || {}).base_stat || 0;

                // Fetch species data
                let habitat = 'Unknown';
                let color = 'Black';
                let isLegendary = false;
                let isMythical = false;
                let evolutionChainUrl = '';

                try {
                    const speciesResponse = await axios.get(pokemonData.species.url);
                    const speciesData = speciesResponse.data;

                    if (speciesData.habitat) {
                        habitat = speciesData.habitat.name;
                    }

                    color = speciesData.color.name;
                    isLegendary = speciesData.is_legendary;
                    isMythical = speciesData.is_mythical;

                    if (speciesData.evolution_chain) {
                        evolutionChainUrl = speciesData.evolution_chain.url;
                    }
                } catch (error) {
                    logError(`❗ Error fetching species details for "${pokemonData.name}": ${error.message}`);
                }

                // Fetch all type effectiveness data
                const typeDataPromises = pokemonTypes.map(type => fetchTypeEffectiveness(type));
                const typeDataArray = await Promise.all(typeDataPromises);

                // Create a map for type data
                const typeDataMap = {};
                pokemonTypes.forEach((type, index) => {
                    typeDataMap[type] = typeDataArray[index];
                });

                // Calculate combined effectiveness
                const effectivenessMap = calculateCombinedEffectiveness(pokemonTypes, typeDataMap);
                const categorizedEffectiveness = categorizeEffectiveness(effectivenessMap);

                // Initialize evolutions
                let previousEvolution = 'None';
                let upcomingEvolution = 'None';

                // Fetch and parse evolution chain
                if (evolutionChainUrl) {
                    try {
                        const evolutionResponse = await axios.get(evolutionChainUrl);
                        const chainData = evolutionResponse.data.chain;

                        const evolutions = traverseEvolutionChain(chainData, pokemonData.name);

                        if (evolutions) {
                            previousEvolution = evolutions.previous || 'None';
                            upcomingEvolution = evolutions.upcoming || 'None';
                        } else {
                            console.warn(`⚠️ Pokémon "${pokemonData.name}" not found in its own evolution chain.`);
                        }
                    } catch (error) {
                        logError(`❗ Error fetching evolution chain for "${pokemonData.name}": ${error.message}`);
                    }
                }

                // Create or update Pokémon document
                const pokemonDocument = {
                    name: pokemonData.name,
                    types: pokemonTypes,
                    height,
                    weight,
                    abilities,
                    spriteLink,
                    officialArtLink,
                    totalBaseStats,
                    habitat,
                    color,
                    isLegendary,
                    isMythical,
                    stats: {
                        hp,
                        attack,
                        defense,
                        specialAttack,
                        specialDefense,
                        speed
                    },
                    typeEffectiveness: categorizedEffectiveness, // Assign categorized data
                    previousEvolution,
                    upcomingEvolution
                };

                await Pokemon.findOneAndUpdate(
                    { name: pokemonData.name },      // Query by name
                    pokemonDocument,                 // Update data
                    { upsert: true, new: true }      // Options: create if not exists, return new doc
                );

                console.log(`✅ Inserted/Updated: "${pokemonData.name}"`);
            } catch (pokemonError) {
                logError(`❗ Error processing "${pokemon.name}": ${pokemonError.message}`);
            }
        }

        console.log('🎉 All Pokémon data has been successfully inserted into MongoDB.');
        mongoose.connection.close(); // Close the connection after all operations
    }
catch(pokemonError){}}
// --------------------
// Start the Data Population Process
// --------------------

// Call the main function to start the process
fetchAndPopulatePokemonData();
