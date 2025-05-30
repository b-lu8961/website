const bootstrap = window.bootstrap;

const fetchButton = document.getElementById("test-button");
const newGameButton = document.getElementById("newGameButton");
const guessButton = document.getElementById("guessButton");
const shareButton = document.getElementById("shareButton");

const seasonSelect = document.getElementById("seasonSelect");
const splitSelect = document.getElementById("splitSelect");
const eventSelect = document.getElementById("eventSelect");
const teamSelect = document.getElementById("teamSelect");

const resultModal = document.getElementById("resultModal");

function getRegionLabel(regionName) {
    if (regionName === "LAN") {
        return ""
    } else if (regionName === "EU") {
        return "Europe"
    } else if (regionName === "NA") {
        return "North America"
    } else if (regionName === "OCE") {
        return "Oceania"
    } else if (regionName === "SAM") {
        return "South America"
    } else if (regionName === "MENA") {
        return "Middle East & North Africa"
    } else if (regionName === "APAC") {
        return "Asia-Pacific"
    } else {
        return "Sub-Saharan Africa"
    }
}

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
    } else if (guessNumber < 6) {
        elem.textContent = playerName[0] + '*';
    } else {
        elem.textContent = playerName;
    }
}

function setCoachName(elem, coachName, guessNumber) {
    if (guessNumber < 1) {
        elem.textContent = "Coach";
    } else if (guessNumber < 4) {
        elem.textContent = coachName[0] + "*";
    } else {
        elem.textContent = coachName;
    }
}

function populateScore(teamData, guessNumber) {
    if (teamData === null) {
        teamData = JSON.parse(localStorage.getItem("teamData"));
    }

    let playerData = teamData["players"]
    playerData = playerData.sort((a, b) => a["score"] - b["score"]);
    const scoreBody = document.getElementById("score-body");
    for (let i = 0; i < playerData.length; i++) {
        let currPlayer = playerData[i];
        const playerRow = document.getElementById(`player-${i}`);
        playerRow.textContent = "";
        
        const nameElem = playerRow.appendChild(document.createElement("th"));
        nameElem.setAttribute("scope", "row");
        setPlayerName(nameElem, currPlayer["name"], i, guessNumber);

        const countryElem = playerRow.appendChild(document.createElement("td"));
        countryElem.textContent = guessNumber < 5 ? "?" : currPlayer["country"];

        const scoreElem = playerRow.appendChild(document.createElement("td"));
        scoreElem.textContent = currPlayer["score"];
        
        const goalElem = playerRow.appendChild(document.createElement("td"));
        goalElem.textContent = currPlayer["goals"];

        const assistElem = playerRow.appendChild(document.createElement("td"));
        assistElem.textContent = currPlayer["assists"];

        const saveElem = playerRow.appendChild(document.createElement("td"));
        saveElem.textContent = currPlayer["saves"];

        const shotElem = playerRow.appendChild(document.createElement("td"));
        shotElem.textContent = currPlayer["shots"];

        const demoElem = playerRow.appendChild(document.createElement("td"));
        demoElem.textContent = currPlayer["demos"];
    }

    for (let i = 0; i < teamData["coaches"].length; i++) {
        let currCoach = teamData["coaches"][i];

        const coachRow = document.getElementById(`coach-${i}`);
        coachRow.textContent = "";

        const nameElem = coachRow.appendChild(document.createElement("td"));
        setCoachName(nameElem, currCoach["name"], guessNumber);

        const countryElem = coachRow.appendChild(document.createElement("td"));
        countryElem.textContent = guessNumber < 4 ? "?" : currCoach["country"];
    }
}

