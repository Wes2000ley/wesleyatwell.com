// sun.js

let currentIndex = 0;
const images = [
    { src: 'sun1.jpg', alt: 'Sun Image 1' },
    { src: 'sun2.jpg', alt: 'Sun Image 2' },
    { src: 'sun3.jpg', alt: 'Sun Image 3' },
    { src: 'sun4.jpg', alt: 'Sun Image 4' },
    { src: 'sun5.jpg', alt: 'Sun Image 5' },
    { src: 'sun6.jpg', alt: 'Sun Image 6' },
    { src: 'sun7.jpg', alt: 'Sun Image 7' },
    { src: 'sun8.jpg', alt: 'Sun Image 8' },
    { src: 'sun9.jpg', alt: 'Sun Image 9' },
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
