const typeDefs = `
    type GeoPoint {
        type: String!
        coordinates: [Float!]!
    }

    type Photo {
        point: GeoPoint!
        name: String!
        displayNum: Int
        date: String
        isExterior: Boolean
        description: String
        tags: [String]
    }

    type Location {
        point: GeoPoint!
        name: String
        tags: [String]
    }

    type Query {
        getAllLocations: [Location!]!
        getLocationsByTags(tags: [String!]!): [Location!]!
        getPhotos(lat: Float!, lng: Float!): [Photo!]!
    }

    type Mutation {
        addPhoto(
            lat: Float!
            lng: Float!
            name: String!
            locationName: String
            displayNum: Int
            date: String
            isExterior: Boolean
            description: String
            tags: [String]
        ): String
    }
`

export default typeDefs;