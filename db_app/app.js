#!/usr/bin/node

const express = require('express');

const app = express();
const port = 3000;


const movieRouter = require('./routes/movies');
const rlcsdleRouter = require('./routes/rlcsdle');

app.get('/', (req, res) => {
    res.send("Hello world!!!");
});

app.use('/movies', movieRouter);

app.use('/rlcsdle', rlcsdleRouter);

app.listen(port, () => {
    console.log(`Website DB app listening on ${port}`);
});