const os = require("os");
const fs = require("fs");
const {acceptable} = require("./utils/ntui");
const storageFolder = os.tmpdir()+process.env.STORAGE_FOLDER


/**
 * Deal with GET requests. Param can be a folder name, a file name or omitted.
 * Return the content of the folder or file. If omitted return the content of the root folder.
 *
 * @param req
 * @param res
 */
exports.getContent = (req, res) => {

    let path = req.path.replace(process.env["API_BASE_URL"], '/').replace('//','/')
    console.log("req.url",path)

    if (path[path.length-1]==='/') {

        // treat as FOLDER
        const folderContent = fs.readdirSync(storageFolder+path, {encoding:'utf8', withFileTypes:true}).map(dirent => {
            return {
                name:dirent.name,
                isFolder:dirent.isDirectory(),
                size: dirent.isFile() ? fs.statSync(storageFolder+path+dirent.name.toString()).size : 0
            }
        })

        res.json(folderContent)

    } else {
        // treat as a single FILE
        res.contentType('application/octet-stream').json(fs.readFileSync(storageFolder+path, {encoding: 'utf8'}))
    }

}


/**
 * Deal with POST requests. Create a folder if not exists yet.
 *
 * @param req
 * @param res
 */
exports.newFolder = (req, res) => {
    let newFolderName = req.query['name']
    let path = req.path.replace(process.env["API_BASE_URL"], '/').replace('//','/')

    if (acceptable(newFolderName)) {
        try {
            fs.mkdirSync(storageFolder+path+newFolderName)
            res.status(201).json()
            console.log("Nouveau dossier :",storageFolder+path+newFolderName )
        } catch (e) {
            res.status(409).json({message: "Le dossier existe déjà"})
        }

    } else {
        res.status(400).json({message: "Le nom du dossier contient des caractères non autorisés" })
    }

}


/**
 * Deal with DELETE requests. Remove the ressource (file or folder) given by the path.
 *
 * @param req
 * @param res
 */
exports.delContent = (req, res) => {
    let path = req.url.replace(process.env["API_BASE_URL"], '/').replace('//','/')
    let errors = {onFileDelete: null, onFolderDelete: null}


    // try remove as a file
    try {
        fs.rmSync(storageFolder+path, {force: true})
        console.log("Suppression du ficher", path)
    } catch(e) {
        errors.onFileDelete = e
    }

    // try remove as a folder
    try {
        fs.rmSync(storageFolder+path+'/', {force: true, recursive: true})
        console.log("Suppression du dossier", path)
    } catch (e) {
        errors.onFolderDelete = e
    }

    // ALWAYS at list 1 error ! actual error is when both rm failed
    errors.onFileDelete && errors.onFolderDelete
        ? res.status(500).json({errors})
        : res.status(200).send()

}


/**
 * Deal with PUT requests. Create a file with incoming multipart/form-data.
 *
 * @param req
 * @param res
 */
exports.newFile = (req, res) => {
    //console.log("newFile controller",req.file)
    req.file
        ? res.status(201).send()
        : res.status(400).json({message: "Unable to write file. Possible causes : missing file or file already exists"})
}
