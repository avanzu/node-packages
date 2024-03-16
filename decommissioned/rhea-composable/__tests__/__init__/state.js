const state = new Map()

exports.store = (name, value) => state.set(name, value)
exports.lookup = (name) => state.get(name)
exports.getHost = (name) => state.get(name).getHost()
exports.getPort = (name, port) => state.get(name).getMappedPort(port)
exports.entries = () => Object.fromEntries(state.entries())
