const express = require('express');
const xml2js = require('xml2js');
const router = express.Router();
const movieDB = require("../services/movies");

const Config = require("../config");

function checkCORS(req, res) {
    if (Config.BOXD_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.get('/', async (req, res) => {
    const data = await movieDB.getByRating();
    res.json(data);
});

router.get('/rating/:rating', async (req, res) => {
    checkCORS(req, res);
    const data = await movieDB.getByRating(parseFloat(req.params.rating));
    res.json(data);
});

router.get('/feed/:member', async (req, res) => {
    checkCORS(req, res);

    const memberName = req.params.member ? req.params.member : "allophony";
    try {
        const api_res = await fetch(`https://www.letterboxd.com/${memberName}/rss`);
        
        const rss_xml = await api_res.text();
        xml2js.parseString(rss_xml, (err, xml_res) => {
            if (err) {
                console.log(err.message);
                res.send("error");
            } else {
                const entries = xml_res.rss.channel[0].item;
                res.send(entries.slice(0, 4));
            }
        });
    } catch(err) {
        console.log(err.message);
        res.send("error");
    }
});

router.get('/groupby', async (req, res) => {
    checkCORS(req, res);
    
    const groupType = req.query.type ? req.query.type.toLowerCase() : "rating";
    try {
        if (groupType === "rating") {
            const ratingData = await movieDB.getRatingGroup();
            res.json(ratingData);
        } else if (groupType === "decade") {
            const yearData = await movieDB.getYearGroup();
            res.json(yearData);   
        } else if (groupType === "runtime") {
            const runtimeData = await movieDB.getRuntimeGroup();
            res.json(runtimeData);
        } else {
            res.send([]);
        }
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});

router.get("/top/:job", async (req, res) => {
    checkCORS(req, res);

    const jobName = req.params.job ? req.params.job : "Directors";
    try {
        const jobData = await movieDB.getTopJobs(jobName.slice(0, -1));
        res.json(jobData);
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});

router.get("/languages", async (req, res) => {
    checkCORS(req, res);
    try {
        const languageData = await movieDB.getLanguages();
        res.json(languageData);
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});

router.get("/network", async (req, res) => {
    checkCORS(req, res);
    try {
        const networkRows = await movieDB.getNetwork();
        const networkData = { nodes: [], links: [] };
        const actors = {};
        const movies = {};
        const linkData = {};

        networkRows.forEach(elem => {
            if (elem.ActorName in actors) {
                actors[elem.ActorName].count++;
            } else {
                actors[elem.ActorName] = {count: 1, group: elem.Gender};
            }
            if (elem.MovieName in movies) {
                movies[elem.MovieName].forEach(actor => {
                    let key = [actor, elem.ActorName].sort().join("|");
                    if (key in linkData) {
                        linkData[key]++;
                    } else {
                        linkData[key] = 1;
                    }
                });
                movies[elem.MovieName].push(elem.ActorName);
            } else {
                movies[elem.MovieName] = [elem.ActorName];
            }
        });

        for (let actorName in actors) {
            networkData.nodes.push({
                name: actorName, 
                group: actors[actorName].group, 
                count: actors[actorName].count
            });
        }
        for (let key in linkData) {
            let pair = key.split("|");
            networkData.links.push({source: pair[0], target: pair[1], count: linkData[key]});
        }
        console.log(networkData.nodes.length);
        res.json(networkData);
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});

module.exports = router;