// neptune.js

let currentIndex = 0;
const images = [
    { src: 'neptune1.jpg', alt: 'Neptune Image 1' },
    { src: 'neptune2.jpg', alt: 'Neptune Image 2' },
    { src: 'neptune3.jpg', alt: 'Neptune Image 3' },
    { src: 'neptune4.jpg', alt: 'Neptune Image 4' },
    { src: 'neptune5.jpg', alt: 'Neptune Image 5' },
    { src: 'neptune6.jpg', alt: 'Neptune Image 6' },
    { src: 'neptune7.jpg', alt: 'Neptune Image 7' },
    { src: 'neptune8.jpg', alt: 'Neptune Image 8' },
    { src: 'neptune9.jpg', alt: 'Neptune Image 9' },
    // Add more images as needed
];

function updateCarousel() {
    const mainImage = document.getElementById('main-image');
    const prevImage = document.getElementById('prev-image');
    const nextImage = document.getElementById('next-image');

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;

    // Preload images to ensure smooth transition
    const currentImg = new Image();
    currentImg.src = images[currentIndex].src;
    currentImg.alt = images[currentIndex].alt;
    currentImg.onload = () => {
        mainImage.innerHTML = '';
        currentImg.classList.add('loaded');
        mainImage.appendChild(currentImg);
    };

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
    updateCarousel();
});

function goToIndexPage() {
    window.location.href = '../index.html'; // Adjust path as necessary
}
