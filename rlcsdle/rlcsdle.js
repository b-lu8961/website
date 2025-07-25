const bootstrap = window.bootstrap;

const dailyButton = document.getElementById("dailyButton");
const randomButton = document.getElementById("randomButton");
const helpButton = document.getElementById("helpButton");
const newGameButton = document.getElementById("newGameButton");

const helpElem = document.getElementById("helpModal");
const randomElem = document.getElementById("randomModal")

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

function getDaily() {
    let DAILY_URL = "v1/daily";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        DAILY_URL = "http://localhost:3000/rlcsdle/" + DAILY_URL
    }

    fetch(DAILY_URL, {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    })
    .then(response => {
        initRound(response);
        localStorage.setItem("dailyNum", response[2].toString());
    })
    .finally(() => {
        window.location.href = "/rlcsdle/daily/";
    });
}

function getRound(regionName="LAN") {
    let RLCS_URL = `v1/region/${regionName}`;
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        RLCS_URL = "http://localhost:3000/rlcsdle/" + RLCS_URL
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

function initRound(response) {
    localStorage.setItem("guessNumber", "0");
    localStorage.setItem("guessLog", "");
    localStorage.setItem("guessResults", "");
    localStorage.setItem("eventID", JSON.stringify(response[0][0]));
    localStorage.setItem("eventURL", response[0][1]);
    localStorage.setItem("teamName", response[0][2]);
    localStorage.setItem("teamData", JSON.stringify(response[0][3]));
    localStorage.setItem("seriesData", JSON.stringify(response[1]));
}

dailyButton.onclick = () => {
    let currDate = new Date();
    if (localStorage.getItem("daily") === currDate.toDateString()) {
        window.location.href = "/rlcsdle/daily/";
    } else {
        getDaily();
    }
}

newGameButton.onclick = () => {
    const regionSelect = document.getElementById("gameRegionSelect");
    getRound(getRegionLabel(regionSelect.value));
}

helpButton.onclick = () => {
    const helpModal = new bootstrap.Modal(helpElem);
    helpModal.show();
}

randomButton.onclick = () => {
    const randomModal = new bootstrap.Modal(randomElem);
    randomModal.show();
}