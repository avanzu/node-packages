export const ErrorCodes = {
    KERNEL: 'KERNEL_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
}

export type ErrorCode = keyof typeof ErrorCodes