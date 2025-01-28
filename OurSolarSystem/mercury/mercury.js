// mercury.js

let currentIndex = 0;
const images = [
    { src: 'mercury1.jpg', alt: 'Mercury Image 1' },
    { src: 'mercury2.jpg', alt: 'Mercury Image 2' },
    { src: 'mercury3.jpg', alt: 'Mercury Image 3' },
    { src: 'mercury4.jpg', alt: 'Mercury Image 4' },
    { src: 'mercury5.jpg', alt: 'Mercury Image 5' },
    { src: 'mercury6.jpg', alt: 'Mercury Image 6' },
    { src: 'mercury7.jpg', alt: 'Mercury Image 7' },
    { src: 'mercury8.jpg', alt: 'Mercury Image 8' },
    { src: 'mercury9.jpg', alt: 'Mercury Image 9' },
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
