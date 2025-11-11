import { Router } from 'express';
const router = Router();
import { analyzeText } from '../services/calvino.js';

import { ALLOWED_ORIGINS } from "../config.js";

function checkCORS(req, res) {
    if (ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

router.post('/', async (req, res) => {
    checkCORS(req, res);

    const textData = analyzeText(JSON.parse(req.body));
    res.send(textData);
});

export default router;