function initScore(teamData) {
    const scoreBody = document.getElementById("score-body");
    scoreBody.textContent = "";
    for (let i = 0; i < teamData["players"].length; i++) {
        const playerElem = scoreBody.appendChild(document.createElement("tr"));
        playerElem.setAttribute("id", `player-${i}`);
    }

    const scoreFooter = document.getElementById("score-foot");
    scoreFooter.textContent = "";
    for (let i = 0; i < teamData["coaches"].length; i++) {
        const coachElem = scoreFooter.appendChild(document.createElement("tr"));
        coachElem.setAttribute("id", `coach-${i}`);
    }
    
    populateScore(teamData, 0);
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

function getSeriesResult(series, guessTeam) {
    if (series["teams"][0] === guessTeam) {
        return series["wins"][0] > series["wins"][1] ? "W" : "L";
    } else {
        return series["wins"][1] > series["wins"][0] ? "W" : "L";
    }
}

function getTeamName(teamName, guessTeam, guessNumber) {
    if (teamName === guessTeam) {
        if (guessNumber < 7) {
            return "&nbsp;<strong>???</strong>&nbsp;";
        } else {
            return `&nbsp;<strong>${teamName}</strong>&nbsp;`;
        }
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
    let seriesRes = getSeriesResult(seriesData, guessTeam);
    if (guessNumber === 0) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.innerHTML = `${seriesRes} | Stage ? | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else if (guessNumber === 1) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.innerHTML = `${seriesRes} | ${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else if (guessNumber === 2) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.innerHTML = `${seriesRes} | ${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else if (guessNumber < 6) {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.innerHTML = `${seriesRes} | ${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    } else {
        let teamOne = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        let teamTwo = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
        elem.innerHTML = `${seriesRes} | ${seriesData["stage"]} | ${teamOne} ${seriesData["wins"][0]} - ${seriesData["wins"][1]} ${teamTwo}`;
    }
}

function setSeriesTeams(elemOne, elemTwo, seriesData, guessTeam, guessNumber) {
    if (guessNumber === 0) {
        elemOne.innerHTML = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.innerHTML = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else if (guessNumber === 1) {
        elemOne.innerHTML = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.innerHTML = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else if (guessNumber === 2) {
        elemOne.innerHTML = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.innerHTML = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
    } else {
        elemOne.innerHTML = getTeamName(seriesData["teams"][0], guessTeam, guessNumber);
        elemTwo.innerHTML = getTeamName(seriesData["teams"][1], guessTeam, guessNumber);
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

function addSelectOptions(elem, options) {
    elem.appendChild(document.createElement("option"));
    let sorted = options.sort();
    for (opt of sorted) {
        let optElem = elem.appendChild(document.createElement("option"));
        optElem.textContent = opt;
    }
}

function resetGuesses() {
    const guessList = document.getElementById("guess-list");
    guessList.textContent = "";
    
    seasonSelect.textContent = "";
    splitSelect.setAttribute("disabled", "");
    splitSelect.textContent = "";
    eventSelect.setAttribute("disabled", "");
    eventSelect.textContent = "";
    teamSelect.setAttribute("disabled", "");
    teamSelect.textContent = "";
    
    let SEASON_URL = "http://localhost:3000/rlcsdle/year"
    fetch(SEASON_URL, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }

        return response.json();
    })
    .then(response => {
        addSelectOptions(seasonSelect, response);
    });
}

function getRound(regionName="LAN") {
    let RLCS_URL = `http://localhost:3000/rlcsdle/region/${regionName}`;

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
        localStorage.setItem("eventID", JSON.stringify(response[0][0]));
        localStorage.setItem("eventURL", response[0][1]);
        localStorage.setItem("teamName", response[0][2]);
        localStorage.setItem("teamData", JSON.stringify(response[0][3]));
        localStorage.setItem("seriesData", JSON.stringify(response[1]));

        resetGuesses();
        populateSeries(response[1], 0);
        initScore(response[0][3]);
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
    let eventInfo = JSON.parse(localStorage.getItem("eventID"));
    let teamName = localStorage.getItem("teamName");

    const guessList = document.getElementById("guess-list");
    const templateBase = document.getElementById("guessTemplate");
    const guessTemplate = templateBase.content.cloneNode(true);
    const guessElem = guessTemplate.querySelector(".row");
    
    const seasonSelect = document.getElementById("seasonSelect");
    const seasonBox = guessElem.appendChild(document.createElement("div"));
    let hasSeason = addGuessSection(seasonBox, seasonSelect, String(eventInfo[0]));
    
    const splitSelect = document.getElementById("splitSelect");
    const splitBox = guessElem.appendChild(document.createElement("div"));
    let hasSplit = addGuessSection(splitBox, splitSelect, eventInfo[1]);

    const eventSelect = document.getElementById("eventSelect");
    const eventBox = guessElem.appendChild(document.createElement("div"));
    let hasEvent = addGuessSection(eventBox, eventSelect, eventInfo[3]);

    const teamSelect = document.getElementById("teamSelect");
    const teamBox = guessElem.appendChild(document.createElement("div"));
    let hasTeam = addGuessSection(teamBox, teamSelect, teamName);

    guessList.appendChild(guessTemplate);
    let guessResult = [hasSeason, hasSplit, hasEvent, hasTeam];
    if (localStorage.getItem("guessNumber") === "0") {
        let guessLog = [guessResult];
        localStorage.setItem("guessLog", JSON.stringify(guessLog));
    } else {
        let guessLog = JSON.parse(localStorage.getItem("guessLog"));
        guessLog.push(guessResult);
        localStorage.setItem("guessLog", JSON.stringify(guessLog));
    }

    return hasSeason && hasSplit && hasEvent && hasTeam;
}

seasonSelect.onchange = () => {
    splitSelect.textContent = "";
    if (seasonSelect.value === "") {
        splitSelect.setAttribute("disabled", "");
        eventSelect.setAttribute("disabled", "");
        teamSelect.setAttribute("disabled", "");
        return;
    }
    splitSelect.removeAttribute("disabled");
    teamSelect.textContent = "";
    guessButton.setAttribute("disabled", "");

    let SEASON_URL = "http://localhost:3000/rlcsdle/season/";
    let eventInfo = JSON.parse(localStorage.getItem("eventID"));
    let region = eventInfo[2] === "" ? "NONE" : eventInfo[2];
    let params = `${seasonSelect.value}/${region}`;
    fetch(SEASON_URL + params, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        addSelectOptions(splitSelect, response);
    });
}

splitSelect.onchange = () => {
    eventSelect.textContent = "";
    if (splitSelect.value === "") {
        eventSelect.setAttribute("disabled", "");
        teamSelect.setAttribute("disabled", "");
        return;
    }
    eventSelect.removeAttribute("disabled");
    teamSelect.textContent = "";
    guessButton.setAttribute("disabled", "");

    let SPLIT_URL = "http://localhost:3000/rlcsdle/split/";
    let eventInfo = JSON.parse(localStorage.getItem("eventID"));
    let region = eventInfo[2] === "" ? "NONE" : eventInfo[2];
    let params = `${String(seasonSelect.value)}/${splitSelect.value}/${region}`;
    fetch(SPLIT_URL + params, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        addSelectOptions(eventSelect, response);
    });
}

eventSelect.onchange = () => {
    teamSelect.textContent = "";
    if (eventSelect.value === "") {
        teamSelect.setAttribute("disabled", "");
        return;
    }
    teamSelect.removeAttribute("disabled");

    let EVENT_URL = "http://localhost:3000/rlcsdle/event/";
    let eventInfo = JSON.parse(localStorage.getItem("eventID"));
    let region = eventInfo[2] === "" ? "NONE" : eventInfo[2];
    let params = `${seasonSelect.value}/${splitSelect.value}/${region}/${eventSelect.value}`;
    fetch(EVENT_URL + params, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        addSelectOptions(teamSelect, response);
    });
}

teamSelect.onchange = () => {
    if (teamSelect.value === "") {
        guessButton.setAttribute("disabled", "");
    } else {
        if (parseInt(localStorage.getItem("guessNumber")) < 7) {
            guessButton.removeAttribute("disabled");
        }
    }
};

fetchButton.onclick = () => {
    getRound();

    guessButton.textContent = "Guess (1/6)";
}

newGameButton.onclick = () => {
    const newGameSelect = document.getElementById("gameRegionSelect");
    getRound(getRegionLabel(newGameSelect.value));
}

guessButton.onclick = () => {
    let guessNumber = parseInt(localStorage.getItem("guessNumber")) + 1;
    guessButton.setAttribute("disabled", "");
    if (checkGuess()) {
        populateSeries(null, 10);
        populateScore(null, 10);

        const modalElem = document.getElementById("resultModal")
        modalElem.setAttribute("data-bs-result", "success");
        const resultModal = new bootstrap.Modal(modalElem);
        resultModal.show();
    } else if (guessNumber === 6) {
        // out of guesses
        guessButton.textContent = `Guess (X/6)`;

        const modalElem = document.getElementById("resultModal")
        modalElem.setAttribute("data-bs-result", "fail");
        const resultModal = new bootstrap.Modal(modalElem);
        resultModal.show();
    } else {
        populateSeries(null, guessNumber);
        populateScore(null, guessNumber);

        guessButton.textContent = `Guess (${guessNumber + 1}/6)`;
        localStorage.setItem("guessNumber", String(guessNumber));
    }
}

resultModal.addEventListener("show.bs.modal", event => {
    const modalHeader = document.getElementById("modalHeader");
    const modalIntro = document.getElementById("modalIntro");
    const modalEvent = document.getElementById("modalEvent");
    const modalTeam = document.getElementById("modalTeam");
    //const modalImage = document.getElementById("modalImage");

    const gameResult = resultModal.getAttribute("data-bs-result");
    if (gameResult === "success") {
        modalHeader.textContent = "Congrats!";
        modalIntro.textContent = "You got it! The answer was:";
    } else {
        modalHeader.textContent = "Sorry!";
        modalHeader.textContent = "Better luck next time! The answer was:";
    }

    let eventID = JSON.parse(localStorage.getItem("eventID"));
    modalEvent.textContent = eventID.join(", ");

    let teamName = localStorage.getItem("teamName")
    modalTeam.textContent = teamName;

    // TODO: need new image source
    // let teamData = JSON.parse(localStorage.getItem("teamData"));
    // modalImage.setAttribute("alt", `${teamName} logo`);
    // modalImage.setAttribute("src", "https://liquipedia.net" + teamData["logo"]);
});

shareButton.onclick = () => {
    const guessLog = JSON.parse(localStorage.getItem("guessLog"));
    let copyText = "RLCSdle "
    let guessText = "";
    for (let i = 0; i < guessLog.length; i++) {
        let guess = guessLog[i];
        for (res of guess) {
            if (res) {
                guessText += "🟩";
            } else {
                guessText += "⬛";
            }
        }
        guessText += '\n';

        if (i === 5 && (guess[0] && guess[1] && guess[2] && guess[3])) {
            copyText += "6/6\n\n";
        } else if (i === 5) {
            copyText += "X/6\n\n";
        } else if (i === guessLog.length - 1) {
            copyText += `${i + 1}/6\n\n`;
        } else {
            continue;
        }
    }

    navigator.clipboard.writeText(copyText + guessText);
    alert("Result copied to clipboard.");
}