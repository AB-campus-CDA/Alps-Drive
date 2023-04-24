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
/*        console.log('req path:', req.path)
        console.log('url:', req.url)
        console.log('baseUrl:', req.baseUrl)*/
        //console.log('name:', req.query['name']) // used by POST
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
        res.status(404).json({
            message: "Ressource introuvable",
            target: storageFolder.concat(path,'(/)'),
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