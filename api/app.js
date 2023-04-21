const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config({ path: '.env'});
const {init} = require('./init')

// middlewares :
const PathChecker = require('./middleware/PathChecker')

// controllers :
const Controller = require('./Controllers')



// headers setting
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')//, PATCH, OPTIONS');
    next();
});


// limit body size to 100kb and JSON.parse compatible
app.use(express.json({limit: "100kb", strict: false}));


// limit number of query params and to NOT nested queries
app.use(express.urlencoded({parameterLimit:2, extended: false}))


app.get('/', (req, res, next) =>{
    console.log("Incoming request !!!")
    next();
})


app.use(process.env.API_BASE_URL.concat('/*+'), (req, res, next)=>{
    PathChecker.check(req, res, next)
    next()
})


// routes :
app.get(`${process.env.API_BASE_URL}*`, (req, res) => {
    Controller.getContent(req, res)
})
app.post(`${process.env.API_BASE_URL}*`, (req, res) => {
    Controller.newFolder(req, res)
})


// finally serve frontend
app.use(express.static('frontend'))



module.exports = app;