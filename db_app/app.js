#!/usr/bin/node

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

import cors from 'cors';
import express, { text, json } from 'express';
import { MongoClient } from 'mongodb';

import { MONGO_CONN_STRING } from './config.js';

const app = express();
const port = 3000;

import calvinoRouter from './routes/calvino.js';
import movieRouter from './routes/movies.js';
import rlcsdleRouter from './routes/rlcsdle.js';
import photoRouter from './routes/photos.js';

import typeDefs from './services/graphql/schema.js';
import resolvers from './services/graphql/resolvers.js';

const apolloServer = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers
});
await apolloServer.start();

app.use(text());

app.get('/', (req, res) => {
    res.send("Hello world!!!");
});

app.use('/movies', movieRouter);

app.use('/rlcsdle/v1', rlcsdleRouter);

app.use('/calvino', calvinoRouter);

app.use('/graphql', cors(), json(), expressMiddleware(apolloServer, {
    context: async ({ req }) => ({
        auth: req.headers.authorization,
        db: req.app.locals.conn.db("cartographic")
    })
}));

app.use('/carto-photos', photoRouter)

MongoClient.connect(MONGO_CONN_STRING)
    .catch(err => console.error(err))
    .then(conn => {
        app.locals.conn = conn;
        app.listen(port, () => {
            console.log(`Website DB app listening on ${port}`);
        });
    });