import { UseCase } from '@avanzu/kernel'
import { User } from '~/domain/entities'
import { UserRepository } from '~/domain/entities/userRepository'
import { Feature } from '~/domain/interfaces'
import { Authenticator } from '~/domain/services'
import { ReauthenticateInput } from './input'
import { ReauthenticateOutput } from './output'

@UseCase({ id: 'reauthenticate' })
export class ReauthenticateFeature implements Feature<ReauthenticateInput, ReauthenticateOutput> {
    kind: 'reauthenticate' = 'reauthenticate'

    constructor(protected users: UserRepository, protected authenticator: Authenticator) {}

    async invoke(value: ReauthenticateInput): Promise<ReauthenticateOutput> {
        let decoded = this.authenticator.verifyToken(value.token)
        let user = await this.users.findOneOrFail({ id: decoded.sub })

        let accessToken = this.authenticator.createToken(user)
        return { accessToken }
    }
}
