const analyzeButton = document.getElementById("analyzeButton");
const wordGrid = new gridjs.Grid({
        columns: [
            "Frequency", 
            "Number of Words",
            {
                name: "Words",
                formatter: (cell) => gridjs.html(`<div class="overflow-auto" style="max-height: 150px;">${cell}</div>`)
            }
        ],
        pagination: {
            limit: 10
        },
        sort: true,
        resizable: true,
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
    let activeTab = localStorage.getItem("computerTab");
    if (activeTab === "novelTab") {
        const novelSelect = document.getElementById("novelSelect");
        if (novelSelect.value !== "00") {
            analyzeText("example", novelSelect.value);
        }
    } else if (activeTab === "customTab") {
        const customText = document.getElementById("customArea");
        if (customText.value !== "") {
            analyzeText("custom", customText.value);
        }
    } else {
        const fileUpload = document.getElementById("fileInput");
        if (fileUpload.files.length !== 0 && fileUpload.files[0].type === "text/plain") {
            fileUpload.files[0].text()
            .then(data => analyzeText("file", data))
            .catch(error => console.log(error));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    localStorage.setItem("computerTab", "novelTab");
    wordGrid.render(document.getElementById("gridWrapper"));
});

const tabList = document.querySelectorAll('button[data-bs-toggle="tab"]');
tabList.forEach(tab => {
    tab.addEventListener('show.bs.tab', _ => {
        localStorage.setItem("computerTab", tab.id)
    });
});