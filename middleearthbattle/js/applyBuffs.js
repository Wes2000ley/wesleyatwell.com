import { factions } from './factions.js';

export function applyBuffs(army) {
  const faction = factions[army.faction];
  if (!faction) return;

  const leader = faction.leaders.find(l => l.name === army.leader);
  if (!leader) return;

  // Apply all leader buffs
  if (leader.buffs) {
    leader.buffs.forEach(buff => {
      applyBuffRule(army, buff);
    });
  }

  // Apply all artifact buffs
  if (leader.artifact?.buffs) {
    leader.artifact.buffs.forEach(buff => {
      applyBuffRule(army, buff);
    });
  }
}

function applyBuffRule(army, buff) {
  for (const unitName in army.units) {
    const unit = army.units[unitName];

    const match = unit.name.includes(buff.target) || unit.type === buff.target || buff.target === "All";
    if (match) {
      if (buff.multiplier) {
        unit[buff.stat] = Math.floor(unit[buff.stat] * buff.multiplier);
      }
      if (buff.flatBonus) {
        unit[buff.stat] += buff.flatBonus;
      }
    }
  }
}
