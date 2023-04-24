const multer = require('multer');
const os = require('node:os')
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

});


module.exports = multer({storage: storage})//.single('image');
