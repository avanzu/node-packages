const panic = (message) => (context) =>
    Promise.reject(Object.assign(new Error(message), { context }))

const defaults = {
    name: '',
    id: '',
    create: panic(`Not Implemented`),
    update: panic(`Not Implemented`),
    remove: panic(`Not Implemented`),
    search: panic(`Not Implemented`),
    fetch: panic(`Not Implemented`),
}

module.exports = (spec) => ({ ...defaults, ...spec })
