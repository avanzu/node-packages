const { LocalStrategy } = require('@feathersjs/authentication-local')
const Piscina = require('piscina')
const { resolve } = require('path')
const get = require('lodash/get')
const { NotAuthenticated } = require('@feathersjs/errors')
const debug = require('debug')('@feathersjs/authentication/local-thread')
const { Result } = require('@avanzu/std')

exports.LocalThreadedStrategy = class LocalThreadedStrategy extends LocalStrategy {
    constructor() {
        super()
        this.pool = new Piscina({ filename: resolve(__dirname, 'bcrypt.js') })
    }

    async comparePassword(entity, password) {
        const { entityPasswordField, errorMessage } = this.configuration
        // find password in entity, this allows for dot notation
        const hash = Result.fromNullable(get(entity, entityPasswordField))
            .mapErr(() => new NotAuthenticated(errorMessage))
            .unwrap()

        debug('Verifying password')

        return Result.fromBoolean(await this.pool.run({ password, hash }, { name: 'compare' }))
            .mapErr(() => new NotAuthenticated(errorMessage))
            .unwrap()
    }

    // eslint-disable-next-line no-unused-vars
    async hashPassword(password, _params) {
        return this.pool.run({ password, hashSize: this.configuration.hashSize }, { name: 'hash' }) // .hash(password, this.configuration.hashSize)
    }
}
