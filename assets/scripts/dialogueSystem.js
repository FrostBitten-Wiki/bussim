let speakerPopup = document.getElementById("speakerPopup");
let speakerImage = document.getElementById("speakerImage");
let speakerId = document.getElementById("speakerId");
let speakerName = document.getElementById("speakerName");
let speakerDialogue = document.getElementById("speakerText");
let soundSource = document.getElementById("soundSource");

let dialogueRunning = false;
let previousImage;
let dialogueData;

fetch("/bussim-assets/dialoguedata/dialogue.json")
.then((response) => response.json())
.then((jsonData) => {
    dialogueData = jsonData;
});


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

function loadAudioFile(soundfile) {
    if (!audioBuffers[soundfile]) {
        return fetch(`/bussim-assets/sounds/${soundfile}.mp3`)
            .then(response => response.arrayBuffer())
            .then(buffer => audioContext.decodeAudioData(buffer))
            .then(decodedBuffer => {
                audioBuffers[soundfile] = decodedBuffer;
            })
            .catch(error => console.error(`Error loading audio file ${soundfile}:`, error));
    } else {
        return Promise.resolve();
    }
}

function playSound(soundfile, volume, pitch) {
    loadAudioFile(soundfile).then(() => {
        let originalAudio = document.getElementById("soundSource");
        let clonedAudio = originalAudio.cloneNode(true);
        clonedAudio.id = "clonedAudio";
        document.body.appendChild(clonedAudio);

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        source.buffer = audioBuffers[soundfile];
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.detune.value = pitch === 0 || pitch === "none" ? 0 : Math.random() * pitch;

        gainNode.gain.value = volume;

        source.addEventListener("ended", function () {
            document.body.removeChild(clonedAudio);
            source.removeEventListener("ended", arguments.callee);
        });

        source.start(0);
    });
}

function startSpeaking(data, characterData) {
    let index = 0;

    speakerPopup.style.bottom = "67px";
    function showNextDialogue() {
        if (index < data.dialogue.length) {
            const charData = characterData[data.dialogue[index][1]];
            const text = data.dialogue[index][3];
            let charIndex = 0;
            
            delay = data.dialogue[index][0][0];
            charDelay = data.dialogue[index][0][1];
            speakerName.innerHTML = data.dialogue[index][1];
            speakerImage.classList.remove(previousImage);
            previousImage = `dialogue-${charData["dialogueEmoteName"]}_${data.dialogue[index][2]}`;
            speakerImage.classList.add(previousImage);
            speakerPopup.style.setProperty("--color1", charData["dialogueColors"][0]);
            speakerPopup.style.setProperty("--color2", charData["dialogueColors"][1]);
            speakerPopup.style.setProperty("--color3", charData["dialogueColors"][2]);
            
            function addCharacter() {
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
                        playSound(charData["dialogueSfx"][0], charData["dialogueSfx"][1], charData["dialogueSfx"][2]);
                    }
                    setTimeout(addCharacter, charDelay);
                } else {
                    index++;
                    setTimeout(showNextDialogue, delay);
                }
            }
    
            addCharacter();
        } else {
            setTimeout(() => {
                delay = data.dialogue[index - 1][0];
                speakerPopup.style.bottom = "-165px";
                dialogueRunning = false;
            }, delay);
        }
    }

    showNextDialogue();
}

function random(data) {
    const keys = Object.keys(data);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return data[randomKey];
}

function randomDialogueEvent(force, id) {
    const dialogueProbbability = 2.5;

    if (dialogueData && Math.random() * 100 < dialogueProbbability && force !== true && !dialogueRunning) {
        dialogueRunning = true;

        let speakData;

        if (id && dialogueData.dialogueData[id]) {
            speakerId.innerText = `dialogueId: ${id}`;
            speakData = dialogueData.dialogueData[id];
        } else {
            speakerId.innerText = ``;
            speakData = random(dialogueData.dialogueData);
        }

        if (Math.random() * 100 < speakData.rarity) {
            startSpeaking(speakData, dialogueData.characterData);
        } else {
            dialogueRunning = false;
        }
    } else if (force === true && id !== "" && !dialogueRunning) {
        dialogueRunning = true;

        let speakData;

        if (id && dialogueData.dialogueData[id]) {
            speakerId.innerText = `dialogueId: ${id}`;
            speakData = dialogueData.dialogueData[id];
        } else {
            speakerId.innerText = ``;
            speakData = random(dialogueData.dialogueData);
        }

        if (Math.random() * 100 < speakData.rarity) {
            startSpeaking(speakData, dialogueData.characterData);
        } else {
            dialogueRunning = false;
        }
    }
}

setInterval(() => randomDialogueEvent(), 2500);

if (typeof document.hidden !== "undefined") {
    var hidden = "hidden";
    var visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
    var hidden = "msHidden";
    var visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    var hidden = "webkitHidden";
    var visibilityChange = "webkitvisibilitychange";
}

function dialogueHandler() {
    if (document[hidden]) {
        dialogueRunning = true;
    } else {
        dialogueRunning = false;
    }
}

document.addEventListener(visibilityChange, dialogueHandler, false);