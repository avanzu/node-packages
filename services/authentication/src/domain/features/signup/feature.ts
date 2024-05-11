import { Authenticated, Authenticator, UseCase } from "@avanzu/kernel";
import { Feature } from "~/domain/interfaces";
import { SignUpInput, SignUpInputSchema } from "./input";
import { SignUpOutput } from "./output";
import { UserRepository } from "~/domain/entities/userRepository";
import { EmailTaken } from "./errors";
import { PasswordHash } from "~/domain/services/passwordHash";


@UseCase({ id: 'signup', schema: SignUpInputSchema })
export class SignUpFeature implements Feature<SignUpInput, SignUpOutput>{
    kind: 'signup' = 'signup';

    constructor(protected users: UserRepository, protected authenticator: Authenticator){}

    async invoke(value: SignUpInput): Promise<SignUpOutput> {

        if(0 !== await this.users.count({ email: value.email })) {
            throw new EmailTaken()
        }

        let passwordHash = new PasswordHash()
        let [hash, salt] = await passwordHash.createHash(value.password)
        let user = this.users.create({ email: value.email, password: hash, salt: salt, fullName: value.username, bio: '' })

        await this.users.insert(user)
        let authenticated = new Authenticated(user.fullName, user.id)
        authenticated.token = this.authenticator.createToken(authenticated)

        return authenticated
    }
}