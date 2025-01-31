// script.js

let currentPage = 1;
let totalPages = 1;
let currentLimit = 10;
let plantData = []; // Global variable to store fetched plants

// Debounce timer
let debounceTimer;

// Event listeners
document.getElementById("results-per-page").addEventListener("change", handleLimitChange);
document.getElementById("prev-page").addEventListener("click", () => changePage(currentPage - 1));
document.getElementById("next-page").addEventListener("click", () => changePage(currentPage + 1));
document.getElementById("search-input").addEventListener("input", handleSearchInput);

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page'));
    const limit = parseInt(urlParams.get('limit')) || 10;
    const query = urlParams.get('query') || '';

    if (!isNaN(page) && page >= 1) {
        currentPage = page;
    }
    currentLimit = limit;
    document.getElementById("results-per-page").value = currentLimit;

    if (query) {
        document.getElementById("search-input").value = query;
    }

    loadPlants(currentPage, currentLimit, query);
});

// Function to handle changes in results per page
function handleLimitChange(event) {
    currentLimit = parseInt(event.target.value);
    currentPage = 1; // Reset to first page

    // Update the URL with the new limit and reset page to 1
    const url = new URL(window.location);
    url.searchParams.set('limit', currentLimit);
    url.searchParams.set('page', currentPage);
    // Preserve existing query parameter if it exists
    const query = document.getElementById("search-input").value.trim();
    if (query) {
        url.searchParams.set('query', query);
    } else {
        url.searchParams.delete('query');
    }
    history.pushState(null, '', url);

    loadPlants(currentPage, currentLimit, query);
}

// Function to change the current page
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;

    // Update the URL with the new page number
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    // Preserve existing query parameter if it exists
    const query = document.getElementById("search-input").value.trim();
    if (query) {
        url.searchParams.set('query', query);
    }
    history.pushState(null, '', url);

    loadPlants(currentPage, currentLimit, query);
}

// Function to handle search input with debouncing
function handleSearchInput(event) {
    const query = event.target.value.trim();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        currentPage = 1; // Reset to first page on new search

        if (query === "") {
            // If search is cleared, load default plants
            loadPlants(currentPage, currentLimit, query);
        } else {
            searchPlants(query);
        }
    }, 300); // 300ms debounce delay
}

// Function to search plants
async function searchPlants(query) {
    showLoading(true); // Show loading spinner
    hideError();

    try {
        // 🔴 **Fix:** Remove 'page' and 'limit' from the search API request
        const response = await fetch(`/api2/plants/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // 🔴 **Fix:** Since the search endpoint returns an array, adjust accordingly
        plantData = data; // 'data' is an array of plants
        totalPages = 1; // No pagination for search results
        currentPage = 1;

        updatePagination();

        // Render the plants in Grid View
        renderGridView(plantData);

        // Update the URL with the search query and reset page
        const url = new URL(window.location);
        if (query) {
            url.searchParams.set('query', query);
        } else {
            url.searchParams.delete('query');
        }
        url.searchParams.set('page', currentPage);
        url.searchParams.set('limit', currentLimit);
        history.pushState(null, '', url);
    } catch (err) {
        console.error("Search failed:", err.message);
        showError("Failed to search plants. Please try again later.");
    } finally {
        showLoading(false); // Hide loading spinner
    }
}

// Function to load plants with pagination and search
async function loadPlants(page, limit, query = "") {
    showLoading(true); // Show loading spinner
    hideError();

    try {
        let apiUrl = `/api2/plants?page=${page}&limit=${limit}`;
        if (query) {
            // 🔴 **Fix:** Remove 'page' and 'limit' from the search API request
            apiUrl = `/api2/plants/search?query=${encodeURIComponent(query)}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        console.log("Fetched data:", data); // Debugging log

        if (query) {
            // 🔴 **Fix:** Handle search results which are an array
            plantData = data; // 'data' is an array
            totalPages = 1; // No pagination for search results
            currentPage = 1;
        } else {
            // Handle regular plant listing with pagination
            totalPages = data.totalPages || 1;
            currentPage = data.currentPage || 1;
            plantData = data.plants || [];
        }

        updatePagination();

        // Render Grid View with the fetched plants
        renderGridView(plantData);
    } catch (err) {
        console.error("Failed to load plants:", err.message);
        showError("Failed to load plants. Please try again later.");
    } finally {
        showLoading(false); // Hide loading spinner
    }
}

// Function to update pagination controls
function updatePagination() {
    const currentPageSpan = document.getElementById("current-page");
    const totalPagesSpan = document.getElementById("total-pages");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    const pageNumbersContainer = document.getElementById("page-numbers");

    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    // Disable/Enable pagination buttons based on totalPages and currentPage
    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;

    // Clear existing page numbers
    if (pageNumbersContainer) pageNumbersContainer.innerHTML = "";

    if (totalPages <= 1) {
        // 🔴 **Fix:** If there's only one page, hide or disable pagination controls
        return;
    }

    // Determine the range of page numbers to display
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-button");
        if (i === currentPage) {
            pageButton.classList.add("active");
            pageButton.disabled = true;
        }
        pageButton.addEventListener("click", () => changePage(i));
        pageNumbersContainer.appendChild(pageButton);
    }

    // Optionally, handle cases where there are too many pages
    if (startPage > 1) {
        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "1";
        firstPageButton.classList.add("page-button");
        firstPageButton.addEventListener("click", () => changePage(1));
        pageNumbersContainer.insertBefore(firstPageButton, pageNumbersContainer.firstChild);

        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.classList.add("dots");
            pageNumbersContainer.insertBefore(dots, pageNumbersContainer.firstChild.nextSibling);
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.classList.add("dots");
            pageNumbersContainer.appendChild(dots);
        }

        const lastPageButton = document.createElement("button");
        lastPageButton.textContent = totalPages;
        lastPageButton.classList.add("page-button");
        lastPageButton.addEventListener("click", () => changePage(totalPages));
        pageNumbersContainer.appendChild(lastPageButton);
    }
}

