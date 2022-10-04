const Piscina = require('piscina')
const { resolve } = require('path')
const threads = new Piscina({
    filename: resolve(__dirname, 'worker.js'),
    maxThreads: 6,
    minThreads: 4,
})

module.exports = threads
