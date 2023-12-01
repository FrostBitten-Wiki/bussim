var speakerPopup = document.getElementById("speakerPopup");
var speakerImage = document.getElementById("speakerImage");
var speakerName = document.getElementById("speakerName");
var speakerDialogue = document.getElementById("speakerText");
var soundSource = document.getElementById("soundSource");
var dialogueRunning = false;

function playSound(soundfile) {
    if (soundSource.src !== `${window.location.protocol + "//" + window.location.host}/bussim-assets/sounds/${soundfile}.mp3`) {
        soundSource.src = `/bussim-assets/sounds/${soundfile}.mp3`
        soundSource.play();
    } else {
        soundSource.play();
    }
}

function startSpeaking(name, dialogues, delay) {
    playSound("elecping");
    speakerPopup.style.bottom = "5px";
    speakerName.textContent = name;
    let index = 0;
    
    function showNextDialogue() {
        if (index < dialogues.length) {
            playSound("elecping");
            console.log(dialogues)
            speakerImage.src = dialogues[index][0];
            speakerDialogue.innerHTML = dialogues[index][1];
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
              startSpeaking(speakData.name, speakData.dialogue, speakData.delay);
          })
    }
}

setInterval(randomDialogueEvent, 5000);