import { AuthUser } from "~/interfaces";

export class Anonymous implements AuthUser {
    public readonly username: string = 'anonymous'
    public readonly id: symbol =  Symbol('anonymous')
    public readonly authenticated: false

    isAnonymous(): boolean {
        return true
    }
}