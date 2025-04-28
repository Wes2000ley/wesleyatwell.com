import { factions } from './factions.js';
import { updatePoints } from './points.js';

export function createInfoIcon(infoText) {
  const icon = document.createElement('span');
  icon.className = 'info-icon';
  icon.innerHTML = 'ℹ️';

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.innerText = infoText;

  icon.appendChild(tooltip);

  icon.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('active');
  });

  return icon;
}

export function populateFactionSelect() {
  const factionSelect = document.getElementById('factionSelect');
  factionSelect.innerHTML = `<option value="">-- Select Faction --</option>`;
  for (const factionName in factions) {
    const option = document.createElement('option');
    option.value = factionName;
    option.text = factionName;
    factionSelect.appendChild(option);
  }
}

export function loadFaction(factionName) {
  if (!factionName) return;

  const faction = factions[factionName];
  const factionNameDiv = document.getElementById('factionName');
  factionNameDiv.innerHTML = factionName;
  factionNameDiv.appendChild(createInfoIcon(faction.lore));

  const unitDiv = document.getElementById('unitPicker');
  unitDiv.innerHTML = '';

  faction.units.forEach(unit => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.value = 0;
    input.dataset.cost = unit.cost;
    input.dataset.name = unit.name; // ✅ safe unit name
    input.className = 'unitInput';

    input.addEventListener('input', () => {
      updatePoints();
    });

    label.appendChild(input);
    label.append(` ${unit.name} (Cost: ${unit.cost} pts)`);
    label.appendChild(createInfoIcon(unit.info));
    unitDiv.appendChild(label);
    unitDiv.appendChild(document.createElement('br'));
  });

  const leaderSelect = document.getElementById('leaderSelect');
  leaderSelect.innerHTML = '';
  faction.leaders.forEach(leader => {
    const option = document.createElement('option');
    option.value = leader.name;
    option.text = leader.name;
    leaderSelect.appendChild(option);
  });

  const artifactSelect = document.getElementById('artifactSelect');
  artifactSelect.innerHTML = '';
  faction.leaders.forEach(leader => {
    const option = document.createElement('option');
    option.value = leader.artifact.name;
    option.text = leader.artifact.name;
    artifactSelect.appendChild(option);
  });

  document.getElementById('armyBuilder').style.display = 'block';

  updateLeaderInfo();
  updateArtifactInfo();
  updatePoints();
}

export function updateLeaderInfo() {
  const factionName = document.getElementById('factionSelect').value;
  const leaderName = document.getElementById('leaderSelect').value;
  const leader = factions[factionName]?.leaders.find(l => l.name === leaderName);
  document.getElementById('leaderInfo').innerText = leader?.info || '';
}

export function updateArtifactInfo() {
  const factionName = document.getElementById('factionSelect').value;
  const artifactName = document.getElementById('artifactSelect').value;
  const artifact = factions[factionName]?.leaders.find(l => l.artifact.name === artifactName)?.artifact;
  document.getElementById('artifactInfo').innerText = artifact?.info || '';
}
