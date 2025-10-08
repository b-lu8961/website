const fs = require('fs');

function analyzeText(data) {
    const wordData = {}
    const freqData = {1: []};

    let text = data['data'];
    let startLine = 0;
    if (data['type'] === "example") {
        text = fs.readFileSync(`../assets/novels/${text}.txt`, 'utf-8');
        startLine = 2;
    }
    
    text = text.replaceAll('\r', '');
    const textLines = text.split('\n');
    const novel = textLines.slice(startLine, textLines.length);
    
    let endDash = false;
    let prefix = "";
    for (line of novel) {
        let newLine = line.replaceAll("—", " ").replace(/[.,;?():"!<>]/g, "");
        const lineWords = newLine.split(" ");
        for (let i = 0; i < lineWords.length; i++) {
            let word = lineWords[i];
            if (i === lineWords.length - 1 && word.charAt(word.length - 1) === "-") {
                endDash = true;
                prefix = word.slice(0, word.length - 1);
                continue;
            }

            let fullWord = endDash ? prefix + word : word;
            endDash = false;
            if (fullWord === '') {
                continue;
            }

            fullWord = fullWord.toUpperCase();
            if (fullWord in wordData) {
                const newFreq = wordData[fullWord] + 1;
                wordData[fullWord] = newFreq;
                
                if (newFreq in freqData) {
                    freqData[newFreq].push(fullWord);
                } else {
                    freqData[newFreq] = [fullWord];
                }

                freqData[newFreq - 1] = freqData[newFreq - 1].filter(item => item !== fullWord);
                if (freqData[newFreq - 1].length === 0) {
                    delete freqData[newFreq - 1];
                }
            } else {
                wordData[fullWord] = 1;
                if (!(1 in freqData)) {
                    freqData[1] = [];
                }
                freqData[1].push(fullWord);
            }
        }
    }

    const resData = [];
    for (entry of Object.entries(freqData)) {
        let sortedWords = entry[1].sort();
        resData.push([parseInt(entry[0]), sortedWords.length, sortedWords.join(", ")]);
    }

    let info = data['type'] === "example" ? textLines[0].split(' | ') : "You";
    return { info: info, freqData: resData };
}

module.exports = { analyzeText }