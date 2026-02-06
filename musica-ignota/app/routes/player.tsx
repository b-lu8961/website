import type { PlayerData } from "~/types";
import type { Route } from "./+types/player";
import { Header } from "~/components/header";
import { Dropdown } from "~/components/dropdown";
import { ButtonRow } from "~/components/button-row";

import * as Tone from 'tone';
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Musica Ignota" },
        { name: "Player", content: "Language player" },
    ];
}

const MODES: PlayerData[] = [
    { key: "major", label: "Major", list: [1, 3, 5, 8, 10], initial: true },
    { key: "suspended", label: "Suspended", list: [1, 3, 6, 8, 11] },
    { key: "blues major", label: "Blues major", list: [1, 4, 6, 9, 11] },
    { key: "blues minor", label: "Blues minor", list: [1, 3, 6, 8, 10] },
    { key: "minor", label: "Minor", list: [1, 4, 6, 8, 11] },
];

const NOTES: PlayerData[] = [
    { key: "0", label: "C", value: 16.351, initial: true },
    { key: "1", label: "C♯/D♭", value: 17.324 },
    { key: "2", label: "D", value: 18.354 },
    { key: "3", label: "D♯/E♭", value: 19.445 },
    { key: "4", label: "E", value: 20.601},
    { key: "5", label: "F", value: 21.827 },
    { key: "6", label: "F♯/G♭", value: 23.124 },
    { key: "7", label: "G", value: 24.499 },
    { key: "8", label: "G♯/A♭", value: 25.596 },
    { key: "9", label: "A", value: 27.5 },
    { key: "10", label: "A♯/B♭", value: 29.135 },
    { key: "11", label: "B", value: 30.868 }
];

const OCTAVES: PlayerData[] = [
    { key: "1", label: "1", value: 1 },
    { key: "2", label: "2", value: 2 },
    { key: "3", label: "3", value: 3, initial: true },
    { key: "4", label: "4", value: 4 },
    { key: "5", label: "5", value: 5 },
    { key: "6", label: "6", value: 6 }
];

const INITIALS = ["A", "B", "C", "D", "E"];
const UPS = ["a", "b", "c", "d"];
const DOWNS = ["f", "g", "h", "i"];
const DIACRITICS = ["o", "#", "-", "^", "%"];

export default function Player() {
    const [textContent, setTextContent] = useState("");

    function addText(charToAdd: string) {
        setTextContent(textContent + charToAdd);
    }

    function getNote(noteIdx: number, startNote: number, mode: number[], octave: number): number {
        let noteNum = mode[noteIdx] + startNote;
        let octJump = noteNum <= 12 ? 0 : 1;
        noteNum = noteNum <= 12 ? noteNum : noteNum % 12;
        const noteObj = NOTES.find(obj => obj.key === String(noteNum));
        let value = 16.351;
        if (noteObj !== undefined) {
            value = noteObj.value !== undefined ? noteObj.value : value;
        }
        return value * (2 ** (octave + octJump))
    }

    function translateText(seq: string, modeName = "major", startNote = 0, octave = 3): number[][] {
        const modeObj = MODES.find(obj => obj.key === modeName);
        let mode = [1, 3, 5, 8, 10];
        if (modeObj !== undefined) {
            mode = modeObj.list !== undefined ? modeObj.list : mode;
        }
        let noteList = [];

        if (!INITIALS.includes(seq.charAt(0))) {
            console.log("Text does not start with an initial")
            return [];
        }

        let idx = 0
        let currTime = 0;
        let noteIdx = 0;
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
        }

        return noteList;
    }

    function playMusic(noteList: number[][]) {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const now = Tone.now()
        noteList.forEach(note => {
            synth.triggerAttackRelease(note[0], "8n", now + note[1]);
        });
    }

    async function handlePlay(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.target);
        console.log(formData);
        const noteList = translateText(
            textContent, 
            String(formData.get("modeSelect")),
            Number(formData.get("noteSelect")),
            Number(formData.get("octaveSelect"))
        );
        await Tone.start().then();
        playMusic(noteList);
    }

    return (
        <div className="container">
            <Header />
            <form onSubmit={e => handlePlay(e)}>
                <div className="row p-2">
                    <Dropdown name="modeSelect" text="Select Mode" options={MODES} />
                    <Dropdown name="noteSelect" text="Select Note" options={NOTES} />
                    <Dropdown name="octaveSelect" text="Select Octave" options={OCTAVES} />
                </div>
                <div className="row p-2">
                    <textarea value={textContent} onChange={e => setTextContent(e.target.value)} spellCheck="false" className="ignota" />
                </div>
                <div className="row p-2">
                    <button id="playButton" type="submit" className="btn btn-primary">Play</button>
                </div>
            </form>
            <ButtonRow clickHandler={addText} label="Initials" chars={INITIALS} />
            <ButtonRow clickHandler={addText} label="Ups" chars={UPS} />
            <ButtonRow clickHandler={addText} label="Downs" chars={DOWNS} />
            <ButtonRow clickHandler={addText} label="Diacritics" chars={DIACRITICS} />
        </div>
    );
}
