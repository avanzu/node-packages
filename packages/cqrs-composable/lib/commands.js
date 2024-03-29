const { notFound } = require('./errors')

// -------------------------------------------------------------------- REGISTRY
const commands = new Map()

// ---------------------------------------------------------------------- PUBLIC
const addCommand = (command) => commands.set(command.name, command)
const addCommands = (commands) => Object.values(commands).forEach(addCommand)
const commandExists = (name) => commands.has(name)
const getCommand = (name) =>
    new Promise((Ok, Err) => {
        commandExists(name) ? Ok(commands.get(name)) : Err(notFound(`Command "${name}" not found.`))
    })

// --------------------------------------------------------------------- EXPORTS
module.exports = {
    addCommand,
    addCommands,
    commandExists,
    getCommand,
}
