const bootstrap = window.bootstrap;

const testButton = document.getElementById("test-button");
const guessButton = document.getElementById("guess-button");

function setCharAt(str, idx, chr) {
    return str.substring(0, idx) + chr + str.substring(idx + 1);
}

function setPlayerName(elem, playerName, playerNumber, guessNumber) {
    if (guessNumber < 2) {
        elem.textContent = `Player ${playerNumber + 1}`;
    } else if (guessNumber === 2) {
        if (playerNumber === 2) {
            elem.textContent = playerName[0] + '*';
        } else {
            elem.textContent = `Player ${playerNumber + 1}`;
        }
    } else if (guessNumber === 3) {
        if (playerNumber > 0) {
            elem.textContent = playerName[0] + '*';
        } else {
            elem.textContent = `Player ${playerNumber + 1}`;
        }
    } else if (guessNumber === 4) {
        elem.textContent = playerName[0] + '*';
    } else {
        elem.textContent = playerName;
    }
}

function populateScore(teamData, guessNumber) {
    if (teamData === null) {
        teamData = JSON.parse(localStorage.getItem("teamData"));
    }

    let playerNames = Object.keys(teamData["players"]);
    playerNames = playerNames.sort((a, b) => teamData["players"][b]["score"] - teamData["players"][a]["score"]);
    for (let i = 0; i < 3; i++) {
        let playerData = teamData["players"][playerNames[i]];
        const playerRow = document.getElementById(`player-${i + 1}`);
        playerRow.textContent = "";
        
        const nameElem = playerRow.appendChild(document.createElement("th"));
        nameElem.setAttribute("scope", "row");
        setPlayerName(nameElem, playerNames[i], i, guessNumber);

        const scoreElem = playerRow.appendChild(document.createElement("td"));
        scoreElem.textContent = playerData["score"];
        
        const goalElem = playerRow.appendChild(document.createElement("td"));
        goalElem.textContent = playerData["goals"];

        const assistElem = playerRow.appendChild(document.createElement("td"));
        assistElem.textContent = playerData["assists"];

        const saveElem = playerRow.appendChild(document.createElement("td"));
        saveElem.textContent = playerData["saves"];

        const shotElem = playerRow.appendChild(document.createElement("td"));
        shotElem.textContent = playerData["shots"];

        const demoElem = playerRow.appendChild(document.createElement("td"));
        demoElem.textContent = playerData["demos"];
    }
}

function addGameValues(gameData, t1Row, t2Row, otRow) {
    const winStyle = "color: green; font-weight: bold;";
    const loseStyle = "color: red;"

    const t1Score = t1Row.appendChild(document.createElement("td"));
    t1Score.textContent = gameData[0];
    const t2Score = t2Row.appendChild(document.createElement("td"));
    t2Score.textContent = gameData[1];

    if (gameData[0] > gameData[1]) {
        t1Score.setAttribute("style", winStyle);
        t2Score.setAttribute("style", loseStyle);
    } else {
        t1Score.setAttribute("style", loseStyle);
        t2Score.setAttribute("style", winStyle);
    }

    const otLen = otRow.appendChild(document.createElement("td"));
    if (gameData[2] !== null) {
        if (gameData[2][0] !== '+') {
            otLen.textContent = '+' + gameData[2];
        } else {
            otLen.textContent = gameData[2];
        }
    }
}

function addTimoutColumn(headRow, takeRow, notRow, footRow) {
    const toHead = headRow.appendChild(document.createElement("th"));
    toHead.textContent = "TO";

    const toVal = takeRow.appendChild(document.createElement("td"));
    toVal.textContent = "X";
    notRow.appendChild(document.createElement("td"));

    footRow.appendChild(document.createElement("td"));
}

function getTeamName(teamName, guessTeam, guessNumber) {
    if (teamName === guessTeam) {
        return "(?)";
    } else {
        if (guessNumber === 0) {
            return "Opp. Team";
        } else if (guessNumber === 1) {
            return teamName[0] + "*";
        } else if (guessNumber === 2) {
            let nameString = teamName[0] + "-".repeat(teamName.length - 1);
            let currIdx = teamName.indexOf(" ", 0);
            while (currIdx !== -1) {
                nameString = setCharAt(nameString, currIdx, " ");
                currIdx = teamName.indexOf(" ", currIdx + 1);
            }
            return nameString;
        } else {
            return teamName;
        }
    }
}

