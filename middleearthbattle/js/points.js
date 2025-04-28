let playerPoints = 0;

export function updatePoints() {
  let total = 0;
  const unitInputs = document.querySelectorAll('.unitInput');
  unitInputs.forEach(input => {
    total += (parseInt(input.value) || 0) * parseInt(input.dataset.cost);
  });

  const artifactSelect = document.getElementById('artifactSelect');
  if (artifactSelect && artifactSelect.value !== "None") {
    total += 5; // Artifact cost
  }

  const maxPoints = parseInt(document.getElementById('maxPoints').value) || 100;
  const pointsDisplay = document.getElementById('pointsDisplay');
  pointsDisplay.innerText = `Points Used: ${total} / ${maxPoints}`;
  pointsDisplay.style.color = total > maxPoints ? 'red' : '#f0e6d2';

  playerPoints = total;
}

// ✅ THIS PART WAS MISSING
export function getPlayerPoints() {
  return playerPoints;
}
