const typeDefs = `
    type Photo {
        lat: Float!
        lng: Float!
        name: String!
        displayNum: Int
        date: String
        isExterior: Boolean
        description: String
        tags: [String]
    }

    type Location {
        lat: Float!
        lng: Float!
        name: String
        tags: [String]
    }

    type Query {
        getAllLocations: [Location]
        getLocationsByTags(tags: [String!]!): [Location]
        getPhotos(lat: Float!, lng: Float!): [Photo]
    }

    input AddPhotoInput {
        lat: Float!
        lng: Float!
        name: String!
        displayNum: Int
        date: String
        isExterior: Boolean
        description: String
        tags: [String]
    }

    type Mutation {
        addPhoto(photo: AddPhotoInput): Photo
    }
`

export default typeDefs;