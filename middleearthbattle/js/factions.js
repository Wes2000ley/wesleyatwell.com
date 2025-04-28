export const factions = {
  "Gondor": {
    lore: "The last great realm of Men, defenders of the West against the darkness.",
    units: [
      { name: "Soldiers", cost: 5, attack: 6, defense: 7, speed: 5, hp: 10, type: "Infantry", info: "Disciplined infantry. Strong vs Cavalry." },
      { name: "Archers", cost: 6, attack: 7, defense: 4, speed: 6, hp: 9, type: "Ranged", info: "Expert marksmen. Effective at range." },
      { name: "Knights", cost: 8, attack: 8, defense: 6, speed: 8, hp: 12, type: "Cavalry", info: "Heavy cavalry. Devastating charges." },
      { name: "Catapults", cost: 10, attack: 10, defense: 3, speed: 2, hp: 15, type: "Siege", info: "Siege engines. Devastate structures and formations." },
      { name: "Rangers", cost: 7, attack: 7, defense: 5, speed: 7, hp: 10, type: "Ranged", info: "Stealth scouts. Bonus in forests." }
    ],
    leaders: [
      {
        name: "Aragorn",
        info: "Heir of Isildur. +20% attack for all Soldiers.",
        buffs: [{ target: "Soldier", stat: "attack", multiplier: 1.2 }],
        artifact: {
          name: "Andúril",
          info: "Flame of the West. +2 attack for Infantry units.",
          buffs: [{ target: "Infantry", stat: "attack", flatBonus: 2 }]
        }
      },
      {
        name: "Boromir",
        info: "Captain of the White Tower. +15% defense for Infantry.",
        buffs: [{ target: "Infantry", stat: "defense", multiplier: 1.15 }],
        artifact: {
          name: "Horn of Gondor",
          info: "One-time rally to restore morale. (+10% HP)",
          buffs: [{ target: "All", stat: "hp", multiplier: 1.1 }]
        }
      }
    ]
  },

  "Rohan": {
    lore: "The horse-lords of the Riddermark, masters of cavalry charges.",
    units: [
      { name: "Riders", cost: 8, attack: 8, defense: 5, speed: 9, hp: 11, type: "Cavalry", info: "Elite cavalry. Bonus speed and charge power." },
      { name: "Spearmen", cost: 6, attack: 6, defense: 7, speed: 5, hp: 10, type: "Infantry", info: "Anti-cavalry infantry. Strong vs mounted units." },
      { name: "Archers", cost: 6, attack: 7, defense: 4, speed: 6, hp: 9, type: "Ranged", info: "Mounted archers. Mobile harassers." },
      { name: "Royal Guards", cost: 9, attack: 9, defense: 8, speed: 7, hp: 12, type: "Cavalry", info: "Théoden's elite bodyguard. High morale and defense." },
      { name: "Outriders", cost: 7, attack: 7, defense: 5, speed: 8, hp: 10, type: "Cavalry", info: "Fast scouts. Bonus movement." }
    ],
    leaders: [
      {
        name: "Théoden",
        info: "King of Rohan. +20% attack for Cavalry.",
        buffs: [{ target: "Cavalry", stat: "attack", multiplier: 1.2 }],
        artifact: {
          name: "Herugrim",
          info: "Royal sword. +2 charge bonus for Riders.",
          buffs: [{ target: "Rider", stat: "attack", flatBonus: 2 }]
        }
      },
      {
        name: "Éomer",
        info: "Marshal of the Mark. Buffs Cavalry attack speed.",
        buffs: [{ target: "Cavalry", stat: "speed", multiplier: 1.2 }],
        artifact: {
          name: "Guthwine",
          info: "Éomer's blade. +15% melee attack to Riders.",
          buffs: [{ target: "Rider", stat: "attack", multiplier: 1.15 }]
        }
      }
    ]
  },

  "Mordor": {
    lore: "The land of shadow, seat of Sauron's dominion.",
    units: [
      { name: "Orc Warriors", cost: 4, attack: 5, defense: 4, speed: 4, hp: 9, type: "Infantry", info: "Weak individually but deadly in swarms." },
      { name: "Trolls", cost: 12, attack: 10, defense: 8, speed: 3, hp: 18, type: "Monster", info: "Huge monsters. Smash infantry lines." },
      { name: "Warg Riders", cost: 7, attack: 7, defense: 5, speed: 8, hp: 10, type: "Cavalry", info: "Fast brutal cavalry." },
      { name: "Haradrim Archers", cost: 6, attack: 7, defense: 3, speed: 6, hp: 8, type: "Ranged", info: "Poison arrows. Extra damage over time." },
      { name: "Siege Towers", cost: 10, attack: 9, defense: 5, speed: 2, hp: 15, type: "Siege", info: "Scale enemy walls. Deliver Orcs to fortresses." }
    ],
    leaders: [
      {
        name: "Sauron",
        info: "Dark Lord. +30% strength for Orcs and Trolls.",
        buffs: [
          { target: "Orc", stat: "attack", multiplier: 1.3 },
          { target: "Troll", stat: "attack", multiplier: 1.3 }
        ],
        artifact: {
          name: "The One Ring",
          info: "Doubles Sauron's army attack but risks corruption.",
          buffs: [{ target: "All", stat: "attack", multiplier: 2 }]
        }
      },
      {
        name: "Gothmog",
        info: "Orc general. +20% attack for Orc Warriors.",
        buffs: [{ target: "Orc Warrior", stat: "attack", multiplier: 1.2 }],
        artifact: {
          name: "Warg Banner",
          info: "Boosts Warg Rider speed by 20%.",
          buffs: [{ target: "Warg Rider", stat: "speed", multiplier: 1.2 }]
        }
      }
    ]
  },
  "Isengard": {
    lore: "The tower of Orthanc, raising the brutal armies of Uruk-hai.",
    units: [
      { name: "Uruk-hai Warriors", cost: 6, attack: 7, defense: 8, speed: 5, hp: 11, type: "Infantry", info: "Strong infantry. Heavy armor." },
      { name: "Berserkers", cost: 9, attack: 9, defense: 5, speed: 7, hp: 10, type: "Infantry", info: "Insane melee damage but fragile." },
      { name: "Ballistae", cost: 10, attack: 10, defense: 2, speed: 2, hp: 14, type: "Siege", info: "Siege weapon. Long-range devastation." },
      { name: "Warg Riders", cost: 7, attack: 7, defense: 5, speed: 8, hp: 10, type: "Cavalry", info: "Swift melee cavalry." },
      { name: "Crossbowmen", cost: 6, attack: 7, defense: 5, speed: 5, hp: 9, type: "Ranged", info: "Ranged Uruk-hai. Armored and deadly." }
    ],
    leaders: [
      {
        name: "Saruman",
        info: "Corrupt wizard. Weakens enemy morale by 20%.",
        buffs: [{ target: "Enemy", stat: "defense", multiplier: 0.8 }],
        artifact: {
          name: "Staff of Power",
          info: "Area magic attack, damaging grouped units. (+2 attack)",
          buffs: [{ target: "All", stat: "attack", flatBonus: 2 }]
        }
      },
      {
        name: "Lurtz",
        info: "First Uruk-hai captain. +20% ranged accuracy for Crossbowmen.",
        buffs: [{ target: "Crossbowman", stat: "attack", multiplier: 1.2 }],
        artifact: {
          name: "Uruk-hai Standard",
          info: "Morale buff for Uruk-hai units. (+15% HP)",
          buffs: [{ target: "Uruk-hai", stat: "hp", multiplier: 1.15 }]
        }
      }
    ]
  },

  "Lothlorien": {
    lore: "Golden wood of the Elves, shining amidst the darkened world.",
    units: [
      { name: "Elven Warriors", cost: 7, attack: 7, defense: 6, speed: 7, hp: 10, type: "Infantry", info: "Swift melee specialists." },
      { name: "Elven Archers", cost: 8, attack: 8, defense: 4, speed: 8, hp: 9, type: "Ranged", info: "Lethal precision at long range." },
      { name: "Light Cavalry", cost: 9, attack: 8, defense: 5, speed: 9, hp: 10, type: "Cavalry", info: "Fast strikes and retreats." },
      { name: "Marchwardens", cost: 7, attack: 7, defense: 5, speed: 7, hp: 10, type: "Infantry", info: "Stealth ambushers. Bonus in forests." },
      { name: "Sentinels", cost: 6, attack: 6, defense: 7, speed: 6, hp: 10, type: "Magic", info: "Magic-resistant elite." }
    ],
    leaders: [
      {
        name: "Galadriel",
        info: "Lady of Light. Shields allies, reducing incoming damage by 15%.",
        buffs: [{ target: "All", stat: "hp", multiplier: 1.15 }],
        artifact: {
          name: "Elessar Stone",
          info: "Healing aura. Gradual health restoration over time (+10% HP).",
          buffs: [{ target: "All", stat: "hp", multiplier: 1.1 }]
        }
      },
      {
        name: "Celeborn",
        info: "Lord of Lothlorien. Grants defense boosts in forests.",
        buffs: [{ target: "Sentinel", stat: "defense", multiplier: 1.2 }],
        artifact: {
          name: "White Ring",
          info: "+20% magic resistance for Sentinels.",
          buffs: [{ target: "Sentinel", stat: "defense", multiplier: 1.2 }]
        }
      }
    ]
  },

  "Rivendell": {
    lore: "The hidden haven of Elrond, refuge for Elves and Men alike.",
    units: [
      { name: "High Elf Spearmen", cost: 7, attack: 7, defense: 8, speed: 6, hp: 10, type: "Infantry", info: "Elite anti-cavalry unit." },
      { name: "High Elf Archers", cost: 8, attack: 8, defense: 5, speed: 7, hp: 9, type: "Ranged", info: "Devastating precision fire." },
      { name: "Swordmasters", cost: 9, attack: 9, defense: 7, speed: 8, hp: 10, type: "Infantry", info: "Bladework masters. Deadly in melee." },
      { name: "Mounted Elves", cost: 9, attack: 8, defense: 6, speed: 9, hp: 10, type: "Cavalry", info: "Noble cavalry. Swift and deadly." },
      { name: "Spellcasters", cost: 10, attack: 7, defense: 4, speed: 6, hp: 8, type: "Magic", info: "Elven mages. Support magic." }
    ],
    leaders: [
      {
        name: "Elrond",
        info: "Master of Rivendell. Grants minor healing after battles.",
        buffs: [{ target: "All", stat: "hp", multiplier: 1.1 }],
        artifact: {
          name: "Vilya",
          info: "Ring of Air. Protects against ranged attacks (+15% defense).",
          buffs: [{ target: "All", stat: "defense", multiplier: 1.15 }]
        }
      },
      {
        name: "Glorfindel",
        info: "Hero of old. +25% damage to Swordmasters.",
        buffs: [{ target: "Swordmaster", stat: "attack", multiplier: 1.25 }],
        artifact: {
          name: "Blade of Light",
          info: "Blinds enemies, reducing defense.",
          buffs: [{ target: "All", stat: "attack", flatBonus: 2 }]
        }
      }
    ]
  },

  "Erebor": {
    lore: "The Lonely Mountain, home of Dwarves and great wealth.",
    units: [
      { name: "Dwarven Warriors", cost: 6, attack: 7, defense: 8, speed: 4, hp: 12, type: "Infantry", info: "Tough infantry. Resistant to archery." },
      { name: "Iron Guards", cost: 7, attack: 6, defense: 9, speed: 4, hp: 13, type: "Infantry", info: "Elite bodyguards. Strong defense." },
      { name: "Crossbow Dwarves", cost: 6, attack: 7, defense: 7, speed: 5, hp: 11, type: "Ranged", info: "Armored ranged units." },
      { name: "Battle Rams", cost: 9, attack: 10, defense: 7, speed: 3, hp: 15, type: "Siege", info: "Break fortifications easily." },
      { name: "War Machines", cost: 10, attack: 11, defense: 6, speed: 2, hp: 16, type: "Siege", info: "Dwarven siege engines." }
    ],
    leaders: [
      {
        name: "Thorin Oakenshield",
        info: "Leader of the Company. +15% morale for all Dwarves.",
        buffs: [{ target: "All", stat: "hp", multiplier: 1.15 }],
        artifact: {
          name: "Orcrist",
          info: "Orc-bane sword. Extra damage to Orcs.",
          buffs: [{ target: "Orc", stat: "attack", flatBonus: 2 }]
        }
      },
      {
        name: "Dáin Ironfoot",
        info: "Lord of the Iron Hills. +20% defense for Dwarven Warriors.",
        buffs: [{ target: "Dwarven Warrior", stat: "defense", multiplier: 1.2 }],
        artifact: {
          name: "Red Axe",
          info: "Boosts melee counterattack power.",
          buffs: [{ target: "All", stat: "attack", multiplier: 1.2 }]
        }
      }
    ]
  },

  "Mirkwood": {
    lore: "The once-green forest, now dark and perilous.",
    units: [
      { name: "Woodland Archers", cost: 7, attack: 8, defense: 5, speed: 8, hp: 9, type: "Ranged", info: "Fast and accurate in forests." },
      { name: "Spear Elves", cost: 6, attack: 7, defense: 6, speed: 7, hp: 10, type: "Infantry", info: "Forest defenders. Quick strike units." },
      { name: "Bladesingers", cost: 8, attack: 9, defense: 5, speed: 9, hp: 10, type: "Infantry", info: "Dancing duelists. High critical hit chance." },
      { name: "Forest Riders", cost: 8, attack: 8, defense: 6, speed: 9, hp: 10, type: "Cavalry", info: "Mobile archery cavalry." },
      { name: "Shadow Scouts", cost: 7, attack: 7, defense: 6, speed: 8, hp: 9, type: "Ranged", info: "Camouflaged ambushers." }
    ],
    leaders: [
      {
        name: "Thranduil",
        info: "King of Mirkwood. +20% attack in forest terrain.",
        buffs: [{ target: "All", stat: "attack", multiplier: 1.2 }],
        artifact: {
          name: "Forest Crown",
          info: "Leadership aura buffs movement speed.",
          buffs: [{ target: "All", stat: "speed", multiplier: 1.1 }]
        }
      },
      {
        name: "Legolas",
        info: "Prince of Mirkwood. +30% accuracy for Archers.",
        buffs: [{ target: "Ranged", stat: "attack", multiplier: 1.3 }],
        artifact: {
          name: "Twin Blades",
          info: "Rapid melee strikes when enemies close in.",
          buffs: [{ target: "All", stat: "attack", flatBonus: 2 }]
        }
      }
    ]
  },

  "Harad": {
    lore: "The desert lands of the South, sworn to Sauron's cause.",
    units: [
      { name: "Haradrim Spearmen", cost: 6, attack: 6, defense: 6, speed: 5, hp: 10, type: "Infantry", info: "Flexible light infantry." },
      { name: "Haradrim Archers", cost: 7, attack: 7, defense: 4, speed: 6, hp: 9, type: "Ranged", info: "Poisoned arrows. Weakens enemy armor." },
      { name: "Mumakil", cost: 12, attack: 11, defense: 8, speed: 4, hp: 20, type: "Monster", info: "Massive war beasts. Trample enemy lines." },
      { name: "Serpent Guard", cost: 8, attack: 8, defense: 6, speed: 6, hp: 10, type: "Infantry", info: "Elite close-range fighters." },
      { name: "Southron Cavalry", cost: 7, attack: 7, defense: 5, speed: 8, hp: 10, type: "Cavalry", info: "Desert raiders. Fast strikes." }
    ],
    leaders: [
      {
        name: "Suladân",
        info: "The Serpent Lord. Inspires Haradrim to fight harder.",
        buffs: [{ target: "All", stat: "attack", multiplier: 1.15 }],
        artifact: {
          name: "Serpent Banner",
          info: "Boosts attack when outnumbered.",
          buffs: [{ target: "All", stat: "attack", multiplier: 1.2 }]
        }
      },
      {
        name: "Golden King of Abrakhân",
        info: "Warlord of riches. +25% gold loot after battles.",
        buffs: [],
        artifact: {
          name: "Gilded Armor",
          info: "Reflects a portion of damage taken. (+15% defense)",
          buffs: [{ target: "All", stat: "defense", multiplier: 1.15 }]
        }
      }
    ]
  },

  "Angmar": {
    lore: "The frozen realm of the Witch-king, bringer of fear.",
    units: [
      { name: "Angmar Orcs", cost: 5, attack: 6, defense: 5, speed: 5, hp: 10, type: "Infantry", info: "Savage hordes. Overwhelm in numbers." },
      { name: "Black Númenóreans", cost: 8, attack: 8, defense: 7, speed: 6, hp: 11, type: "Infantry", info: "Dark knights with fear aura." },
      { name: "Barrow-wights", cost: 7, attack: 6, defense: 6, speed: 5, hp: 10, type: "Magic", info: "Undead spirits. Drain enemy morale." },
      { name: "Shade Riders", cost: 9, attack: 8, defense: 6, speed: 8, hp: 10, type: "Cavalry", info: "Wraith cavalry. Hard to hit." },
      { name: "Fellbeasts", cost: 10, attack: 10, defense: 7, speed: 7, hp: 16, type: "Monster", info: "Flying terror creatures." }
    ],
    leaders: [
      {
        name: "Witch-king of Angmar",
        info: "Lord of the Nazgûl. Spreads terror on the battlefield.",
        buffs: [{ target: "All", stat: "attack", multiplier: 1.1 }],
        artifact: {
          name: "Crown of Sorcery",
          info: "Buffs allied magic and drains enemy willpower.",
          buffs: [{ target: "Magic", stat: "attack", multiplier: 1.2 }]
        }
      },
      {
        name: "Morgomir",
        info: "Lieutenant of Angmar. Strengthens Barrow-wights.",
        buffs: [{ target: "Barrow-wight", stat: "attack", flatBonus: 2 }],
        artifact: {
          name: "Shadow Blade",
          info: "Drains health with each strike.",
          buffs: [{ target: "All", stat: "attack", flatBonus: 2 }]
        }
      }
    ]
  }
};