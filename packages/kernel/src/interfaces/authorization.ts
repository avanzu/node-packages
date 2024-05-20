import { AuthUser } from "./app";

export const PermissionKinds = {
    ACTION : 'action',
    DATA : 'data',
    WORKFLOW : 'workflow'
}

export type PermissionKind = keyof typeof PermissionKinds

export interface Permission {
    kind: PermissionKind,
    name: string
}

export const AuthorizationResults = {
    GRANTED : 'granted',
    DENIED : 'denied',
    NONE : 'none'

}

export type AuthorizationResult = keyof typeof AuthorizationResults

export interface Authorization {
    isGranted(user: AuthUser, permission: Permission): Promise<AuthorizationResult>
}