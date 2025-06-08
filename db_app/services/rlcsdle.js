async function getRandomRound(db) {
    let roundData = []
    let seasonVal = Math.random() > 0.5 ? 2025 : 2024;
    const evQuery = { season: { $eq: seasonVal }};

    //let db = await getConn();
    let eventColl = db.collection("events");
    let eventRes = await eventColl.findOne(evQuery);
    
    const teamName = Object.keys(eventRes["teams"])[Math.floor(Math.random() * 16)]
    let team = eventRes["teams"][teamName];
    let eventData = [eventRes["season"], eventRes["split"], eventRes["region"], eventRes["name"]];
    roundData.push([eventData, eventRes["url"], teamName, team])

    const srQuery = { bc: { $in: team["series"] }};
    let seriesColl = db.collection("series");
    let seriesRes = await seriesColl.find(srQuery).toArray();
    roundData.push(seriesRes);

    return roundData;
}

async function getRoundByRegion(db, regionVal) {
    let roundData = []
    const evQuery = [{ $match: { region: regionVal } }, { $sample: { size: 1 } }];

    //let db = await getConn();
    let eventColl = db.collection("events");
    let eventList = await eventColl.aggregate(evQuery).toArray();
    let eventRes = eventList[0];
    
    const teamIdx = Math.floor(Math.random() * 16)
    let team = eventRes["teams"][teamIdx];
    let eventData = [eventRes["season"], eventRes["split"], eventRes["region"], eventRes["name"]];
    roundData.push([eventData, eventRes["url"], team["name"], team])

    const srQuery = { bc: { $in: team["series"] }};
    let seriesColl = db.collection("series");
    let seriesRes = await seriesColl.find(srQuery).toArray();
    roundData.push(seriesRes);

    return roundData;
}

async function getSeriesFromIds(db, idList) {
    //let db = await getConn();
    let coll = db.collection("series");
    const query = { bc: { $in: idList }};
    let results = await coll.find(query).toArray();

    return results;
}

async function getSeasons(db) {
    //let db = await getConn();
    let coll = db.collection("events");
    let results = await coll.distinct("season");

    return results;
}

async function getSplitsFromSeason(db, seasonVal, regionVal) {
    //let db = await getConn();
    let coll = db.collection("events");
    const query = { season: { $eq: seasonVal }, region: { $eq: regionVal }};
    let results = await coll.distinct("split", query);

    return results;
}

async function getEventsFromSplit(db, seasonVal, splitVal, regionVal) {
    //let db = await getConn();
    let coll = db.collection("events");
    const query = { season: { $eq: seasonVal }, split: { $eq: splitVal }, region: { $eq: regionVal }};
    let results = await coll.distinct("name", query);

    return results;
}

async function getTeamsFromEvent(db, seasonVal, splitVal, regionVal, eventVal) {
    //let db = await getConn();
    let coll = db.collection("events");
    const query = { 
        season: { $eq: seasonVal }, 
        split: { $eq: splitVal },
        region: { $eq: regionVal },
        name: { $eq: eventVal }
    };
    let results = await coll.findOne(query);

    return results["teams"].map((team) => team["name"]);
}

module.exports = {
    getRandomRound, getRoundByRegion, getSeriesFromIds, 
    getSeasons, getSplitsFromSeason, getEventsFromSplit, getTeamsFromEvent
};