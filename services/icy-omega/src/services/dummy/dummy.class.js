/* eslint-disable no-unused-vars */
const Character = require('../../../__fixtures__/potter-characters.json')
const Spell = require('../../../__fixtures__/spells.json')
const { buildXML } = require('../../buildXML')
const { GeneralError } = require('@feathersjs/errors')

exports.Dummy = class Dummy {
    constructor(options) {
        this.options = options || {}
        this.rawData = {
            PotterVerse: {
                Characters: {
                    Character: Character.map(
                        ({
                            wizard,
                            hogwartsStaff,
                            hogwartsStudent,
                            alive,
                            wand,
                            alternate_names,
                            ...res
                        }) => ({
                            $: { wizard, student: hogwartsStudent, staff: hogwartsStaff, alive },
                            wand: { $: wand },
                            alternateNames: { alternateName: alternate_names },
                            ...res,
                        })
                    ),
                },
                Spells: {
                    Spell: Spell.map(({ name, description }) => ({
                        $: { name },
                        _: description,
                    })),
                },
            },
        }
    }

    async find(params) {
        return buildXML(this.rawData)
            .mapErr((e) => (console.log(e), new GeneralError(e)))
            .promise()
    }

    async get(id, params) {
        return {
            id,
            text: `A new message with ID: ${id}!`,
        }
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
