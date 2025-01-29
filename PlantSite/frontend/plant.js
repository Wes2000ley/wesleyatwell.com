// plant.js

// Global variables to store plant data and current plant index
let plants = [];
let currentPlantIndex = 0;

// Debounce timer
let debounceTimer;

// Event listeners
document.getElementById("back-button").addEventListener("click", handleBackButton);
document.getElementById("prev-plant").addEventListener("click", () => navigatePlant(-1));
document.getElementById("next-plant").addEventListener("click", () => navigatePlant(1));
document.getElementById("search-input").addEventListener("input", handleSearchInput);

// Listen to popstate events to handle browser navigation (back/forward)
window.addEventListener('popstate', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const plantName = urlParams.get('name');
    const pageNumber = parseInt(urlParams.get('page'));
    if (plantName) {
        loadPlantDetails(plantName, false, pageNumber); // Load without pushing a new state
    } else {
        // If no plant name is specified, redirect to the main page
        window.location.href = 'index.html';
    }
});

// Initial load
document.addEventListener("DOMContentLoaded", init);

// Function to initialize the plant details page
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const plantName = urlParams.get('name');
    const pageNumber = parseInt(urlParams.get('page'));

    if (!plantName) {
        displayError("No plant specified.");
        showLoading(false);
        return;
    }

    await loadPlantDetails(plantName, true, pageNumber);
}

// Function to handle back button click
function handleBackButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = parseInt(urlParams.get('page'));
    if (!isNaN(pageNumber) && pageNumber >= 1) {
        window.location.href = `index.html?page=${pageNumber}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Function to handle search input with debouncing
function handleSearchInput(event) {
    const query = event.target.value.trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (query === "") {
            // If search is cleared, reload current plant details
            if (plants.length > 0) {
                loadPlantDetails(plants[currentPlantIndex].name, true);
            }
        } else {
            searchPlants(query);
        }
    }, 300); // 300ms debounce delay
}

// Function to navigate between plants
function navigatePlant(direction) {
    const newIndex = currentPlantIndex + direction;
    if (newIndex < 0 || newIndex >= plants.length) return;
    currentPlantIndex = newIndex;
    const plant = plants[currentPlantIndex];
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = parseInt(urlParams.get('page')) || 1;
    loadPlantDetails(plant.name, true, pageNumber); // Load and push state
}

// Function to search for plants
async function searchPlants(query) {
    hideError();

    try {
        const response = await fetch(`/api2/plants/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const searchResults = await response.json();

        if (searchResults.length === 0) {
            displayError("No plants found matching your search.");
            showLoading(false);
            return;
        }

        // If there's exactly one result, navigate to it
        if (searchResults.length === 1) {
            const foundPlantName = searchResults[0].name;
            const foundIndex = plants.findIndex(p => p.name.toLowerCase() === foundPlantName.toLowerCase());

            if (foundIndex !== -1) {
                currentPlantIndex = foundIndex;
                const urlParams = new URLSearchParams(window.location.search);
                const pageNumber = parseInt(urlParams.get('page')) || 1;
                loadPlantDetails(foundPlantName, true, pageNumber);
            } else {
                // If plant is not in the current list, reload all plants
                plants = await fetchAllPlants();
                currentPlantIndex = plants.findIndex(p => p.name.toLowerCase() === foundPlantName.toLowerCase());
                const urlParams = new URLSearchParams(window.location.search);
                const pageNumber = parseInt(urlParams.get('page')) || 1;
                loadPlantDetails(foundPlantName, true, pageNumber);
            }
        } else {
            // If multiple results, display a list for user to select
            displaySearchResults(searchResults);
        }
    } catch (err) {
        console.error("Search failed:", err.message);
        displayError("Failed to search plants. Please try again later.");
    } finally {
        showLoading(false);
    }
}

