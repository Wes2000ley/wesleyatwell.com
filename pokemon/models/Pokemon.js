// models/Pokemon.js

const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    types: [String],
    height: String,
    weight: String,
    abilities: [String],
    spriteLink: String,
    officialArtLink: String,
    totalBaseStats: Number,
    habitat: String,
    color: String,
    isLegendary: Boolean,
    isMythical: Boolean,
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

module.exports = Pokemon;
