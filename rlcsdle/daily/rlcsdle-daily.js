const bootstrap = window.bootstrap;
const d3 = window.d3;

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
        return "LAN"
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
    
    populateScore(teamData, parseInt(localStorage.getItem("guessNumber")));
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

function setSeasonOptions() {
    let SEASON_URL = "year";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        SEASON_URL = "http://localhost:3000/rlcsdle/" + SEASON_URL;
    }
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
    
    setSeasonOptions();
}

function initRound(response) {
    localStorage.setItem("guessNumber", "0");
    localStorage.setItem("guessLog", "");
    localStorage.setItem("guessResults", "");
    localStorage.setItem("eventID", JSON.stringify(response[0][0]));
    localStorage.setItem("eventURL", response[0][1]);
    localStorage.setItem("teamName", response[0][2]);
    localStorage.setItem("teamData", JSON.stringify(response[0][3]));
    localStorage.setItem("seriesData", JSON.stringify(response[1]));

    resetGuesses();
    populateSeries(response[1], 0);
    initScore(response[0][3]);
}

function getRound(regionName="LAN") {
    let RLCS_URL = `region/${regionName}`;
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        RLCS_URL = "http://localhost:3000/rlcsdle/" + RLCS_URL;
    }

    fetch(RLCS_URL, {
        method: "GET",
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }

        return response.json();
    })
    .then(response => {
        initRound(response);
    })
    .finally(() => {
        window.location.href = "/rlcsdle/random/";
    });
}

function addGuessSection(elem, guess, answer) {
    elem.setAttribute("class", "col");
    if (guess === answer) {
        elem.textContent = guess + " ✅";
        return true;
    } else {
        elem.textContent = guess + " ❌";
        return false;
    }
}

function restoreGuesses() {
    resetGuesses();
    if (localStorage.getItem("guessLog")) {
        let guessLog = JSON.parse(localStorage.getItem("guessLog"));

        for (guess of guessLog) {
            checkGuess(guess, storeFlag=false);
        }
    }
}

function storeGuess(guessResult, guessValue) {
    if (localStorage.getItem("guessNumber") === "0") {
        let guessResults = [guessResult];
        localStorage.setItem("guessResults", JSON.stringify(guessResults));

        let guessLog = [guessValue];
        localStorage.setItem("guessLog", JSON.stringify(guessLog));
    } else {
        let guessResults = JSON.parse(localStorage.getItem("guessResults"));
        guessResults.push(guessResult);
        localStorage.setItem("guessResults", JSON.stringify(guessResults));

        let guessLog = JSON.parse(localStorage.getItem("guessLog"));
        guessLog.push(guessValue);
        localStorage.setItem("guessLog", JSON.stringify(guessLog));
    }
}

function checkGuess(guessValues, storeFlag=true) {
    let eventInfo = JSON.parse(localStorage.getItem("eventID"));
    let teamName = localStorage.getItem("teamName");

    const guessList = document.getElementById("guess-list");
    const templateBase = document.getElementById("guessTemplate");
    const guessTemplate = templateBase.content.cloneNode(true);
    const guessElem = guessTemplate.querySelector(".row");
    
    const seasonBox = guessElem.appendChild(document.createElement("div"));
    let hasSeason = addGuessSection(seasonBox, guessValues[0], String(eventInfo[0]));
    
    const splitBox = guessElem.appendChild(document.createElement("div"));
    let hasSplit = addGuessSection(splitBox, guessValues[1], eventInfo[1]);

    const eventBox = guessElem.appendChild(document.createElement("div"));
    let hasEvent = addGuessSection(eventBox, guessValues[2], eventInfo[3]);

    const teamBox = guessElem.appendChild(document.createElement("div"));
    let hasTeam = addGuessSection(teamBox, guessValues[3], teamName);

    guessList.appendChild(guessTemplate);

    if (storeFlag) {
        let guessResult = [hasSeason, hasSplit, hasEvent, hasTeam];
        storeGuess(guessResult, guessValues);
    }

    return hasSeason && hasSplit && hasEvent && hasTeam;
}

