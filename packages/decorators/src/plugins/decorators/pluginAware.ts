import 'reflect-metadata'
import { PLUGIN_KEY } from "../types";


export type PluginAwareOptions = {
    key?: string;
};

export function PluginAware(options: PluginAwareOptions = {}): ClassDecorator {
    return function (target: Function) {
        let key = options.key ?? target;
        Reflect.defineMetadata(PLUGIN_KEY, key, target);
    };
}
