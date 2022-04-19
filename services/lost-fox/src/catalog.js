module.exports = () => {
    const entries = new Map()

    const addEntry = entries.set.bind(entries)
    const dropEntry = entries.delete.bind(entries)
    const entryOf = entries.get.bind(entries)
    const entryExists = entries.has.bind(entries)
    const allEntries = () => Array.from(entries.entries())
    const forAllEntries = entries.forEach.bind(entries)

    return { addEntry, dropEntry, entryOf, entryExists, allEntries, forAllEntries }
}
