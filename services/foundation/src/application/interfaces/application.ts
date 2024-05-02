import * as Avanzu from '@avanzu/kernel'
import { Services } from './services';
import { ConfigValues } from './configuration'

export type Config = Avanzu.Configuration<ConfigValues>

export interface Container extends Avanzu.Container<Services> {}

export interface State extends Avanzu.AppState<Container> {}

export interface Context extends Avanzu.AppContext<Container, State> {}

export interface Middleware extends Avanzu.AppMiddleware<Container, State, Context> {}

export interface Application extends Avanzu.App<Container, State, Context> {}
