document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.inaturalist.org/v1/observations';
    const query = 'frog';
    const perPage = 200; // API max
    const maxFrogsToShow = 100; // 🐸 <<< Set how many frogs you want
    const speciesList = document.getElementById('speciesList');
    const modalsContainer = document.getElementById('modals-container');
    const seenSpecies = new Map(); // To track by ID and keep full species
    let page = 1;
    let totalLoaded = 0;
    let keepFetching = true;

    async function fetchAllFrogs() {
        while (keepFetching) {
            const url = `${apiUrl}?taxon_name=${query}&per_page=${perPage}&page=${page}`;
            console.log('Fetching page', page);

            const response = await fetch(url);
            if (!response.ok) {
                console.error('Network error:', response.statusText);
                break;
            }
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                console.log('No more results.');
                break;
            }

            data.results.forEach(observation => {
                const species = observation.taxon;
                if (species && species.preferred_common_name && species.preferred_common_name.toLowerCase().includes('frog')) {
                    if (!seenSpecies.has(species.id)) {
                        seenSpecies.set(species.id, observation);
                        totalLoaded++;
                    }
                }
            });

            // If we already loaded way more than needed, we can stop early
            if (totalLoaded > maxFrogsToShow * 2 || data.results.length < perPage) {
                keepFetching = false;
            }

            page++;
        }

        console.log(`Total unique frogs fetched: ${seenSpecies.size}`);
        pickRandomFrogsAndDisplay();
    }

    function pickRandomFrogsAndDisplay() {
        const allFrogs = Array.from(seenSpecies.values());

        // Shuffle array
        for (let i = allFrogs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allFrogs[i], allFrogs[j]] = [allFrogs[j], allFrogs[i]];
        }

        // Pick the first maxFrogsToShow
        const selectedFrogs = allFrogs.slice(0, maxFrogsToShow);

        selectedFrogs.forEach(observation => {
            const species = observation.taxon;

            const speciesCard = createSpeciesCard(observation);
            speciesList.appendChild(speciesCard);

            const modal = createModal(species);
            modalsContainer.appendChild(modal);
        });

        setupModalListeners();
    }

    fetchAllFrogs().catch(error => console.error('Error fetching data:', error));

    function createSpeciesCard(observation) {
        const species = observation.taxon;
        const commonName = species.preferred_common_name || 'No common name';
        const scientificName = species.name || 'No scientific name';
        const imageUrl = species.default_photo && species.default_photo.medium_url ? species.default_photo.medium_url : 'placeholder.png';

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

        return speciesCard;
    }

    function createModal(species) {
        const commonName = species.preferred_common_name || 'No common name';
        const scientificName = species.name || 'No scientific name';
        const imageUrl = species.default_photo && species.default_photo.medium_url ? species.default_photo.medium_url : 'placeholder.png';

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

        return modal;
    }

    function getTaxonomy(species) {
        if (species.rank && species.ancestors) {
            return `${species.rank} in ${species.ancestors.map(a => a.name).join(' > ')}`;
        } else {
            return 'Taxonomy information not available';
        }
    }

    function setupModalListeners() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-target');
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'block';
            });
        });

        document.querySelectorAll('.close-btn').forEach(span => {
            span.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });

        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
    }

    // Frog facts section
    const frogFacts = [
        "Frogs are amphibians.",
        "There are over 5,000 species of frogs worldwide.",
        "The study of frogs is called herpetology.",
        "A group of frogs is called an army.",
        "Frogs absorb water through their skin.",
    ];
    const frogFactsList = document.getElementById('frogFacts');
    frogFacts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        frogFactsList.appendChild(li);
    });
});