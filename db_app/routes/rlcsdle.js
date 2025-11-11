import { Router } from 'express';

import { getRandomRound, getDailyRound, getRoundByRegion, getSeriesFromIds, getSeasons, getSplitsFromSeason, getEventsFromSplit, getTeamsFromEvent, addDailyResult } from "../services/rlcsdle.js";

import { ALLOWED_ORIGINS } from "../config.js";

const router = Router();

function checkCORS(req, res) {
    if (ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.get('/', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let roundData = await getRandomRound(db);
    res.send(roundData);
});

router.get('/daily', async (req, res) => {
    checkCORS(req, res);
    const conn = req.app.locals.conn;
    let roundData = await getDailyRound(conn);
    res.send(roundData);
});

router.get('/region/:name', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let regionParam = req.params.name === "LAN" ? "" : req.params.name;
    let roundData = await getRoundByRegion(db, regionParam);
    res.send(roundData);
});

router.get('/series/:ids', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let idList = req.params.ids.split("&");
    let series = await getSeriesFromIds(db, idList);
    res.send(series);
})

router.get('/year', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonList = await getSeasons(db);
    res.send(seasonList);
})

router.get('/season/:num/:region', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let splitList = await getSplitsFromSeason(db, parseInt(req.params.num), regionParam);
    res.send(splitList);
});

router.get('/split/:season/:split/:region', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonParam = parseInt(req.params.season);
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let eventList = await getEventsFromSplit(db, seasonParam, req.params.split, regionParam);
    res.send(eventList);
});

router.get('/event/:season/:split/:region/:name', async (req, res) => {
    checkCORS(req, res);

    const db = req.app.locals.conn.db("rlcs");
    let seasonParam = parseInt(req.params.season);
    let regionParam = req.params.region === "NONE" ? "" : req.params.region;
    let eventList = await getTeamsFromEvent(db, seasonParam, req.params.split, regionParam, req.params.name);
    res.send(eventList);
});

router.post('/daily', async (req, res) => {
    checkCORS(req, res);
    const conn = req.app.locals.conn;
    let indexParam = parseInt(req.body);
    let dailyStats = await addDailyResult(conn, indexParam);
    res.send(dailyStats);
});

export default router;