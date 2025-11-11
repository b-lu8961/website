import sqlite3 from 'sqlite3';
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

async function getTopJobs(jobName) {
    let query = `SELECT p.Name, p.image_path as Path, COUNT(*) as Count from person p join movie m where instr('|' || m.${jobName} || '|', '|' || p.id || '|') > 0 GROUP BY p.Name ORDER BY Count DESC LIMIT 3`;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getLanguages() {
    return new Promise((resolve, reject) => {
        db.all("SELECT l.Name, l.iso_id as ISO, COUNT(*) as Count from language l join movie m where instr('|' || m.languages || '|', '|' || l.iso_id || '|') > 0 GROUP BY l.Name, l.iso_id ORDER BY Count DESC", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getCountries() {
    return new Promise((resolve, reject) => {
        db.all("SELECT c.Name, c.iso_id as ISO, COUNT(*) as Count, AVG(m.rating) as AvgRating from country c join movie m where instr('|' || m.countries || '|', '|' || c.iso_id || '|') > 0 GROUP BY c.Name, c.iso_id ORDER BY Count DESC", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getMoviesByCountry(countryCode) {
    let query = `SELECT Name, Year, Rating, Watch_Date FROM movie WHERE instr('|' || Countries || '|', '|' || '${countryCode}' || '|') > 0 ORDER BY Name`;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getNetwork() {
    return new Promise((resolve, reject) => {
        db.all("SELECT p.Name as ActorName, p.Gender, m.Name as MovieName from person p join movie m where instr('|' || m.Actors || '|', '|' || p.id || '|') > 0", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getUpdateDate() {
    return new Promise((resolve, reject) => {
        db.all("SELECT date FROM updateDate where Id = 0", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export {
    getByRating, getUpdateDate,
    getRatingGroup, getYearGroup, getRuntimeGroup,
    getTopJobs, getLanguages, getCountries, getMoviesByCountry,
    getNetwork
}