// jupiter.js

let currentIndex = 0;
const images = [
    { src: 'jupiter1.jpg', alt: 'Jupiter Image 1' },
    { src: 'jupiter2.jpg', alt: 'Jupiter Image 2' },
    { src: 'jupiter3.jpg', alt: 'Jupiter Image 3' },
    { src: 'jupiter4.jpg', alt: 'Jupiter Image 4' },
    { src: 'jupiter5.jpg', alt: 'Jupiter Image 5' },
    { src: 'jupiter6.jpg', alt: 'Jupiter Image 6' },
    { src: 'jupiter7.jpg', alt: 'Jupiter Image 7' },
    { src: 'jupiter8.jpg', alt: 'Jupiter Image 8' },
    { src: 'jupiter9.jpg', alt: 'Jupiter Image 9' }
    // Add more images as needed
];

function updateCarousel() {
    const mainImage = document.getElementById('main-image');
    const prevImage = document.getElementById('prev-image');
    const nextImage = document.getElementById('next-image');

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;

    // Preload main image for smooth transition
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
