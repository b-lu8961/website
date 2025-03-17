const bootstrap = window.bootstrap;
const d3 = window.d3;

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

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

function drawHistogram(data) {
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
        .attr("viewBox", [0, 0, width, height])
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
    .then(data => drawHistogram(data))
    .catch(error => {
        console.log(error);
    });
}

function populateCarousel(data) {
    let carouselId = "";
    for (let i = 0; i < data.length; i++) {
        if (i == 0) {
            carouselId = "carouselFirst";
        } else if (i == 1) {
            carouselId = "carouselSecond";
        } else {
            carouselId = "carouselThird";
        }
        const carouselItem = document.getElementById(carouselId);
        const carouselImage = carouselItem.querySelector("img");
        const carouselName = carouselItem.querySelector("h5");
        const carouselInfo = carouselItem.querySelector("p");
        carouselName.textContent = data[i].Name;
        carouselInfo.textContent = `#${i + 1} | ${data[i].Count} movies`;
        if (data[i].Path) {
            carouselImage.setAttribute("src", TMDB_IMAGE_BASE + data[i].Path);
        }
    }
}

function getJobData(jobName) {
    let db_endpoint = `movies/top/${jobName}`;
    if (document.documentURI.startsWith("http://localhost:8000/letterboxd/")) {
        db_endpoint = "http://localhost:3000/" + db_endpoint
    }

    fetch(db_endpoint, {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => populateCarousel(data))
    .catch(error => {
        console.log(error);
    })
}

function drawPieChart(data) {
    const languageDetail = document.getElementById("languageDetail");
    languageDetail.textContent = `${data[0].Name}: ${data[0].Count} movies`;

    const otherLangs = { Name: "Other", ISO: "++", Count: 0 }
    let otherIndex = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].Count <= 4) {
            if (otherIndex === 0) {
                otherIndex = i;
            }
            otherLangs.Count += data[i].Count;
        }
    }
    data = data.slice(0, otherIndex).concat(otherLangs);

    const pieContainer = document.getElementById("pieContainer");
    pieContainer.textContent = "";

    const width = 175;
    const height = 175;
    const margin = 20;
    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [ -width / 2, -height / 2, width, height])
        .attr("preserveAspectRatio", "xMinYMid meet");

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.ISO))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    const pie = d3.pie()
        .sort(null)
        .value(d => d.Count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius((width / 2) - 1);

    const labelRadius = arc.outerRadius()() * 0.8;
    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);
    svg.append("g")
        .attr("stroke", "white")
        .attr("stroke-width", "0.5")
    .selectAll()
    .data(arcs)
    .join("path")
        .attr("fill", d => color(d.data.ISO))
        .attr("d", arc)
        .style("cursor", "pointer")
    .append("title")
        .text(d => `${d.data.Name}: ${d.data.Count}`);

    svg.append("g")
        .attr("text-anchor", "middle")
    .selectAll()
    .data(arcs)
    .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.15).append("tspan")
            .attr("y", "0.3em")
            .style("font-size", "10px")
            .text(d => d.data.ISO));

    svg.selectAll("path").on("click", event => {
        languageDetail.textContent = event.target.textContent + " movies";
    });

    pieContainer.append(svg.node());
}

function getLanguageData() {
    let db_endpoint = `movies/languages`;
    if (document.documentURI.startsWith("http://localhost:8000/letterboxd/")) {
        db_endpoint = "http://localhost:3000/" + db_endpoint
    }

    fetch(db_endpoint, {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => drawPieChart(data))
    .catch(error => {
        console.log(error);
    })
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
            getJobData("directors");
            getLanguageData();
        } else {

        }
    });
});

const carouselList = document.querySelectorAll('.list-group-item-action');
carouselList.forEach(item => {
    item.addEventListener("shown.bs.tab", event => {
        const jobCarousel = document.getElementById("carouselTopList");
        bootstrap.Carousel.getOrCreateInstance(jobCarousel).to(0);
        getJobData(event.target.textContent);
    })
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