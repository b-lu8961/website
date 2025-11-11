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
            const photos = contextValue.db.collection("photos");
            return await photos.find({ lat: args.lat, lng: args.lng }).toArray();
        }
    }, 
    Mutation: {
        addPhoto: async (_, args, contextValue) => {
            // TODO
        }
    }
};

export default resolvers;