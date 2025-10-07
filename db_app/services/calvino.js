const fs = require('fs');

function analyzeText(data) {
    const wordData = {}
    const freqData = {1: []};

    let text = data['data'];
    if (data['type'] === "example") {
        text = fs.readFileSync(`../assets/novels/${text}.txt`, 'utf-8');
    }
    text = text.replaceAll('\r', '');
    
    const textLines = text.split('\n');
    const info = textLines[0].split(',');
    const novel = textLines.slice(2, textLines.length);
    let endDash = false;
    let prefix = "";
    for (line of novel) {
        let newLine = line.replace("—", " ").replace(/[.,;?():"!]/g, "");
        const lineWords = newLine.split(" ");
        for (word of lineWords) {
            let fullWord = endDash ? prefix + word : word;
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
                freqData[1].push(fullWord);
            }
        }
    }

    const resData = [];
    for (entry of Object.entries(freqData)) {
        resData.push([parseInt(entry[0]), entry[1].join(", ")]);
    }
    return {info: info, freqData: resData };
}

module.exports = { analyzeText }