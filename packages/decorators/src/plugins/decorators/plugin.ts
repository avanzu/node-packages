


export type PluginOptions = {
    target: string | symbol | Function;
};

export function Plugin(options: PluginOptions): ClassDecorator {
    return function (target: Function) { };
}
