function changeDialogue(id, dialogueId) {
    console.log(id, dialogueId)
    var speakerName = document.getElementById(`${id}-name`);
    var speakerDialogue = document.getElementById(`${id}-chat`);
    var dialogueBox = document.getElementById(`${id}-dialogue`);
    
    var choices = document.getElementById(`${id}-choices`);
    var controls = document.getElementById(`${id}-controls`);
    var note = document.getElementById(`${id}-note`);

    var dialogueId = random(dialogueId.split(","))

    var chatData = window[`${id}chatDataset`][dialogueId];
    var userData = chatData[chatData.name];

    choices.innerHTML = "";
    controls.innerHTML = "";
    window[`${id}dialogueDelay`] = 25;
    
    // Update Dialogue Box
    speakerName.innerText = chatData.name;
    dialogueBox.style.setProperty("--color1", dialogueData.characterData[chatData.name]["dialogueColors"][0]);
    dialogueBox.style.setProperty("--color2", dialogueData.characterData[chatData.name]["dialogueColors"][1]);
    dialogueBox.style.setProperty("--color3", dialogueData.characterData[chatData.name]["dialogueColors"][2]);

    let charIndex = 0;

    function typeDialogue(text) {
        const char = text[charIndex];

        if (char === "<") {
            let htmlTag = char;
            charIndex++;
        
            while (charIndex < text.length && text[charIndex] !== ">") {
                htmlTag += text[charIndex];
                charIndex++;
            }
        
            if (charIndex < text.length) {
                htmlTag += ">";
                charIndex++;
            }
        
            speakerDialogue.innerHTML = htmlTag;
        } else {
            speakerDialogue.innerHTML = text.slice(0, charIndex);
            charIndex++;
        }
    
        if (charIndex <= text.length) {
            if (charIndex % 3 === 0) {
                playSound(dialogueData.characterData[chatData.name]["dialogueSfx"][0], dialogueData.characterData[chatData.name]["dialogueSfx"][1], dialogueData.characterData[chatData.name]["dialogueSfx"][2]);
            }
            setTimeout(() => typeDialogue(text), window[`${id}dialogueDelay`]);
        } else {
            chatData.choices.forEach(item => {
                var button = document.createElement('button');

                console.log(item)

                if (Array.isArray(item[0])) {
                    button.innerHTML = `
                        <text type="hoverText" style="pointer-events: none;">${item[0][0]}</text>
                    `;

                    button.classList.add("tooltip-trigger");
                    button.setAttribute("data-tooltip-text", "(?) " + item[0][1]);
                    button.onmouseover = function(event) {
                        showTooltip(event)
                    };
                    button.onmouseout = function(event) {
                        hideTooltip()
                    };

                    button.style.cursor = "help";
                } else {
                    button.innerHTML = `
                        <text type="hoverText">${item[0]}</text>
                    `;
                }

                button.onclick = function() {
                    hideTooltip()
                    changeDialogue(id, `${item[1]}`);
                };

                button.style.flex = 'auto';

                button.addEventListener('click', function() {
                    playSound("buttonclick", 1, "none")
                });

                button.addEventListener('mouseenter', function() {
                    playSound("buttonhover", 1, "none")
                });

                choices.appendChild(button);
            });

            chatData.controls.forEach(item => {
                var button = document.createElement('button');

                console.log(item)

                if (Array.isArray(item[0])) {
                    button.innerHTML = `
                        <text type="hoverText" style="color: #eb4034;">${item[0][0]}</text>
                    `;

                    button.classList.add("tooltip-trigger");
                    button.setAttribute("data-tooltip-text", "(?) " + item[0][1]);
                    button.onmouseover = function(event) {
                        showTooltip(event)
                    };
                    button.onmouseout = function(event) {
                        hideTooltip()
                    };

                    button.style.cursor = "help";
                } else {
                    button.innerHTML = `
                        <text type="hoverText" style="color: #eb4034;">${item[0]}</text>
                    `;
                }

                button.onclick = function() {
                    hideTooltip()
                    changeDialogue(id, `${item[1]}`);
                };

                button.style.flex = 'auto';

                button.addEventListener('click', function() {
                    playSound("buttonclick", 1, "none")
                });

                button.addEventListener('mouseenter', function() {
                    playSound("buttonhover", 1, "none")
                });

                controls.appendChild(button);
            });

        }
    }

    

    var text = random(chatData.text);

    if (Array.isArray(text)) {
        note.innerHTML = "NOTE: " + text[1] + "<br><br>";
        typeDialogue(text[0]);
    } else {
        note.innerHTML = "";
        typeDialogue(text);
    }
    
}