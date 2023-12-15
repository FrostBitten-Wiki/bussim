var tooltip;
        
            document.addEventListener('DOMContentLoaded', function () {
                tooltip = document.getElementById('custom-tooltip');
            });
        
            function showTooltip(event) {
                var tooltipTrigger = event.target;
                var tooltipText = tooltipTrigger.getAttribute('data-tooltip-text');
                
                setContent(tooltip, tooltipText);
                displayTooltip(tooltip);
                animateTooltip(tooltip, event.clientX + 25, event.clientY + 25);
            }
        
            function hideTooltip() {
                hideElement(tooltip);
            }
        
            function updateTooltipPosition(event) {
                if (isElementVisible(tooltip)) {
                    animateTooltip(tooltip, event.clientX + 25, event.clientY + 25);
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
                return window.getComputedStyle(element).display !== '0';
            }

            document.addEventListener('mousemove', updateTooltipPosition);