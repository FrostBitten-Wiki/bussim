const speakerPopup = document.getElementById("speakerPopup");
const speakerImage = document.getElementById("speakerImage");
const speakerName = document.getElementById("speakerName");
const speakerDialogue = document.getElementById("speakerText");
const soundSource = document.getElementById("soundSource");
const dialogueRunning = false;

function playSound(soundfile) {
    if (soundSource.src !== `${window.location.protocol + "//" + window.location.host}/bussim-assets/sounds/${soundfile}.mp3`) {
        soundSource.src = `/bussim-assets/sounds/${soundfile}.mp3`
        soundSource.play();
    } else {
        soundSource.play();
    }
}

function startSpeaking(name, image, dialogues, delay) {
    playSound("elecping");
    speakerPopup.style.bottom = "5px";
    speakerName.textContent = name;
    speakerImage.src = image;
    let index = 0;

    function showNextDialogue() {
        if (index < dialogues.length) {
            playSound("elecping");
            speakerDialogue.innerHTML = dialogues[index];
            index++;
            setTimeout(showNextDialogue, delay);
        } else {
            setTimeout(() => {
                speakerPopup.style.bottom = "-130px";
                dialogueRunning = false;
            }, delay);
        }
    }

    showNextDialogue();
}

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDialogueEvent() {
    if (Math.random() * 100 < 5 && dialogueRunning == false) {
          dialogueRunning = true;
          fetch("/bussim-assets/dialoguedata/dialogue.json")
          .then(response => response.json())
          .then(data => {
              const speakData = random(data.data)
              startSpeaking(speakData.name, speakData.image, speakData.dialogue, speakData.delay);
          })
    }
}

setInterval(randomDialogueEvent, 5000);