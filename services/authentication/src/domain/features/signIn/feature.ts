import { Authenticated, Authenticator, UseCase } from '@avanzu/kernel'
import { Feature } from '~/domain/interfaces'
import { SignInInput, SignInInputSchema } from './input'
import { SignInOutput } from './output'
import { UserRepository } from '~/domain/entities/userRepository'
import {  PasswordHash } from '~/domain/services'
import { InvalidCredentials, PasswordHashMismatch, UserNotFound } from './errors'

@UseCase({ id: 'signin', schema: SignInInputSchema })
export class SignInFeature implements Feature<SignInInput, SignInOutput> {
    kind: 'signin' = 'signin'

    constructor(protected users: UserRepository, protected authenticator: Authenticator) {}

    async invoke(value: SignInInput): Promise<SignInOutput> {
        try {
            let user = await this.users.findOne({ email: value.email }, { populate: ['password', 'salt'] })
            if (null == user) throw new UserNotFound()

            let passwordHash = new PasswordHash(user.salt)

            if (false === (await passwordHash.compare(user.password, value.password)))
                throw new PasswordHashMismatch()

            let authenticated = new Authenticated(user.username, user.id)
            authenticated.token = this.authenticator.createToken(authenticated)

            return authenticated

        } catch (error) {
            if (error instanceof UserNotFound || error instanceof PasswordHashMismatch) {
                throw new InvalidCredentials()
            }
            throw error
        }
    }
}
