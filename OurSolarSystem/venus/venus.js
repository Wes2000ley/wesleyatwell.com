let currentIndex = 0;
const images = [
    { src: 'venus1.jpg', alt: 'Venus Image 1' },
    { src: 'venus2.jpg', alt: 'Venus Image 2' },
    { src: 'venus3.jpg', alt: 'Venus Image 3' },
    { src: 'venus4.jpg', alt: 'Venus Image 4' },
    { src: 'venus5.jpg', alt: 'Venus Image 5' },
    { src: 'venus6.jpg', alt: 'Venus Image 6' },
    { src: 'venus7.jpg', alt: 'Venus Image 7' },
    { src: 'venus8.jpg', alt: 'Venus Image 8' },
    { src: 'venus9.jpg', alt: 'Venus Image 9' },
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
