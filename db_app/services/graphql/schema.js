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
        tags: [String!]
    }

    type LocationTag {
        name: String!
        value: Int!
    }

    type Location {
        point: GeoPoint!
        name: String
        tags: [LocationTag!]!
    }

    type Query {
        getAllLocations: [Location!]!
        getLocationsByTags(tags: [String!]!): [Location!]!
        getPhotos(lat: Float!, lng: Float!): [Photo!]!
    }

    interface MutationResponse {
        code: Int!
        message: String!
    }

    type AddPhotoResponse implements MutationResponse {
        code: Int!
        message: String!
        result: String!
    }

    type RemovePhotoResponse implements MutationResponse {
        code: Int!
        message: String!
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
            tags: [String!]
        ): AddPhotoResponse!

        removePhoto(
            lat: Float!
            lng: Float!
            name: String!
        ): RemovePhotoResponse!
    }
`

export default typeDefs;