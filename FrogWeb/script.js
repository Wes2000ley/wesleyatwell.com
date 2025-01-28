document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.inaturalist.org/v1/observations';
    const query = 'frog';
    const perPage = 10000;

    const url = `${apiUrl}?taxon_name=${query}&per_page=${perPage}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const speciesList = document.getElementById('speciesList');
            speciesList.innerHTML = ''; // Clear any previous content

            if (!data.results || data.results.length === 0) {
                speciesList.innerHTML = '<p>No frog species found.</p>';
                return;
            }

            const seenSpecies = new Set(); // To track seen species IDs

            data.results.forEach(observation => {
                const species = observation.taxon;

                // Ensure we only include species that are frogs and not already seen
                if (species && species.preferred_common_name && species.preferred_common_name.toLowerCase().includes('frog') && !seenSpecies.has(species.id)) {
                    seenSpecies.add(species.id); // Add species ID to Set

                    const speciesCard = createSpeciesCard(observation);
                    speciesList.appendChild(speciesCard);

                    // Create modal for each species
                    const modal = createModal(species);
                    document.getElementById('modals-container').appendChild(modal);
                }
            });

            // Add event listeners for modal buttons
            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const modalId = this.getAttribute('data-target');
                    const modal = document.getElementById(modalId);
                    modal.style.display = 'block';
                });
            });

            // Add event listeners for close buttons
            document.querySelectorAll('.close-btn').forEach(span => {
                span.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    modal.style.display = 'none';
                });
            });

            // Close modals when clicking outside of them
            window.onclick = function(event) {
                if (event.target.classList.contains('modal')) {
                    event.target.style.display = 'none';
                }
            };
        })
        .catch(error => console.error('Error fetching data:', error));

        function createSpeciesCard(observation) {
            const species = observation.taxon;
            const commonName = species.preferred_common_name || 'No common name';
            const scientificName = species.name || 'No scientific name';
        
            const imageUrl = species.default_photo && species.default_photo.medium_url ?
            species.default_photo.medium_url : 'placeholder.png';
            
            const speciesCard = document.createElement('div');
            speciesCard.classList.add('species-card');
        
            speciesCard.innerHTML = `
                <img src="${imageUrl}" alt="${commonName}">
                <div class="species-details">
                    <h3>${commonName}</h3>
                    <p><strong>Scientific Name:</strong> ${scientificName}</p>
                    <p><strong>Taxonomy:</strong> ${getTaxonomy(species)}</p>
                    <a class="btn" href="#" data-target="${species.id}Modal">Learn More</a>
                </div>
            `;
            speciesCard.querySelector('.btn').addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = `${species.id}Modal`;
                const modal = document.getElementById(modalId);
                modal.style.display = 'block';
            });
        
            return speciesCard;
        }

    function createModal(species) {
        const commonName = species.preferred_common_name || 'No common name';
        const scientificName = species.name || 'No scientific name';
        const imageUrl = species.default_photo && species.default_photo.medium_url ?
            species.default_photo.medium_url : 'placeholder.png';

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.setAttribute('id', `${species.id}Modal`);

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>${commonName}</h2>
                <img src="${imageUrl}" alt="${commonName}" style="max-width: 100%; height: auto;">
                <p><strong>Scientific Name:</strong> ${scientificName}</p>
                <p><strong>Taxonomy:</strong> ${getTaxonomy(species)}</p>
                <a href="https://www.google.com/search?q=${encodeURIComponent(commonName)}" target="_blank">Google Search</a>
            </div>
        `;

        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });

        return modal;
    }

    function getTaxonomy(species) {
        if (species.rank && species.ancestors) {
            return `${species.rank} in ${species.ancestors.map(a => a.name).join(' > ')}`;
        } else {
            return 'Taxonomy information not available';
        }
    }

    // Populate frog facts
    const frogFacts = [
        "Frogs are amphibians.",
        "There are over 5,000 species of frogs worldwide.",
        "The study of frogs is called herpetology.",
        "A group of frogs is called an army.",
        "Frogs don’t need to drink water as they absorb it through their skin.",
        // Add more facts as needed
    ];

    const frogFactsList = document.getElementById('frogFacts');
    frogFacts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        frogFactsList.appendChild(li);
    });
});
