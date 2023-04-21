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
    //console.log("req.url",req.url.replace(process.env["API_BASE_URL"], '/').replace('//','/'))
    let path = req.url.replace(process.env["API_BASE_URL"], '/').replace('//','/')

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
 */
exports.newFolder = (req, res) => {
    let newFolderName = req.query['name']
    let path = req.path.replace(process.env["API_BASE_URL"], '/').replace('//','/')

    if (acceptable(newFolderName)) {
        try {
            console.log("create new folder",storageFolder+path+newFolderName )
            fs.mkdirSync(storageFolder+path+newFolderName)
            res.status(201).json()
        } catch (e) {
            res.status(500)
        }

    } else {
        res.status(400).json({message: "Le nom du dossier contient des caractères non autorisés" })
    }

}