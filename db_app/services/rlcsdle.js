async function getRandomRound(db) {
    let roundData = []
    let seasonVal = Math.random() > 0.5 ? 2025 : 2024;
    const evQuery = { season: { $eq: seasonVal }};

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

function hasAnswer(prevData, currRound) {
    for (let prev of prevData) {
        let prevRound = prev["roundData"][0];
        if (prevRound[0][0] === currRound[0][0] && prevRound[0][1] === currRound[0][1] &&
            prevRound[0][2] === currRound[0][2] && prevRound[0][3] === currRound[0][3] &&
            prevRound[2] === currRound[2]
        ) {
            return true;
        }
    }
    return false;
}

async function getDailyRound(conn) {
    const currDate = new Date();
    
    const daily = conn.db("meta").collection("daily");
    
    let dailyRes = await daily.findOne({ date: { $eq: currDate.toDateString() } });
    if (dailyRes !== null) {
        const dailyData = dailyRes["roundData"].concat(dailyRes["number"]);
        return dailyData;
    } else {
        const prevData = await daily.find().sort({ number: -1 }).limit(30).toArray();
        const roundObj = {
            date: currDate.toDateString(),
            number: prevData[0]["number"] + 1, 
            stats: [0, 0, 0, 0, 0, 0, 0]
        };

        const rlcs = conn.db("rlcs")
        let randomData = await getRoundByRegion(rlcs, "");
        while (hasAnswer(prevData, randomData[0])) {
            randomData = await getRoundByRegion(rlcs, "");
        }
        roundObj["roundData"] = randomData;
        let insertRes = await daily.insertOne(roundObj);

        randomData.push(prevData[0]["number"] + 1);
        return randomData;
    }

}

async function addDailyResult(conn, index) {
    const currDate = new Date();
    const daily = conn.db("meta").collection("daily");

    const updateKey = `stats.${index}`;
    await daily.updateOne({ date: currDate.toDateString() }, { $inc: { [updateKey]: 1 } });

    let dailyRes = await daily.findOne({ date: { $eq: currDate.toDateString() } });
    return dailyRes["stats"];
}

async function getSeriesFromIds(db, idList) {
    let coll = db.collection("series");
    const query = { bc: { $in: idList }};
    let results = await coll.find(query).toArray();

    return results;
}

async function getSeasons(db) {
    let coll = db.collection("events");
    let results = await coll.distinct("season");

    return results;
}

async function getSplitsFromSeason(db, seasonVal, regionVal) {
    let coll = db.collection("events");
    const query = { season: { $eq: seasonVal }, region: { $eq: regionVal }};
    let results = await coll.distinct("split", query);

    return results;
}

async function getEventsFromSplit(db, seasonVal, splitVal, regionVal) {
    let coll = db.collection("events");
    const query = { season: { $eq: seasonVal }, split: { $eq: splitVal }, region: { $eq: regionVal }};
    let results = await coll.distinct("name", query);

    return results;
}

async function getTeamsFromEvent(db, seasonVal, splitVal, regionVal, eventVal) {
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

export {
    getDailyRound, addDailyResult,
    getRandomRound, getRoundByRegion, getSeriesFromIds, 
    getSeasons, getSplitsFromSeason, getEventsFromSplit, getTeamsFromEvent
};