import { LogContext, LogOptions, Logger } from './types'

export class LogBox {
    public static defaults: LogOptions = {
        enter: false,
        error: true,
        exit: true,
        args: false,
        result: false,
        level: 'info',
        enterPrefix: '',
        exitPrefix: '',
        errorPrefix: '',
    }
    protected static $: Logger = console

    protected context: LogContext
    protected options: LogOptions

    static use(logger: Logger) {
        LogBox.$ = logger
    }

    static configure(options: LogOptions) {
        LogBox.defaults = { ...LogBox.defaults, ...options }
    }

    constructor(options?: LogOptions) {
        this.options = { ...LogBox.defaults, ...options }
    }

    public openContext(obj: any, methodName: string, args: any[]) {
        let className = obj.constructor ? obj.constructor.name : `${obj}`
        const context: LogContext = { time: Date.now(), className, methodName }

        if (false === Boolean(this.options.message)) {
            this.options.message = `${className}.${methodName}()`
        }

        if (true === this.options.args) {
            context.args = args
        }

        this.context = context
    }

    protected closeContext() {}

    public logEnter() {
        if (false === this.options.enter) return
        let message: string = `${this.options.enterPrefix} ${this.options.message}`.trim()
        LogBox.$[this.options.level].call(LogBox.$, message, { ...this.context })
    }

    public logExit(result: unknown) {
        if (false === this.options.exit) return
        let message: string = `${this.options.exitPrefix} ${this.options.message}`.trim()
        let context = { ...this.context, ms: Date.now() - this.context.time }
        if (true === this.options.result) {
            context.result = result
        }

        LogBox.$[this.options.level].call(LogBox.$, message, context)
    }

    public logFailure(error: unknown) {
        if (false === this.options.error) return
        let message: string = `${this.options.errorPrefix} ${this.options.message}`.trim()
        let context = { ...this.context, ms: Date.now() - this.context.time, error }
        LogBox.$.error(message, context)
    }
}
