const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config({ path: '.env'});
const {init} = require('./init')


// middlewares :
const PathChecker = require('./middleware/PathChecker')
const FileManager = require('./middleware/FileManager');
const Logger = require('./middleware/Logger')


// controllers :
const Controller = require('./Controllers')



// headers setting
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')//, PATCH, OPTIONS');
    next();
});

// joker trap
app.use((req, res, next) => {
    if (req.ip !== "::ffff:127.0.0.1") {
        res.status(200).json({message: "Accès réservé"})
    }
    next()
})

app.use(
    // limit body size to 100kb and JSON.parse compatible
    express.json({limit: "100kb", strict: false}),

    // limit number of query params and to NOT nested queries
    express.urlencoded({parameterLimit:2, extended: false}),

    (req, res, next) => {

        // early catch 404 errors
        PathChecker.check(req, res)

        // request logging
        Logger.request(req)

        next()
    }
);



// routes :
app.get(`${process.env.API_BASE_URL}*`,
    (req, res) => {
    Controller.getContent(req, res)
})
app.post(`${process.env.API_BASE_URL}*`,
    (req, res) => {
    Controller.newFolder(req, res)
})
app.delete(`${process.env.API_BASE_URL}*`,
    (req, res) => {
    Controller.delContent(req, res)
})
app.put(`${process.env.API_BASE_URL}/*`,
    FileManager.single('file'),
    (req, res) => {
    Controller.newFile(req, res)
})


// finally serve frontend
app.use(express.static('frontend'))



module.exports = app;