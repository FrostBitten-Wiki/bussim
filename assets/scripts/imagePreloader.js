let imageList

fetch("/bussim-assets/dialoguedata/dialogue.json")
.then(response => response.json())
.then(data => {
    imageList = data.characterImagePreload;
    preloadImages();
})

function preloadImages() {
    console.log("Preloading Images...");

    imageList.forEach(function (imageUrl) {
        let linkElement = document.createElement('link');
        linkElement.rel = 'preload';
        linkElement.href = `/bussim-assets/images/dialogue/${imageUrl}.webp`;
        linkElement.as = 'image';
        linkElement.type = 'image/png';
        document.head.appendChild(linkElement);
    });

    console.log("Images Preloaded!");
}