import { StatusCodes } from 'http-status-codes'

export const NodeErrors = {
    ECONNRESET: StatusCodes.SERVICE_UNAVAILABLE,
    ENOTFOUND: StatusCodes.SERVICE_UNAVAILABLE,
    ETIMEDOUT: StatusCodes.GATEWAY_TIMEOUT,
    ECONNREFUSED: StatusCodes.SERVICE_UNAVAILABLE,
    ERRADDRINUSE: StatusCodes.SERVICE_UNAVAILABLE,
    EADDRNOTAVAIL: StatusCodes.SERVICE_UNAVAILABLE,
    ECONNABORTED: StatusCodes.BAD_GATEWAY,
    EHOSTUNREACH: StatusCodes.SERVICE_UNAVAILABLE,
    EAI_AGAIN: StatusCodes.SERVICE_UNAVAILABLE,
}

export type NodeError = keyof typeof NodeErrors