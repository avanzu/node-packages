declare module 'koa-qs' {
    import * as Koa from 'koa'

    namespace koaQs {
        type ParseMode = 'extended' | 'strict' | 'first'
    }

    function koaQs<APP extends Koa<any, any>>(app: APP, mode?: koaQs.ParseMode) : APP

    export = koaQs
}
