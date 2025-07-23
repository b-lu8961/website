#!/usr/bin/node

const express = require('express');
const mongodb = require("mongodb");

const config = require("./config");

const app = express();
const port = 3000;


const movieRouter = require('./routes/movies');
const rlcsdleRouter = require('./routes/rlcsdle');

app.use(express.text());

app.get('/', (req, res) => {
    res.send("Hello world!!!");
});

app.use('/movies', movieRouter);

app.use('/rlcsdle', rlcsdleRouter);


mongodb.MongoClient.connect(config.MONGO_CONN_STRING)
    .catch(err => console.error(err))
    .then(conn => {
        app.locals.conn = conn;
        app.listen(port, () => {
            console.log(`Website DB app listening on ${port}`);
        });
    });