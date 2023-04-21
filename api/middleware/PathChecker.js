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
exports.check = (req, res, next) => {
    let path = req.baseUrl.replace(process.env["API_BASE_URL"], '/').replace('//','/')
    let errors = {onFileRead: null, onFolderRead: null}

    // debug log
    if (true) {
        console.log("-------------------------------------------------")
        console.log(req.method)
        console.log('path:', path)
        console.log('name:', req.query['name']) // used by POST
        console.log("-------------------------------------------------")
    }


    // test if is an existing file
    try {
        readFileSync(storageFolder+path, {encoding: 'utf8'})
    } catch (e) {
        errors.onFileRead = e
    }

    // test if is an existing folder
    try {
        readdirSync(storageFolder.concat(path,'/').replace('//','/'), {encoding: 'utf8'})
    } catch (e) {
        errors.onFolderRead = e
    }



    if ((errors.onFileRead && errors.onFolderRead) && req.method !== 'POST') {
        res.status(404).json({
            message: "Ressource introuvable",
            target:storageFolder.concat(path,'(/)'),
            errors
        })
    }

    if (errors.onFolderRead && res.method === 'POST') {
        res.status(404).json({
            message: "Dossier introuvable",
            target: storageFolder.concat(path,'/').replace('//','/'),
            errors
        })
    }

}