import { factions } from './factions.js';

export function generateEnemyArmy(playerFaction, playerPoints) {
  let factionNames = Object.keys(factions).filter(name => name !== playerFaction);
  let randomFaction = factionNames[Math.floor(Math.random() * factionNames.length)];
  let enemyFaction = factions[randomFaction];

  let enemyUnits = {};
  let totalEnemyPoints = 0;
  const maxPoints = playerPoints;
  const unitOptions = [...enemyFaction.units];

  while (totalEnemyPoints < maxPoints * 0.95) {
    let unit = unitOptions[Math.floor(Math.random() * unitOptions.length)];
    let count = Math.floor(Math.random() * 3) + 1; // 1-3 units
    let addedPoints = count * unit.cost;
    if (totalEnemyPoints + addedPoints <= maxPoints * 1.05) {
      if (!enemyUnits[unit.name]) {
        enemyUnits[unit.name] = {
          ...unit, // ✅ FULL COPY of unit data
          count: 0
        };
      }
      enemyUnits[unit.name].count += count;
      totalEnemyPoints += addedPoints;
    }
  }

  let randomLeader = enemyFaction.leaders[Math.floor(Math.random() * enemyFaction.leaders.length)];
  const enemyLeader = randomLeader.name;
  const enemyArtifact = randomLeader.artifact.name;

  return {
    faction: randomFaction,
    units: enemyUnits,
    leader: enemyLeader,
    artifact: enemyArtifact,
    points: totalEnemyPoints
  };
}

export function displayEnemyArmy(enemyArmy) {
  document.getElementById('enemyFactionName').innerText = `Faction: ${enemyArmy.faction}`;

  const unitListDiv = document.getElementById('enemyUnitList');
  unitListDiv.innerHTML = '';
  for (const unitName in enemyArmy.units) {
    const unit = enemyArmy.units[unitName];
    const unitText = document.createElement('div');
    unitText.innerText = `${unitName} x${unit.count}`;
    unitListDiv.appendChild(unitText);
  }

  document.getElementById('enemyLeader').innerText = `Leader: ${enemyArmy.leader}`;
  document.getElementById('enemyArtifact').innerText = `Artifact: ${enemyArmy.artifact}`;
  document.getElementById('enemyPoints').innerText = `Total Points: ${enemyArmy.points.toFixed(0)}`;
  document.getElementById('enemyArmy').style.display = 'block';
}
