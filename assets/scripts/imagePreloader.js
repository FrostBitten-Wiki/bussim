let imageUrls = [
    '/bussim-assets/images/banner.jpg',

    '/bussim-assets/images/dialogue/pear/pear_emote0.png',
    '/bussim-assets/images/dialogue/pear/pear_emote1.png',
    '/bussim-assets/images/dialogue/pear/pear_emote2.png',
    '/bussim-assets/images/dialogue/pear/pear_emote3.png',
    '/bussim-assets/images/dialogue/pear/pear_emote4.png',
    '/bussim-assets/images/dialogue/pear/pear_emote5.png',
    '/bussim-assets/images/dialogue/pear/pear_emote6.png',
];

function preloadImages() {
    imageUrls.forEach(function (imageUrl) {
        let linkElement = document.createElement('link');
        linkElement.rel = 'preload';
        linkElement.href = imageUrl;
        linkElement.as = 'image';
        linkElement.type = 'image/png';
        document.head.appendChild(linkElement);
    });

    console.log("Images Preloaded!");
}

console.log("Preloading Images...");
window.addEventListener('load', preloadImages);