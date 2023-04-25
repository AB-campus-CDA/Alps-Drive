const {readFileSync,
    readdirSync} = require("fs");
const os = require("os");

const storageFolder = os.tmpdir()+process.env.STORAGE_FOLDER

/**
 * Check if path exists. If yes : response is given to the next middleware. If not : response is resolve with error code.
 *
 * @param req
 * @param res
 */
exports.check = (req, res) => {
    let path = req.baseUrl.replace(process.env["API_BASE_URL"], '/')
    let errors = {onFileRead: null, onFolderRead: null}


    // test if is an existing folder
    try {
        readdirSync(storageFolder.concat(path).replace('//','/'), {encoding: 'utf8'})
        //console.log(storageFolder+path, 'is a folder')
    } catch (e) {
        console.error("FOLDER READ ERROR :", storageFolder+path)
        errors.onFolderRead = e
    }

    // test if is an existing file
    try {
        readFileSync(storageFolder+path, {encoding: 'utf8'})
        //console.log(storageFolder+path, 'is a file')
    } catch (e) {
        console.error("FILE READ ERROR :", storageFolder+path)
        errors.onFileRead = e
    }


    // FILE OVERRIDE CONFLICT
    if (req.method === 'PUT' && errors.onFileRead === null) {
        console.error("FILE OVERRIDE")
        res.status(400).json({
            message: "File already exists",
            target: storageFolder+path
        })
    }


    // MISSING FOLDER/FILE
    if ((errors.onFileRead && errors.onFolderRead) && req.method !== 'POST') {
        console.log("something fucked up")
        res.status(404).json({
            message: "Ressource introuvable",
            target: storageFolder.concat(path),
            errors
        })
    }


    // MISSING FOLDER
    if (errors.onFolderRead && res.method === 'POST') {
        res.status(404).json({
            message: "Dossier introuvable",
            target: storageFolder.concat(path,'/').replace('//','/'),
            errors
        })
    }

}