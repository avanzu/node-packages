import { AuthUser, AuthenticatedUser } from '~/interfaces'

export class Authenticated implements AuthenticatedUser {
    readonly authenticated: true = true
    isAnonymous(): boolean {
        return false
    }

    constructor(
        public readonly username: string,
        public readonly id: string | number | symbol,
        public token?: string
    ) {}
}
