import { populateFactionSelect, loadFaction, updateLeaderInfo, updateArtifactInfo } from './builder.js';
import { updatePoints, getPlayerPoints } from './points.js';
import { generateEnemyArmy, displayEnemyArmy } from './enemyBuilder.js';
import { startBattle } from './battle.js';
import { factions } from './factions.js';
import { applyBuffs } from './applyBuffs.js'; // ✅ NEW!

let playerFaction = "";
let playerArmy = null;
let enemyArmy = null;

document.addEventListener('DOMContentLoaded', () => {
  populateFactionSelect();

  document.getElementById('factionSelect').addEventListener('change', (e) => {
    playerFaction = e.target.value;
    loadFaction(playerFaction);
  });

  document.getElementById('leaderSelect').addEventListener('change', () => {
    updateLeaderInfo();
    updatePoints();
  });

  document.getElementById('artifactSelect').addEventListener('change', () => {
    updateArtifactInfo();
    updatePoints();
  });

  document.getElementById('resetArmy').addEventListener('click', () => {
    location.reload();
  });

  document.getElementById('doneBuilding').addEventListener('click', () => {
    const points = getPlayerPoints();

    const unitInputs = document.querySelectorAll('.unitInput');
    const units = {};

    unitInputs.forEach(input => {
      const unitName = input.dataset.name; // ✅ safer with dataset
      const count = parseInt(input.value) || 0;
      if (count > 0) {
        const unitData = getUnitDataByName(playerFaction, unitName);
        units[unitName] = {
          ...unitData,
          count: count
        };
      }
    });

    // ✅ Correct check: Must pick at least 2 units
    if (Object.keys(units).length < 2) {
      alert("⚠️ You must select at least two different units to build your army!");
      return; // Stop here
    }

    const selectedLeaderName = document.getElementById('leaderSelect').value;
    const selectedArtifactName = document.getElementById('artifactSelect').value;

    playerArmy = {
      faction: playerFaction,
      units: units,
      leader: selectedLeaderName,
      artifact: selectedArtifactName,
      points: points
    };

    // ✅ Generate enemy army
    enemyArmy = generateEnemyArmy(playerFaction, points);
    displayEnemyArmy(enemyArmy);

    // ✅ Apply buffs to both armies BEFORE battle starts
    applyBuffs(playerArmy);
    applyBuffs(enemyArmy);

    document.getElementById('startBattle').disabled = false;
  });

  document.getElementById('startBattle').addEventListener('click', () => {
    const battleLog = startBattle(playerArmy, enemyArmy);
    displayBattleLog(battleLog);
  });
});

// Helper to get full unit data
function getUnitDataByName(factionName, unitName) {
  const faction = factions[factionName];
  if (!faction) return null;
  return faction.units.find(u => u.name === unitName);
}

// Display battle log
function displayBattleLog(logArray) {
  const logDiv = document.getElementById('battleLog');
  logDiv.innerHTML = ''; // Clear previous logs

  logArray.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    logDiv.appendChild(p);
  });

  document.getElementById('battleLogSection').style.display = 'block';
}
