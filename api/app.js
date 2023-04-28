const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config({ path: '.env'});
const {init} = require('./init')


// middlewares :
const OriginChecker = require('./middleware/OriginChecker')
const PathChecker = require('./middleware/PathChecker')
const FileManager = require('./middleware/FileManager');
const Logger = require('./middleware/Logger')


// controllers :
const Controller = require('./Controllers')


// joker trap
app.use((req, res, next) => {
    OriginChecker.filter(req, res)
    next()
})


// headers setting
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')//, PATCH, OPTIONS');
    res.setHeader('toto', 'un bon gars');
    next();
});


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
        console.log('GET FROM', req.headers.origin)
    Controller.getContent(req, res)
})
app.post(`${process.env.API_BASE_URL}*`,
    (req, res) => {
        console.log('POST FROM', req.headers.origin)
    Controller.newFolder(req, res)
})
app.delete(`${process.env.API_BASE_URL}*`,
    (req, res) => {
        console.log('DELETE FROM', req.headers.origin)
    Controller.delContent(req, res)
})
app.put(`${process.env.API_BASE_URL}/*`,
    FileManager.single('file'),
    (req, res) => {
        console.log('PUT FROM', req.headers.origin)
    Controller.newFile(req, res)
})


// finally serve frontend
app.use(express.static('frontend'))



module.exports = app;