// Function to display search results for multiple matches
function displaySearchResults(results) {
    const plantDetailsDiv = document.getElementById("plant-details");
    plantDetailsDiv.innerHTML = `
        <h2>Search Results:</h2>
        <ul id="search-results-list">
            ${results.map(plant => `<li><a href="plant.html?name=${encodeURIComponent(plant.name)}&page=${getPageNumber()}"">${plant.name}</a></li>`).join('')}
        </ul>
    `;
    plantDetailsDiv.classList.remove("hidden");
}

// Function to get the current page number from URL
function getPageNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = parseInt(urlParams.get('page'));
    return (!isNaN(pageNumber) && pageNumber >= 1) ? pageNumber : 1;
}

// Function to load plant details
async function loadPlantDetails(plantName, pushState = true, pageNumber = 1) {
    hideError();

    try {
        const response = await fetch(`/api2/plants/name/${encodeURIComponent(plantName)}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Plant not found.");
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        const plant = await response.json();

        // If plants list is empty, fetch all plants
        if (plants.length === 0) {
            plants = await fetchAllPlants();
        }

        // Update current plant index
        currentPlantIndex = plants.findIndex(p => p.name.toLowerCase() === plant.name.toLowerCase());

        renderPlantDetails(plant);
        updateNavigationButtons();

        // Update the URL using History API
        if (pushState) {
            history.pushState(null, '', `plant.html?name=${encodeURIComponent(plant.name)}&page=${pageNumber}`);
        }
    } catch (err) {
        console.error("Failed to load plant details:", err.message);
        displayError(err.message);
    } finally {
        showLoading(false);
    }
}

// Function to fetch all plants (used for navigation)
async function fetchAllPlants() {
    try {
        const response = await fetch(`/api2/plants/all`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const allPlants = await response.json();
        return allPlants;
    } catch (err) {
        console.error("Failed to fetch all plants:", err.message);
        displayError("Failed to load plants for navigation.");
        return [];
    }
}

// Function to render plant details on the page
function renderPlantDetails(plant) {
    const plantDetailsDiv = document.getElementById("plant-details");
    plantDetailsDiv.innerHTML = `
        <h1 id="plant-name">${plant.name}</h1>
        <div id="plant-images" class="image-gallery">
            ${generateImageGalleryHTML(plant)}
        </div>
        <p><strong>Sunlight:</strong> ${plant.sunlight}</p>
        <p><strong>Watering:</strong> ${plant.watering}</p>
        <p><strong>Temperature:</strong> ${plant.temperature}</p>
        <p><strong>Description:</strong> ${plant.description}</p>
    `;
    plantDetailsDiv.classList.remove("hidden");
}

// Function to generate HTML for image gallery
function generateImageGalleryHTML(plant) {
    let galleryHTML = '';
    for (let i = 1; i <= 5; i++) {
        const imgSrc = `arn:aws:s3:::wesleyatwell.com.cdn/images2/${plant.name}/image${i}.jpg`; // Primary image
        const fallbackSrc = `arn:aws:s3:::wesleyatwell.com.cdn/images2/${plant.name}/image${i}.png`; // Fallback image (if .jpg fails)
        const altText = `Image ${i} of ${plant.name}`; // Descriptive alt text
galleryHTML += `
        <img 
            src="${imgSrc}" 
            alt="${altText}" 
            class="detail-image" 
            onerror="this.onerror=null; this.src='${fallbackSrc}';"
        />
    `;    }
    return galleryHTML;
}

// Function to update navigation buttons' state
function updateNavigationButtons() {
    const prevButton = document.getElementById("prev-plant");
    const nextButton = document.getElementById("next-plant");

    // Disable Previous Plant button if at the first plant
    if (currentPlantIndex <= 0) {
        prevButton.disabled = true;
        prevButton.style.backgroundColor = "#ccc";
        prevButton.style.cursor = "not-allowed";
    } else {
        prevButton.disabled = false;
        prevButton.style.backgroundColor = "#2c3e50";
        prevButton.style.cursor = "pointer";
    }

    // Disable Next Plant button if at the last plant
    if (currentPlantIndex >= plants.length - 1) {
        nextButton.disabled = true;
        nextButton.style.backgroundColor = "#ccc";
        nextButton.style.cursor = "not-allowed";
    } else {
        nextButton.disabled = false;
        nextButton.style.backgroundColor = "#2c3e50";
        nextButton.style.cursor = "pointer";
    }
}



// Function to display error messages
function displayError(message) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }
}

// Function to hide error messages
function hideError() {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.classList.add("hidden");
    }
}
