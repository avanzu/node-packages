import { AuthUser, AuthenticatedUser } from "./app";

export interface Authenticator {
    /* TODO: add the missing return type */
    createToken(user: AuthUser): string;
    verifyToken(token: string): AuthenticatedUser;
}