function drawDailyResults(index, rawValues) {
    let data = [];
    for (let i = 0; i < 7; i++) {
        let key = i === 6 ? "X" : `${i + 1}`;
        let currData = { label: key, value: rawValues[i]};
        if (i === index) {
            currData["current"] = true;
        }
        data.push(currData);
    }

    const histContainer = document.getElementById("barContainer");
    histContainer.textContent = "";

    const width = 200;
    const height = 100;
    const margin = 10;

    const x = d3.scaleBand()
        .domain(data.map((d) => d.label))
        .range([margin, width - margin])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([height - (2 * margin), 2 * margin]);

    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])
        .attr("preserveAspectRatio", "xMinYMid meet");
    
    svg.append("g").selectAll()
    .data(data)
    .join("rect")
        .attr("fill", function (d) {
            if ("current" in d) {
                return "green";
            } else {
                return "steelblue"
            }
        })
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => y(0) - y(d.value))
        .attr("width", x.bandwidth());

    svg.selectAll("text.bar")
        .data(data)
    .enter().append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("x", (d) => x(d.label) + (x.bandwidth() / 2))
        .attr("y", (d) => y(d.value) - 5)
        .text((d) =>  d.value)
        .style("font-size", "0.5em");

    svg.append("g")
        .attr("transform", `translate(0,${height - (2 * margin)})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", width / 2)
            .attr("y", margin + 8)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
    );

    histContainer.append(svg.node());
}

function postDailyScore(index) {
    let POST_URL = "daily";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        POST_URL = "http://localhost:3000/rlcsdle/" + POST_URL;
    }
    fetch(POST_URL, {
        method: "POST",
        body: index.toString()
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        drawDailyResults(index, response);
    });
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

    let SEASON_URL = "season/";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        SEASON_URL = "http://localhost:3000/rlcsdle/" + SEASON_URL;
    }
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

    let SPLIT_URL = "split/";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        SPLIT_URL = "http://localhost:3000/rlcsdle/" + SPLIT_URL;
    }
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

    let EVENT_URL = "event/";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        EVENT_URL = "http://localhost:3000/rlcsdle/" + EVENT_URL;
    }
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

newGameButton.onclick = () => {
    const newGameSelect = document.getElementById("gameRegionSelect");
    getRound(getRegionLabel(newGameSelect.value));
}

guessButton.onclick = () => {
    let guessNumber = parseInt(localStorage.getItem("guessNumber")) + 1;
    guessButton.setAttribute("disabled", "");

    let guessValues = [seasonSelect.value, splitSelect.value, eventSelect.value, teamSelect.value];
    if (checkGuess(guessValues)) {
        // correct guess
        populateSeries(null, 10);
        populateScore(null, 10);
        postDailyScore(guessNumber - 1);
        let currDate = new Date();
        localStorage.setItem("daily", currDate.toDateString());
        localStorage.setItem("guessNumber", "10");

        const modalElem = document.getElementById("resultModal")
        modalElem.setAttribute("data-bs-result", "success");
        const resultModal = new bootstrap.Modal(modalElem);
        resultModal.show();
    } else if (guessNumber === 6) {
        // out of guesses
        postDailyScore(guessNumber);
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
        modalIntro.textContent = "Better luck next time! The answer was:";
    }

    let eventID = JSON.parse(localStorage.getItem("eventID"));
    modalEvent.textContent = eventID.join(", ").replace(" ,", "");

    let teamName = localStorage.getItem("teamName")
    modalTeam.textContent = teamName;

    // TODO: need new image source
    // let teamData = JSON.parse(localStorage.getItem("teamData"));
    // modalImage.setAttribute("alt", `${teamName} logo`);
    // modalImage.setAttribute("src", "https://liquipedia.net" + teamData["logo"]);
});

shareButton.onclick = () => {
    const guessLog = JSON.parse(localStorage.getItem("guessResults"));
    let copyText = `RLCSdle #${localStorage.getItem("dailyNum")} `;
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
};

window.onload = (event) => {
    let guessNumber = parseInt(localStorage.getItem("guessNumber"));
    let currDate = new Date();
    if (localStorage.getItem("daily") === currDate.toDateString()) {
        guessNumber = 10;
        localStorage.setItem("guessNumber", 10);
        guessButton.setAttribute("disabled", "");
    }

    initScore(JSON.parse(localStorage.getItem("teamData")));
    populateSeries(JSON.parse(localStorage.getItem("seriesData")), guessNumber);
    restoreGuesses();
};
