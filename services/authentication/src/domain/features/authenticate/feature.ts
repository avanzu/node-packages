import { UseCase } from "@avanzu/kernel";
import { User } from "~/domain/entities";
import { UserRepository } from "~/domain/entities/userRepository";
import { Feature } from "~/domain/interfaces";
import { Authenticator } from "~/domain/services";
import { AuthenticateInput } from "./input";

@UseCase({ id: 'authenticate' })
export class AuthenticateFeature implements Feature<AuthenticateInput, User>{
    kind: 'authenticate' = 'authenticate';

    constructor(protected users: UserRepository, protected authenticator: Authenticator) {}

    async invoke(value: AuthenticateInput): Promise<User> {

        let decoded = this.authenticator.verifyToken(value.token)
        let user = await this.users.findOneOrFail({ id: decoded.sub })

        return user
    }
}