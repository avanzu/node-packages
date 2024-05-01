import { Container as KernelContainer } from '@avanzu/kernel';
import { Services } from './services';
export interface Container extends KernelContainer<Services> {}