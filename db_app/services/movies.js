const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("./assets/movies.db", sqlite3.OPEN_READONLY);


async function getByRating(rating = 5) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Name, Year FROM movie WHERE Rating = ?`, rating, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    }); 
}

async function getRatingGroup() {
    console.log("test");
    return new Promise((resolve, reject) => {
        db.all("SELECT Rating, COUNT(*) as Count FROM movie GROUP BY Rating", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getYearGroup() {
    console.log("test");
    return new Promise((resolve, reject) => {
        db.all("SELECT CAST(ROUND(Year / 10) * 10 as INTEGER) as Year, COUNT(*) as Count FROM movie GROUP BY ROUND(Year / 10)", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getRuntimeGroup() {
    console.log("test");
    return new Promise((resolve, reject) => {
        db.all("SELECT CAST(ROUND(Runtime / 30) * 30 as INTEGER) as Runtime, COUNT(*) as Count FROM movie GROUP BY ROUND(Runtime / 30)", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    getByRating, 
    getRatingGroup, getYearGroup, getRuntimeGroup
}