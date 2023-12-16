var buttons = document.querySelectorAll('button');
var notes = document.querySelectorAll('note'); //non-existing class, although used for tooltip noting!

buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        playSound("buttonclick", 1, "none")
    });

    button.addEventListener('mouseenter', function() {
        playSound("buttonhover", 1, "none")
    });
});

notes.forEach(function(item) {
    item.onmouseover = function(event) {
        showTooltip(event)
    };
    item.onmouseout = function(event) {
        hideTooltip()
    };
})