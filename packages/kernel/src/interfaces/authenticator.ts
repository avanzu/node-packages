import { AuthUser, AuthenticatedUser } from "./app";

export interface Authenticator {
    createToken(user: AuthUser): string;
    verifyToken(token: string): AuthenticatedUser;
}