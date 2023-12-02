let speakerPopup = document.getElementById("speakerPopup");
let speakerImage = document.getElementById("speakerImage");
let speakerName = document.getElementById("speakerName");
let speakerDialogue = document.getElementById("speakerText");
let soundSource = document.getElementById("soundSource");
let dialogueRunning = false;

function playSound(soundfile) {
    if (soundSource.src !== `${window.location.protocol + "//" + window.location.host}/bussim-assets/sounds/${soundfile}.mp3`) {
        soundSource.src = `/bussim-assets/sounds/${soundfile}.mp3`
        soundSource.play();
    } else {
        soundSource.play();
    }
}

function startSpeaking(data, characterData) {
    let index = 0;

    speakerPopup.style.bottom = "5px";
    function showNextDialogue() {
        if (index < data.dialogue.length) {
            const charData = characterData[data.dialogue[index][1]]
            
            playSound(charData["dialogueSfx"]);
            
            delay = data.dialogue[index][0];
            speakerName.innerHTML = data.dialogue[index][1];
            speakerImage.src = `/bussim-assets/images/dialogue/${charData["dialogueEmoteName"]}/${data.dialogue[index][2]}.png`;
            speakerDialogue.innerHTML = data.dialogue[index][3];

            speakerPopup.style.setProperty("--color1", charData["dialogueColors"][0])
            speakerPopup.style.setProperty("--color2", charData["dialogueColors"][1])
            speakerPopup.style.setProperty("--color3", charData["dialogueColors"][2])

            index++;
            setTimeout(showNextDialogue, delay);
        } else {
            setTimeout(() => {
                delay = data.dialogue[index - 1][0];
                speakerPopup.style.bottom = "-165px";
                dialogueRunning = false;
                console.log(dialogueRunning);
            }, delay);
        }
    }

    showNextDialogue();
}

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDialogueEvent(force) {
    let dialogueProbbability = 2.5

    if (Math.random() * 100 < dialogueProbbability && force !== true && dialogueRunning === false) {
        fetch("/bussim-assets/dialoguedata/dialogue.json")
        .then(response => response.json())
        .then(data => {
            dialogueRunning = true;
            console.log(dialogueRunning);
            
            const speakData = random(data.dialogueData);
            if (Math.random() * 100 < speakData.rarity) {
                startSpeaking(speakData, data.characterData);
            }
        })
    } else if (force === true && dialogueRunning === false) {
        fetch("/bussim-assets/dialoguedata/dialogue.json")
        .then(response => response.json())
        .then(data => {
            dialogueRunning = true;
            console.log(dialogueRunning);
            
            const speakData = random(data.dialogueData);
            if (Math.random() * 100 < speakData.rarity) {
                startSpeaking(speakData, data.characterData);
            }
        })
    }
}


setInterval(randomDialogueEvent, 5000);