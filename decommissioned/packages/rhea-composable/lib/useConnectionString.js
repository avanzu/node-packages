const { when, is } = require('ramda')

module.exports = () => {
    const fromString = (dsn) => {
        const url = new URL(dsn)
        const params = Object.fromEntries(url.searchParams.entries())
        return Object.assign(params, {
            host: url.hostname,
            port: url.port,
            username: url.username,
            password: url.password,
        })
    }

    const parse = when(is(String), fromString)

    return { fromString, parse }
}
