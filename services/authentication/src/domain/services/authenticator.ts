import { User } from "../entities";
import * as jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { promisify } from 'node:util'

export type AuthenticatorOptions = {
    jwt: SignOptions,
    secret: string
}

export class Authenticator {

    constructor(protected options: AuthenticatorOptions){}

    createToken(user: User) {

        let token = jwt.sign({ sub: user.id }, this.options.secret, this.options.jwt)
        user.token = token

        return token
    }

    verifyToken(token: string) : jwt.JwtPayload {
        let decoded = jwt.verify(token, this.options.secret)
        return decoded as jwt.JwtPayload
    }
}