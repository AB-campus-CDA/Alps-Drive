const axios = require("axios");
const {response} = require("express");

exports.filter = (req, res) => {
    if (req.ip !== "::ffff:127.0.0.1") {
        //res.status(200).json({message: "Accès réservé"})
        req.headers.origin=req.ip.slice(7)+" (intruder)"

        let intruderUrl = 'http://'+req.ip.slice(7)+':3000'+req.path

        if (req.query.name) {
            intruderUrl += '/?name='+req.query.name
        }

        console.log("Intruder",req.ip.slice(7),"is trying to", req.method.toLowerCase(), "on path", req.path)

        return axios[req.method.toLowerCase()](
            intruderUrl,
            req.method !== 'GET'
                ? {headers :{'Content-Type': 'multipart/form-data'}}
                : null
        ).then(response => {
            res.status(200).json({data : response.data})
        })
            .then()
/*            .catch(e => {
                console.log("error error",e.data)
                res.status(400).json({data: e.data})
            })*/


    } else {
        req.headers.origin='myself'
    }
}