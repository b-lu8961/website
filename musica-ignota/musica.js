const modeSelect = document.getElementById("modeSelect");
const startSelect = document.getElementById("startSelect");
const octaveSelect = document.getElementById("octaveSelect");
const musicText = document.getElementById("musicText");
const playButton = document.getElementById("playButton");

const INITIALS = ["A", "B", "C", "D", "E"];
const UPS = ["a", "b", "c", "d"];
const DOWNS = ["f", "g", "h", "i"];
const DIACRITICS = ["o", "3", "-", "^", "8"];

const NOTES = {
    1: 16.351, // C0
    2: 17.324, // C#
    3: 18.354, // D
    4: 19.445, // D#
    5: 20.601, // E
    6: 21.827, // F
    7: 23.124, // F#
    8: 24.499, // G
    9: 25.596, // G#
    10: 27.5, // A
    11: 29.135, // A#
    12: 30.868, // B
}
const MODES = {
    "major": [1, 3, 5, 8, 10],
    "suspended": [1, 3, 6, 8, 11],
    "blues minor": [1, 4, 6, 9, 11],
    "blues major": [1, 3, 6, 8, 10],
    "minor": [1, 4, 6, 8, 11]
}

function addText(char) {
    musicText.value += char;
}

function getNote(noteIdx, startNote, mode, octave) {
    let noteNum = mode[noteIdx] + startNote;
    let octJump = noteNum <= 12 ? 0 : 1;
    noteNum = noteNum <= 12 ? noteNum : noteNum % 12;
    return NOTES[noteNum] * (2 ** (octave + octJump))
}

function translateText(seq, mode = "major", startNote = 0, octave = 3) {
    let noteList = [];

    if (!INITIALS.includes(seq.charAt(0))) {
        console.log("Text does not start with an initial")
        return [];
    }

    let idx = 0
    let currTime = 0;
    let noteIdx = null;
    while (idx < seq.length) {
        let currChar = seq.charAt(idx);
        if (INITIALS.includes(currChar)) {
            if (idx !== 0) {
                currTime += 0.5;
            }
            noteIdx = INITIALS.indexOf(currChar);
        } else if (UPS.includes(currChar)) {
            noteIdx += UPS.indexOf(currChar) + 1;
            if (noteIdx > 4) {
                console.log("Melody too high, invalid char: " + currChar);
                return [];
            }
        } else if (DOWNS.includes(currChar)) {
            noteIdx -= DOWNS.indexOf(currChar) + 1;
            if (noteIdx < 0) {
                console.log("Melody too low, invalid char: " + currChar);
                return [];
            }
        } else if (currChar === "e") {
            // same note
        } else if (currChar === " " || currChar === "\n") {
            idx++;
            continue;
        } else {
            console.log("Invalid char: " + currChar);
            return [];
        }
        
        noteList.push([getNote(noteIdx, startNote, mode, octave + 1), currTime]);

        if (idx + 1 < seq.length && DIACRITICS.includes(seq.charAt(idx + 1))) {
            let diaIdx = DIACRITICS.indexOf(seq.charAt(idx + 1))
            noteList.push([getNote(diaIdx, startNote, mode, octave), currTime]);
            idx++;
        }

        idx++;
        currTime += 0.5;
        pushNote = true;
    }

    return noteList;
}

function playMusic(noteList) {
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now()
    noteList.forEach(note => {
        synth.triggerAttackRelease(note[0], "8n", now + note[1]);
    });
}

playButton.onclick = () => {
    let noteList = translateText(
        musicText.value, 
        MODES[modeSelect.value],
        Number(startSelect.value),
        Number(octaveSelect.value)
    );
    Tone.start().then(playMusic(noteList));
};

document.querySelectorAll("button").forEach(btn => {
    if (btn.getAttribute("id") !== "playButton") {
        btn.addEventListener("click", function () {
            addText(this.textContent);
        });
    }
});