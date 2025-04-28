import { factions } from './factions.js';

const advantages = {
  "Infantry": "Cavalry",
  "Cavalry": "Ranged",
  "Ranged": "Infantry",
  "Magic": "Monster",
  "Monster": "Infantry"
};

function pickBestTarget(attacker, enemyArmy) {
  let bestTargets = [];
  let backupTargets = [];

  for (const unit of enemyArmy) {
    if (unit.count <= 0) continue;

    if (advantages[attacker.type] === unit.type) {
      bestTargets.push(unit);
    } else {
      backupTargets.push(unit);
    }
  }

  if (bestTargets.length > 0) {
    bestTargets.sort((a, b) => (a.count * a.hp) - (b.count * b.hp));
    return bestTargets[0];
  } else if (backupTargets.length > 0) {
    backupTargets.sort((a, b) => (a.count * a.hp) - (b.count * b.hp));
    return backupTargets[0];
  }

  return null;
}

function flattenArmy(factionName, armyData, side) {
  const units = [];

  for (const unitName in armyData.units) {
    const unitData = armyData.units[unitName];
    units.push({
      side: side,
      faction: factionName,
      name: unitData.name,
      attack: unitData.attack,
      defense: unitData.defense,
      speed: unitData.speed,
      hp: unitData.hp,
      type: unitData.type,
      count: unitData.count
    });
  }

  return units;
}

export function startBattle(playerArmyData, enemyArmyData) {
  const playerUnits = flattenArmy(playerArmyData.faction, playerArmyData, "Player");
  const enemyUnits = flattenArmy(enemyArmyData.faction, enemyArmyData, "Enemy");

  const allUnits = [...playerUnits, ...enemyUnits];
  allUnits.sort((a, b) => b.speed - a.speed);

  const battleLog = [];
  let roundNumber = 1;

  battleLog.push(`⚔️ Round ${roundNumber} Begins!`);

  while (playerUnits.some(u => u.count > 0) && enemyUnits.some(u => u.count > 0)) {
    for (const unit of allUnits) {
      if (unit.count <= 0) continue;

      const attackers = unit;
      const defenders = unit.side === "Player" ? enemyUnits : playerUnits;

      const target = pickBestTarget(attackers, defenders);
      if (!target) continue;

      // 🎯 Base Damage: attacker vs defender
      let baseDamage = attackers.attack - target.defense;
      baseDamage = Math.max(1, baseDamage);

      // 🎯 Critical Hit Chance (10%)
      const critRoll = Math.random();
      if (critRoll < 0.10) {
        const critMultiplier = Math.random() < 0.5 ? 2 : 3;
        baseDamage *= critMultiplier;
        battleLog.push(`💥 CRITICAL HIT! ${attackers.side} ${attackers.name} hits for x${critMultiplier} damage!`);
      }

      // 🎯 NEW: Type Advantage Bonus +20% if attacker counters defender
      if (advantages[attackers.type] === target.type) {
        baseDamage = Math.floor(baseDamage * 1.2);
        battleLog.push(`🔺 Type Advantage! ${attackers.type} counters ${target.type} (damage boosted!)`);
      }

      // 🎯 Group Damage Calculation
      const groupDamage = baseDamage * attackers.count;
      let totalGroupHP = target.count * target.hp;
      totalGroupHP -= groupDamage;

      if (totalGroupHP <= 0) {
        battleLog.push(`${attackers.side} ${attackers.name} wiped out ${target.side} ${target.name}!`);
        target.count = 0;
      } else {
        const newCount = Math.ceil(totalGroupHP / target.hp);
        const unitsKilled = target.count - newCount;
        target.count = newCount;
        battleLog.push(`${attackers.side} ${attackers.name} attacked ${target.side} ${target.name} dealing ${groupDamage} total damage, killing ${unitsKilled} unit(s)!`);
      }

      if (!playerUnits.some(u => u.count > 0)) {
        battleLog.push("⚔️ Enemy wins!");
        return battleLog;
      }

      if (!enemyUnits.some(u => u.count > 0)) {
        battleLog.push("🏆 Player wins!");
        return battleLog;
      }
    }

    roundNumber++;
    battleLog.push(`⚔️ Round ${roundNumber} Begins!`);
  }

  return battleLog;
}
