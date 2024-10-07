import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { KernelError, ErrorCodes } from '~/errors'
import type { Plugin } from './plugin'

export class PluginAlreadyRegistered extends KernelError {
    status: number = StatusCodes.INTERNAL_SERVER_ERROR
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
    code: string = ErrorCodes.KERNEL

    constructor(protected plugin: Plugin) {
        super(`Plugin ${plugin.name()} is already registered.`)
    }
}

export class CircularDependency extends KernelError {
    status: number = StatusCodes.INTERNAL_SERVER_ERROR
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
    code: string = ErrorCodes.KERNEL

    constructor(
        protected plugin: Plugin,
        protected visiting: string[]
    ) {
        super(`Plugin ${plugin.name()} has a circular dependency.`)
    }

    get details() {
        return {
            plugin: this.plugin.name(),
            visiting: this.visiting,
        }
    }
}
export class MissingDependency extends KernelError {
    status: number = StatusCodes.INTERNAL_SERVER_ERROR
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
    code: string = ErrorCodes.KERNEL

    constructor(
        protected plugin: Plugin,
        protected dependency: string
    ) {
        super(`Plugin ${plugin.name()} depends on ${dependency} which is not provided.`)
    }
}
export class PluginInvocationError extends KernelError {
    status: number = StatusCodes.INTERNAL_SERVER_ERROR
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR
    code: string = ErrorCodes.KERNEL

    constructor(
        protected plugin: Plugin,
        protected error: any
    ) {
        super(`Plugin ${plugin.name()} failed to execute.`)
    }

    get details() {
        return {
            plugin: this.plugin.name(),
            error: String(this.error),
        }
    }
}
