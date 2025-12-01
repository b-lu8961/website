import { Router } from 'express';
import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import * as path from 'path'
import { ALLOWED_ORIGINS, CARTOGRAPHIC_IMAGES_PATH, GRAPHQL_AUTH_KEY } from "../config.js";

const router = Router();

function getCoordString(lat, lng) {
    const latStr = Number(lat).toFixed(4);
    const lngStr = Number(lng).toFixed(4);
    return `${latStr},${lngStr}`;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dirName = path.join(CARTOGRAPHIC_IMAGES_PATH, getCoordString(req.body.latitude, req.body.longitude));
        if (!existsSync(dirName)) {
            mkdirSync(dirName);
        }

        cb(null, dirName);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


function checkCORS(req, res) {
    if (ALLOWED_ORIGINS.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Vary", "Origin");
    }
}

const checkAuth = function (req, res, next) {
    if (req.headers.authorization !== GRAPHQL_AUTH_KEY) {
        throw new Error("User is not authorized");
    }
    next();
}

router.get('/:lat/:lng/:name', async (req, res) => {
    checkCORS(req, res);
    
    const imagePath = path.join(CARTOGRAPHIC_IMAGES_PATH, getCoordString(req.params.lat, req.params.lng), req.params.name)
    res.sendFile(imagePath);
});

router.post('/', checkAuth, upload.array('photos'), async (req, res, next) => {
    checkCORS(req, res);
    
    res.status(200).send({ msg: "Succeeded" });
});

router.options('/', async (req, res) => {
    checkCORS(req, res)

    res.header("Access-Control-Allow-Headers", "Authorization");
    res.header("Access-Control-Allow-Methods", "POST");
    res.status(200).send();
});

export default router;