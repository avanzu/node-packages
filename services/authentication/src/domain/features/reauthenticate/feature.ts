import { Authenticated, Authenticator, UseCase } from '@avanzu/kernel'
import { UserRepository } from '~/domain/entities/userRepository'
import { Feature } from '~/domain/interfaces'
import { ReauthenticateInput } from './input'
import { ReauthenticateOutput } from './output'

@UseCase({ id: 'reauthenticate' })
export class ReauthenticateFeature implements Feature<ReauthenticateInput, ReauthenticateOutput> {
    kind: 'reauthenticate' = 'reauthenticate'

    constructor(protected users: UserRepository, protected authenticator: Authenticator) {}

    async invoke(value: ReauthenticateInput): Promise<ReauthenticateOutput> {
        let decoded = this.authenticator.verifyToken(value.token)
        let user = await this.users.findOneOrFail({ id: String(decoded.id) })
        user.token = this.authenticator.createToken(decoded)
        return { accessToken: user.token }
    }
}
