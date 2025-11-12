const modalElem = document.getElementById("photoModal");
const photoCarousel = document.getElementById("photoCarousel")

const GQL_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
};

function getGqlURL() {
    let db_endpoint = "graphql/";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        db_endpoint = "http://localhost:3000/" + db_endpoint
    }
    return db_endpoint;
}

function onPinClick(ev) {
    const lat = Number(ev.latlng.lat).toFixed(4);
    const lng = Number(ev.latlng.lng).toFixed(4);
    const photoQuery = `{
        getPhotos(lat: ${lat}, lng: ${lng}) {
            name
            displayNum
            date
            isExterior
            description
        }
    }`

    const coordStr = `${lat},${lng}`;
    // if (coordStr === localStorage.getItem("coords")) {
    //     return;
    // }

    fetch(getGqlURL(), {
        method: "POST",
        headers: GQL_HEADERS,
        body: JSON.stringify({
            query: photoQuery
        })
    })
    .then(response => response.json())
    .then(res => {
        localStorage.setItem("coords", coordStr);
        photoCarousel.textContent = "";

        const modalTitle = document.getElementById("modalTitle");
        modalTitle.textContent = ev.sourceTarget.options.title;

        for (elem of res.data.getPhotos) {
            const templateBase = document.getElementById("photoSlideTemplate");
            const slideTemplate = templateBase.content.cloneNode(true);

            if (elem.displayNum === 0) {
                const slideDiv = slideTemplate.querySelector("div");
                slideDiv.setAttribute("class", "carousel-item text-center active");
            }

            const imgElem = slideTemplate.querySelector("img");
            const imgPath = "../assets/cartographic/" + coordStr + '/' + elem.name;
            imgElem.setAttribute("src", imgPath);

            const descElem = slideTemplate.querySelector("p");
            descElem.textContent = elem.description;

            photoCarousel.appendChild(slideTemplate);
        }

        const prevButton = document.getElementById("carouselPrev");
        const nextButton = document.getElementById("carouselNext");
        if (res.data.getPhotos.length === 1) {
            prevButton.style.display = "none";
            nextButton.style.display = "none";
        } else {
            prevButton.style.display = "inline-block";
            nextButton.style.display = "inline-block";
        }

        const photoModal = new bootstrap.Modal(modalElem);
        photoModal.show();
    })
    .catch(error => console.log(error));
}

function fetchPins(map, markerLayer) {
    const allQuery = `{
        getAllLocations {
            point {
                coordinates
            }
            name
        }
    }`

    fetch(getGqlURL(), {
        method: "POST",
        headers: GQL_HEADERS,
        body: JSON.stringify({
            query: allQuery
        })
    })
    .then(response => response.json())
    .then(res => {
        for (elem of res.data.getAllLocations) {
            let coords = [elem.point.coordinates[1], elem.point.coordinates[0]];
            let newMarker = L.marker(coords, {
                title: elem.name,
                riseOnHover: true
            })
            newMarker.on('click', onPinClick);
            markerLayer.addLayer(newMarker);
        }

        map.addLayer(markerLayer);
    })
    .catch(error => console.log(error));
}

function initMap() {
    var map = L.map('map').setView([41.882, -87.631], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var markerLayer = L.markerClusterGroup();
    fetchPins(map, markerLayer);
}

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});