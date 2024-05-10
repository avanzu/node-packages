import type { AxiosError } from 'axios'
import { ReasonPhrases, StatusCodes, getReasonPhrase } from 'http-status-codes'
import { KernelError } from '../errors'
import { ErrorCode } from '~/errors/errorCodes'

export class ErrorView {
    public readonly status: number
    public readonly reason: string
    public readonly stack?: string
    private error: Error
    private body: Record<string, any>
    private code: string|number
    constructor(error: unknown) {
        this.error = this.getError(error)
        this.status = this.getStatus()
        this.reason = getReasonPhrase(this.status)
        this.code =  this.createErrorCode()
        this.stack = this.error.stack
        this.body = this.createBody()
    }
    protected createErrorCode(): string | number {
        if('code' in this.error) return String(this.error.code)
        return ErrorCode.KERNEL
    }

    private isError(value: unknown): value is Error {
        return value instanceof Error
    }

    private isString(value: unknown): value is string {
        return typeof value === 'string'
    }

    private isNumber(value: unknown): value is number {
        return typeof value === 'number'
    }

    private isAxiosError(e: Error): e is AxiosError {
        return 'isAxiosError' in e && e.isAxiosError === true
    }

    private normalizeError(e: Error | AxiosError): Error {
        if (false === this.isAxiosError(e)) {
            return e
        }

        let details = {
            baseUrl: e.config?.baseURL,
            url: e.config?.url,
            query: e.config?.params,
            responseCode: e.response?.status || e.code,
        }

        return Object.assign(new Error(e.message), { ...e.toJSON(), details })
    }

    private getError(value: unknown): Error {
        if (this.isError(value)) {
            return this.normalizeError(value)
        }
        if (this.isString(value)) return new Error(value)
        if (this.isNumber(value)) return new Error(getReasonPhrase(value))
        return new Error(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }

    getStatus(): number {
        if ('status' in this.error) return Number(this.error.status)
        if ('statusCode' in this.error) return Number(this.error.statusCode)
        return StatusCodes.INTERNAL_SERVER_ERROR
    }

    private createBody() {
        let details: any = {}

        if ('details' in this.error) {
            details = this.error.details
        }

        let body = {
            errorCode: this.code,
            statusCode: this.status,
            reason: getReasonPhrase(this.status),
            message: this.error.message,
            details,
        }

        return body
    }

    toJSON() {
        return this.body
    }
}