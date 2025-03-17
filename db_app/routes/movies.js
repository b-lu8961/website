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

//SELECT Rating, COUNT(*) FROM movie GROUP BY Rating
//SELECT CAST(ROUND(Year / 5) * 5 as INTEGER), COUNT(*) FROM movie GROUP BY ROUND(Year / 5)
//SELECT CAST(ROUND(Runtime / 30) * 30 as INTEGER), COUNT(*) FROM movie GROUP BY ROUND(Runtime / 30)
//SELECT p.Name, COUNT(*) as MovieCount from person p join movie m where (m.actors LIKE p.ID || '|%' OR m.actors LIKE '%|' || p.id or m.actors LIKE '%|' || p.id || '|%') GROUP BY p.Name ORDER BY MovieCount DESC LIMIT 10
//SELECT p.Name, COUNT(*) as MovieCount from person p join movie m where (m.director LIKE p.ID || '|%' OR m.director = '' || p.id or m.director LIKE '%|' || p.id || '|%') GROUP BY p.Name ORDER BY MovieCount DESC LIMIT 10

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

//SELECT p.Name, COUNT(*) as MovieCount from person p join movie m where (m.actors LIKE p.ID || '|%' OR m.actors LIKE '%|' || p.id or m.actors LIKE '%|' || p.id || '|%') GROUP BY p.Name ORDER BY MovieCount DESC LIMIT 10
//SELECT p.Name, COUNT(*) as MovieCount from person p join movie m where (m.director LIKE p.ID || '|%' OR m.director = '' || p.id or m.director LIKE '%|' || p.id || '|%') GROUP BY p.Name ORDER BY MovieCount DESC LIMIT 10
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

module.exports = router;