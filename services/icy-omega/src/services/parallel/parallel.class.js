/* eslint-disable no-unused-vars */
const Character = require('../../../__fixtures__/potter-characters.json')
const Spell = require('../../../__fixtures__/spells.json')
const threads = require('../../threads')
const { splitEvery } = require('ramda')
const { Result } = require('@avanzu/std')
const { GeneralError } = require('@feathersjs/errors')

exports.Parallel = class Parallel {
    constructor(options) {
        console.log('number of threads in pool %s', threads.threads.length)

        this.options = options || {}
        this.rawData = {
            PotterVerse: {
                Characters: { Character },
                Spells: { Spell },
            },
        }
    }

    async find(params) {
        const p = threads.run(this.rawData, { name: 'toXML' })

        return (await Result.promised(p))
            .mapErr((e) => (console.log(e), new GeneralError(e)))
            .promise()
    }

    async get(id, params) {
        return threads.run({ RunTime: threads.runTime }, { name: 'toXML' })
    }

    async create(data, params) {
        if (Array.isArray(data)) {
            return Promise.all(data.map((current) => this.create(current, params)))
        }

        return data
    }

    async update(id, data, params) {
        return data
    }

    async patch(id, data, params) {
        return data
    }

    async remove(id, params) {
        return { id }
    }
}
