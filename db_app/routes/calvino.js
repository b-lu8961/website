const express = require('express');
const router = express.Router();
const computer = require('../services/calvino');

const Config = require("../config");

function checkCORS(req, res) {
    if (Config.ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.post('/', async (req, res) => {
    checkCORS(req, res);

    const textData = computer.analyzeText(JSON.parse(req.body));
    res.send(textData);
});

module.exports = router;