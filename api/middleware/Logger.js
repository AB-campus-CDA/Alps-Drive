const os = require("os");
const fs = require("fs");
const logFolder = os.tmpdir()+process.env["LOG_FOLDER"]



/**
 * Log request main data in log folder into OS temporary folder
 */
exports.request = (req) => {
    const reqData = {
        time: req.times,
        method: req.method,
        path: req.url,
        IP_user: req.ip
    }

    const d = new Date()
    const fileName = d.getFullYear().toString()+d.getMonth().toString()+d.getDate().toString()+d.getHours().toString()+d.getMinutes().toString()+d.getSeconds().toString()+d.getMilliseconds().toString()

    fs.writeFileSync(logFolder+'/'+fileName, JSON.stringify(reqData), {encoding: 'utf8'})

}