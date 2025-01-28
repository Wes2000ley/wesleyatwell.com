let currentIndex = 0;
const images = [
    { src: 'mars1.jpg', alt: 'Mars Image 1' },
    { src: 'mars2.jpg', alt: 'Mars Image 2' },
    { src: 'mars3.jpg', alt: 'Mars Image 3' },
    { src: 'mars4.jpg', alt: 'Mars Image 4' },
    { src: 'mars5.jpg', alt: 'Mars Image 5' },
    { src: 'mars6.jpg', alt: 'Mars Image 6' },
    { src: 'mars7.jpg', alt: 'Mars Image 7' },
    { src: 'mars8.jpg', alt: 'Mars Image 8' },
    { src: 'mars9.jpg', alt: 'Mars Image 9' },
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