function setSeriesTitle(elem, seriesData, guessTeam, guessNumber) {
    if (guessNumber === 0) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.textContent = `Stage ? | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else if (guessNumber === 1) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.textContent = `${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else if (guessNumber === 2) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.textContent = `${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.textContent = `${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    }
}

function setSeriesTeams(elemOne, elemTwo, seriesData, guessTeam, guessNumber) {
    if (guessNumber === 0) {
        elemOne.textContent = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.textContent = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else if (guessNumber === 1) {
        elemOne.textContent = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.textContent = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else if (guessNumber === 2) {
        elemOne.textContent = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.textContent = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else {
        elemOne.textContent = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.textContent = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    }
}

function setSeriesInfo(elem, seriesData, guessNumber) {
    if (guessNumber === 0) {
        elem.textContent = "Casters: ? | Date: ?"
    } else if (guessNumber < 4) {
        elem.textContent = `${seriesData["casters"].join(" & ")} | Date: ?`;
    } else {
        elem.textContent = `${seriesData["casters"].join(" & ")} | ${seriesData["date"]}`;
    }
}

function populateSeries(seriesData, guessNumber) {
    const seriesAccordion = document.getElementById("series-accordion");
    seriesAccordion.textContent = "";

    let guessTeam = localStorage.getItem("teamName");
    if (seriesData === null) {
        seriesData = JSON.parse(localStorage.getItem("seriesData"));
    }
    for (let i = 0; i < seriesData.length; i++) {
        let data = seriesData[i];
        let idString = `series${i}`;
        
        const templateBase = document.getElementById("seriesTemplate");
        const seriesTemplate = templateBase.content.cloneNode(true);

        const header = seriesTemplate.querySelector("button");
        header.setAttribute("data-bs-target", "#" + idString);
        header.setAttribute("aria-controls", idString);
        setSeriesTitle(header, data, guessTeam, guessNumber);

        const collapse = seriesTemplate.querySelector(".accordion-collapse");
        collapse.setAttribute("id", idString);

        const body = seriesTemplate.querySelector(".accordion-body");
        const tableHead = body.querySelector("thead");
        const headRow = tableHead.appendChild(document.createElement("tr"));

        const tableBody = body.querySelector("tbody");
        const t1Row = tableBody.appendChild(document.createElement("tr"));
        const t2Row = tableBody.appendChild(document.createElement("tr"));

        const tableFoot = body.querySelector("tfoot");
        const otRow = tableFoot.appendChild(document.createElement("tr"));

        for (let j = 0; j < data["games"].length; j++) {
            if (j === 0) {
                headRow.appendChild(document.createElement("th"));
                
                const t1Name = t1Row.appendChild(document.createElement("th"));
                const t2Name = t2Row.appendChild(document.createElement("th"));
                setSeriesTeams(t1Name, t2Name, data, guessTeam, guessNumber);

                const otName = otRow.appendChild(document.createElement("td"));
                otName.textContent = "OT";
            }

            const gameHead = headRow.appendChild(document.createElement("th"));
            gameHead.textContent = `G${j + 1}`;

            addGameValues(data["games"][j], t1Row, t2Row, otRow);

            if (data["timeout"][0] === j) {
                addTimoutColumn(headRow, t1Row, t2Row, otRow);
            }
            if (data["timeout"][1] === j) {
                addTimoutColumn(headRow, t2Row, t1Row, otRow);
            }
        }

        const info = body.querySelector("p");
        setSeriesInfo(info, data, guessNumber);

        seriesAccordion.appendChild(seriesTemplate);
    }
}

function getRound() {
    let RLCS_URL = "http://localhost:3000/rlcsdle"

    fetch(RLCS_URL, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        localStorage.setItem("guessNumber", "0");
        localStorage.setItem("eventID", response[0][0]);
        localStorage.setItem("eventURL", response[0][1]);
        localStorage.setItem("teamName", response[0][2]);
        localStorage.setItem("teamData", JSON.stringify(response[0][3]));
        localStorage.setItem("seriesData", JSON.stringify(response[1]));

        populateSeries(response[1], 0);
        populateScore(response[0][3], 0);
        console.log(0);
    });
    
}

function addGuessSection(elem, select, answer) {
    elem.setAttribute("class", "col");
    if (select.value === answer) {
        elem.textContent = select.value + " ✅";
        return true;
    } else {
        elem.textContent = select.value + " ❌";
        return false;
    }
}

function checkGuess() {
    let answer = localStorage.getItem("eventID").split("|");

    const guessList = document.getElementById("guess-list");
    const templateBase = document.getElementById("guessTemplate");
    const guessTemplate = templateBase.content.cloneNode(true);
    const guessElem = guessTemplate.querySelector(".row");
    
    const seasonSelect = document.getElementById("seasonSelect");
    const seasonBox = guessElem.appendChild(document.createElement("div"));
    let hasSeason = addGuessSection(seasonBox, seasonSelect, answer[0]);
    
    const splitSelect = document.getElementById("splitSelect");
    const splitBox = guessElem.appendChild(document.createElement("div"));
    let hasSplit = addGuessSection(splitBox, splitSelect, answer[1]);

    const eventSelect = document.getElementById("eventSelect");
    const eventBox = guessElem.appendChild(document.createElement("div"));
    let hasEvent = addGuessSection(eventBox, eventSelect, answer[2]);

    const teamSelect = document.getElementById("teamSelect");
    const teamBox = guessElem.appendChild(document.createElement("div"));
    let hasTeam = addGuessSection(teamBox, teamSelect, answer[3]);

    guessList.appendChild(guessTemplate);

    return hasSeason && hasSplit && hasEvent && hasTeam;
}

testButton.onclick = () => {
    getRound();
}

guessButton.onclick = () => {
    if (checkGuess()) {

    } else {


        let guessNumber = parseInt(localStorage.getItem("guessNumber")) + 1;
        populateSeries(null, guessNumber);
        populateScore(null, guessNumber);

        console.log(guessNumber);
        localStorage.setItem("guessNumber", String(guessNumber));
    }
}