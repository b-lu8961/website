const mongodb = require("mongodb");

const Config = require("../config");
const client = new mongodb.MongoClient(Config.MONGO_CONN_STRING);

async function getConn() {
    let conn;
    try {
        conn = await client.connect();
    } catch(e) {
        console.error(e);
    }

    return conn.db("rlcs");
}

async function getRandomRound() {
    let roundData = []
    let season = Math.random() > 0.5 ? "2025" : "2024";
    const evQuery = { name: { $regex: season }};

    let db = await getConn();
    let eventColl = db.collection("events");
    let eventRes = await eventColl.findOne(evQuery);
    
    const teamName = Object.keys(eventRes["teams"])[Math.floor(Math.random() * 16)]
    let team = eventRes["teams"][teamName];
    roundData.push([eventRes["name"], eventRes["url"], teamName, team])

    const srQuery = { bc: { $in: team["series"] }};
    let seriesColl = db.collection("series");
    let seriesRes = await seriesColl.find(srQuery).toArray();
    roundData.push(seriesRes);

    return roundData;
}

async function getRandomEvent() {
    let db = await getConn();
    let coll = db.collection("events");
    let results = await coll.find({}).toArray();

    if (Math.random() > 0.5) {
        return results[0];
    } else {
        return results[1];
    }
}

async function getSeriesFromIds(idList) {
    let db = await getConn();
    let coll = db.collection("series");
    const query = { bc: { $in: idList }};
    let results = await coll.find(query).toArray();

    return results;
}

module.exports = {getRandomEvent, getRandomRound, getSeriesFromIds};