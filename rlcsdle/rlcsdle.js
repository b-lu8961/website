const bootstrap = window.bootstrap;

const testButton = document.getElementById("test-button");

function getEvent() {
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
        console.log(response);
        let team = Object.keys(response["teams"])[Math.floor(Math.random() * 16)];
        getSeries(response["teams"][team]["series"]);
    });
    
}

function populateSeries(seriesData) {
    const seriesAccordion = document.getElementById("series-accordion");
    seriesAccordion.textContent = "";

    for (let i = 0; i < seriesData.length; i++) {
        let data = seriesData[i];
        let idString = `series${i}`;
        
        const templateBase = document.getElementById("seriesTemplate");
        const seriesTemplate = templateBase.content.cloneNode(true);

        const header = seriesTemplate.querySelector("button");
        header.textContent = `${data["stage"]} | ${data["teams"][0]} ${data["wins"][0]} - ${data["teams"][1]} ${data["wins"][1]}`;
        header.setAttribute("data-bs-target", "#" + idString);
        header.setAttribute("aria-controls", idString);

        const collapse = seriesTemplate.querySelector(".accordion-collapse");
        collapse.setAttribute("id", idString);

        const body = seriesTemplate.querySelector(".accordion-body");
        let bodyString = ""
        for (let j = 0; j < data["games"].length; j++) {
            game = data["games"][j];
            if (j == data["games"].length - 1) {
                bodyString += `${game[0]} - ${game[1]}`;
            } else {
                bodyString += `${game[0]} - ${game[1]} | `;
            }
        }
        body.textContent = bodyString;

        seriesAccordion.appendChild(seriesTemplate);
    }
}

function getSeries(seriesIds) {
    let SERIES_URL = "http://localhost:3000/rlcsdle/series/"
    fetch(SERIES_URL + seriesIds.join("&"), {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            return [];
        }

        return response.json();
    })
    .then(response => {
        console.log(response);
        populateSeries(response);
    });
}

testButton.onclick = () => {
    getEvent();
}