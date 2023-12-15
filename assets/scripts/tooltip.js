var tooltip;

document.addEventListener('DOMContentLoaded', function () {
    tooltip = document.getElementById('custom-tooltip');
});

function showTooltip(event) {
    var tooltipTrigger = event.target;
    var tooltipText = tooltipTrigger.getAttribute('tooltip-text');

    setContent(tooltip, tooltipText);
    displayTooltip(tooltip);
    updateTooltipPosition(event);
}

function hideTooltip() {
    hideElement(tooltip);
}

function updateTooltipPosition(event) {
    if (isElementVisible(tooltip)) {
        var x = event.clientX + 15;
        var y = event.clientY + 15;

        // Adjust tooltip position to prevent it from going off-screen
        var maxX = window.innerWidth - tooltip.offsetWidth;
        var maxY = window.innerHeight - tooltip.offsetHeight;

        x = Math.min(x, maxX);
        y = Math.min(y, maxY);

        animateTooltip(tooltip, x, y);
    }
}

function setContent(element, content) {
    element.textContent = content;
}

function displayTooltip(element) {
    showElement(element);
}

function animateTooltip(element, x, y) {
    gsap.to(element, { x: x, y: y, duration: 0.5, ease: 'Power0.easeNone' });
}

function hideElement(element) {
    element.style.opacity = '0';
}

function showElement(element) {
    element.style.opacity = '1';
}

function isElementVisible(element) {
    return window.getComputedStyle(element).display !== 'none';
}

document.addEventListener('mousemove', updateTooltipPosition);
