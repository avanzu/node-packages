import 'reflect-metadata'
import { Constructor, isClass } from './util'

const USECASE_KEY = Symbol('avanzu.kernel.useCase')
const USECASE_INFO = Symbol('avanzu.kernel.useCase:info')
export const USECASE_TAG = 'UseCase'
const useCases = new Map<string, Constructor>()
const resolvers = new Map()

export type UseCaseOptions = {
    id: string
    schema?: any

}

export function UseCase(options: UseCaseOptions): ClassDecorator {
    return function useCaseDecorator(target: Function) {
        if(false === isClass(target)) return

        Reflect.defineMetadata(USECASE_KEY, true, target)
        Reflect.defineMetadata(USECASE_INFO, options, target)
        useCases.set(options.id, target)
    }
}

export function InputResolver(targetUseCase: Constructor | string ) : ClassDecorator {
    return function payloadResolverDecorator(target: Function) {
        resolvers.set(targetUseCase, target)
    }
}

export type UseCaseInfo = UseCaseOptions & {
    useCase: Constructor
    tags: string[]
}

export function getUseCases() : UseCaseInfo[] {
    let entries: UseCaseInfo[] = []
    for (let [id, useCase] of useCases) {
        let info = createInfo(useCase)
        entries.push(info)
    }

    return entries
}

function createInfo(useCase: Constructor<any>) {
    let proto = useCase.prototype
    let ctor = proto.constructor
    let info = Reflect.getMetadata(USECASE_INFO, ctor)
    return {...info, useCase, tags: [ USECASE_TAG ]}
}

export function getUseCase(id: string) : UseCaseInfo {
    if(useCases.has(id)) {
        let useCase = useCases.get(id)
        return createInfo(useCase)
    }
    return null
}

export function getResolver(useCase: Constructor | string) {
    if(resolvers.has(useCase)) {
        return resolvers.get(useCase)
    }

    return null
}