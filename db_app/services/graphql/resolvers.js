import { existsSync, rmSync, rmdirSync } from 'fs';
import * as path from 'path'
import { CARTOGRAPHIC_IMAGES_PATH, GRAPHQL_AUTH_KEY } from "../../config.js";

function getGeoPoint(lat, lng) {
    return {
        type: "Point",
        coordinates: [lng, lat]
    }
}

const resolvers = {
    Query: {
        getAllLocations: async (_, __, contextValue) => {
            const locations = contextValue.db.collection("locations");
            return await locations.find().toArray();
        },
        getLocationsByTags: async (_, args, contextValue) => {
            const locations = contextValue.db.collection("locations");
            return await locations.find({ "tags.name": { $in: args.tags } }).toArray();
        },
        getPhotos: async (_, args, contextValue) => {
            let geoPoint = getGeoPoint(args.lat, args.lng);
            const photos = contextValue.db.collection("photos");
            return await photos.find({ point: geoPoint }).sort({ displayNum: 1 }).toArray();
        }
    }, 
    Mutation: {
        addPhoto: async (_, args, contextValue) => {
            if (contextValue.auth !== GRAPHQL_AUTH_KEY) {
                return {
                    code: 401,
                    message: "User is not authorized",
                    result: "ERROR"
                };
            }

            const photos = contextValue.db.collection("photos");
            const locations = contextValue.db.collection("locations");
            
            let geoPoint = getGeoPoint(args.lat, args.lng);
            let filter = { point: geoPoint, name: args.name }
            let doc = {
                $set: {
                    point: geoPoint,
                    name: args.name,
                    displayNum: args.displayNum,
                    date: args.date,
                    isExterior: args.isExterior,
                    description: args.description,
                    tags: args.tags
                }
            }
            let options = { upsert: true }
            let updateResult = await photos.updateOne(filter, doc, options)

            let docCount = await locations.countDocuments({ point: geoPoint }, { limit: 1 });
            if (docCount === 1) {
                // Location already exists
                let currLocation = await locations.findOneAndUpdate(
                    { point: geoPoint },
                    { $inc: { "tags.$[elem].value": 1 } }, { arrayFilters: [{"elem.name": { $in: args.tags } }] }
                )

                let locationTags = currLocation.tags.map((tag) => tag.name);
                let tagsToAdd = args.tags.filter((tag) => !locationTags.includes(tag)).map((tag) => Object({name: tag, value: 1}));
                await locations.updateOne({ point: geoPoint }, { $push: { tags: { $each: tagsToAdd } } });
            } else {
                // New Location
                let locTags = args.tags.map((tag) => Object({name: tag, value: 1}));
                await locations.insertOne({
                    point: geoPoint,
                    name: args.locationName,
                    tags: locTags
                });
            }

            return {
                code: 200,
                message: "addPhoto success",
                result: updateResult.upsertedId === null ? "UPDATED" : "INSERTED"
            };
        },
        removePhoto: async (_, args, contextValue) => {
            if (contextValue.auth !== GRAPHQL_AUTH_KEY) {
                return {
                    code: 401,
                    message: "User is not authorized",
                    result: "ERROR"
                };
            }

            const photos = contextValue.db.collection("photos");
            const locations = contextValue.db.collection("locations");
            
            let geoPoint = getGeoPoint(args.lat, args.lng);
            let filter = { point: geoPoint, name: args.name };

            let deleteResult = await photos.findOneAndDelete(filter);
            if (deleteResult !== null) {
                let docCount = await photos.countDocuments({ point: geoPoint });
                if (docCount === 0) {
                    // Location has no more photos
                    await locations.deleteOne({ point: geoPoint });
                } else {
                    // Location has remaining photos
                    await locations.updateOne(
                        { point: geoPoint },
                        [
                            { $set: { 
                                "tags": { 
                                    $map: { 
                                        input: "$tags", 
                                        as: "t", 
                                        in: { 
                                            $cond: [
                                                { $in: ["$$t.name", deleteResult.tags] }, 
                                                { name: "$$t.name", value: { $add: ["$$t.value", -1] } }, 
                                                "$$t"
                                            ] 
                                        } 
                                    } 
                                } 
                            } }, 
                            { $set: { 
                                tags: { 
                                    $filter: { 
                                        input: "$tags", 
                                        as: "t", 
                                        cond: { $gte: ["$$t.value", 1] } 
                                    } 
                                } 
                            } }
                        ]
                    );
                }

                // Delete photo from server
                const dirPath = path.join(
                    CARTOGRAPHIC_IMAGES_PATH,
                    `${Number(args.lat).toFixed(4)},${Number(args.lng).toFixed(4)}`
                );
                if (existsSync(path.join(dirPath, args.name))) {
                    rmSync(path.join(dirPath, args.name));
                    if (docCount === 0) {
                        rmdirSync(dirPath);
                    }

                    return {
                        code: 200,
                        message: "removePhoto success"
                    };
                } else {
                    return {
                        code: 404,
                        message: "Photo removed from database, but not found on server"
                    }
                }
            } else {
                return {
                    code: 404,
                    message: "Photo not found"
                };
            }
        }
    }
};

export default resolvers;