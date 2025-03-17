const bootstrap = window.bootstrap;
const d3 = window.d3;

const histSelect = document.getElementById("histSelect");
const boxdButton = document.getElementById("feedButton");
const boxdInput = document.getElementById("feedInput");
const feedErrorToast = document.getElementById("feedErrorToast");

function showErrorToast(error) {
    console.log(error.message);
    const bootstrapToast = bootstrap.Toast.getOrCreateInstance(feedErrorToast);
    bootstrapToast.show();
}

function generateCards(feedData) {
    if (feedData.length === 0) {
        return;
    }    

    const feedContainer = document.getElementById("feedContainer");
    feedContainer.textContent = '';
    for (elem of feedData) {
        const quoteIdx = elem.description[0].indexOf('"');
        const rightPart = elem.description[0].slice(quoteIdx + 1);
        const descParts = rightPart.split("\"/></p> <p>")
        const review = descParts[1].split("<")[0];

        const templateBase = document.getElementById("feedTemplate");
        const cardTemplate = templateBase.content.cloneNode(true);

        const cardImage = cardTemplate.querySelector("img");
        cardImage.setAttribute("src", descParts[0]);
        
        const titleLink = cardTemplate.querySelector("a");
        titleLink.textContent = elem.title[0];
        titleLink.setAttribute("href", elem.link[0]);        

        if (!review.startsWith("Watched on")) {
            const cardReview = cardTemplate.getElementById("cardReview");
            cardReview.textContent = review;
        }

        const cardDate = cardTemplate.querySelector("small");
        cardDate.textContent = "Watched " + elem["letterboxd:watchedDate"][0];

        feedContainer.appendChild(cardTemplate);
    }
}

function getFeed(username) {
    if (username === "") {
        return;
    }
    
    const currentFeed = localStorage.getItem("currentFeed");
    if (username == currentFeed) {
        return;
    }
    localStorage.setItem("currentFeed", username);


    const spinnerSpan = boxdButton.appendChild(document.createElement("span"));
    spinnerSpan.setAttribute("class", "spinner-border spinner-border-sm");
    spinnerSpan.setAttribute("aria-hidden", "true");

    let RSS_URL = `movies/feed/${username}`;
    if (document.documentURI === "http://localhost:8000/letterboxd/") {
        RSS_URL = "http://localhost:3000/" + RSS_URL
    }

    fetch(RSS_URL, {
        method: "GET",
        mode: "cors"
    })
    .then(response => {
        if (!response.ok) {
            showErrorToast();
            return [];
        }
        return response.json();
    })
    .then(data => generateCards(data))
    .catch(error => {
        showErrorToast(error);
    })
    .finally(() => {
        const spinnerSpan = boxdButton.querySelector("span");
        if (spinnerSpan) {
            boxdButton.removeChild(spinnerSpan);
        }

        const feedTitle = document.getElementById("feedTitle");
        feedTitle.textContent = `${username}'s Last Four Watched*`;
    });
}

function visualizeSummary(data) {
    const histContainer = document.getElementById("histContainer");
    histContainer.textContent = "";
    
    let domain = null;
    let key = "";
    let xLabel = "";
    if ("Rating" in data[0]) {
        key = "Rating";
        xLabel = "Stars";
        data = data.splice(1);
        domain = Array.from({length: 10}, (x, i) => (i/2) + 0.5);
    } else if ("Year" in data[0]) {
        key = "Year";
        xLabel = "Decade";
        domain = data.map((d) => d[key]);
    } else {
        key = "Runtime";
        xLabel = "Minutes";
        for (elem of data) {
            if (elem.Runtime === 210) {
                elem.Runtime = "210+";
            } else {
                elem.Runtime += `-${parseInt(elem.Runtime) + 30}`;
            }
        }
        domain = data.map((d) => d[key]);
    }

    const width = 500;
    const height = 300;
    const margin = 20;

    const x = d3.scaleBand()
        .domain(domain)
        .range([margin, width - margin])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.Count)])
        .range([height - (2 * margin), 2 * margin]);

    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 500 300")
        .attr("preserveAspectRatio", "xMinYMid meet");
    
    svg.append("g")
        .attr("fill", "steelblue")
    .selectAll()
    .data(data)
    .join("rect")
        .attr("x", (d) => x(d[key]))
        .attr("y", (d) => y(d.Count))
        .attr("height", (d) => y(0) - y(d.Count))
        .attr("width", x.bandwidth());

    svg.selectAll("text.bar")
        .data(data)
    .enter().append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("x", (d) => x(d[key]) + (x.bandwidth() / 2))
        .attr("y", (d) => y(d.Count) - 10)
        .text((d) =>  d.Count);

    svg.append("g")
        .attr("transform", `translate(0,${height - (2 * margin)})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call((g) => g.append("text")
            .attr("x", width / 2)
            .attr("y", margin + 8)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .text(xLabel)
    );

    histContainer.append(svg.node());
}

function getSummaryData() {
    let db_endpoint = `movies/groupby?type=${histSelect.value}`;
    if (document.documentURI.startsWith("http://localhost:8000/letterboxd/")) {
        db_endpoint = "http://localhost:3000/" + db_endpoint
    }
    fetch(db_endpoint, {
        method: "GET",
    })
    .then(response => response.json())
    .then(data => visualizeSummary(data))
    .catch(error => {
        console.log(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    boxdInput.value = "";
    localStorage.removeItem("currentFeed");
    const activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
        const selectedTab = document.getElementById(activeTab);
        bootstrap.Tab.getOrCreateInstance(selectedTab).show();
    } else {
        const selectedTab = document.getElementById("pills-feed-tab");
        bootstrap.Tab.getOrCreateInstance(selectedTab).show();
    }
});

const pillList = document.querySelectorAll('button[data-bs-toggle="pill"]');
pillList.forEach(pill => {
    pill.addEventListener('show.bs.tab', event => {
        localStorage.setItem("activeTab", pill.id);
        if (pill.id === "pills-feed-tab") {
            if (boxdInput.value === "") {
                getFeed("allophony");
            } else {
                getFeed(boxdInput.value);
            }
        } else if (pill.id === "pills-summary-tab") {
            getSummaryData();
        } else {

        }
    });
});

boxdButton.onclick = () => {
    getFeed(boxdInput.value);
};
boxdInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getFeed(boxdInput.value);
    }
});

histSelect.addEventListener("change", (event) => {
    getSummaryData();
})