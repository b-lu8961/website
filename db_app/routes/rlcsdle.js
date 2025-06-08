const express = require('express');

const rlcsDB = require("../services/rlcsdle");
const Config = require("../config");

const router = express.Router();

function checkCORS(req, res) {
    if (Config.ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.get('/', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let roundData = await rlcsDB.getRandomRound(db);
    res.send(roundData);
});

router.get('/region/:name', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let regionParam = req.params.name === "LAN" ? "" : req.params.name;
    let roundData = await rlcsDB.getRoundByRegion(db, regionParam);
    res.send(roundData);
});

router.get('/series/:ids', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let idList = req.params.ids.split("&");
    let series = await rlcsDB.getSeriesFromIds(db, idList);
    res.send(series);
})

router.get('/year', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonList = await rlcsDB.getSeasons(db);
    res.send(seasonList);
})

router.get('/season/:num/:region', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let splitList = await rlcsDB.getSplitsFromSeason(db, parseInt(req.params.num), regionParam);
    res.send(splitList);
});

router.get('/split/:season/:split/:region', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonParam = parseInt(req.params.season);
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let eventList = await rlcsDB.getEventsFromSplit(db, seasonParam, req.params.split, regionParam);
    res.send(eventList);
});

router.get('/event/:season/:split/:region/:name', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonParam = parseInt(req.params.season);
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let eventList = await rlcsDB.getTeamsFromEvent(db, seasonParam, req.params.split, regionParam, req.params.name);
    res.send(eventList);
});

router.get('/region/:region', async (req, res) => {
    
});


module.exports = router;