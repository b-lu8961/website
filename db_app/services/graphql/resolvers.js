import { GraphQLError } from "graphql";
import { GRAPHQL_AUTH_KEY } from "../../config.js";

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
            return await locations.find({ tags: { $in: args.tags } }).toArray();
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
                throw new GraphQLError("User is not authorized", {
                    extensions: {
                        code: "UNAUTHORIZED",
                        http: { status: 401 }
                    }
                });
            }

            const photos = contextValue.db.collection("photos");
            const locations = contextValue.db.collection("locations");
            
            let geoPoint = getGeoPoint(args.lat, args.lng);
            let photoId = await photos.insertOne({
                point: geoPoint,
                name: args.name,
                displayNum: args.displayNum,
                date: args.date,
                isExterior: args.isExterior,
                description: args.description,
                tags: args.tags
            })

            let docCount = await locations.countDocuments({ point: geoPoint }, { limit: 1 });
            if (docCount === 1) {
                await locations.updateOne(
                    { point: geoPoint },
                    { 
                        $addToSet: { tags: { $each: args.tags } } 
                    }
                )
            } else {
                await locations.insertOne({
                    point: geoPoint,
                    name: args.locationName,
                    tags: args.tags
                });
            }

            return photoId.insertedId;
        }
    }
};

export default resolvers;