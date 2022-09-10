const commands = require('./commands')
const mutations = require('./mutations')
module.exports = () => {
    commands()
    mutations()
}
