document.addEventListener('DOMContentLoaded', () => {
    const planets = document.querySelectorAll('.planet, .sun');
    const fixedTooltip = document.getElementById('fixed-tooltip');
    const tooltipImage = fixedTooltip.querySelector('img');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipSummary = document.getElementById('tooltip-summary');

    // Function to get initial rotation from data attribute
    function getInitialRotation(orbitElement) {
        const initialRotation = orbitElement.dataset.initialRotation;
        return parseFloat(initialRotation) || 0;
    }

    // Function to update axial rotation and scale
    function updateAxialRotation() {
        planets.forEach(planet => {
            const planetRotationSpeed = parseFloat(planet.getAttribute('data-axial-rotation-speed')) || 1;
            const currentRotation = parseFloat(planet.style.getPropertyValue('--planet-rotation')) || 0;
            const newRotation =  (currentRotation + planetRotationSpeed);
            const scaleValue = parseFloat(getComputedStyle(planet).getPropertyValue('--planet-scale')) || 1;

            planet.style.setProperty('--planet-rotation', newRotation);
            planet.style.transform = `translate(-50%, -50%) rotate(${newRotation}deg) scale(${scaleValue})`;
        });
    }
// Function to increase scale on mouseover
function increaseScaleOnHover(element) {
    element.addEventListener('mouseover', () => {
        element.style.setProperty('--planet-scale', 2); // Set scale to 2x
    });

    element.addEventListener('mouseout', () => {
        element.style.setProperty('--planet-scale', 1); // Reset scale to default
    });
}

// Apply hover effect to planets and sun
planets.forEach(planet => {
    increaseScaleOnHover(planet);
});
    // Function to start animations
    function startAnimations() {
        setInterval(updateAxialRotation, 30); // Update axial rotation every 30ms
    }

    // Initialize animations
    startAnimations();

    // Adjust initial positions based on data attributes
    planets.forEach(planet => {
        const orbit = planet.closest('.orbit');
        if (orbit) {
            const initialRotation = getInitialRotation(orbit);
            orbit.style.transform = `translate(-50%, -50%) rotate(${initialRotation}deg)`;
        }

        planet.addEventListener('mouseover', async () => {
            const title = planet.getAttribute('data-title');

            // Show tooltip with fade-in effect
            fadeInTooltip();

            tooltipTitle.textContent = title.replace('_', ' ');
            tooltipSummary.textContent = 'Loading...';
            tooltipImage.src = '';

            try {
                const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
                const data = await response.json();

                tooltipImage.src = data.thumbnail ? data.thumbnail.source : 'default-image.jpg';
                tooltipSummary.textContent = data.extract;
            } catch (error) {
                console.error('Error fetching Wikipedia data:', error);
                tooltipSummary.textContent = 'Error loading data';
            }
        });

        planet.addEventListener('mouseout', () => {
            // Hide tooltip with fade-out effect
            fadeOutTooltip();
        });
    });

    // Scroll animation logic remains the same
    document.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollRatio = scrollPosition / maxScroll;
        const orbits = document.querySelectorAll('.orbit');

        orbits.forEach((orbit, index) => {
            const speedMultiplier = 1 * (index + 1);
            const rotationSpeed = parseFloat(orbit.getAttribute('data-rotation-speed')) || 1;
            const initialRotation = getInitialRotation(orbit);
            const rotationDegrees = (scrollRatio * rotationSpeed * speedMultiplier * 360) + initialRotation;
            orbit.style.transform = `translate(-50%, -50%) rotate(${rotationDegrees}deg)`;
        });
    });

    // Function to fade in tooltip
    function fadeInTooltip() {
        fixedTooltip.style.display = 'block';
        fixedTooltip.style.opacity = '0';
        setTimeout(() => {
            fixedTooltip.style.opacity = '1';
        }, 0); // Adjust timing if needed
    }

    // Function to fade out tooltip
    function fadeOutTooltip() {
        fixedTooltip.style.opacity = '0';
        setTimeout(() => {
            fixedTooltip.style.display = 'none';
        }, 0); // Adjust timing if needed
    }

    // Initial scroll to ensure planets are positioned
    window.scrollTo(0, 10); // Scroll down a bit on page load
});
