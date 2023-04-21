const os = require("os");
const fs = require("fs");
const {dummyData} = require("./dummy");
const tmpStorage = os.tmpdir()+process.env["STORAGE_FOLDER"]



/**
 * Check if storage folder exists in OS temporary folder. Creates it if it doesn't exist yet.
 */
function init() {
    if (!checkStorageFolderExists()) {
        createStorageFolder()
        populateStorage()
    }
    console.log("System ready")
}
init()


/**
 * Check if the storage folder exists in the OS temporary folder.
 * @return boolean
 */
function checkStorageFolderExists(){
    console.log(`Vérification de l'existence du dossier ${process.env["STORAGE_FOLDER"]} dans le dossier ${os.tmpdir()} ...`)
    try {
        return !!fs.readdirSync(tmpStorage)
    } catch (e) {
        //console.error(e.message)
        return false
    }
}


/**
 * Create the storage folder in the OS temporary folder.
 * @return void
 */
function createStorageFolder() {
    console.log("Création du dossier de stockage temporaire")
    fs.mkdirSync(tmpStorage)
}


/**
 * Populate storage folder with dummy.js data.
 * @return void
 */
function populateStorage() {
    fs.mkdirSync(`${tmpStorage}/Personnel`)
    fs.writeFileSync(`${tmpStorage}/avis_imposition`, dummyData, {encoding: 'utf8'})
}