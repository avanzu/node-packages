const defaults = {
    name: '',
    id: '',
    execute: () => new Promise((_, reject) => reject(new Error(`Not Implemented`))),
}

module.exports = (spec) => ({ ...defaults, ...spec })
