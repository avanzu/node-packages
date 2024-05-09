import { AuthUser } from '@avanzu/kernel'
import { CurrentUser } from '~/domain'

export class CurrentUserAdapter implements CurrentUser {
    constructor(protected authUser: AuthUser) {
    }
}
