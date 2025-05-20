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

module.exports = {getRandomEvent, getSeriesFromIds};