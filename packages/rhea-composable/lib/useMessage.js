const { debug, notice } = require('./inspect')('useMessage')
const { nanoid } = require('nanoid')
const { pipe, when, pathOr, complement, cond, T } = require('ramda')
const { toPayload } = require('./errors')

module.exports = (message) => {
    const { correlation_id, reply_to, ttl } = message
    debug('Using message [%s] %o', correlation_id, message)

    const isReplyExpected = () => !!reply_to
    const lookupId = () => correlation_id
    const lifetime = () => ttl

    const inReplyTo = (payload) => ({
        ...payload,
        correlation_id,
        ttl,
        to: reply_to,
        message_id: nanoid(),
    })

    const withSuccessStatus = (success) => (message) => ({
        ...message,
        application_properties: { success },
    })

    const replyOK = (send) => pipe(inReplyTo, withSuccessStatus(true), send)
    const replyError = (send) => pipe(toPayload, inReplyTo, withSuccessStatus(false), send)

    const whenReplyIsExpected = (action) => when(isReplyExpected, action)

    const isSuccessful = () => pathOr(false, ['application_properties', 'success'], message)
    const isError = () => complement(isSuccessful)

    const produceOutcome = ({ onSuccess, onError }) =>
        cond([
            [isSuccessful, onSuccess],
            [isError, onError],
            [T, pipe(notice('Message is inconclusive. Assuming success.'), onSuccess)],
        ])(message)

    return {
        isReplyExpected,
        whenReplyIsExpected,
        replyOK,
        replyError,
        message,
        isSuccessful,
        isError,
        lookupId,
        lifetime,
        produceOutcome,
    }
}
