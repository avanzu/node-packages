import { ErrorCode } from "./errorCodes"

export abstract class KernelError extends Error {
    abstract readonly status: number
    abstract readonly reason: string
    readonly code: ErrorCode | string|number = ErrorCode.VALIDATION
}