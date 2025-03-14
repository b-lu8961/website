const express = require('express');
const xml2js = require('xml2js');
const router = express.Router();
const movies = require("../services/movies");

const Config = require("../config");

router.get('/', async (req, res) => {
    const data = await movies.getByRating();
    res.json(data);
});

router.get('/:rating(d+)', async (req, res) => {
    console.log(req.query);
    const data = await movies.getByRating(parseFloat(req.params.rating));
    res.json(data);
});

router.get('/feed/:member', async (req, res) => {
    const member_name = req.params.member ? req.params.member : "allophony";
    if (Config.BOXD_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
    try {
        const api_res = await fetch(`https://www.letterboxd.com/${member_name}/rss`);
        
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

module.exports = router;