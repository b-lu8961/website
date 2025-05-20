const express = require('express');
const router = express.Router();
const rlcsDB = require("../services/rlcsdle");

const Config = require("../config");

function checkCORS(req, res) {
    if (Config.ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.get('/', async (req, res) => {
    checkCORS(req, res);

    let event = await rlcsDB.getRandomEvent();
    res.send(event);
});

router.get('/series/:ids', async (req, res) => {
    checkCORS(req, res);

    let idList = req.params.ids.split("&");
    let series = await rlcsDB.getSeriesFromIds(idList);
    res.send(series);
})

router.get('/region/:region', async (req, res) => {
    
});


module.exports = router;