import { UseCase } from '@avanzu/kernel'
import { Feature } from '~/domain/interfaces'
import { DemoInput as Input, DemoInputSchema as InputSchema } from './input'
import {
  DemoOutput as Output,
  DemoOutputSchema as OutputSchema,
} from './output'
import { Container } from '~/application/interfaces'

@UseCase({
  id: 'demo',
  schema: InputSchema,
})
export class DemoFeature implements Feature<Input, Output> {
  kind: 'demo' = 'demo'

  constructor() {}

  async invoke(value: Input): Promise<Output> {
    return {}
  }
}