// Function to render plants in grid view
function renderGridView(plants) {
    const gridContainer = document.getElementById("grid-container");
    if (!gridContainer) {
        console.error("Grid container not found. Please check the element ID.");
        return;
    }
    gridContainer.innerHTML = ""; // Clear existing content

    if (!plants || plants.length === 0) {
        gridContainer.innerHTML = "<p>No plants found.</p>";
        return;
    }

    plants.forEach(plant => {
        const card = document.createElement("div");
        card.classList.add("plant-card");
        // Remove backgroundImage to prevent conflicts
        // card.style.backgroundImage = `url('${plant.image1}')`;

        // Create a hyperlink for the image
        const imageLink = document.createElement("a");
        imageLink.href = `plant.html?name=${encodeURIComponent(plant.name)}&page=${currentPage}`;
        imageLink.setAttribute("aria-label", `View details for ${plant.name}`);

        // Create the image element
        const fallbackSrc = `https://s3.us-west-1.amazonaws.com/wesleyatwell.com.cdn/images2/${plant.name}/image1.png`;
        const img = document.createElement("img");
        img.src = `https://s3.us-west-1.amazonaws.com/wesleyatwell.com.cdn/images2/${plant.name}/image1.jpg` ; // Primary image or placeholder
        img.alt = `Image of ${plant.name}`;
        img.width = 100;
        img.height = 100;
        img.classList.add("thumbnail");
        // Add an error handler to load the fallback image if the primary fails
img.onerror = function() {
    if (img.src !== fallbackSrc) { // Prevent infinite loop if fallback also fails
        img.src = fallbackSrc;
    } else {
        // If fallback also fails, set a default alt text or image
        img.alt = `Image of ${plant.name} is unavailable`;
    }
};



        // Append the image to the hyperlink
        imageLink.appendChild(img);

        // Append the hyperlink to the card
        card.appendChild(imageLink);

        // Append plant information
        const info = document.createElement("div");
        info.innerHTML = `
            <h3><a href="plant.html?name=${encodeURIComponent(plant.name)}&page=${currentPage}" class="plant-link">${plant.name}</a></h3>
            <p><strong>Sunlight:</strong> ${plant.sunlight}</p>
            <p><strong>Watering:</strong> ${plant.watering}</p>
        `;
        card.appendChild(info);

        gridContainer.appendChild(card);
    });

    console.log(`Rendered ${plants.length} plants in Grid View.`);
    // Highlight current plant if on plant.html
    highlightCurrentPlant();
}

// Function to handle image loading errors
function handleImageError(imgElement, fallbackSrc) {
    if (fallbackSrc && fallbackSrc !== imgElement.src) {
        imgElement.src = fallbackSrc; // Attempt to load the fallback image
    } else {
        imgElement.src = '/images2/placeholder.jpg'; // Final fallback to placeholder
    }
}

// Function to show error message
function showError(message) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }
}

// Function to hide error message
function hideError() {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.classList.add("hidden");
    }
}

// Function to highlight the current plant in the list
function highlightCurrentPlant() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPlantName = urlParams.get('name');
    if (!currentPlantName) return;

    // Highlight in grid view
    const gridLinks = document.querySelectorAll("#grid-container .plant-link");
    gridLinks.forEach(link => {
        if (link.textContent.toLowerCase() === currentPlantName.toLowerCase()) {
            link.classList.add("current-plant");
        } else {
            link.classList.remove("current-plant");
        }
    });
}

// Listen to popstate events to handle browser navigation (back/forward)
window.addEventListener('popstate', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page'));
    const limit = parseInt(urlParams.get('limit')) || 10;
    const query = urlParams.get('query') || '';

    if (!isNaN(page) && page >= 1) {
        currentPage = page;
    } else {
        currentPage = 1;
    }

    if (!isNaN(limit) && limit > 0) {
        currentLimit = limit;
        document.getElementById("results-per-page").value = currentLimit;
    }

    // Update search input if query exists
    document.getElementById("search-input").value = query;

    // Load plants based on the updated parameters
    loadPlants(currentPage, currentLimit, query);
});

// **Ensure that the showLoading function exists**
function showLoading(show) {
    const loadingDiv = document.getElementById("loading");
    if (loadingDiv) {
        if (show) {
            loadingDiv.classList.remove("hidden");
        } else {
            loadingDiv.classList.add("hidden");
        }
    } else {
        console.error("Element with ID 'loading' not found.");
    }
}


