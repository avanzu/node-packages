import type { SignOptions } from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken'
import { Authenticator } from '~/interfaces/authenticator'
import { AuthUser, AuthenticatedUser } from '../..'
import { Authenticated } from './authenticated'

export type AuthenticatorOptions = {
    jwt: SignOptions,
    secret: string
}

export type JWTPayload = jwt.JwtPayload & {
    preferred_username: string,
}

export class JWTAuthenticator implements Authenticator {

    constructor(protected options: AuthenticatorOptions){}

    createToken(user: AuthUser) {
        if(user.isAnonymous()) {
            //TODO: invent proper kernel error
            throw new Error('create token for anonymous user is not allowed.')
        }

        let payload: JWTPayload = {
            sub: String(user.id),
            preferred_username: user.username,
        }

        let token = jwt.sign(payload, this.options.secret, this.options.jwt)
        user.token = token

        return token
    }

    verifyToken(token: string) : AuthenticatedUser {
        let decoded = jwt.verify(token, this.options.secret)
        if(typeof decoded === 'object') {
            return new Authenticated(decoded.preferred_username, decoded.sub, token)
        }

    }
}

