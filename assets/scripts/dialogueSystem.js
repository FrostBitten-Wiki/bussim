let speakerPopup = document.getElementById("speakerPopup");
let speakerImage = document.getElementById("speakerImage");
let speakerId = document.getElementById("speakerId");
let speakerName = document.getElementById("speakerName");
let speakerDialogue = document.getElementById("speakerText");
let soundSource = document.getElementById("soundSource");

let dialogueRunning = false;
let previousImage;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

console.log(dialogueData)

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

function randomDialogueEvent(force, id, showDebug = false) {
    console.log(force, id);
    const dialogueProbbability = 2.5;

    if (force === undefined) {
        force = false;
    }

    if (dialogueRunning) {
        return console.log("Another random dialogue event was called, but there's still one running.");
    }

    if (force === true) {
        // force a random dialogue regardless of rarity.
        // used for forced dialogues on NPC pages, usually.
        if (id === "" | undefined) {
            return console.log("randomDialogueEvent function did not pass any ID to force.");
        }

        dialogueRunning = true;

        if (showDebug) {
            speakerId.innerText = `dialogueId: ${id}`;
        } else {
            speakerId.innerText = ``;
        }
        speakData = dialogueData.dialogueData[id];
        startSpeaking(speakData, dialogueData.characterData);
    } else {
        // force a random dialogue.
        dialogueRunning = true;

        speakerId.innerText = ``;
        speakData = random(dialogueData.dialogueData);
        chance = Math.random() * 100

        console.log(chance, speakData.rarity)
        if (chance < speakData.rarity) {
            startSpeaking(speakData, dialogueData.characterData);
        } else {
            dialogueRunning = false;
        }
    }
}

var min = 30000
var max = 180000
setInterval(() => randomDialogueEvent(), Math.random() * (max - min) + min);

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
