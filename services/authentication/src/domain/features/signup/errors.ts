import { KernelError } from "@avanzu/kernel";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class EmailTaken extends KernelError{
    status: number = StatusCodes.CONFLICT;
    reason: string = ReasonPhrases.CONFLICT;
    code: string | number = 'EMAIL_TAKEN';


}