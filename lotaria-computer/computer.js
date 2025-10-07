const analyzeButton = document.getElementById("analyzeButton");
const wordGrid = new gridjs.Grid({
        columns: ["Frequency", "Words"],
        sort: true,
        data: []
});

function analyzeText(type, text) {
    let db_endpoint = "calvino/";
    if (document.documentURI.startsWith("http://localhost:8000/")) {
        db_endpoint = "http://localhost:3000/" + db_endpoint
    }

    fetch(db_endpoint, {
        method: "POST",
        body: JSON.stringify({
            type: type,
            data: text
        })
    })
    .then(response => response.json())
    .then(data => {
        const gridDiv = document.getElementById("gridWrapper");
        gridDiv.textContent = '';
        wordGrid.updateConfig({
            data: data.freqData
        }).forceRender();
    })
    .catch(error => console.log(error));
}

analyzeButton.onclick = () => {
    const novelSelect = document.getElementById("novelSelect");
    if (novelSelect.value !== "00") {
        analyzeText("example", novelSelect.value);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    wordGrid.render(document.getElementById("gridWrapper"));
});


