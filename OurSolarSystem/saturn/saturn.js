// saturn.js

let currentIndex = 0;
const images = [
    { src: 'saturn1.jpg', alt: 'Saturn Image 1' },
    { src: 'saturn2.jpg', alt: 'Saturn Image 2' },
    { src: 'saturn3.jpg', alt: 'Saturn Image 3' },
    { src: 'saturn4.jpg', alt: 'Saturn Image 4' },
    { src: 'saturn5.jpg', alt: 'Saturn Image 5' },
    { src: 'saturn6.jpg', alt: 'Saturn Image 6' },
    { src: 'saturn7.jpg', alt: 'Saturn Image 7' },
    { src: 'saturn8.jpg', alt: 'Saturn Image 8' },
    { src: 'saturn9.jpg', alt: 'Saturn Image 9' }
    // Add more images as needed
];

function updateCarousel() {
    const mainImage = document.getElementById('main-image');
    const prevImage = document.getElementById('prev-image');
    const nextImage = document.getElementById('next-image');

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;

    // Preload main image to ensure smooth transition
    const currentImg = new Image();
    currentImg.src = images[currentIndex].src;
    currentImg.alt = images[currentIndex].alt;
    currentImg.onload = () => {
        mainImage.innerHTML = '';
        currentImg.classList.add('loaded');
        mainImage.appendChild(currentImg);
    };

    // Update previous and next image previews
    prevImage.innerHTML = `<img src="${images[prevIndex].src}" alt="${images[prevIndex].alt}">`;
    nextImage.innerHTML = `<img src="${images[nextIndex].src}" alt="${images[nextIndex].alt}">`;
}

function showPreviousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCarousel(); // Initialize carousel on page load
});

function goToIndexPage() {
    window.location.href = '../index.html'; // Adjust path as necessary
}
