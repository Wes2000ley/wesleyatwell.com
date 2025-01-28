let currentIndex = 0;
const images = [
    { src: 'earth1.jpg', alt: 'Earth Image 1' },
    { src: 'earth2.jpg', alt: 'Earth Image 2' },
    { src: 'earth3.jpg', alt: 'Earth Image 3' },
    { src: 'earth4.jpg', alt: 'Earth Image 4' },
    { src: 'earth5.jpg', alt: 'Earth Image 5' },
    { src: 'earth6.jpg', alt: 'Earth Image 6' },
    { src: 'earth7.jpg', alt: 'Earth Image 7' },
    { src: 'earth8.jpg', alt: 'Earth Image 8' },
    { src: 'earth9.jpg', alt: 'Earth Image 9' },
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
