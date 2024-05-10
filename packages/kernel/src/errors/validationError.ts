import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { KernelError } from './kernelError'
import { ErrorCode } from './errorCodes'

export class ValidationError extends KernelError {
    status: number = StatusCodes.BAD_REQUEST
    reason: string = ReasonPhrases.BAD_REQUEST
    code: string | number = ErrorCode.VALIDATION
    constructor(public errors: any = []) {
        super('Invalid request payload')
    }

    get details() {
        return this.errors
    }
}
