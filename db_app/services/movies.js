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

module.exports = {
    getByRating
}