const multer = require('multer');
const os = require('node:os')
const fs = require("fs");
const storageFolder = os.tmpdir()+process.env.STORAGE_FOLDER



const storage = multer.diskStorage({

    destination: (req, file, callback) => {

        let path = req.url.replace(process.env["API_BASE_URL"], '/').replace('//','/')

        callback(null, storageFolder+path);
    },

    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        callback(null, name);
    }

})

const filter = (req, file, cb) => {
    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    //console.log("filter", storageFolder+"/"+file['originalname'])
    let path = req.url.replace(process.env["API_BASE_URL"], '/').replace('//','/')

    try {
        if( fs.statSync(storageFolder+path+file['originalname'])) { // will return null is reading performed
            console.log("file already exists :",storageFolder+req.path+file['originalname'])
            cb(null, false)
        }
    } catch (e) { // in case of error that's mean that incoming file can be written on disk
        console.log("file write :",storageFolder+req.path+file['originalname'])
        cb(null, true)
    }
    // You can always pass an error if something goes wrong:
    //cb(new Error('I don\'t have a clue!'))
}



module.exports = multer({storage: storage, fileFilter: filter})
