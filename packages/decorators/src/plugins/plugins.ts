import { Callables } from './types'
import { IPlugin, Id } from './types'

export class Plugins {
    static entries: Map<Id, Set<IPlugin>> = new Map()
    static cache: Map<any, Callables> = new Map()

    static register(key: Id, plugin: IPlugin) {
        if (false === Plugins.entries.has(key)) {
            Plugins.entries.set(key, new Set())
        }
        Plugins.entries.get(key).add(plugin)
    }

    static getCallables(key: Id, methodName: string): Callables {
        let matches: Callables = { before: [], after: [] }

        if (false === Plugins.entries.has(key)) {
            return matches
        }

        let cacheKey = { key, methodName }

        if (false === Plugins.cache.has(cacheKey)) {
            Plugins.updateCache(methodName, key, cacheKey)
        }

        return Plugins.cache.get(cacheKey)
    }

    private static updateCache(
        methodName: string,
        key: Id,
        cacheKey: { key: Id; methodName: string }
    ) {
        let matches: Callables = { before: [], after: [] }

        let baseName = methodName.at(0).toUpperCase() + methodName.slice(1)
        let beforeName = `before${baseName}`
        let afterName = `after${baseName}`

        let candidates = Array.from(Plugins.entries.get(key))
        for (let candiate of candidates) {
            if (beforeName in candiate) {
                matches.before.push(candiate[beforeName].bind(candiate))
            }
            if (afterName in candiate) {
                matches.after.push(candiate[afterName].bind(candiate))
            }
        }

        Plugins.cache.set(cacheKey, matches)
    }
}
