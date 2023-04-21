// NEVER TRUST USER INPUTS

/**
 * Filter name removing unauthorized symbols.
 */
function filter(name) {

}


/**
 * Check if name of file or folder is valid. Valid mean that contains only a to Z letters, numbers and . - and _ characters.
 */
function acceptable(name) {
    let regex = /^[a-zA-Z0-9._\-]+$/
    return regex.test(name)
}

module.exports = {
    acceptable
}