import { Next } from 'koa'
import Router from 'koa-router'
import 'reflect-metadata'
import { AppContext, AppMiddleware, Container } from '../interfaces'

const CONTROLLER_KEY = Symbol('avanzu.kernel.controller')
const MIDDLEWARE_KEY = Symbol('avanzu.kernel.middleware')
const BEFORE_MIDDLEWARE_KEY = Symbol('avanzu.kernel.middleware.before')
const AFTER_MIDDLEWARE_KEY = Symbol('avanzu.kernel.middleware.after')
const ROUTE_KEY = Symbol('avanzu.kernel.route')
const HTTP_VERB_KEY = Symbol('avanzu.kernel.httpVerb')

const controllerMap = new Set<Function>()

type Middleware = AppMiddleware<Container, any, any>
type Context = AppContext<Container, any>

export function Controller(prefix: string = '', ...middlewares: Middleware[]): ClassDecorator {
    return function controllerDecorator(target: Function) {
        Reflect.defineMetadata(CONTROLLER_KEY, prefix, target)
        Reflect.defineMetadata(MIDDLEWARE_KEY, middlewares, target)
        controllerMap.add(target)
    }
}

export type HTTPVerb = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'all'

function Route(method: HTTPVerb, route: string, middlewares: Middleware[]): MethodDecorator {
    return function routeDecorator(target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(HTTP_VERB_KEY, method, target, propertyKey)
        Reflect.defineMetadata(ROUTE_KEY, route, target, propertyKey)
        Reflect.defineMetadata(MIDDLEWARE_KEY, middlewares, target, propertyKey)
    }
}

export function Before(...middlewares: Middleware[]): MethodDecorator {
    return function beforeMiddlewareDecorator(target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(BEFORE_MIDDLEWARE_KEY, middlewares, target, propertyKey)
    }
}

export function After(...middlewares: Middleware[]): MethodDecorator {
    return function beforeMiddlewareDecorator(target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(AFTER_MIDDLEWARE_KEY, middlewares, target, propertyKey)
    }
}

export function Get(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('get', route, middlewares)
}
export function Post(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('post', route, middlewares)
}
export function Put(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('put', route, middlewares)
}
export function Patch(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('patch', route, middlewares)
}
export function Delete(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('delete', route, middlewares)
}
export function Head(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('head', route, middlewares)
}
export function All(route: string = '/', ...middlewares: Middleware[]): MethodDecorator {
    return Route('all', route, middlewares)
}

export function getControllers() {
    return Array.from(controllerMap)
}

export type Endpoint = {
    target: any
    route: string
    verb: HTTPVerb
    method: string | symbol
    middlewares: Middleware[]
    before: Middleware[]
    after: Middleware[]
}

export type MountPoint = {
    prefix?: string
    middlewares: Middleware[]
    endpoints: Endpoint[]
}

export function getMountPoints(target: Function) {
    const proto = target.prototype
    const ctor = proto.constructor
    const mount: MountPoint = { endpoints: [], middlewares: [] }

    if (Reflect.hasMetadata(CONTROLLER_KEY, ctor)) {
        mount.prefix = Reflect.getMetadata(CONTROLLER_KEY, ctor)
    }

    if (Reflect.hasMetadata(MIDDLEWARE_KEY, ctor)) {
        mount.middlewares = Reflect.getMetadata(MIDDLEWARE_KEY, ctor)
    }

    for (const method of Object.getOwnPropertyNames(proto)) {
        if (false === Reflect.hasMetadata(ROUTE_KEY, proto, method)) {
            continue
        }

        const  route = Reflect.getMetadata(ROUTE_KEY, proto, method)
        const  endpoint: Endpoint = {
            target,
            route,
            verb: 'all',
            method,
            middlewares: [],
            before: [],
            after: [],
        }

        if (Reflect.hasMetadata(HTTP_VERB_KEY, proto, method)) {
            endpoint.verb = Reflect.getMetadata(HTTP_VERB_KEY, proto, method)
        }

        if (Reflect.hasMetadata(MIDDLEWARE_KEY, proto, method)) {
            endpoint.middlewares = Reflect.getMetadata(MIDDLEWARE_KEY, proto, method)
        }
        if (Reflect.hasMetadata(BEFORE_MIDDLEWARE_KEY, proto, method)) {
            endpoint.before = Reflect.getMetadata(BEFORE_MIDDLEWARE_KEY, proto, method)
        }
        if (Reflect.hasMetadata(AFTER_MIDDLEWARE_KEY, proto, method)) {
            endpoint.after = Reflect.getMetadata(AFTER_MIDDLEWARE_KEY, proto, method)
        }

        mount.endpoints.push(endpoint)
    }

    return mount
}

export function mountControllers(globalPrefix?:string): Router {
    const  root = new Router({ prefix: globalPrefix })
    for (const  controller of getControllers()) {
        const  mountpoints = getMountPoints(controller)
        const  router = new Router({ prefix: mountpoints.prefix })
        for (const  middleware of mountpoints.middlewares) {
            router.use(middleware)
        }

        for (const  endpoint of mountpoints.endpoints) {
            const  handler = createHandler(endpoint)
            const  middlewares = [
                ...endpoint.before,
                ...endpoint.middlewares,
                handler,
                ...endpoint.after,
            ]
            router[endpoint.verb](endpoint.route, ...middlewares)
        }

        root.use(router.routes())
    }
    return root
}

function createHandler(endpoint: Endpoint): Middleware {
    return async function dispatchRequest(context: Context, next: Next) {
        const instance = context.scope.build(endpoint.target)
        await instance[endpoint.method](context, next)
    }
}
