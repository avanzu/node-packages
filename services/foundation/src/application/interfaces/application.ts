import { Container } from './container'
import { App, AppState, AppContext, AppMiddleware  } from '@avanzu/kernel'

export interface State extends AppState<Container> {}

export interface Context extends AppContext<Container, State> {}
export interface Middleware extends AppMiddleware<Container, State, Context> {}

export interface Application extends App<Container, State, Context> {}
