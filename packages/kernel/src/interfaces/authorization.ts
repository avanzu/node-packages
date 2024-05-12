import { AuthUser } from "./app";

export enum PermissionKind {
    ACTION = 'action',
    DATA = 'data',
    WORKFLOW = 'workflow'
}

export interface Permission {
    kind: PermissionKind,
    name: string
}


export enum AuthorizationResult {
    GRANTED = 'granted',
    DENIED = 'denied',
    NONE = 'none'
}

export interface Authorization {
    isGranted(user: AuthUser, permission: Permission): Promise<AuthorizationResult>
}