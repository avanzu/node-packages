import 'reflect-metadata'

type Constructor<T = any> = new (...args: any[]) => T
const USECASE_KEY = Symbol('avanzu.kernel.useCase')
const CONTAINER_ID = Symbol('avanzu.kernel.containerId')
export const USECASE_TAG = 'UseCase'
const useCases = new Set<Constructor>()

function isClass<T>(value: Function): value is Constructor<T> {
    return value.constructor && typeof value.constructor === 'function'
}

export function UseCase(id?: string): ClassDecorator {
    return function useCaseDecorator(target: Function) {
        if(false === isClass(target)) return
        let containerId = id ?? target.constructor.name

        Reflect.defineMetadata(USECASE_KEY, true, target)
        Reflect.defineMetadata(CONTAINER_ID, containerId, target)
        useCases.add(target)
    }
}

type UseCaseInfo = {
    containerId: string | symbol
    useCase: Constructor
    tags: string[]
}

export function getUseCases() {
    let entries: UseCaseInfo[] = []
    for (let useCase of useCases) {
        let proto = useCase.prototype
        let ctor = proto.constructor
        let containerId = useCase.constructor.name
        if (Reflect.hasMetadata(CONTAINER_ID, ctor)) {
            containerId = Reflect.getMetadata(CONTAINER_ID, ctor)
        }

        entries.push({ containerId, useCase, tags: [USECASE_TAG] })
    }

    return entries
}
