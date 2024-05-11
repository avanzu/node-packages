import { KernelError } from "@avanzu/kernel";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class PasswordHashMismatch extends KernelError {
    status: number = StatusCodes.BAD_REQUEST;
    reason: string = ReasonPhrases.BAD_REQUEST;
    code: string | number = 'PASSWORD_MISMATCH';
}

export class UserNotFound extends KernelError {
    status: number = StatusCodes.NOT_FOUND;
    reason: string = ReasonPhrases.NOT_FOUND;
    code: string | number = 'USER_NOT_FOUND';

}

export class InvalidCredentials extends KernelError {
    status: number = StatusCodes.UNAUTHORIZED;
    reason: string = ReasonPhrases.UNAUTHORIZED;
    code: string | number = 'INVALID_CREDENTIALS';

}