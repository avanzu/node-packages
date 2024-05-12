import { AuthUser, AuthorizationResult, UseCase } from '@avanzu/kernel'
import { Feature } from '~/domain/interfaces'
import { IsGrantedInput as Input, IsGrantedInputSchema as InputSchema } from './input'
import { IsGrantedOutput as Output, IsGrantedOutputSchema as OutputSchema } from './output'

@UseCase({ id: 'isgranted', schema: InputSchema })
export class IsGranted implements Feature<Input, Output> {
    kind: 'isgranted' = 'isgranted'

    constructor(protected authUser: AuthUser) {}

    async invoke(value: Input): Promise<Output> {
        if (this.authUser.isAnonymous()) {
            return AuthorizationResult.DENIED
        }

        return AuthorizationResult.GRANTED
    }
}
