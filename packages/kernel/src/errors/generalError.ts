import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { KernelError } from "./kernelError";
import { ErrorCodes } from "./errorCodes";

export class GeneralError extends KernelError {
    status: number = StatusCodes.INTERNAL_SERVER_ERROR;
    reason: string = ReasonPhrases.INTERNAL_SERVER_ERROR;

    constructor(message: string, public code: string = ErrorCodes.KERNEL){
        super(message)
    }

}