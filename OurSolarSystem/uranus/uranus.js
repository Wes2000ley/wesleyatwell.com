// uranus.js

let currentIndex = 0;
const images = [
    { src: 'uranus1.jpg', alt: 'Uranus Image 1' },
    { src: 'uranus2.jpg', alt: 'Uranus Image 2' },
    { src: 'uranus3.jpg', alt: 'Uranus Image 3' },
    { src: 'uranus4.jpg', alt: 'Uranus Image 4' },
    { src: 'uranus5.jpg', alt: 'Uranus Image 5' },
    { src: 'uranus6.gif', alt: 'Uranus Image 6' },
    { src: 'uranus7.jpg', alt: 'Uranus Image 7' },
    { src: 'uranus8.jpg', alt: 'Uranus Image 8' },
    { src: 'uranus9.jpg', alt: 'Uranus Image 9' }
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
