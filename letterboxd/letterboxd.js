const bootstrap = window.bootstrap;
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

    const spinnerSpan = boxdButton.appendChild(document.createElement("span"));
    spinnerSpan.setAttribute("class", "spinner-border spinner-border-sm");
    spinnerSpan.setAttribute("aria-hidden", "true");

    const RSS_URL = `http://localhost:3000/movies/feed/${username}`;
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

document.addEventListener("DOMContentLoaded", () => {
    boxdInput.value = "";
    getFeed("allophony");
});

boxdButton.onclick = () => {
    getFeed(boxdInput.value);
};
boxdInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getFeed(boxdInput.value);
    }
});