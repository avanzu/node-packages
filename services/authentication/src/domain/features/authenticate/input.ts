import {Type, type Static} from '@sinclair/typebox'
export const AuthenticateInputSchema = Type.Object({
    token: Type.String()
})
export type AuthenticateInput = Static<typeof AuthenticateInputSchema>