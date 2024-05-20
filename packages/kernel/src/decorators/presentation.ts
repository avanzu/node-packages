import { Constructor, isClass } from './util'
import * as Views from '../presentation'

const ERROR_VIEW = Symbol('avanzu.kernel.presentation.errorView')
const views: Map<string | symbol, Constructor> = new Map([[ERROR_VIEW, Views.ErrorView]])

export function ErrorPresenter(): ClassDecorator {
    return function (target: Function) {
        if (isClass(target)) views.set(ERROR_VIEW, target)
    }
}

export function getErrorView(): Constructor<Views.ErrorView> {
    return views.get(ERROR_VIEW)
}
